import { MikroORM, RequestContext } from '@mikro-orm/core';
import { __prod__ } from './consts';
import * as Posts from './entities/Post';
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

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  console.log('Connected to the PostgreSQL database');

  await orm.getMigrator().up();

  await RequestContext.createAsync(orm.em, async () => {
    const post = orm.em.create(Posts.Post, {
      title: 'my first post',
      createdAt: '',
      updatedAt: '',
    });
    // await orm.em.persistAndFlush(post);

    const app = express();

    app.get('/', (_, res) => {
      res.send('hello');
    });

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver],
        validate: false,
      }),
    });
    await apolloServer.start();

    app.use(
      cors(),
      bodyParser.json(),
      expressMiddleware(apolloServer, {
        context: async () => ({ em: orm.em }),
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
