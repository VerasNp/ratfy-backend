import DomainError from '#domain/errors/DomainError.js'
import Name from '#domain/rbac/shared/Name.js'

class Operation {
	public readonly id: string
	private _name: Name
	private _description: string | null

	private constructor(id: string, name: Name, description: string | null) {
		this.id = id
		this._name = name
		this._description = description
	}

	public static create(name: string, description: string | null = null): Operation {
		return new Operation(crypto.randomUUID(), new Name(name), description)
	}

	public static restore(id: string, name: string, description: string | null = null): Operation {
		return new Operation(id, new Name(name), description)
	}

	public updateData(data: { name?: string; description?: string | null }): void {
		if (data.name) {
			this._name = new Name(data.name)
		}
		if (data.description) {
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

export default Operation
