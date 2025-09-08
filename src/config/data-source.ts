import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from "../users/entities/user.entity";
import { Crop } from "../crops/entities/crop.entity";
import { File } from "../files/entities/file.entity";

dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
  synchronize: false,
  entities: [User, Crop, File], // ✅ Explicit entities for CLI
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
  logging: process.env.NODE_ENV !== 'production',
});