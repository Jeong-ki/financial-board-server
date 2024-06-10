import {
  ArgsType,
  Field,
  HideField,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { MinLength } from 'class-validator';
import { User } from 'src/user/user.dto';

@ObjectType()
export class Board {
  @Field(() => ID, { nullable: false }) id: string;
  @Field(() => Date, { nullable: false }) createdAt: Date;
  @Field(() => Date, { nullable: false }) updatedAt: Date;
  @Field(() => String, { nullable: true }) title: string;
  @Field(() => Date, { nullable: false }) time: Date;
  @Field(() => User, { nullable: false }) user: User;
}

@ArgsType()

