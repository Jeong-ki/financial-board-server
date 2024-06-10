import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/user/user.dto';

export enum LogInErrMsg {
  ID_NOT_MATCHED = 'ID_NOT_MATCHED',
  PW_NOT_MATCHED = 'PW_NOT_MATCHED',
}

registerEnumType(LogInErrMsg, {
  name: 'LogInErrMsgEnum',
});

export enum SessionUpdateReasonEnum {
  REFRESH_SESSION_EXPIRATION_DATE = 'REFRESH_SESSION_EXPIRATION_DATE',
  UPDATE_USER_AUTH_INFO = 'UPDATE_USER_AUTH_INFO',
}

registerEnumType(SessionUpdateReasonEnum, {
  name: 'SessionUpdateReasonEnum',
});

@ArgsType()
export class LogInInput {
  @Field() userId: string;```
  @Field() password: string;
}

@ObjectType()
export class UserSessionInfo {
  @Field() token: string;
  @Field() userId: string;
  @Field(() => Date) sessionExpiredDate: Date;
}

@ObjectType()
export class SessionUpdateOutput {
  @Field(() => UserSessionInfo, { nullable: false })
  userSessionInfo: UserSessionInfo;
  @Field(() => SessionUpdateReasonEnum, { nullable: false })
  sessionUpdateReasonEnum: SessionUpdateReasonEnum;
}
export class SessionPayload {
  token: string;
  user: User;
  expiredDate: Date;
}

export class JWTPayload {
  id: string;
  userId: string;
  name: string;
}
