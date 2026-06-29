import ConflictError from '#domain/errors/ConclictError.js'
import NotFoundError from '#domain/errors/NotFoundError.js'
import Name from '#domain/rbac/shared/Name.js'

class Role {
	public static readonly PredefinedRoles = {
		ADMIN: 'ADMIN',
		USER: 'USER',
		ARTIST: 'ARTIST',
	} as const
	public readonly id: string
	private _name: Name
	private _description: string | null
	private _actions: Set<string>

	private constructor(id: string, name: Name, description: string | null, actions: Set<string>) {
		this.id = id
		this._name = name
		this._description = description
		this._actions = actions
	}

	public static create(
		name: string,
		description: string | null,
		actions: Set<string> = new Set(),
	): Role {
		return new Role(crypto.randomUUID(), new Name(name), description, actions)
	}

	public static restore(
		id: string,
		name: string,
		description: string | null,
		actions: Set<string> = new Set(),
	): Role {
		return new Role(id, new Name(name), description, actions)
	}

	public updateData(data: { name: string | null; description: string | null }): void {
		if (data.name) {
			this._name = new Name(data.name)
		}
		if (data.description) {
			this._description = data.description
		}
	}

	public assignActions(resourceId: string, permissionId: string): void {
		const action = `${resourceId}:${permissionId}`
		if (this._actions.has(action)) {
			throw new ConflictError(`Action ${action} already assigned to role ${this._name.value}`)
		}
		this._actions.add(action)
	}

	public removeActions(resourceId: string, permissionId: string): void {
		const action = `${resourceId}:${permissionId}`
		if (!this._actions.has(action)) {
			throw new NotFoundError(`Action ${action} not assigned to role ${this._name.value}`)
		}
		this._actions.delete(action)
	}

	public get actions(): Set<string> {
		return this._actions
	}
	public get name() {
		return this._name
	}
	public get description() {
		return this._description
	}
}

export default Role
