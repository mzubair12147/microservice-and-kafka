import { CreateEventDto, UpdateEventDto } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class EventsService {
    private eventsServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        const eventServiceUrl = this.configService.get<string>('EVENTS_SERVICE_URL');
        if (!eventServiceUrl)
            throw new InternalServerErrorException(
                'EVENTS_SERVICE_URL is not set',
            );
        this.eventsServiceUrl = eventServiceUrl;
    }

    async create(data: CreateEventDto, userid: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.eventsServiceUrl}/`,
                    {
                        data,
                    },
                    {
                        headers: {
                            'x-user-id': userid,
                            'x-user-role': userRole,
                        },
                    },
                ),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async update(
        eventId: string,
        data: UpdateEventDto,
        userId: string,
        userRole: string,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.put(
                    `${this.eventsServiceUrl}/${eventId}`,
                    {
                        data,
                    },
                    {
                        headers: {
                            'x-user-id': userId,
                            'x-user-role': userRole,
                        },
                    },
                ),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async findAll() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.eventsServiceUrl}/`),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async findMyEvents(userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.eventsServiceUrl}/my-events`, {
                    headers: {
                        'x-user-id': userId,
                    },
                }),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async findOne(eventId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.eventsServiceUrl}/${eventId}`),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async publish(eventId: string, userid: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.eventsServiceUrl}/${eventId}/publish`,
                    {},
                    {
                        headers: {
                            'x-user-id': userid,
                            'x-user-role': userRole,
                        },
                    },
                ),
            );

            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async cancel(eventId: string, userid: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.eventsServiceUrl}/${eventId}/cancel`,
                    {},
                    {
                        headers: {
                            'x-user-id': userid,
                            'x-user-role': userRole,
                        },
                    },
                ),
            );

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
