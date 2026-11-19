import nodemailer, { type Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { smtpConfig } from "../config/AppConfig";

export default class EmailService {
  private transport: Transporter;

  constructor() {
    try {
      const transportConfig: SMTPTransport.Options = {
        host: smtpConfig.host as string,
        port: Number(smtpConfig.port),
        service: smtpConfig.service as string,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password,
        },
      };
      this.transport = nodemailer.createTransport(transportConfig);
    } catch (exception) {
      console.error("SMTP Server connection failed", exception);
      throw { code: 500, message: "SMTP server not connected..." };
    }
  }

  async sendEmail({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      return await this.transport.sendMail({
        from: smtpConfig.address,
        to: to,
        subject: subject,
        html: message,
      });
    } catch (exception) {
      console.error("Email sending failed", exception);
      throw { code: 500, message: "Email sending failed" };
    }
  }
}
