import argon2 from 'argon2';
import 'reflect-metadata';
import { myContext } from 'src/types';
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
import { COOKIE_NAME } from '../consts';
import { UserType } from '../types/user';

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

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@Resolver(() => UserType)
export class UserResolver {
  // me query
  @Query(() => UserType, { nullable: true })
  async me(@Ctx() { req, prisma }: myContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });
    return user;
  }

  // register mutation
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { prisma, req }: myContext
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
    const user = await prisma.user.create({
      data: {
        username: options.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: hashedPassword,
      },
    });
    req.session.userId = user.id;
    return { user };
  }

  // login mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { prisma, req }: myContext
  ): Promise<UserResponse> {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username: options.username },
      });
    } catch (error) {
      console.error('Error executing findUnique:', error);
      return {
        errors: [
          {
            field: 'username',
            message: 'An error occurred while fetching the user.',
          },
        ],
      };
    }

    if (!user) {
      console.log(user);
      console.log('no user');

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
      console.log('invalid password');
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    console.log('req.session.userId from user login', req.session.userId);
    req.session.userId = user.id;

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
