import { IsEmail, IsString, MinLength, IsBoolean } from 'class-validator';

export class OnboardingRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  nick: string;

  @IsString()
  role: string;

  @IsBoolean()
  consent1: boolean;

  @IsBoolean()
  consent2: boolean;
}

export class OnboardingVerifyDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}
