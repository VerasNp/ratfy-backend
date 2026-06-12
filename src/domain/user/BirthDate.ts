class BirthDate {
	public readonly value: Date

	constructor(value: Date) {
		console.log(typeof value)
		if (!this.isValidDatePast(value)) {
			throw new Error('Birth date must be a valid date in the past')
		} else if (!this.isGreaterThan18YearsAgo(value)) {
			throw new Error('Must be at least 18 years old')
		}
		this.value = value
	}

	private isValidDatePast(birthDate: Date): boolean {
		const now = new Date()
		return birthDate < now
	}

	private isGreaterThan18YearsAgo(birthDate: Date): boolean {
		const now = new Date()
		const cutoffDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
		return birthDate <= cutoffDate
	}
}

export default BirthDate
