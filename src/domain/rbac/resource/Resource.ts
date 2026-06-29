import Name from '../shared/Name'

class Resource {
	public readonly id: string
	private _name: Name

	private constructor(id: string, name: Name) {
		this.id = id
		this._name = name
	}

	public static create(name: string): Resource {
		return new Resource(crypto.randomUUID(), new Name(name))
	}

	public static restore(id: string, name: string): Resource {
		return new Resource(id, new Name(name))
	}

	public updateData(data: { name?: string }): void {
		if (data.name) {
			this._name = new Name(data.name)
		}
	}

	public get name() {
		return this._name
	}
}

export default Resource
