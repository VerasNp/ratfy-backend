import ValidationError from '#domain/errors/ValidationError.js'

class Name {
	public readonly value: string

	public constructor(value: string) {
		const normalized = value.toUpperCase().trim()
		if (normalized.length === 0) {
			throw new ValidationError('Name cannot be empty')
		}
		if (!/^[A-Z0-9_]+$/.test(normalized))
			throw new ValidationError('Role name must be alphanumeric')
		this.value = normalized
	}
}

export default Name
