import { Field, ObjectType, Int } from 'type-graphql';

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
}
