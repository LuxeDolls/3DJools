import { NextResponse } from "next/server"
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"
import { verifyContactCaptcha } from "@/lib/contact/captcha"

const handler = toNextJsHandler(auth)

export const GET = handler.GET

export async function POST(request: Request) {
  // A direct call to the sign-up API must not skip the image captcha.
  if (new URL(request.url).pathname.endsWith("/sign-up/email")) {
    const valid = verifyContactCaptcha(
      request.headers.get("x-captcha-token") ?? "",
      request.headers.get("x-captcha-answer") ?? "",
    )
    if (!valid) {
      return NextResponse.json({ code: "INVALID_CAPTCHA", message: "Invalid captcha" }, { status: 403 })
    }
  }

  return handler.POST(request)
}
