class Role {
	public static readonly PredefinedRoles = {
		ADMIN: 'ADMIN',
		USER: 'USER',
		ARTIST: 'ARTIST',
	} as const
	public readonly id: string
	public name: string
	public description: string | null

	private constructor(id: string, name: string, description: string | null) {
		this.id = id
		this.name = name
		this.description = description
	}

	public static create(name: string, description: string | null): Role {
		const id = crypto.randomUUID()
		return new Role(id, name, description)
	}

	public static restore(id: string, name: string, description: string | null): Role {
		return new Role(id, name, description)
	}
}

export default Role
