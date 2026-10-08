import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NormalizeEmail, Trim } from '#src/common/decorators/transform.decorators.js';

export class UpdateProfileDto {
  @IsOptional()
  @Trim()
  @IsString({ message: 'Tên hiển thị phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name?: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Bio phải là chuỗi ký tự' })
  bio?: string;
}
