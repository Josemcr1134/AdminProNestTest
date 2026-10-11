import { Transform } from "class-transformer";
import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;
}
