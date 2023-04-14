import { Post as PostModel } from '@prisma/client'; // Import Post from @prisma/client
import 'reflect-metadata';
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Field,
  InputType,
  ObjectType,
} from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { myContext } from '../types';
import { PostType } from '../types/post';
import { Max, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => String, { nullable: true })
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @Min(1)
  @Max(50)
  limit?: number;
}

@ObjectType()
export class PaginatedPosts {
  @Field(() => [PostType])
  posts: PostModel[];

  @Field(() => String, { nullable: true })
  nextCursor?: string | null;
}

@Resolver(() => PostType)
export class PostResolver {
  // query that returns a list of posts
  // @Query(() => [PostType])
  // async posts(
  //   @Arg('limit', () => Int, { nullable: true }) limit: number,
  //   @Arg('myCursor', () => Int, { nullable: true }) myCursor: number,
  //   @Ctx() { prisma }: myContext
  // ): Promise<PostModel[]> {
  //   return await prisma.post.findMany({ include: { author: true } });
  // }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('input', () => PaginationInput) { cursor, limit }: PaginationInput,
    @Ctx() { prisma }: myContext
  ): Promise<PaginatedPosts> {
    const take = Math.min(50, limit || 10);
    const skip = 1;
    const cursorOptions = cursor
      ? {
          createdAt: {
            lt: new Date(parseInt(cursor)),
          },
        }
      : undefined;

    const posts = await prisma.post.findMany({
      where: cursorOptions,
      orderBy: {
        createdAt: 'desc',
      },
      include: { author: true },
      take: take + 1,
      skip,
    });

    const hasNextPage = posts.length > take;
    const edges = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      posts: edges,
      nextCursor: hasNextPage
        ? String(posts[posts.length - 1].createdAt.getTime())
        : null,
    };
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
