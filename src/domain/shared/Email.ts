import ValidationError from '#domain/errors/ValidationError.js'

class Email {
	public readonly value: string
	constructor(value: string) {
		if (!this.validateEmail(value)) {
			throw new ValidationError('Invalid email format')
		}
		this.value = value
	}

	private validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}
}

export default Email
