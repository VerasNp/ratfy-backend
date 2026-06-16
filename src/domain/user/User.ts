import Email from '#domain/shared/Email.js'
import BirthDate from './BirthDate'
import Password from './Password'

class User {
	public readonly id: string
	public name: string
	public email: Email
	public password: Password
	public birthDate: BirthDate
	public verifiedAt: Date | null

	private constructor(
		id: string,
		name: string,
		email: Email,
		password: Password,
		birthDate: BirthDate,
		verifiedAt: Date | null,
	) {
		this.id = id
		this.name = name
		this.email = email
		this.password = password
		this.birthDate = birthDate
		this.verifiedAt = verifiedAt
	}

	public static create(
		name: string,
		email: string,
		password: string,
		birthDate: Date,
		verifiedAt: Date | null = null,
	): User {
		const id = crypto.randomUUID()
		return new User(
			id,
			name,
			new Email(email),
			Password.create(password),
			new BirthDate(birthDate),
			verifiedAt,
		)
	}

	public static restore(
		id: string,
		name: string,
		email: string,
		password: string,
		birthDate: Date,
		verifiedAt: Date | null,
	): User {
		return new User(
			id,
			name,
			new Email(email),
			Password.fromHash(password),
			new BirthDate(birthDate),
			verifiedAt,
		)
	}

	public verifyEmail(): void {
		this.verifiedAt = new Date()
	}

	public isEmailVerified(): boolean {
		return this.verifiedAt !== null
	}
}

export default User
