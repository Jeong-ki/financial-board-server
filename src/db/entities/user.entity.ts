import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardEntity } from './board.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;

  @Column({
    name: 'userid',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  userId: string;

  @Column({
    name: 'salt',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  salt: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    name: 'hash',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  hash: string;

  @Column({
    name: 'is_admin',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isAdmin: boolean;

  @Column({
    name: 'is_activated',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isActivated: boolean;

  @OneToMany(() => BoardEntity, (boards) => boards.user)
  boards: BoardEntity[];
}
