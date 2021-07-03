import { ArrayNotEmpty } from "class-validator";

export class CitiesDto {
  
  @ArrayNotEmpty()
  readonly cities: Array<{ city: string }>
}