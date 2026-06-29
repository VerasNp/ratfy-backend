import ConflictError from '#domain/errors/ConflictError.js'
import NotFoundError from '#domain/errors/NotFoundError.js'
import Name from '#domain/rbac/shared/Name.js'
import type Operation from '../operation/Operation'
import type Permission from '../permission/Permission'
import type Resource from '../resource/Resource'

class Role {
	public static readonly PredefinedRoles = {
		ADMIN: 'ADMIN',
		USER: 'USER',
		ARTIST: 'ARTIST',
	} as const
	public readonly id: string
	private _name: Name
	private _description: string | null
	private _permissions: Permission[]

	private constructor(
		id: string,
		name: Name,
		description: string | null,
		permissions: Permission[],
	) {
		this.id = id
		this._name = name
		this._description = description
		this._permissions = permissions
	}

	public static create(
		name: string,
		description: string | null,
		permissions: Permission[] = [],
	): Role {
		return new Role(crypto.randomUUID(), new Name(name), description, permissions)
	}

	public static restore(
		id: string,
		name: string,
		description: string | null,
		permissions: Permission[] = [],
	): Role {
		return new Role(id, new Name(name), description, permissions)
	}

	public updateData(data: { name: string | null; description: string | null }): void {
		if (data.name) {
			this._name = new Name(data.name)
		}
		if (data.description) {
			this._description = data.description
		}
	}

	public assignPermission(permission: Permission): void {
		const alreadyAssigned = this._permissions.some((p) =>
			p.matches(permission.operation.name.value, permission.resource.name.value),
		)
		if (alreadyAssigned) {
			throw new ConflictError(
				`Permission ${permission.label} already assigned to role ${this._name.value}`,
			)
		}
		this._permissions.push(permission)
	}

	public removePermission(permission: Permission): void {
		const index = this._permissions.findIndex((p) =>
			p.matches(permission.operation.name.value, permission.resource.name.value),
		)
		if (index === -1) {
			throw new NotFoundError(
				`Permission ${permission.label} not assigned to role ${this._name.value}`,
			)
		}
		this._permissions.splice(index, 1)
	}

	public hasPermission(operationName: string, resourceName: string): boolean {
		return this._permissions.some((permission) => permission.matches(operationName, resourceName))
	}

	public get permissions(): Permission[] {
		return this._permissions
	}
	public get name() {
		return this._name
	}
	public get description() {
		return this._description
	}
}

export default Role
