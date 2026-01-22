import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    private authServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        const authServiceUrl =
            this.configService.get<string>('AUTH_SERVICE_URL');
        if (!authServiceUrl)
            throw new Error(
                'AUTH_SERVICE_URL variable is not loaded successfully',
            );
        this.authServiceUrl = authServiceUrl;
    }

    async register(data: { email: string; name: string; password: string }) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/register`, data),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async login(data: { email: string; password: string }) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/login`, data),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async getProfile(token: string) {
        try {
            const response = await firstValueFrom(this.httpService.get(`${this.authServiceUrl}/profile`, {
                headers: {
                    Authorization: token
                }
            }));

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    private HandleError(error: any): never {
        if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
        }
        throw new HttpException('Something went wrong', 503);
    }
}
