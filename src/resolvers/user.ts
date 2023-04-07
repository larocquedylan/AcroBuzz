import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { myContext } from 'src/types';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../consts';

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
  // me query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: myContext) {
    // check if logged in
    if (!req.session.userId) {
      return null;
    }
    // if logged in, return user
    const user = await em.findOne(User, { _id: req.session.userId });
    return user;
  }

  // register mutation
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: myContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username must be at least 3 characters long',
          },
        ],
      };
    }
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password must be at least 3 characters long',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      createdAt: '',
      updatedAt: '',
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // user already exists
      if (err.code === '23505' || err.detail.includes('already exists')) {
        console.log('username taken');
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }
    // log user in after registration
    req.session.userId = user._id;

    // return user
    return { user };
  }

  // login mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: myContext
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

    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: myContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
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
