import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface SmtpConfig {
  service?: string
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailMessage {
  to: string
  subject: string
  text?: string
  html?: string
}

export class SmtpEmailService {
  private transporter: Transporter

  constructor() {
    const config: SmtpConfig = {
      service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    }

    this.transporter = nodemailer.createTransport(config)
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error(`Email sending failed: ${error.message}`)
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}
