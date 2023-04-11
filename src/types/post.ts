import { Field, ObjectType, Int } from 'type-graphql';
import { UserType } from './user';

@ObjectType()
export class PostType {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  title: string;

  @Field(() => UserType, { nullable: true })
  author?: UserType;
}
