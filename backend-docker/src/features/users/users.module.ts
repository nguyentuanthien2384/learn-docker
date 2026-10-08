import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '#src/database/entities/index.js';
import { UsersService } from '#src/features/users/users.service.js';
import { UsersController } from '#src/features/users/users.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
