import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';
import { myContext } from 'src/types';
import { User } from '../entities/User';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: myContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      createdAt: '',
      updatedAt: '',
      paswword: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }
}
// //   @Query(() => [User])
// //   users(@Ctx() { em }: myContext): Promise<User[]> {
// //     return em.find(User, {});
// //   }

//   // query that returns a single post
//   @Query(() => User, { nullable: true })
//   user(
//     @Arg('id', () => Int) id: number,
//     @Ctx() { em }: myContext
//   ): Promise<User | null> {
//     return em.findOne(User, { _id: id });
//   }

//   // create a post
//   @Mutation(() => User)
//   async createUser(
//     @Arg('username', () => String) username: string,
//     @Ctx() { em }: myContext
//   ): Promise<User> {
//     const user = em.create(User, {
//       username: '',
//       createdAt: '',
//       updatedAt: '',
//       paswword: '',
//     });
//     await em.persistAndFlush(user);
//     return user;
//   }

//   // update a post
//   @Mutation(() => User, { nullable: true })
//   async updateUser(
//     @Arg('id', () => Int) id: number,
//     @Arg('username', () => String, { nullable: true }) username: string,
//     @Ctx() { em }: myContext
//   ): Promise<User | null> {
//     const user = await em.findOne(User, { _id: id });
//     if (!user) {
//       return null;
//     }
//     if (typeof username !== 'undefined') {
//       user.username = username;
//       user.updatedAt = new Date();
//       await em.persistAndFlush(user);
//     }
//     return user;
//   }

//   // delete a post
//   @Mutation(() => Boolean)
//   async deleteUser(
//     @Arg('id', () => Int) id: number,
//     @Ctx() { em }: myContext
//   ): Promise<Boolean> {
//     await em.nativeDelete(User, { _id: id });
//     return true;
//   }
// }
