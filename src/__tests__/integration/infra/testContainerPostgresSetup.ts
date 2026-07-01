import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { execSync } from 'node:child_process'
import type { TestProject } from 'vitest/node'

let postgresContainer: StartedPostgreSqlContainer

declare module 'vitest' {
	export interface ProvidedContext {
		testPostgresURL: string
	}
}

export async function setup(project: TestProject) {
	postgresContainer = await new PostgreSqlContainer('postgres:18').start()
	const postgresURL = postgresContainer.getConnectionUri()
	execSync('npx prisma migrate reset --force', {
		env: { ...process.env, DATABASE_URL: postgresURL },
	})
	execSync('npx prisma migrate deploy', {
		env: { ...process.env, DATABASE_URL: postgresURL },
	})
	project.provide('testPostgresURL', postgresURL)
}

export async function teardown() {
	await postgresContainer.stop()
}
