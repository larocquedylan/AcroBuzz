// -- Active: 1680624047577@@127.0.0.1@5432@acrobuzz
import path from 'path';
import { __prod__ } from './consts';
import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core';
import dotenv from 'dotenv';

dotenv.config();

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: 'acrobuzz',
  clientUrl: process.env.DATABASE_URL,
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];

// could do as const for the return type of the function for typechecking, this is for the index. but it is for the init so could just import that type and use parameters of that type, this way gives us autocomplete for the init function
