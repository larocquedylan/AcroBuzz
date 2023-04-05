import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';
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
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
// return user if successful, return errors if not
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // register
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
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: myContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username,
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'specified username does not exist',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }
    return { user };
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
