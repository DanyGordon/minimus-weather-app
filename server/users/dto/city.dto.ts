import { IsNotEmpty } from "class-validator";


export class CityDto {

  @IsNotEmpty()
  readonly city: string
}