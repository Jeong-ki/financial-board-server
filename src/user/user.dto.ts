import {
  Field,
  HideField,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { MinLength } from 'class-validator';

export const USER_ID_MIN_LENGTH = 3;
export const PW_MIN_LENGTH = 3;

export enum SignUpErrMsg {
  DUPLICATED_ID = 'DUPLICATED_ID',
  SHORT_ID_LENGTH = 'SHORT_ID_LENGTH',
  SHORT_PW_LENGTH = 'SHORT_PW_LENGTH',
  EMPTY_NAME = 'EMPTY_NAME',
  UNKNOWN_ERR = 'UNKNOWN_ERR',
}

registerEnumType(SignUpErrMsg, {
  name: 'SignUpErrMsgEnum',
});

@InputType()
export class SignUpInput {
  @Field() @MinLength(USER_ID_MIN_LENGTH) userId: string;
  @Field() @MinLength(PW_MIN_LENGTH) password: string;
  @Field() name: string;
}

@ObjectType()
export class SignUpResult {
  @Field() result: boolean;
  @Field(() => SignUpErrMsg, { nullable: true }) errorMsg: SignUpErrMsg;
}

@ObjectType()
export class User {
  @Field(() => ID, { nullable: false }) id: string;
  @Field(() => Date, { nullable: false }) createdAt: Date;
  @Field(() => Date, { nullable: false }) updatedAt: Date;
  @Field(() => String, { nullable: false }) userId: string;
  @Field(() => String, { nullable: false }) name: string;
  @HideField() salt: string;
  @HideField() hash: string;
  @Field(() => Boolean, { nullable: false }) isActivated: boolean;
}

@InputType()
export class UserFilter {
  @Field(() => String, { nullable: true }) userId?: string;
  @Field(() => String, { nullable: true }) name?: string;
  @Field(() => Boolean, { nullable: true }) isActivated?: boolean;
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID, { nullable: false }) id: string;
  @Field(() => String, { nullable: true }) name?: string;
  @Field(() => Boolean, { nullable: true }) isActivated?: boolean;
}

@InputType()
export class UpdateUserBySelfInput {
  @Field(() => ID, { nullable: false }) id: string;
  @Field(() => String, { nullable: true }) name?: string;
}
