import { PickType } from "@nestjs/swagger";
import { RegisterDto } from "../register/register.js";

export class LoginDto extends PickType(RegisterDto, ['email', 'password'] as const) { }
