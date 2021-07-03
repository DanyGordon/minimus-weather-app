import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  
  readonly id?: string

  @IsNotEmpty()
  readonly firstname: string

  @IsNotEmpty()
  readonly lastname: string

  @IsNotEmpty()
  @IsEmail()
  readonly email: string
  
  @IsNotEmpty()
  @Length(8)
  readonly password: string
}