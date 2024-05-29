import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { In, Like, Repository } from 'typeorm';
import {
  SignUpInput,
  SignUpResult,
  SignUpErrMsg,
  UserFilter,
  User,
  UpdateUserInput,
} from './user.dto';
import { UserMapper } from './user.mapper';
import { FINCIAL_BOARD_DB_CONN_NAME } from 'src/db/financialBoard.module';
import { UserEntity } from 'src/db/entities/user.entity';

const PW_ENCRYPT_ITERATION = 10000;
const PW_ENCRYPT_KEY_LENGTH = 128;
const PW_ENCRYPT_ALGO = 'sha1';
const PW_SALT_LENGTH = 64;
const PW_HASH_ENCODING = 'base64';
const PW_SALT_ENCODING = 'base64';

@Injectable()
export class UserService {
  public get userRepository(): Repository<UserEntity> {
    return this._userRepository;
  }
  public set userRepository(value: Repository<UserEntity>) {
    this._userRepository = value;
  }
  constructor(
    @InjectRepository(UserEntity, FINCIAL_BOARD_DB_CONN_NAME)
    private _userRepository: Repository<UserEntity>,
    private userMapper: UserMapper,
  ) {}

  async signUp(signUpInput: SignUpInput): Promise<SignUpResult> {
    const cnt = await this.userRepository.countBy({
      userId: signUpInput.userId,
    });
    if (cnt > 0) {
      return { result: false, errorMsg: SignUpErrMsg.DUPLICATED_ID };
    }
    const randomSalt = crypto.randomBytes(PW_SALT_LENGTH);
    const hash = crypto
      .pbkdf2Sync(
        signUpInput.password,
        randomSalt,
        PW_ENCRYPT_ITERATION,
        PW_ENCRYPT_KEY_LENGTH,
        PW_ENCRYPT_ALGO,
      )
      .toString(PW_HASH_ENCODING);

    let userEntity = this.userRepository.create();
    userEntity = {
      ...userEntity,
      userId: signUpInput.userId,
      name: signUpInput.name,
      salt: randomSalt.toString(PW_SALT_ENCODING),
      hash: hash,
      isActivated: false,
    };

    await this.userRepository.save(userEntity);
    return { result: true, errorMsg: null };
  }

  async encryptPassword(rawPassword: string) {
    const randomSalt = crypto.randomBytes(PW_SALT_LENGTH);
    const hash = crypto
      .pbkdf2Sync(
        rawPassword,
        randomSalt,
        PW_ENCRYPT_ITERATION,
        PW_ENCRYPT_KEY_LENGTH,
        PW_ENCRYPT_ALGO,
      )
      .toString(PW_HASH_ENCODING);
    const salt = randomSalt.toString(PW_SALT_ENCODING);
    return {
      salt: salt,
      hash: hash,
    };
  }

  async findUsers(userFilter: UserFilter): Promise<User[]> {
    const userEntities: UserEntity[] = await this.userRepository.find({
      where: {
        userId: userFilter.userId ? Like(`%${userFilter.userId}%`) : null,
        name: userFilter.name ? Like(`%${userFilter.name}%`) : null,
        isActivated: userFilter.isActivated,
      },
    });
    const users: User[] = userEntities.map((userEntity: UserEntity) => {
      return this.userMapper.convertEntityToUser(userEntity);
    });
    return users;
  }

  async findOneUserById(id: string): Promise<User> {
    const userEntity = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    const user: User = await this.userMapper.convertEntityToUser(userEntity);
    return user;
  }

  async findOneUserByUserId(userId: string): Promise<User> {
    const userEntity = await this.userRepository.findOne({
      where: {
        userId: userId,
      },
    });
    const user: User = await this.userMapper.convertEntityToUser(userEntity);
    return user;
  }

  async updateUser(updateUserInput: UpdateUserInput): Promise<User> {
    const updateResult = await this.userRepository.save(
      {
        id: updateUserInput.id,
        name: updateUserInput.name,
        isActivated: updateUserInput.isActivated,
      },
      { reload: true },
    );
    const updatedUser = await this.findOneUserById(updateResult.id);
    return updatedUser;
  }
}
