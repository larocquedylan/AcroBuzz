import { PrismaClient } from '@prisma/client';
import { COOKIE_NAME, __prod__ } from './consts';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import cors from 'cors';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import { PostResolver } from './resolvers/post';
import 'reflect-metadata';
import { UserResolver } from './resolvers/user';
import { myContext } from './types';
import { VoteResolver } from './resolvers/voter';

import esmRedis from 'connect-redis';
const RedisStore = esmRedis.default;
import session from 'express-session';
import { createClient } from 'redis';

const main = async () => {
  const prisma = new PrismaClient();
  console.log('Connected to the PostgreSQL database');

  const app = express();

  // Initialize client.
  let redisClient = createClient();
  redisClient.connect().catch(console.error);

  // Initialize store.
  let redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
    disableTouch: true,
  });

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

  app.use(
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3000'],
      credentials: true,
    }),
    bodyParser.json(),
    session({
      store: redisStore,
      name: COOKIE_NAME,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: 'garypayton', // use a env later
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
        httpOnly: true, // cookie only accessible by the web server
        sameSite: 'lax', // protection against CSRF
        secure: __prod__, // cookie only works in https, when prod is true
      },
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<myContext> => {
        const session = req.session as session.Session & { userId: number };

        return {
          prisma,
          req: req as express.Request & { session: typeof session },
          res,
          redis: redisStore,
        };
      },
    })
  );

  app.listen(8080, () => {
    console.log('Server started on localhost:8080');
  });
};

main().catch((err) => {
  console.error(err);
});
