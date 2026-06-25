class Action {
	public readonly id: string
	public readonly resourceId: string
	public readonly permissionId: string

	private constructor(id: string, resourceId: string, permissionId: string) {
		this.id = id
		this.resourceId = resourceId
		this.permissionId = permissionId
	}

	public static create(resourceId: string, permissionId: string): Action {
		const id = crypto.randomUUID()
		return new Action(id, resourceId, permissionId)
	}

	public static restore(id: string, resourceId: string, permissionId: string) {
		return new Action(id, resourceId, permissionId)
	}
}

export default Action
