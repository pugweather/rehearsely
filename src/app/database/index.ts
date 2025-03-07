import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/database/drizzle/schema'

// Create the postgres client
const client = postgres(process.env.DATABASE_URL!, { prepare: false})

// Create and export the datbaase instance
const db = drizzle(client, {schema, logger: true})

export default db