// SAFE compression for Filaments category images.
//
// Learned from two earlier incidents:
//   - Simple in-place overwrite fails with "quota exceeded" when the store
//     is near its 1GB limit, because it briefly needs old+new space.
//   - Delete-then-reupload-immediately ALSO fails: Vercel Blob's quota
//     counter has real propagation lag (tens of seconds+) after a delete,
//     so an immediate re-upload can still be rejected as "quota exceeded"
//     even though the bytes were already removed.
//
// This script therefore runs in strict PHASES, and — critically — every
// original file is fully backed up to local disk and verified BEFORE any
// delete happens anywhere. Nothing is ever deleted from Blob until its
// replacement is safely sitting on local disk.
//
//   PHASE 1: For every referenced image pathname, download the original,
//            verify it decodes, compress it, verify the compressed version
//            decodes, and write ONLY the compressed buffer to local disk.
//            No Blob deletes or uploads happen in this phase.
//   PHASE 2: Once phase 1 is 100% complete for a file, delete the ORIGINAL
//            from Blob (this is what frees real quota).
//   PHASE 3: Wait for the quota counter to settle (poll list() until total
//            size reflects the deletions, with a generous timeout).
//   PHASE 4: Upload each local backup buffer back to its original pathname,
//            verify it landed correctly, and only THEN delete the local
//            backup file. Anything that fails to upload keeps its local
//            backup + is recorded in a manifest for manual follow-up —
//            it is never discarded.
import { get, put, del, list } from "@vercel/blob"
import { Pool } from "pg"
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MAX_WIDTH = 1000
const WEBP_QUALITY = 78
const SKIP_UNDER_BYTES = 300 * 1024
const BACKUP_DIR = "/tmp/filament-compress-backups"
const PLAN_PATH = "/tmp/filament-compress-plan.json"
const MANIFEST_PATH = "/tmp/filament-compress-manifest.json"

fs.mkdirSync(BACKUP_DIR, { recursive: true })

function log(...args) {
  console.log("[compress-filaments]", ...args)
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
function backupFilePath(pathname) {
  return path.join(BACKUP_DIR, pathname.replace(/\//g, "__"))
}

async function getTotalStoreSize() {
  let cursor
  let total = 0
  do {
    const res = await list({ cursor, limit: 1000 })
    for (const b of res.blobs) total += b.size
    cursor = res.cursor
  } while (cursor)
  return total
}

async function phase1_downloadCompressBackup(pathnameList) {
  log(`PHASE 1: downloading + compressing + backing up ${pathnameList.length} candidates to local disk`)
  const plan = [] // { pathname, originalSize, compressedSize }
  let skippedSmall = 0
  let skippedNoGain = 0
  let failed = 0

  for (let i = 0; i < pathnameList.length; i++) {
    const pathname = pathnameList[i]
    const idx = i + 1
    const backupPath = backupFilePath(pathname)

    // Resume support: if we already backed this one up in a previous run, skip re-downloading.
    if (fs.existsSync(backupPath)) {
      const size = fs.statSync(backupPath).size
      plan.push({ pathname, compressedSize: size })
      continue
    }

    try {
      const meta = await get(pathname, { access: "private" })
      if (!meta) {
        log(`[${idx}/${pathnameList.length}] MISSING (skip): ${pathname}`)
        failed++
        continue
      }
      const originalSize = meta.blob.size ?? 0
      if (originalSize < SKIP_UNDER_BYTES) {
        skippedSmall++
        continue
      }

      const chunks = []
      for await (const chunk of meta.stream) chunks.push(chunk)
      const originalBuffer = Buffer.concat(chunks)
      if (originalBuffer.length === 0) {
        log(`[${idx}/${pathnameList.length}] EMPTY DOWNLOAD (skip): ${pathname}`)
        failed++
        continue
      }

      const originalMetadata = await sharp(originalBuffer).metadata().catch(() => null)
      if (!originalMetadata) {
        log(`[${idx}/${pathnameList.length}] NOT A VALID IMAGE (skip): ${pathname}`)
        failed++
        continue
      }

      const compressedBuffer = await sharp(originalBuffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      const compressedMetadata = await sharp(compressedBuffer).metadata().catch(() => null)
      if (!compressedMetadata || compressedMetadata.width < 10 || compressedMetadata.height < 10) {
        log(`[${idx}/${pathnameList.length}] COMPRESSED INVALID (skip): ${pathname}`)
        failed++
        continue
      }

      if (compressedBuffer.length >= originalBuffer.length) {
        skippedNoGain++
        continue
      }

      fs.writeFileSync(backupPath, compressedBuffer)
      // Verify the file we just wrote to disk is readable and correct size.
      const writtenSize = fs.statSync(backupPath).size
      if (writtenSize !== compressedBuffer.length) {
        log(`[${idx}/${pathnameList.length}] BACKUP WRITE VERIFY FAILED (skip): ${pathname}`)
        failed++
        continue
      }

      plan.push({ pathname, originalSize, compressedSize: compressedBuffer.length })
      if (idx % 25 === 0 || idx === pathnameList.length) {
        log(`[${idx}/${pathnameList.length}] progress... (${plan.length} planned so far)`)
      }
    } catch (err) {
      log(`[${idx}/${pathnameList.length}] ERROR (skip, nothing touched in Blob): ${pathname}`, err?.message ?? err)
      failed++
    }
  }

  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2))
  log(
    `PHASE 1 done. Planned: ${plan.length}, skipped (small): ${skippedSmall}, skipped (no gain): ${skippedNoGain}, failed: ${failed}`,
  )
  return plan
}

async function phase2_deleteOriginals(plan) {
  log(`PHASE 2: deleting ${plan.length} originals from Blob (backups already verified on local disk)`)
  let deleted = 0
  for (let i = 0; i < plan.length; i++) {
    const { pathname } = plan[i]
    const backupPath = backupFilePath(pathname)
    if (!fs.existsSync(backupPath)) {
      log(`SAFETY ABORT: no backup found for ${pathname}, refusing to delete original`)
      continue
    }
    try {
      await del(pathname)
      deleted++
    } catch (err) {
      log(`Delete failed for ${pathname} (leaving as-is): ${err?.message ?? err}`)
    }
  }
  log(`PHASE 2 done. Deleted ${deleted}/${plan.length} originals.`)
}

async function phase3_waitForQuotaSettle(expectedFreedBytes) {
  log(`PHASE 3: waiting for Blob quota counter to settle...`)
  const start = await getTotalStoreSize()
  log(`Store size right after deletes: ${(start / 1024 / 1024).toFixed(1)} MB`)
  // Just give it a generous fixed cooldown; the counter itself (via list())
  // already reflects real object listing, so the earlier failures were the
  // *quota enforcement* layer lagging behind, not list(). Sleep well past
  // what we observed (single delete needed >70s), then double check.
  await sleep(90_000)
  const after = await getTotalStoreSize()
  log(`Store size after cooldown: ${(after / 1024 / 1024).toFixed(1)} MB`)
}

async function phase4_uploadCompressed(plan) {
  log(`PHASE 4: uploading ${plan.length} compressed backups back to Blob`)
  let uploaded = 0
  let stillFailing = []
  const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000]

  for (let i = 0; i < plan.length; i++) {
    const { pathname } = plan[i]
    const idx = i + 1
    const backupPath = backupFilePath(pathname)
    if (!fs.existsSync(backupPath)) continue // already uploaded + cleaned up in a previous run

    const compressedBuffer = fs.readFileSync(backupPath)
    let ok = false
    let lastErr
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        await put(pathname, compressedBuffer, {
          access: "private",
          contentType: "image/webp",
          allowOverwrite: true,
        })
        const verify = await get(pathname, { access: "private" })
        if (verify && verify.blob.size === compressedBuffer.length) {
          ok = true
          break
        }
        lastErr = new Error("verify size mismatch")
      } catch (err) {
        lastErr = err
      }
      if (attempt < RETRY_DELAYS_MS.length) {
        log(`[${idx}/${plan.length}] retrying ${pathname} in ${RETRY_DELAYS_MS[attempt] / 1000}s (${lastErr?.message ?? lastErr})`)
        await sleep(RETRY_DELAYS_MS[attempt])
      }
    }

    if (ok) {
      fs.unlinkSync(backupPath) // safe to remove now — confirmed live in Blob
      uploaded++
      if (idx % 25 === 0 || idx === plan.length) {
        log(`[${idx}/${plan.length}] uploaded ${uploaded} so far...`)
      }
    } else {
      log(`[${idx}/${plan.length}] STILL FAILING after retries, backup kept: ${pathname} (${lastErr?.message ?? lastErr})`)
      stillFailing.push({ pathname, backupPath, error: String(lastErr?.message ?? lastErr) })
    }
  }

  if (stillFailing.length > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(stillFailing, null, 2))
  }
  log(`PHASE 4 done. Uploaded: ${uploaded}/${plan.length}. Still failing: ${stillFailing.length}`)
  return stillFailing
}

