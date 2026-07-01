import './infra/docs/openapiSetup.js'
import { config } from '#config.js'
import container from '#infra/di/container.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'

container.resolve('userController')
container.resolve('verifyEmailController')
container.resolve('authController')
container.resolve('rbacController')

container.resolve<ExpressAdapter>('httpServer').registerErrorHandler()
container.resolve<ExpressAdapter>('httpServer').listen()
