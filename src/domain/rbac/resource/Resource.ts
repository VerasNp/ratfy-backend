import DomainError from '#domain/errors/DomainError.js'

class Resource {
	public readonly id: string
	private _name: string

	private constructor(id: string, name: string) {
		this.id = id
		this._name = name
	}

	public static create(name: string): Resource {
		return new Resource(crypto.randomUUID(), name)
	}

	public static restore(id: string, name: string): Resource {
		return new Resource(id, name)
	}

	public updateData(data: { name?: string }): void {
		if (data.name !== undefined) {
			if (data.name.trim().length === 0) {
				throw new DomainError('Resource name cannot be empty')
			}
			this._name = data.name
		}
	}

	public get name() {
		return this._name
	}
}

export default Resource
