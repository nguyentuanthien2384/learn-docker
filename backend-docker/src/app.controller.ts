import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  /** Trang giới thiệu dự án: view độc lập, không dùng layout của Todos. */
  @Get()
  @Render('home')
  home() {
    return { layout: false };
  }
}
