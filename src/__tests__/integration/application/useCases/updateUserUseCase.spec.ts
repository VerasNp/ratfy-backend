import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import UpdateUserUseCase from '#application/useCases/user/UpdateUserUseCase.js'
import User from '#domain/user/User.js'
import Email from '#domain/shared/Email.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import argon2 from 'argon2'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserRepository } from '#application/ports/UserRepository.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { hashPortMock } from '#application/ports/__mocks__/HashPortMock.js'
import type { HashPort } from '#application/ports/HashPort.js'
import Argon2Adapter from '#infra/security/Argon2Adapter.js'

let updateUser: UpdateUserUseCase
let userRepository: UserRepository
let hashService: HashPort

describe('UpdateUserUseCase', () => {
	let dummyUser: User
	beforeEach(() => {
		dummyUser = createDummyUser({
			name: 'Original Name',
			email: 'foo@bar.com',
		})
		userRepository = new UserRepositoryMemory([dummyUser])
		hashService = new Argon2Adapter()
		updateUser = new UpdateUserUseCase(
			userRepository,
			loggerPortMock,
			tokenPortMock,
			mailPortMock,
			templateRendererPortMock,
			'http://localhost:3000',
			hashService,
		)
	})
	it('should update user name successfully', async () => {
		const output = await updateUser.execute(dummyUser.id, { name: 'Updated Name' })
		expect(output.name).toBe('Updated Name')
		expect(output.email).toBe('foo@bar.com')
		const updatedUser = await userRepository.findById(dummyUser.id)
		expect(updatedUser?.name).toBe('Updated Name')
	})

	it('should update user birthDate successfully', async () => {
		const newBirthDate = new Date('2000-06-15')
		const output = await updateUser.execute(dummyUser.id, { birthDate: newBirthDate })
		expect(output.birthDate).toEqual(newBirthDate)
	})

	it('should update user password successfully', async () => {
		await updateUser.execute(dummyUser.id, { password: 'NewPass@123' })
		const updatedUser = await userRepository.findById(dummyUser.id)
		const isMatch = await argon2.verify(updatedUser!.password, 'NewPass@123')
		expect(isMatch).toBe(true)
	})

	it('should update email, reset verifiedAt and send verification email', async () => {
		await updateUser.execute(dummyUser.id, { email: 'new@email.com' })
		const updatedUser = await userRepository.findById(dummyUser.id)
		expect(updatedUser?.email).toBe('new@email.com')
		expect(updatedUser?.verifiedAt).toBeNull()

		expect(mailPortMock.sendMail).toHaveBeenCalledTimes(1)
		expect(mailPortMock.sendMail).toHaveBeenCalledWith(
			'new@email.com',
			'Verify your new email',
			undefined,
		)
		expect(tokenPortMock.generateToken).toHaveBeenCalledWith(
			{ userId: dummyUser.id, email: 'new@email.com' },
			expect.any(Number),
		)
	})

	it('should update all fields at once', async () => {
		const newBirthDate = new Date('1995-03-20')
		const output = await updateUser.execute(dummyUser.id, {
			name: 'New Name',
			email: 'all@new.com',
			birthDate: newBirthDate,
		})
		expect(output.name).toBe('New Name')
		expect(output.email).toBe('all@new.com')
		expect(output.birthDate).toEqual(newBirthDate)
	})

	it('should throw an error if user is not found', async () => {
		await expect(updateUser.execute('non-existing-id', { name: 'No one' })).rejects.toThrow(
			'User not found',
		)
	})

	it('should throw an error if email is already in use', async () => {
		const anotherUser = createDummyUser({
			name: 'Another User',
			email: 'existing@email.com',
		})
		await userRepository.create(anotherUser)
		await expect(
			updateUser.execute(dummyUser.id, { email: 'existing@email.com' }),
		).rejects.toThrow('User with this email already exists')
	})

	it('should throw an error if password does not meet complexity requirements', async () => {
		await expect(updateUser.execute(dummyUser.id, { password: 'weak' })).rejects.toThrow(
			'Password must be at least 8 characters long',
		)
	})

	it('should throw ResourceAlreadyExistsError when email uniqueness is violated at repository level', async () => {
		const anotherUser = User.create(
			'Another User',
			'taken@email.com',
			'Valid@123',
			new Date('1990-01-01'),
		)
		await userRepository.create(anotherUser)
		const user = (await userRepository.findById(dummyUser.id))!
		user.changeEmail('taken@email.com')
		await expect(userRepository.updateUser(user)).rejects.toThrow(UniqueConstraintError)
	})
})
