import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { User } from './user.dto';
import { UserEntity } from 'src/db/entities/user.entity';

@Injectable()
export class UserMapper {
  convertEntityToUser(userEntity: UserEntity) {
    let user: User = undefined;
    if (userEntity && userEntity.userId) {
      user = {
        id: userEntity.id,
        createdAt: userEntity.createdAt,
        updatedAt: userEntity.updatedAt,
        userId: userEntity.userId,
        name: userEntity.name,
        salt: userEntity.salt,
        hash: userEntity.hash,
        isActivated: userEntity.isActivated,
      };
    }
    return user;
  }
}
