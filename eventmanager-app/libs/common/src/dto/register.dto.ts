import {IsEmail, IsNotEmpty, IsString, IsStrongPassword} from "class-validator"

export class RegisterDto {
    @IsEmail({}, {message: "Please provide a valid email"})
    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email : string;
}