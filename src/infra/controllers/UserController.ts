import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import { UserUpdateSchema } from '#application/DTOs/user/UserUpdateInputDTO.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import type AssignRoleToUserUseCase from '#application/useCases/rbac/AssignRoleToUserUseCase.js'
import type RemoveRoleFromUserUseCase from '#application/useCases/rbac/RemoveRoleFromUserUseCase.js'
import type GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import type GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import type ListUsersUseCase from '#application/useCases/user/ListUsersUseCase.js'
import type SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import type UpdateUserUseCase from '#application/useCases/user/UpdateUserUseCase.js'
import BadRequestError from '#infra/errors/BadRequestError.js'
import ForbiddenError from '#infra/errors/ForbiddenError.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import type RateLimitMiddleware from '#infra/http/middlewares/RateLimitMiddleware.js'

class UserController {
	public constructor(
		private readonly signUpUserCase: SignupUseCase,
		private readonly httpServer: HttpServerPort,
		private readonly getAccountUseCase: GetAccountUseCase,
		private readonly authMiddleware: AuthMiddleware,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly listUsersUseCase: ListUsersUseCase,
		private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
		private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
		private readonly userRepository: UserRepository,
		private readonly signupRateLimiter: RateLimitMiddleware,
		private readonly updateUserUseCase: UpdateUserUseCase,
	) {
		this.httpServer.register(
			'post',
			'/signup',
			async (_params: any, body: any, _query: any) => {
				const input = SignupSchema.parse(body)
				await this.signUpUserCase.execute(input)
				return { message: 'User created successfully' }
			},
			[this.signupRateLimiter.handle()],
		)

		this.httpServer.register(
			'get',
			'/account',
			async (_params: any, _body: any, _query: any, req: any) => {
				const { userId } = req.user
				const output = await this.getAccountUseCase.execute(userId)
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/user/:id',
			async (params: any, _body: any, _query: any) => {
				const { id } = params
				const output = await this.getUserUseCase.execute(id)
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'patch',
			'/user/:id',
			async (params: any, body: any, _query: any, req: any) => {
				const { id } = params
				if (req.user.userId !== id) {
					throw new ForbiddenError('You can only update your own account')
				}
				const input = UserUpdateSchema.parse(body)
				const output = await this.updateUserUseCase.execute(id, input)
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/users',
			async (params: any, _body: any, _query: any) => {
				const output = await this.listUsersUseCase.execute()
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)
		this.httpServer.register(
			'post',
			'/user/:userId/roles/:roleId',
			async (params: any, _body: any, _query: any) => {
				const { userId, roleId } = params
				await this.assignRoleToUserUseCase.execute(userId, roleId)
				return { message: 'Role assigned to user successfully' }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/user/:userId/roles/:roleId',
			async (params: any, _body: any, _query: any) => {
				const { userId, roleId } = params
				await this.removeRoleFromUserUseCase.execute(userId, roleId)
				return { message: 'Role revoked from user successfully' }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/user/:userId/roles',
			async (params: any, _body: any, _query: any) => {
				const { userId } = params
				const user = await this.userRepository.findById(userId)
				if (!user) {
					throw new ResourceNotFoundError('User not found')
				}
				return { data: user.roles.map((role) => ({ id: role.id, name: role.name.value })) }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/user/:userId/permissions',
			async (params: any, _body: any, _query: any) => {
				const { userId } = params
				const user = await this.userRepository.findById(userId)
				if (!user) {
					throw new ResourceNotFoundError('User not found')
				}
				const permissions = user.roles.flatMap((role) => role.permissions)
				return {
					data: permissions.map((permission) => ({
						id: permission.id,
						label: permission.label,
					})),
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			"get",
			"/user/:userId/can",
			async (params: any, _body: any, query: any) => {
				const { userId } = params
				const { operation, resource } = query
				if (!operation || !resource) {
					throw new BadRequestError("Missing operation or resource query parameters")
				}
				const user = await this.userRepository.findById(userId)
				if (!user) {
					throw new ResourceNotFoundError("User not found")
				}
				const hasPermission = user.roles.some((role) => role.hasPermission(operation, resource))
				return { data: { can: hasPermission } }
			}
		)
	}
}

export default UserController
