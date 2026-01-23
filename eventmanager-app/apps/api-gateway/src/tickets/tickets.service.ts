import { PurchaseTicketDto } from '@app/common';
import { HttpService } from '@nestjs/axios';
import {
    HttpException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TicketsService {
    private ticketServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        const ticketServiceUrl =
            configService.get<string>('TICKET_SERVICE_URL');
        if (!ticketServiceUrl)
            throw new InternalServerErrorException(
                'TICKET_SERVICE_URL env variable is not set',
            );
        this.ticketServiceUrl = ticketServiceUrl;
    }

    async purchase(data: PurchaseTicketDto, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ticketServiceUrl}/purchase`,
                    { data },
                    {
                        headers: {
                            'x-user-id': userId,
                        },
                    },
                ),
            );
            return response.data;
        } catch (err) {
            this.HandleError(err);
        }
    }

    async findMy(userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.ticketServiceUrl}/my-tickets`, {
                    headers: {
                        'x-user-id': userId,
                    },
                }),
            );
            return response.data;
        } catch (err) {
            this.HandleError(err);
        }
    }

    async findOne(ticketId: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.ticketServiceUrl}/${ticketId}`, {
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

    async cancel(ticketId: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ticketServiceUrl}/${ticketId}/cancel`,
                    {},
                    {
                        headers: {
                            'x-user-id': userId,
                        },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async checkIn(ticketId: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ticketServiceUrl}/${ticketId}/check-in`,
                    {},
                    {
                        headers: {
                            'x-user-id': userId,
                        },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.HandleError(error);
        }
    }

    async findEventTickets(eventId: string, organizerId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.ticketServiceUrl}/event/${eventId}`,
                    {
                        headers: {
                            'x-user-id': organizerId,
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
