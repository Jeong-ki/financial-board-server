import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'board' })
export class BoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
