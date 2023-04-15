import { Field, ObjectType, Int } from 'type-graphql';
import { UserType } from './user';
import { VoteType } from './vote';

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

  @Field()
  text: string;

  @Field(() => Int)
  totalPoints: number;

  @Field(() => UserType, { nullable: true })
  author?: UserType;

  @Field(() => [VoteType], { nullable: true })
  votes?: VoteType[];
}
