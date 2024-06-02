import { Injectable } from '@nestjs/common';
import { CreateBoardInput } from './create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';

@Injectable()
export class BoardService {
  create(createBoardInput: CreateBoardInput) {
    return 'This action adds a new board';
  }

  findAll() {
    return `This action returns all board`;
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  update(id: number, updateBoardInput: UpdateBoardInput) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
