import nodemailer, { type Transporter } from 'nodemailer'
import type { MailPort, SMTPConfig } from '../../application/ports/MailPort.js'

class NodemailerAdapter implements MailPort {
	private transporter: Transporter

	constructor(private smtpConfig: SMTPConfig) {
		this.transporter = nodemailer.createTransport(smtpConfig)
	}

	async sendMail(to: string, subject: string, body: string): Promise<void> {
		await this.transporter.sendMail({
			from: this.smtpConfig.auth.user,
			to,
			subject,
			html: body,
		})
	}
}

export default NodemailerAdapter
