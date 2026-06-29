import type Operation from '../operation/Operation'
import type Resource from '../resource/Resource'

class Permission {
	public readonly id: string
	private _operation: Operation
	private _resource: Resource

	private constructor(id: string, operation: Operation, resource: Resource) {
		this.id = id
		this._operation = operation
		this._resource = resource
	}

	public static create(operation: Operation, resource: Resource): Permission {
		return new Permission(crypto.randomUUID(), operation, resource)
	}

	public static restore(id: string, operation: Operation, resource: Resource): Permission {
		return new Permission(id, operation, resource)
	}

	public matches(operation: Operation, resource: Resource): boolean {
		return this._operation.id === operation.id && this._resource.id === resource.id
	}

	public get operation() {
		return this._operation
	}
	public get resource() {
		return this._resource
	}
	public get label(): string {
		return `${this._operation.name.value}:${this._resource.name.value}`
	}
}

export default Permission
