import DomainError from '#domain/errors/DomainError.js'

class Permission {
	public readonly id: string
	private _name: string
	private _description: string | null

	private constructor(id: string, name: string, description: string | null) {
		this.id = id
		this._name = name
		this._description = description
	}

	public static create(name: string, description: string | null): Permission {
		return new Permission(crypto.randomUUID(), name, description)
	}

	public static restore(id: string, name: string, description: string | null): Permission {
		return new Permission(id, name, description)
	}

	public updateData(data: { name?: string; description?: string | null }): void {
		if (data.name !== undefined) {
			if (data.name.trim().length === 0) {
				throw new DomainError('Permission name cannot be empty')
			}
			this._name = data.name
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

export default Permission
