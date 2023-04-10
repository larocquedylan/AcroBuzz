import { Post } from './entities/Post';
import { User } from './entities/User';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { __prod__ } from './consts';

dotenv.config();

const myDataSource = new DataSource({
  type: 'postgres',
  database: 'acrobuzz2',
  url: process.env.DATABASE_URL,
  // host: 'localhost',
  // port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: true, // __prod__, true in production
  logging: true, // !__prod__, true in development //  creates tables auto without migrations
  entities: [Post, User],
  // migrations: ['src/migrations/**/*.ts'],
});

export default myDataSource;
