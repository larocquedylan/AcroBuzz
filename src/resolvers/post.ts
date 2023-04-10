import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { myContext } from 'src/types';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: myContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // query that returns a single post
  @Query(() => Post, { nullable: true })
  post(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: myContext
  ): Promise<Post | null> {
    return em.findOne(Post, { _id: id });
  }

  // create a post
  @Mutation(() => Post)
  async createPost(
    @Arg('title', () => String) title: string,
    @Ctx() { em }: myContext
  ): Promise<Post> {
    const post = em.create(Post, {
      title,
      createdAt: '',
      updatedAt: '',
    });
    await em.persistAndFlush(post);
    return post;
  }

  // update a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: myContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { _id: id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      post.updatedAt = new Date();
      await em.persistAndFlush(post);
    }
    return post;
  }

  // delete a post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: myContext
  ): Promise<Boolean> {
    await em.nativeDelete(Post, { _id: id });
    return true;
  }
}
