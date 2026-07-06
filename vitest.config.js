import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'unit tests',
					include: ['src/__tests__/unit/**/*.spec.ts'],
				},
			},
			{
				test: {
					name: 'prisma repository integration tests',
					include: ['src/__tests__/integration/infra/repository/*.spec.ts'],
					globalSetup: [
						'./src/__tests__/integration/infra/testContainerPostgresSetup.ts',
					],
					fileParallelism: false,
				},
			},
			{
				test: {
					name: 'use cases integration tests',
					include: ['src/__tests__/integration/application/useCases/**/*.spec.ts'],
				},
			},
			{
				test: {
					name: 'controllers integration tests',
					include: ['src/__tests__/integration/http/**/*.spec.ts'],
				}
			},
			{
				test: {
					name: 'storage and cache integration tests',
					include: [
						'src/__tests__/integration/infra/storage/*.spec.ts',
						'src/__tests__/integration/infra/cache/*.spec.ts',
					],
					globalSetup: [
						'./src/__tests__/integration/infra/testContainerMinioRedisSetup.ts',
					],
					fileParallelism: false,
					timeout: 60_000,
				},
			},
		],
	},
})
