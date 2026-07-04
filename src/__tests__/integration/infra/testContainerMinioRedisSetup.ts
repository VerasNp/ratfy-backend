import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { GenericContainer, Wait } from 'testcontainers'
import type { StartedTestContainer } from 'testcontainers'
import type { TestProject } from 'vitest/node'

let minioContainer: StartedTestContainer
let redisContainer: StartedRedisContainer

declare module 'vitest' {
  export interface ProvidedContext {
    testMinioEndpoint: string
    testMinioPort: number
    testMinioAccessKey: string
    testMinioSecretKey: string
    testRedisUrl: string
  }
}

export async function setup(project: TestProject) {
    minioContainer = await new GenericContainer('minio/minio:RELEASE.2024-12-18T13-15-44Z')
    .withCommand(['server', '/data'])
    .withEnvironment({ MINIO_ROOT_USER: 'minioadmin', MINIO_ROOT_PASSWORD: 'minioadmin' })
    .withExposedPorts(9000)
    .withWaitStrategy(Wait.forLogMessage(/MinIO Object Storage Server/))
    .start()

  const minioHost = minioContainer.getHost()
  const minioPort = minioContainer.getMappedPort(9000)

  project.provide('testMinioEndpoint', minioHost)
  project.provide('testMinioPort', minioPort)
  project.provide('testMinioAccessKey', 'minioadmin')
  project.provide('testMinioSecretKey', 'minioadmin')

  redisContainer = await new RedisContainer('redis:7-alpine').start()
  project.provide('testRedisUrl', redisContainer.getConnectionUrl())
}

export async function teardown() {
  if (minioContainer) await minioContainer.stop()
  if (redisContainer) await redisContainer.stop()
}
