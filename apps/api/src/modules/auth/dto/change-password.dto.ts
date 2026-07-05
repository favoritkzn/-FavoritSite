import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Текущий пароль обязателен' })
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: 'Новый пароль минимум 6 символов' })
  newPassword!: string;
}
