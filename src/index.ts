import { PrismaClient } from '@prisma/client';
import 'dotenv-safe/config';
import { COOKIE_NAME, __prod__ } from './consts';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import 'reflect-metadata';
import { UserResolver } from './resolvers/user';
import { VoteResolver } from './resolvers/voter';
import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';

import session from 'express-session';
import connectRedis, { Client } from 'connect-redis';
import Redis from 'ioredis';

import { myContext } from './types';

const main = async () => {
  const prisma = new PrismaClient();
  console.log('Connected to the PostgreSQL database');

  const app = express();

  const redisClient = new Redis(process.env.REDIS_URL);

  const RedisStore = connectRedis(session);
  const sessionStoreRedis = new RedisStore({
    client: redisClient as unknown as Client,
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
      store: sessionStoreRedis,
      name: COOKIE_NAME,
      resave: false,
      saveUninitialized: false,
      secret: 'garypayton',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<myContext> => {
        const session = req.session as session.Session & { userId: number };

        return {
          prisma,
          req: req as express.Request & { session: typeof session },
          res,
          redis: sessionStoreRedis,
        };
      },
    })
  );

  app.listen(parseInt(process.env.PORT), () => {
    console.log('Server started on localhost:4000');
  });
};

main().catch((err) => {
  console.error(err);
});

// import { PrismaClient } from '@prisma/client';
// import 'dotenv-safe/config';
// import { COOKIE_NAME, __prod__ } from './consts';
// import express from 'express';
// import { ApolloServer } from '@apollo/server';
// import { buildSchema } from 'type-graphql';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import { expressMiddleware } from '@apollo/server/express4';
// import 'reflect-metadata';
// import { UserResolver } from './resolvers/user';
// import { VoteResolver } from './resolvers/voter';
// import { PostResolver } from './resolvers/post';
// import { HelloResolver } from './resolvers/hello';

// // import RedisStore from 'connect-redis';
// import session from 'express-session';
// import { Redis } from 'ioredis';
// // import { redis } from './redis';

// import { myContext } from './types';
// import connectRedis from 'connect-redis';

// const main = async () => {
//   const prisma = new PrismaClient();
//   console.log('Connected to the PostgreSQL database');

//   const app = express();

//   const redis = new Redis(process.env.REDIS_URL);
//   const RedisStore = connectRedis(session);

//   app.get('/', (_, res) => {
//     res.send('hello');
//   });

//   const apolloServer = new ApolloServer({
//     schema: await buildSchema({
//       resolvers: [HelloResolver, PostResolver, UserResolver, VoteResolver],
//       validate: false,
//     }),
//   });

//   await apolloServer.start();

//   app.use(
//     cors<cors.CorsRequest>({
//       origin: ['http://localhost:3000'],
//       credentials: true,
//     }),
//     bodyParser.json(),
//     session({
//       store: new RedisStore({
//         client: redis,
//         disableTouch: true,
//       }),
//       name: COOKIE_NAME,
//       resave: false, // required: force lightweight session keep alive (touch)
//       saveUninitialized: false, // recommended: only save session when data exists
//       secret: 'garypayton', // use a env later
//       cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
//         httpOnly: true, // cookie only accessible by the web server
//         sameSite: 'lax', // protection against CSRF
//         secure: __prod__, // cookie only works in https, when prod is true
//       },
//     }),
//     expressMiddleware(apolloServer, {
//       context: async ({ req, res }): Promise<myContext> => {
//         const session = req.session as session.Session & { userId: number };

//         return {
//           prisma,
//           req: req as express.Request & { session: typeof session },
//           res,
//           redis: redis,
//         };
//       },
//     })
//   );

//   app.listen(parseInt(process.env.PORT), () => {
//     console.log('Server started on localhost:4000');
//   });
// };

// main().catch((err) => {
//   console.error(err);
// });
