"use server"

import { issueContactCaptcha, type ContactCaptcha } from "@/lib/contact/captcha"

export async function refreshSignupCaptcha(): Promise<ContactCaptcha> {
  return issueContactCaptcha()
}
