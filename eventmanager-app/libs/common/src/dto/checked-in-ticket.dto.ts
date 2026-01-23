import { IsNotEmpty, IsString } from "class-validator";

export class CheckedInTicketeDto {
    @IsString()
    @IsNotEmpty()
    ticketCode : string
}