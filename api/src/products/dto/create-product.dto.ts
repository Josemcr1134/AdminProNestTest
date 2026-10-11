import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from "class-validator";

export class CreateProductDto {

  @IsString() @Length(2, 100)
  name: string;

  @IsString() @Length(3, 30)
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive()
  price: number;

  @IsInt() @Min(0)
  stock: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsInt()
  categoryId: number;


}
