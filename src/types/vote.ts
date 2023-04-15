import { Field, Int, ObjectType } from 'type-graphql';
import { PostType } from './post';
import { UserType } from './user';

@ObjectType()
export class VoteType {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  voteValue: number;

  @Field(() => Int)
  postId: number;

  @Field(() => PostType)
  post: PostType;

  @Field(() => Int)
  userId: number;

  @Field(() => UserType)
  user: UserType;
}
