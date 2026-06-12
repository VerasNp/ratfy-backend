class Password {
	public readonly value: string

	private constructor(value: string) {
		this.value = value
	}

	public static create(value: string): Password {
		if (!Password.validatePassword(value)) {
			throw new Error(
				'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
			)
		}
		return new Password(value)
	}

	public static fromHash(hash: string): Password {
		return new Password(hash)
	}

	private static validatePassword(password: string): boolean {
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
		return passwordRegex.test(password)
	}
}

export default Password
