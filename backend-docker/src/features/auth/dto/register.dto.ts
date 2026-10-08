import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail, Trim } from '#src/common/decorators/transform.decorators.js';

export class RegisterDto {
  @NormalizeEmail()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
  password!: string;

  @Trim()
  @IsString({ message: 'Tên hiển thị phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
  @MaxLength(100, { message: 'Tên hiển thị tối đa 100 ký tự' })
  name!: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Bio phải là chuỗi ký tự' })
  bio?: string;
}
