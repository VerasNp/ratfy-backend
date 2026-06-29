import type Role from '#domain/rbac/role/Role.js'
import type User from '#domain/user/User.js'

export interface UserRepository {
	/**
	 * Creates a new user in the repository on persistence layer
	 * @param user The user entity to be created
	 */
	create(user: User): Promise<User>
	/**
	 * Finds a user by their email address
	 * @param email The email address to search for
	 */
	findByEmail(email: string): Promise<User | null>
	/**
	 * Updates an existing user in the persistence layer
	 * @param userData The user entity with updated information
	 */
	updateUser(userData: User): Promise<User | null>
	/**
	 * Finds a user by their unique identifier
	 * @param id The unique identifier of the user to search for
	 */
	findById(id: string): Promise<User | null>
	/**
	 * Retrieves all users from the repository
	 */
	findAll(): Promise<User[]>
}
