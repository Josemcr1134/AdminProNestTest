import { Transform, Type } from "class-transformer";
import { IsOptional, IsInt, Min, IsString, IsIn, min, IsBoolean, Max } from "class-validator";

export class QueryProductDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit: number = 10;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  categoryId: number;

  @IsOptional() @IsIn(['name', 'price', 'stock', 'createdAt'])
  sortBy: 'name' | 'price' | 'stock' | 'createdAt';

  @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional() @Type(() => Number) @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @Min(0)
  maxPrice?: number;

  @IsOptional() @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
