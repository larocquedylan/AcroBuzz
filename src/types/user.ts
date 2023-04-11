import { Field, ObjectType, Int } from 'type-graphql';
import { PostType } from './post';

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field(() => [PostType], { nullable: true })
  posts?: PostType[];
}
