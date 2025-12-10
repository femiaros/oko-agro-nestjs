import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import * as dotenv from 'dotenv';

dotenv.config();

const config: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },

    entities: [__dirname + '/../**/*.entity{.ts,.js}'], // ✅ Use glob pattern
    synchronize: false,
    extra: {
        ssl: true,
        max: 10,          // Increase pool
        keepAlive: true,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
    },
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
    logging: process.env.NODE_ENV !== 'production'
}

export default config;