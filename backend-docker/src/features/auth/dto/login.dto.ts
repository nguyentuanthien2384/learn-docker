import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { NormalizeEmail } from '#src/common/decorators/transform.decorators.js';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password!: string;
}
