import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardEntity } from './board.entity';

@Entity({ name: 'bank-Transaction' })
export class BankTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  type: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'time',
    nullable: false,
  })
  time: string;

  @Column({ type: 'integer', nullable: false, default: 0 })
  amount: number;

  @Column({
    name: 'memo',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  memo: string;

  @ManyToOne(() => BoardEntity, (board) => board.bankTransactions)
  board: BoardEntity;
}
