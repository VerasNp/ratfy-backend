import { config } from '#config.js'
import container from '#infra/di/container.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import type { CachePort } from '#application/ports/CachePort.js'
import type { StoragePort } from '#application/ports/StoragePort.js'

container.resolve('userController')
container.resolve('verifyEmailController')
container.resolve('authController')
container.resolve('passwordResetController')
container.resolve('rbacController')
container.resolve('uploadController')
container.resolve('playbackController')
container.resolve('favoriteController')

const httpServer = container.resolve<ExpressAdapter>('httpServer')
httpServer.registerErrorHandler()

const loggerService = container.resolve<LoggerPort>('loggerService')

const RETRY_MAX = 3

async function ensureServices(): Promise<void> {
  for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
    try {
      const storageService = container.resolve<StoragePort>('storageService')
      await storageService.ensureBucket(config.minio.bucketAudio)
      await storageService.ensureBucket(config.minio.bucketImages)
      if (config.minio.bucketDrm) {
        await storageService.ensureBucket(config.minio.bucketDrm)
      }

      const cacheService = container.resolve<CachePort>('cacheService')
      await cacheService.connect()

      return
    } catch (error) {
      if (attempt === RETRY_MAX) {
        loggerService.error('Critical services failed to start — exiting', { error })
        process.exit(1)
      }
      loggerService.warn(`Service startup attempt ${attempt} failed, retrying...`)
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

await ensureServices()

httpServer.listen()

function shutdown(signal: string): void {
  loggerService.info(`Received ${signal}, shutting down gracefully...`)

  const forceExit = setTimeout(() => {
    loggerService.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30_000)

  ;(async () => {
    try {
      await httpServer.close()
    } catch {
      loggerService.warn('Error closing HTTP server')
    }

    try {
      const cacheService = container.resolve<CachePort>('cacheService')
      await cacheService.disconnect()
    } catch {
      loggerService.warn('Error disconnecting cache service')
    }

    clearTimeout(forceExit)
    process.exit(0)
  })()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
