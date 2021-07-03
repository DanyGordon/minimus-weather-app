import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendUserDto {
  
  @IsNotEmpty()
  readonly firstname: string
  
  @IsNotEmpty()
  readonly lastname: string
  
  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @IsNotEmpty()
  readonly id: string

}