import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Todo } from '#src/todos/todo.entity.js';

/** Lưu todo vào file JSON. Mọi thao tác ghi được xếp hàng để tránh ghi đè lẫn nhau. */
@Injectable()
export class TodoRepository {
  private readonly file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    this.file = join(import.meta.dirname, 'data', 'todos.json');
  }

  findAll(): Promise<Todo[]> {
    return this.read();
  }

  async findById(id: string): Promise<Todo | undefined> {
    return (await this.read()).find((t) => t.id === id);
  }

  create(title: string): Promise<Todo> {
    return this.mutate((todos) => {
      const now = new Date().toISOString();
      const todo: Todo = { id: randomUUID(), title, completed: false, createdAt: now, updatedAt: now };
      todos.unshift(todo);
      return todo;
    });
  }

  update(id: string, patch: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<Todo | undefined> {
    return this.mutate((todos) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return undefined;
      Object.assign(todo, patch, { updatedAt: new Date().toISOString() });
      return todo;
    });
  }

  remove(id: string): Promise<boolean> {
    return this.mutate((todos) => {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return false;
      todos.splice(index, 1);
      return true;
    });
  }

  private async read(): Promise<Todo[]> {
    try {
      return JSON.parse(await readFile(this.file, 'utf8')) as Todo[];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  private mutate<T>(fn: (todos: Todo[]) => T): Promise<T> {
    const run = async () => {
      const todos = await this.read();
      const result = fn(todos);
      await mkdir(dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await writeFile(tmp, JSON.stringify(todos, null, 2), 'utf8');
      await rename(tmp, this.file);
      return result;
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }
}
