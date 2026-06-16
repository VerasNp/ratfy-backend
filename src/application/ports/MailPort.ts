export interface MailPort {
	/**
	 * Sends an email with the specified recipient, subject, and body.
	 * @param to The recipient's email address.
	 * @param subject The subject of the email.
	 * @param body The body content of the email.
	 * @returns A promise that resolves when the email has been sent successfully, or rejects with an error if the sending fails.
	 */
	sendMail: (to: string, subject: string, body: string) => Promise<void>
}

export interface SMTPConfig {
	host: string
	port: number
	secure: boolean
	auth: {
		user: string
		pass: string
	}
}