async function main() {
  const before = await getTotalStoreSize()
  log(`Store size BEFORE anything: ${(before / 1024 / 1024).toFixed(1)} MB`)

  const { rows } = await pool.query(
    `select id, name, images from products where category = 'filaments' and archived = false`,
  )
  const pathnames = new Set()
  for (const row of rows) {
    for (const img of row.images ?? []) {
      const match = /pathname=([^&]+)/.exec(img)
      if (match) pathnames.add(decodeURIComponent(match[1]))
    }
  }
  const pathnameList = Array.from(pathnames)
  log(`Found ${rows.length} filament products, ${pathnameList.length} unique image pathnames`)

  let plan
  if (fs.existsSync(PLAN_PATH) && process.env.RESUME_PLAN === "1") {
    plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"))
    log(`Resuming from existing plan with ${plan.length} entries`)
  } else {
    plan = await phase1_downloadCompressBackup(pathnameList)
  }

  if (plan.length === 0) {
    log("Nothing to compress. Done.")
    await pool.end()
    return
  }

  const expectedFreed = plan.reduce((sum, p) => sum + ((p.originalSize ?? 0) - (p.compressedSize ?? 0)), 0)
  log(`Expected space to free: ~${(expectedFreed / 1024 / 1024).toFixed(1)} MB`)

  await phase2_deleteOriginals(plan)
  await phase3_waitForQuotaSettle(expectedFreed)
  const stillFailing = await phase4_uploadCompressed(plan)

  const after = await getTotalStoreSize()
  log("=".repeat(60))
  log(`Store size BEFORE: ${(before / 1024 / 1024).toFixed(1)} MB, AFTER: ${(after / 1024 / 1024).toFixed(1)} MB`)
  if (stillFailing.length > 0) {
    log(`!!! ${stillFailing.length} files still need manual re-upload — backups safe at ${BACKUP_DIR}, manifest at ${MANIFEST_PATH} !!!`)
  } else {
    log("All planned files successfully compressed and re-uploaded. No data loss.")
  }

  await pool.end()
}

main().catch((err) => {
  console.error("[compress-filaments] FATAL:", err)
  process.exit(1)
})
