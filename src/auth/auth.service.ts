import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as moment from 'moment';
import { Request } from 'express';
import * as _ from 'lodash';
import * as crypto from 'crypto';

const PW_ENCRYPT_ITERATION = 10000;
const PW_ENCRYPT_KEY_LENGTH = 128;
const PW_ENCRYPT_ALGO = 'sha1';
const PW_HASH_ENCODING = 'base64';
const PW_SALT_ENCODING = 'base64';

export type AuthServiceProps = {
  sessionExpiredInMinute: number;
  sessionKeyPrefix: string;
};

@Injectable()
export class AuthService {
  static PROPS_PROPERTY = `${AuthService.name}).PROPS`;

  constructor(
    @InjectRedis()
    private readonly redis,
    @Inject(AuthService.PROPS_PROPERTY)
    private props: AuthServiceProps,

    private jwtService: JwtService, // @Inject(INTER_MODULE_PUBSUB_NAME) private pubsub: PubSub
  ) {
    // this.pubsub.subscribe(AUTH_INFO_CHANGE_TOPIC, (user: User) => {
    //   this.updateUserToken(user);
    // });
  }

  async checkUserPassword(user, password: string): Promise<boolean> {
    const salt = user.salt;
    const hash = user.hash;
    const calculatedHash = crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, PW_SALT_ENCODING),
      PW_ENCRYPT_ITERATION,
      PW_ENCRYPT_KEY_LENGTH,
      PW_ENCRYPT_ALGO,
    );

    if (hash !== calculatedHash.toString(PW_HASH_ENCODING)) {
      throw new Error(
        `User(userId: ${user.userId}, password: ${password}) does not exists.`,
      );
    } else {
      return true;
    }
  }

  async createUserSession(user, clientIPAddr: string | string[]) {
    const jwtPayload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
    };
    const token = this.jwtService.sign(jwtPayload);

    const sessionExpiredInSecond = this.props.sessionExpiredInMinute * 60;
    const expiredDate = moment(new Date())
      .add(sessionExpiredInSecond, 'seconds')
      .toDate();
    const sessionPayload = {
      token: token,
      user: user,
      clientIPAddr: clientIPAddr,
      expiredDate: expiredDate,
    };

    await this.setUserSessionPayload(sessionPayload);

    // return {
    //   token: token,
    //   roles: user.roles,
    //   sessionExpiredDate: expiredDate,
    //   autoRefreshSession: user.autoRefreshSession,
    //   company: user.company,
    //   authority:
    //     Object.values(UserAuthorityEnum).find((userAuthority) => {
    //       return user.authority === userAuthority;
    //     }) || UserAuthorityEnum.USER,
    // };
    return sessionPayload;
  }

  /** Function for reflecting updated user to session */
  async updateUserSession(user) {
    const oldUserSessionPayload = await this.getUserSessionPayload(user.userId);
    if (!oldUserSessionPayload)
      throw new Error(
        `This user ${JSON.stringify(
          user,
        )} does not have existing user session.`,
      );

    const jwtPayload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
    };
    const newToken = this.jwtService.sign(jwtPayload);

    const newSessionPayload = {
      token: newToken,
      user: user,
      clientIPAddr: oldUserSessionPayload.clientIPAddr,
      expiredDate: oldUserSessionPayload.expiredDate,
    };

    await this.setUserSessionPayload(newSessionPayload);

    return newSessionPayload;
  }

  // async updateUserToken(user: User) {
  //   const oldUserSessionPayload = await this.getUserSessionPayload(user.userId);
  //   if (!oldUserSessionPayload) return;

  //   const jwtPayload: JWTPayload = {
  //     id: user.id,
  //     userId: user.userId,
  //     name: user.name,
  //   };
  //   const newToken = this.jwtService.sign(jwtPayload);

  //   const newSessionPayload: SessionPayload = {
  //     token: newToken,
  //     user: user,
  //     clientIPAddr: oldUserSessionPayload.clientIPAddr,
  //     expiredDate: oldUserSessionPayload.expiredDate,
  //   };

  //   await this.setUserSessionPayload(newSessionPayload);
  //   const userTokenUpdateInfo: UpdatedUserTokenInfo = {
  //     userId: user.userId,
  //     oldToken: oldUserSessionPayload.token,
  //     newToken: newSessionPayload.token,
  //   };
  //   this.pubsub.publish(USER_TOKEN_UPDATE_TOPIC, userTokenUpdateInfo);
  // }

  async findUserSessionInfo(userId: string) {
    const userSession = await this.getUserSessionPayload(userId);
    if (!userSession) {
      return null;
    } else if (!userSession.user.company) {
      throw Error(
        `The user session is invalid (${JSON.stringify(userSession)})`,
      );
    } else {
      return {
        token: userSession.token,
        userId: userSession.user.userId,
        roles: userSession.user.roles,
        sessionExpiredDate: userSession.expiredDate,
        autoRefreshSession: userSession.user.autoRefreshSession,
        authority: userSession.user.authority,
        company: userSession.user.company,
      };
    }
  }

  getTokenFromReqHeader(req: Request) {
    let token = '';
    try {
      token = req.headers['authorization'].split(' ')[1];
      return token;
    } catch (e) {
      console.log('Error on getting token ');
      return token;
    }
  }

  // async isValidReqToken(req: Request, userSessionInfo: UserSessionInfo) {
  //   const reqToken = this.getTokenFromReqHeader(req);
  //   if (reqToken === userSessionInfo.token) {
  //     return true;
  //   } else {
  //     throw new Error(
  //       `Request token (${reqToken}) and session token (${userSessionInfo.token}) is not matched. (Userid: ${userSessionInfo.userId})`
  //     );
  //   }
  // }

  // async isValidReqToken(req: Request, userId: string) {
  //   const reqToken = this.getTokenFromReqHeader(req);
  //   const userSessionInfo = await this.findUserSessionInfo(userId);
  //   if (reqToken === userSessionInfo.token) {
  //     return true;
  //   } else {
  //     throw new Error(
  //       `Request token (${reqToken}) and session token (${userSessionInfo.token}) is not matched. (Userid: ${userSessionInfo.userId})`
  //     );
  //   }
  // }

  getJWTFromAuthorizationStr(jwtAuthStr: string): string {
    const splitedAuthStrArr = jwtAuthStr.split(' ');
    let token: string = null;
    if (splitedAuthStrArr[0].toLowerCase() !== 'bearer') {
      throw new Error('Invalid jwt auth str.');
    }
    if (splitedAuthStrArr) {
      token = splitedAuthStrArr[1];
    } else {
      throw new Error('Invalid jwt auth str.');
    }
    return token;
  }

  getUserFromRequest(req: Request) {
    if (_.isNil(req)) {
      throw new Error('The request is null or undefined.');
    }
    if (req['user']) {
      return req['user'];
    } else {
      throw new Error(`The request has not user info.`);
    }
  }

  async isValidRequest(req: Request) {
    const userFromReq = this.getUserFromRequest(req);
    const reqToken = this.getTokenFromReqHeader(req);
    const userSessionInfo = await this.findUserSessionInfo(userFromReq.userId);
    if (reqToken === userSessionInfo.token) {
      return true;
    } else {
      throw new Error(
        `Request token (${reqToken}) and session token (${userSessionInfo.token}) is not matched. (Userid: ${userSessionInfo.userId})`,
      );
    }
  }

  async isValidToken(token: string) {
    const jwtPayload = this.jwtService.verify(token);
    if (_.isNil(jwtPayload)) {
      throw new Error('Invalid token value.');
    }
    const userSessionInfo = await this.findUserSessionInfo(jwtPayload.userId);
    if (token === userSessionInfo.token) {
      return true;
    } else {
      throw new Error(
        `Session for the token does not exist. (token value: ${token})`,
      );
    }
  }

  async compareUserAndSessionPayload(user) {
    const userSessionPayload = await this.getUserSessionPayload(user.userId);

    // Check company info
    if (
      !user.company.isActivated !== userSessionPayload.user.company.isActivated
    ) {
      return false;
    }
    // Check user info
    if (user.authority !== userSessionPayload.user.authority) {
      return false;
    } else if (user.isActivated !== userSessionPayload.user.isActivated) {
      return false;
    }

    // Check role info
    // if (user.roles && user.roles.length > 0) {

    // }

    if (_.isEqual(user, userSessionPayload.user)) {
      return true;
    } else {
      return false;
    }
  }

  async refreshSessionExpiration(user, clientIPAddr) {
    const oldSession = await this.getUserSessionPayload(user.userId);
    if (!oldSession) {
      throw new Error(
        `User(userId: ${user.userId}) does not have valid session.`,
      );
    }

    return await this.createUserSession(user, clientIPAddr);
  }

  decodeTokenStr(tokenStr: string) {
    return this.jwtService.verify(tokenStr);
  }

  async validateToken(token: string, decodedJWT) {
    if (!decodedJWT.userId) {
      throw new Error(
        `Invalid decoded jwt. (Decoded jwt: ${JSON.stringify(decodedJWT)})`,
      );
    }
    const sessionPayload = await this.getUserSessionPayload(decodedJWT.userId);
    if (!sessionPayload) {
      throw new Error(
        `The user session is expired. (Decoded jwt: ${JSON.stringify(
          decodedJWT,
        )})`,
      );
    }
    if (sessionPayload.token !== token) {
      throw new Error(
        `Token is not matched. (Token from user: ${token}, Token on session: ${sessionPayload.token})`,
      );
    }

    return sessionPayload.user;
  }

  private async setUserSessionPayload(sessionPayload) {
    // Overwrite session payload to the key
    await this.redis.set(
      `${this.props.sessionKeyPrefix}${sessionPayload.user.userId}`,
      JSON.stringify(sessionPayload),
      'EX',
      moment(sessionPayload.expiredDate).diff(Date.now(), 'seconds'),
    );
  }

  private async getUserSessionPayload(userId: string) {
    const sessionPayload = JSON.parse(
      await this.redis.get(`${this.props.sessionKeyPrefix}${userId}`),
    );

    return sessionPayload;
  }
}
