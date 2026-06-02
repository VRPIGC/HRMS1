import { Resend } from 'resend'

// Lazy Resend client — instantiated only when an email is actually sent
let _resend: Resend | null = null
function getResendClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
      throw new Error('RESEND_API_KEY is missing or not configured in environment variables.')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const notificationService = {
  async sendEmail(to: string, subject: string, html: string, text?: string, attachments?: any[]) {
    // If in test mode, just log it
    if (process.env.NODE_ENV === 'test') {
      console.log('-----------------------------------------------------')
      console.log(`[TEST MODE] Email queued to: ${to}`)
      console.log(`Subject: ${subject}`)
      if (attachments && attachments.length > 0) {
        console.log(`Attachments: ${attachments.length} files attached`)
      }
      console.log('-----------------------------------------------------')
      return { queued: true, logged: true }
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is missing in environment variables.')
      }

      // Convert attachments to Resend format if they exist (Resend expects Base64 or Buffer, but Base64 is safer)
      const mappedAttachments = attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      }))

      const { data, error } = await getResendClient().emails.send({
        from: process.env.SMTP_FROM || 'HRMS <onboarding@resend.dev>', 
        to: [to],
        subject,
        html,
        text: text || 'Please enable HTML to view this email.',
        attachments: mappedAttachments,
      })

      if (error) {
        console.error(`[Resend ERROR] Failed to send email to ${to}:`, error)
        throw new Error(error.message)
      }

      console.log(`[Resend] Email successfully sent to ${to}: ${data?.id}`)
      return { success: true, messageId: data?.id }
    } catch (error: any) {
      console.error(`[Resend ERROR Exception] Failed to send email to ${to}:`, error)
      throw error
    }
  },

  async sendHRActivationEmail(to: string, hrId: string, role: string, companyName: string, subdomain: string, firstName: string, token: string) {
    const activationLink = `https://hrmsvrpigroup.com/activate?token=${token}`
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to HRMS Portal</h2>
        <p>Hello <strong>${firstName}</strong>,</p>
        <p>Your HR operator account has been successfully created.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 0 0 10px 0;"><strong>HR ID:</strong> ${hrId}</p>
          <p style="margin: 0 0 10px 0;"><strong>Role:</strong> ${role}</p>
          <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="https://hrmsvrpigroup.com/login">https://hrmsvrpigroup.com/login</a></p>
        </div>

        <p>Please activate your account and set up your secure password by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Account</a>
        </div>

        <p style="font-size: 0.9em; color: #64748b;">If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${activationLink}">${activationLink}</a></p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">Thank you,<br>HRMS Team</p>
      </div>
    `
    const subject = 'Welcome to HRMS Portal - Activate Your Account'
    return this.sendEmail(to, subject, htmlBody)
  },
}
