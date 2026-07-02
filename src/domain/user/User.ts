import ConflictError from '#domain/errors/ConflictError.js'
import type Role from '#domain/rbac/role/Role.js'
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
	public roles: Role[] = []

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
		this.name = name
		this.email = email
		this.password = password
		this.birthDate = birthDate
		this.verifiedAt = verifiedAt
		this.roles = roles
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
		this.verifiedAt = new Date()
	}

	public isEmailVerified(): boolean {
		return this.verifiedAt !== null
	}

	public changePassword(passwordHash: string): void {
		this.password = Password.fromHash(passwordHash)
	}

	public assignRole(role: Role): void {
		const alreadyAssigned = this.roles.some((r) => r.id === role.id)
		if (alreadyAssigned) {
			throw new ConflictError(`Role ${role.name.value} already assigned to user ${this.name}`)
		}
		this.roles.push(role)
	}

	public removeRole(role: Role): void {
		const roleIndex = this.roles.findIndex((r) => r.id === role.id)
		if (roleIndex === -1) {
			throw new ConflictError(`Role ${role.name.value} not assigned to user ${this.name}`)
		}
		this.roles.splice(roleIndex, 1)
	}

	public hasRole(role: Role): boolean {
		return this.roles.some((r) => r.id === role.id)
	}
}

export default User
