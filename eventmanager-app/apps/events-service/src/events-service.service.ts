import { CreateEventDto, UpdateEventDto } from '@app/common';
import { DatabaseService, events } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';

@Injectable()
export class EventsServiceService implements OnModuleInit {
    constructor(
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
        private readonly dbService: DatabaseService,
    ) {}
    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async create(eventDto: CreateEventDto, organizerId: string) {
        const [event] = await this.dbService.db
            .insert(events)
            .values({ ...eventDto, organizerId: organizerId })
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CREATED, {
            eventId: event.id,
            organizerId: organizerId,
            title: event.title,
            timestamp: new Date().toISOString(),
        });

        return event;
    }

    async findAll() {
        return await this.dbService.db
            .select()
            .from(events)
            .where(eq(events.status, 'PUBLISHED'));
    }

    async findOne(eventId: string) {
        const [event] = await this.dbService.db
            .select()
            .from(events)
            .where(eq(events.id, eventId));
        if (!event) throw new NotFoundException('Event not Found');
        return event;
    }

    async updateOne(
        eventId: string,
        updateEventDto: UpdateEventDto,
        userId: string,
        userRole: string,
    ) {
        const event = await this.findOne(eventId);
        if (event.organizerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('Not authorized to update this event');
        }

        const updatedEvent: Record<string, unknown> = { ...updateEventDto };

        if (updateEventDto.date) {
            updatedEvent.date = new Date(updateEventDto.date);
        }
        updatedEvent.updatedAt = new Date();

        const [updated] = await this.dbService.db
            .update(events)
            .set(updatedEvent)
            .where(eq(events.id, eventId))
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
            eventId: updated.id,
            changes: Object.keys(updateEventDto),
            timestamp: new Date(),
        });

        return updated;
    }

    async publish(eventId: string, userId: string, userRole: string) {
        const event = await this.findOne(eventId);

        if (event.organizerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException(
                'Not authorized to publish this event',
            );
        }

        const [published] = await this.dbService.db
            .update(events)
            .set({ status: 'PUBLISHED' })
            .where(eq(events.id, eventId))
            .returning();

        return published;
    }

    async cancelEvent(eventId: string, userId: string, userRole: string) {
        const event = await this.findOne(eventId);

        if (event.organizerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('Not authorized to cancel this event');
        }

        const [cancelled] = await this.dbService.db
            .update(events)
            .set({ status: 'CANCELLED' })
            .where(eq(events.id, eventId))
            .returning();

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
            eventId: cancelled.id,
            organizerId: cancelled.organizerId,
            timestamp: new Date().toISOString(),
        });

        return cancelled;
    }

    async findMy(organizerId: string) {
        return this.dbService.db
            .select()
            .from(events)
            .where(eq(events.organizerId, organizerId));
    }
}
