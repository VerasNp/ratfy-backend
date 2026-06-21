class Permission {
	public id: string
	public name: string
	public description: string | null

	private constructor(id: string, name: string, description: string | null) {
		this.id = id
		this.name = name
		this.description = description
	}

	public static create(name: string, description: string | null) {
		const id = crypto.randomUUID()
		return new Permission(id, name, description)
	}

	public static restore(id: string, name: string, description: string | null) {
		return new Permission(id, name, description)
	}
}

export default Permission
