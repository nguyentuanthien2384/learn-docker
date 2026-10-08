import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Todo } from '#src/todos/todo.entity.js';
import { TodoRepository } from '#src/todos/todo.repository.js';

@Injectable()
export class TodosService {
  constructor(private readonly repo: TodoRepository) {}

  findAll(): Promise<Todo[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.repo.findById(id);
    if (!todo) throw new NotFoundException('Todo không tồn tại');
    return todo;
  }

  create(title: string): Promise<Todo> {
    return this.repo.create(this.validateTitle(title));
  }

  async updateTitle(id: string, title: string): Promise<Todo> {
    return this.orFail(await this.repo.update(id, { title: this.validateTitle(title) }));
  }

  async toggle(id: string): Promise<Todo> {
    const todo = await this.findOne(id);
    return this.orFail(await this.repo.update(id, { completed: !todo.completed }));
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repo.remove(id))) throw new NotFoundException('Todo không tồn tại');
  }

  private validateTitle(title: unknown): string {
    const value = typeof title === 'string' ? title.trim() : '';
    if (!value) throw new BadRequestException('Tiêu đề không được để trống');
    if (value.length > 200) throw new BadRequestException('Tiêu đề tối đa 200 ký tự');
    return value;
  }

  private orFail(todo: Todo | undefined): Todo {
    if (!todo) throw new NotFoundException('Todo không tồn tại');
    return todo;
  }
}
