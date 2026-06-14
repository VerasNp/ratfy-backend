import ApplicationError from './ApplicationError'

class UserNotFoundError extends ApplicationError {
	public constructor(message?: string) {
		super(message || 'User not found')
	}
}

export default UserNotFoundError
