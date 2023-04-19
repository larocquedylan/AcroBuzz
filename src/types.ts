import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express'; // access req and res in resolvers
import { Session } from 'express-session'; // access session in resolvers

export type myContext = {
  req: Request & { session: Session & { userId: number } };
  res: Response;
  prisma: PrismaClient;
};
