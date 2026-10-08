import { Body, Controller, Get, HttpException, Param, Post, Redirect, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TodosService } from '#src/todos/todos.service.js';

interface TitleForm {
  title?: string;
}

/** Controller MVC (SSR): render view Handlebars, form gửi bằng POST rồi redirect (PRG). */
@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) { }

  @Get()
  @Render('todos/index')
  list() {
    return this.listModel();
  }

  @Post()
  async create(@Body() body: TitleForm, @Res() res: Response) {
    try {
      await this.todos.create(body?.title ?? '');
      res.redirect(303, '/todos');
    } catch (e) {
      res.status(400).render('todos/index', await this.listModel(this.message(e)));
    }
  }

  @Get(':id/edit')
  @Render('todos/edit')
  async edit(@Param('id') id: string) {
    return { title: 'Sửa công việc', todo: await this.todos.findOne(id) };
  }

  @Post(':id/update')
  async update(@Param('id') id: string, @Body() body: TitleForm, @Res() res: Response) {
    try {
      await this.todos.updateTitle(id, body?.title ?? '');
      res.redirect(303, '/todos');
    } catch (e) {
      if (e instanceof HttpException && e.getStatus() === 404) throw e;
      res.status(400).render('todos/edit', {
        title: 'Sửa công việc',
        todo: await this.todos.findOne(id),
        error: this.message(e),
      });
    }
  }

  @Post(':id/toggle')
  @Redirect('/todos', 303)
  async toggle(@Param('id') id: string) {
    await this.todos.toggle(id);
  }

  @Post(':id/delete')
  @Redirect('/todos', 303)
  async remove(@Param('id') id: string) {
    await this.todos.remove(id);
  }

  private async listModel(error?: string) {
    const todos = await this.todos.findAll();
    const left = todos.filter((t) => !t.completed).length;
    const summary = todos.length ? `Còn ${left} trên ${todos.length} việc` : 'Chưa có việc nào';
    return { title: 'Todos App - Hỏi Dân IT @hoidanit', todos, summary, error };
  }

  private message(e: unknown): string {
    return e instanceof HttpException ? e.message : 'Có lỗi xảy ra';
  }
}
