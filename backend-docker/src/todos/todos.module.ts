import { Module } from '@nestjs/common';
import { TodoRepository } from '#src/todos/todo.repository.js';
import { TodosController } from '#src/todos/todos.controller.js';
import { TodosService } from '#src/todos/todos.service.js';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodoRepository],
  exports: [TodosService],
})
export class TodosModule {}
