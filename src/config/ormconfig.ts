import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import * as dotenv from 'dotenv';

dotenv.config();

const config: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [__dirname + '/../**/*.entity{.ts,.js}'], // ✅ Use glob pattern
    synchronize: false,
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
    logging: process.env.NODE_ENV !== 'production'
}

export default config;