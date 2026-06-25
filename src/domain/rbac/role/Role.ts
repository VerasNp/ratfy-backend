import DomainError from '#domain/errors/DomainError.js'
import Name from './Name'

class Role {
	public static readonly PredefinedRoles = {
		ADMIN: 'ADMIN',
		USER: 'USER',
		ARTIST: 'ARTIST',
	} as const
	public readonly id: string
	private _name: Name
	private _description: string | null

	private constructor(id: string, name: Name, description: string | null) {
		this.id = id
		this._name = name
		this._description = description
	}

	public static create(name: string, description: string | null): Role {
		return new Role(crypto.randomUUID(), new Name(name), description)
	}

	public static restore(id: string, name: string, description: string | null): Role {
		return new Role(id, new Name(name), description)
	}

	public updateData(data: { name?: string; description?: string | null }): void {
		if (data.name !== undefined) {
			this._name = new Name(data.name)
		}
		if (data.description !== undefined) {
			this._description = data.description
		}
	}

	public get name() {
		return this._name
	}
	public get description() {
		return this._description
	}
}

export default Role
