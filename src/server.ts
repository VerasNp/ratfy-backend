import Signup from '#application/useCases/Signup.js'
import UserController from '#infra/controllers/UserController.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/prisma/client.js'

const httpServer = new ExpressAdapter()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const userRepository = new UserRepositoryPrismaORM(prisma)

const signUpUserCase = new Signup(userRepository)

new UserController(signUpUserCase, httpServer)
httpServer.listen(3000)
