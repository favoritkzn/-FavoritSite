import { IsEmail, IsIn, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(2)
  childFirstName!: string;

  @IsString()
  @MinLength(2)
  childLastName!: string;

  @IsDateString()
  childBirthDate!: string;

  @IsIn(['MALE', 'FEMALE'])
  childGender!: 'MALE' | 'FEMALE';
}
