import ConflictError from '#domain/errors/ConflictError.js'
import type Role from '#domain/rbac/role/Role.js'
import Email from '#domain/shared/Email.js'
import BirthDate from './BirthDate'
import Password from './Password'

class User {
	public readonly id: string
	private _name: string
	private _email: Email
	private _password: Password
	private _birthDate: BirthDate
	private _verifiedAt: Date | null
	private _roles: Role[] = []

	private constructor(
		id: string,
		name: string,
		email: Email,
		password: Password,
		birthDate: BirthDate,
		verifiedAt: Date | null,
		roles: Role[] = [],
	) {
		this.id = id
		this._name = name
		this._email = email
		this._password = password
		this._birthDate = birthDate
		this._verifiedAt = verifiedAt
		this._roles = roles
	}

	public static create(
		name: string,
		email: string,
		password: string,
		birthDate: Date,
		verifiedAt: Date | null = null,
		roles: Role[] = [],
	): User {
		const id = crypto.randomUUID()
		return new User(
			id,
			name,
			new Email(email),
			Password.create(password),
			new BirthDate(birthDate),
			verifiedAt,
			roles
		)
	}

	public static restore(
		id: string,
		name: string,
		email: string,
		password: string,
		birthDate: Date,
		verifiedAt: Date | null,
		roles: Role[] = [],
	): User {
		return new User(
			id,
			name,
			new Email(email),
			Password.fromHash(password),
			new BirthDate(birthDate),
			verifiedAt,
			roles
		)
	}

	public verifyEmail(): void {
		this._verifiedAt = new Date()
	}

	public isEmailVerified(): boolean {
		return this._verifiedAt !== null
	}

	public changePassword(passwordHash: string): void {
		this._password = Password.fromHash(passwordHash)
	}

	public changeEmail(email: string): void {
		this._email = new Email(email)
		this._verifiedAt = null
	}

	public updateData(data: { name?: string; birthDate?: Date }): void {
		if (data.name !== undefined) {
			this._name = data.name
		}
		if (data.birthDate !== undefined) {
			this._birthDate = new BirthDate(data.birthDate)
		}
	}

	public assignRole(role: Role): void {
		const alreadyAssigned = this._roles.some((r) => r.id === role.id)
		if (alreadyAssigned) {
			throw new ConflictError(`Role ${role.name.value} already assigned to user ${this._name}`)
		}
		this._roles.push(role)
	}

	public removeRole(role: Role): void {
		const roleIndex = this._roles.findIndex((r) => r.id === role.id)
		if (roleIndex === -1) {
			throw new ConflictError(`Role ${role.name.value} not assigned to user ${this._name}`)
		}
		this._roles.splice(roleIndex, 1)
	}

	public hasRole(role: Role): boolean {
		return this._roles.some((r) => r.id === role.id)
	}

	public get name(): string {
		return this._name
	}

	public get email(): string {
		return this._email.value
	}

	public get birthDate(): Date {
		return this._birthDate.value
	}

	public get verifiedAt(): Date | null {
		return this._verifiedAt
	}

	public get roles(): Role[] {
		return this._roles
	}

	public get password(): string {
		return this._password.value
	}
}

export default User
