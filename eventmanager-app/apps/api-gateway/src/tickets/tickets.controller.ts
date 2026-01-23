import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from './tickets.service';
import { CheckedInTicketeDto, PurchaseTicketDto } from '@app/common';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}
    @Post('purchase')
    async purchase(
        @Body() purchaseDto: PurchaseTicketDto,
        @Request() req: { user: { userId: string } },
    ) {
        return await this.ticketsService.purchase(purchaseDto, req.user.userId);
    }

    @Get('my-tickets')
    findMyTickets(@Request() req: { user: { userId: string } }) {
        return this.ticketsService.findMy(req.user.userId);
    }

    @Get(':id')
    findOne(
        @Param('id') ticketId: string,
        @Request() req: { user: { userId: string } },
    ) {
        return this.ticketsService.findOne(ticketId, req.user.userId);
    }

    @Post(':id/cancel')
    cancel(
        @Param('id') ticketId: string,
        @Request() req: { user: { userId: string } },
    ) {
        return this.ticketsService.cancel(ticketId, req.user.userId);
    }

    @Post('check-in')
    checkIn(
        @Body() checkInDto: CheckedInTicketeDto,
        @Request() req: { user: { userId: string } },
    ) {
        return this.ticketsService.checkIn(
            checkInDto.ticketCode,
            req.user.userId,
        );
    }

    @Post('event/:eventId')
    findEventTickets(
        @Param('eventId') eventId: string,
        @Request() req: { user: { userId: string } },
    ) {
        return this.ticketsService.findEventTickets(eventId, req.user.userId);
    }
}
