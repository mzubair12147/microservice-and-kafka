import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DatabaseService, events, tickets } from '@app/database';
import { randomBytes } from 'crypto';
import { PurchaseTicketDto } from '@app/common';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class TicketsServiceService implements OnModuleInit {
    constructor(
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
        private readonly dbService: DatabaseService,
    ) {}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async purchase(purchaseTicketDto: PurchaseTicketDto, userId: string) {
        const { eventId, quantity } = purchaseTicketDto;

        const [event] = await this.dbService.db
            .select()
            .from(events)
            .where(eq(events.id, eventId));
        if (!event) throw new NotFoundException('Event not Found');

        if (event.status !== 'PUBLISHED')
            throw new BadRequestException('Event is not published');

        const soldTickets = await this.dbService.db
            .select({
                total: sql<number>`COALESCE(SUM(${tickets.quantity}),0)`,
            })
            .from(tickets)
            .where(
                and(
                    eq(tickets.eventId, eventId),
                    eq(tickets.status, 'CONFIRMED'),
                ),
            );

        const currentSold = Number(soldTickets[0]?.total || 0);
        const remaining = event.capacity - currentSold;

        if (quantity > remaining)
            throw new BadRequestException('Not enough tickets available');

        const totalPrice = event.price * quantity;

        const [ticket] = await this.dbService.db
            .insert(tickets)
            .values({
                eventId,
                userId,
                quantity,
                totalPrice,
                ticketCode: this.generateTicketCode(),
                status: 'PENDING',
            })
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, {
            ticketId: ticket.id,
            eventId: ticket.eventId,
            userId: ticket.userId,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice,
            ticketCode: ticket.ticketCode,
            timestamp: new Date().toISOString(),
        });
        return {
            message: 'Ticket Purchase successful',
            ticket: {
                id: ticket.id,
                ticketCode: ticket.ticketCode,
                eventTitle: event.title,
                quantity: ticket.quantity,
                totalPrice: ticket.totalPrice,
                status: ticket.status,
                purchasedAt: new Date().toISOString(),
            },
        };
    }

    async findMy(userId: string) {
        return this.dbService.db
            .select()
            .from(tickets)
            .where(eq(tickets.userId, userId));
    }

    async findOne(ticketId: string, userId: string) {
        const [ticket] = await this.dbService.db
            .select({
                id: tickets.id,
                ticketCode: tickets.ticketCode,
                quantity: tickets.quantity,
                totalPrice: tickets.totalPrice,
                status: tickets.status,
                purchasedAt: tickets.purchasedAt,
                checkedInAt: tickets.checkedInAt,
                userId: tickets.userId,
                eventId: events.id,
                eventTitle: events.title,
                eventDate: events.date,
                eventLocation: events.location,
            })
            .from(tickets)
            .innerJoin(events, eq(tickets.eventId, events.id))
            .where(and(eq(tickets.id, ticketId), eq(tickets.userId, userId)))
            .limit(1);

        if (!ticket) throw new NotFoundException('ticket not found');
        if (ticket.userId !== userId)
            throw new BadRequestException("Ticket doesn't belong to the user");

        return ticket;
    }

    async cancel(ticketId: string, userId: string) {
        const [ticket] = await this.dbService.db
            .select()
            .from(tickets)
            .where(and(eq(tickets.id, ticketId), eq(tickets.userId, userId)))
            .limit(1);

        if (!ticket) throw new NotFoundException('ticket not found');
        if (ticket.userId !== userId)
            throw new BadRequestException("Ticket doesn't belong to the user");

        if (ticket.status === 'CANCELLED')
            throw new BadRequestException('Ticket is already cancelled');

        const [updatedTicket] = await this.dbService.db
            .update(tickets)
            .set({ status: 'CANCELLED', updatedAt: new Date() })
            .where(eq(tickets.id, ticketId))
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, {
            ticketId: updatedTicket.id,
            eventId: updatedTicket.eventId,
            userId: updatedTicket.userId,
            timestamp: new Date().toISOString(),
        });

        return {
            message: 'ticket cancelled successfully',
            ticket: updatedTicket,
        };
    }

    async checkIn(ticketCode: string, organizerId: string) {
        const [ticket] = await this.dbService.db
            .select({
                id: tickets.id,
                status: tickets.status,
                eventId: events.id,
                quantity: tickets.quantity,
            })
            .from(tickets)
            .innerJoin(events, eq(tickets.eventId, events.id))
            .where(eq(tickets.ticketCode, ticketCode))
            .limit(1);

        if (!ticket) throw new NotFoundException('ticket not found');

        const [event] = await this.dbService.db
            .select()
            .from(events)
            .where(eq(tickets.id, ticket.eventId))
            .limit(1);

        if (event.organizerId !== organizerId)
            throw new ForbiddenException(
                'You are not authorized to check in this ticket',
            );

        if (ticket.status === 'CHECKED_IN')
            throw new BadRequestException('Ticket is already checked in');
        if (ticket.status === 'CANCELLED')
            throw new BadRequestException('Ticket is already cancelled');

        const [updatedTicket] = await this.dbService.db
            .update(tickets)
            .set({
                status: 'CHECKED_IN',
                updatedAt: new Date(),
                checkedInAt: new Date(),
            })
            .where(eq(tickets.id, ticket.id))
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CHECKED_IN, {
            ticketId: updatedTicket.id,
            eventId: updatedTicket.eventId,
            ticketCode: updatedTicket.ticketCode,
            timestamp: new Date(),
        });

        return {
            message: 'Ticked successfully checked In',
            ticket: {
                id: updatedTicket.id,
                ticketCode: updatedTicket.ticketCode,
                quantity: updatedTicket.quantity,
                status: updatedTicket.status,
                checkedInAt: updatedTicket.checkedInAt,
            },
        };
    }

    async findEventTickets(eventId: string, organizerId: string) {
        const [event] = await this.dbService.db
            .select()
            .from(events)
            .where(eq(events.id, eventId))
            .limit(1);
        if (!event) throw new NotFoundException('Event not Found');

        if (event.organizerId !== organizerId)
            throw new BadRequestException(
                'you are not authorized to check in to this event',
            );
        return this.dbService.db
            .select()
            .from(tickets)
            .where(eq(tickets.eventId, event.id));
    }

    private generateTicketCode(): string {
        return randomBytes(6).toString('hex').toUpperCase();
    }
}
