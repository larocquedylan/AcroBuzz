import { MikroORM, RequestContext } from '@mikro-orm/core';
import { COOKIE_NAME, __prod__ } from './consts';
// import * as Posts from './entities/Post';
import microConfig from './mikro-orm.config';
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
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { myContext } from './types';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  console.log('Connected to the PostgreSQL database');

  await orm.getMigrator().up();

  await RequestContext.createAsync(orm.em, async () => {
    // const post = orm.em.create(Posts.Post, {
    //   title: 'my first post',
    //   createdAt: '',
    //   updatedAt: '',
    // });

    // await orm.em.persistAndFlush(post);

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
        resolvers: [HelloResolver, PostResolver, UserResolver],
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
        context: async ({ req, res }): Promise<myContext> => ({
          em: orm.em,
          req,
          res,
        }),
      })
    );
    app.listen(8080, () => {
      console.log('Server started on localhost:8080');
    });
  });
};
main().catch((err) => {
  console.error(err);
});
