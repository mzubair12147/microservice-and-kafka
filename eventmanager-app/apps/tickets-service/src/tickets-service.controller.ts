import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { TicketsServiceService } from './tickets-service.service';
import { CheckedInTicketeDto, PurchaseTicketDto } from '@app/common';

@Controller()
export class TicketsServiceController {
    constructor(
        private readonly ticketsServiceService: TicketsServiceService,
    ) {}

    @Post('purchase')
    async purchase(
        @Body() purchaseDto: PurchaseTicketDto,
        @Headers('x-user-id') userId: string,
    ) {
        return await this.ticketsServiceService.purchase(purchaseDto, userId);
    }

    @Get('my-tickets')
    findMyTickets(@Headers('x-user-id') userId: string) {
        return this.ticketsServiceService.findMy(userId);
    }

    @Get(':id')
    findOne(
        @Param('id') ticketId: string,
        @Headers('x-user-id') userId: string,
    ) {
        return this.ticketsServiceService.findOne(ticketId, userId);
    }

    @Post(':id/cancel')
    cancel(
        @Param('id') ticketId: string,
        @Headers('x-user-id') userId: string,
    ) {
        return this.ticketsServiceService.cancel(ticketId, userId);
    }

    @Post('check-in')
    checkIn(
        @Body() checkInDto: CheckedInTicketeDto,
        @Headers('x-user-id') organizerId: string,
    ) {
        return this.ticketsServiceService.checkIn(
            checkInDto.ticketCode,
            organizerId,
        );
    }

    @Post('event/:eventId')
    findEventTickets(
        @Param('eventId') eventId: string,
        @Headers('x-user-id') organizerId: string,
    ) {
        return this.ticketsServiceService.findEventTickets(
            eventId,
            organizerId,
        );
    }
}
