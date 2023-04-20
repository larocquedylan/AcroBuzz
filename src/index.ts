import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import 'dotenv-safe/config';
import express from 'express';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './consts';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { VoteResolver } from './resolvers/voter';

import session from 'express-session';
import { myContext } from './types';

dotenv.config();

const main = async () => {
  const prisma = new PrismaClient();
  console.log('Connected to the PostgreSQL database');

  const app = express();

  app.get('/', (_, res) => {
    res.send('hello');
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver, VoteResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  app.set('proxy', 1);
  app.use(
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
    bodyParser.json(),
    session({
      name: COOKIE_NAME,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
        domain: __prod__ ? '.domain.com' : undefined, // cookie will only be sent to this domain
      },
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<myContext> => {
        const session = req.session as session.Session & { userId: number };

        return {
          prisma,
          req: req as express.Request & { session: typeof session },
          res,
        };
      },
    })
  );

  app.listen(parseInt(process.env.PORT), () => {
    console.log('Server started on port:', process.env.PORT);
  });
};

main().catch((err) => {
  console.error(err);
});
