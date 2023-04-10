import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express'; // access req and res in resolvers
import { Session } from 'express-session';
import { Redis } from 'ioredis';

export type myContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Session };
  res: Response;
  redis: Redis;
};
