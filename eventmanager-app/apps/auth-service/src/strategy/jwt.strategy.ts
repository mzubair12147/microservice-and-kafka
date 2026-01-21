import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || "this-is-a-jwt-secret"
        })
    }

    // sub will be the id of the token or the id of the user in the database (I guess!);
    async validate(payload: {sub: string, email: string}) {
        return {userId: payload.sub, email: payload.email};
    }
}