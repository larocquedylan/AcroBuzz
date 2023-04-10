import { EntityManager } from 'typeorm';
import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Client } from 'redis';

export type MyContext = {
  em: EntityManager;
  req: Request & { session: Session };
  res: Response;
  redis: Client;
};
