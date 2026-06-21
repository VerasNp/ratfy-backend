class Resource {
	public readonly id: string
	public readonly name: string

	private constructor(id: string, name: string) {
		this.id = id
		this.name = name
	}

	public static create(name: string): Resource {
		const id = crypto.randomUUID()
		return new Resource(id, name)
	}

	public static restore(id: string, name: string): Resource {
		return new Resource(id, name)
	}
}

export default Resource
