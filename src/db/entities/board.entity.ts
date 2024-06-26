import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BankTransactionEntity } from './bankTransaction.entity';

@Entity({ name: 'board' })
export class BoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  title: string;

  // @Column({
  //   name: 'type',
  //   type: 'varchar',
  //   length: 50,
  //   unique: true,
  //   nullable: false,
  // })
  // type: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'time',
    nullable: false,
  })
  time: string;

  @ManyToOne(() => UserEntity, (user) => user.boards)
  user: UserEntity;

  @OneToMany(
    () => BankTransactionEntity,
    (bankTransactions) => bankTransactions.board,
  )
  bankTransactions: BankTransactionEntity[];
}
