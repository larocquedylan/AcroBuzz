import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryKey()
  _id!: number;

  @Field(() => String)
  @Property()
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({ type: 'text' })
  title!: string;
}

// @Entity() decorator tells mikro-orm that this is an entity

// @PrimaryKey() decorator tells mikro-orm that this is the primary key
// @Property() decorator tells mikro-orm that this is a property
// @Property({ type: 'text' }) decorator tells mikro-orm that this is a property and the type is text
// @Property({ onUpdate: () => new Date() }) decorator tells mikro-orm that this is a property and the type is date

// @Field(() => Int)) decorator tells type-graphql that this is a field and the type is Int
// @Field(() => String) decorator tells type-graphql that this is a field and the type is String
// @Field() exposes the field to the graphql schema

// we can stack deocrators
// we can turn classes into graphql types by using the @ObjectType() decorator
