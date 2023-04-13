import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { myContext } from '../types';
import { Post as PostModel } from '@prisma/client'; // Import Post from @prisma/client
import { PostType } from '../types/post';
import 'reflect-metadata';
import { isAuth } from '../middleware/isAuth';

@Resolver(() => PostType)
export class PostResolver {
  // query that returns a list of posts
  @Query(() => [PostType])
  async posts(@Ctx() { prisma }: myContext): Promise<PostModel[]> {
    return await prisma.post.findMany({ include: { author: true } });
  }

  // query that returns a single post
  @Query(() => PostType, { nullable: true })
  async post(
    @Arg('id', () => Int) id: number,
    @Ctx() { prisma }: myContext
  ): Promise<PostModel | null> {
    return await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  // create a post
  @Mutation(() => PostType)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('title', () => String) title: string,
    @Arg('text', () => String) text: string,
    @Ctx() { prisma, req }: myContext
  ): Promise<PostModel> {
    const authorId = req.session.userId;
    return await prisma.post.create({
      data: { title, authorId, text },
      include: { author: true },
    });
  }

  // update a post
  @Mutation(() => PostType, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { prisma }: myContext
  ): Promise<PostModel | null> {
    return await prisma.post.update({ where: { id }, data: { title } });
  }

  // delete a post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { prisma }: myContext
  ): Promise<Boolean> {
    await prisma.post.delete({ where: { id } });
    return true;
  }
}
