import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { EventsServiceService } from './events-service.service';
import { CreateEventDto, UpdateEventDto } from '@app/common';

@Controller()
export class EventsServiceController {
    constructor(private readonly eventsServiceService: EventsServiceService) {}

    @Post()
    create(
        @Body() createEventDto: CreateEventDto,
        @Headers('x-user-id') userId: string,
    ) {
        return this.eventsServiceService.create(createEventDto, userId);
    }

    @Get()
    findAll() {
        return this.eventsServiceService.findAll();
    }

    @Get('my-events')
    findMyEvents(@Headers('x-user-id') userId: string) {
        return this.eventsServiceService.findMy(userId);
    }

    @Get(':id')
    findOne(@Param('id') eventId: string) {
        return this.eventsServiceService.findOne(eventId);
    }

    @Put(':id')
    update(
        @Param('id') eventId: string,
        @Body() updateEventDto: UpdateEventDto,
        @Headers('x-user-id') userId: string,
        @Headers('x-user-role') userRole: string,
    ) {
        return this.eventsServiceService.updateOne(
            eventId,
            updateEventDto,
            userId,
            userRole,
        );
    }

    @Post(':id/publish')
    publish(
        @Param('id') eventId: string,
        @Headers('x-user-id') userId: string,
        @Headers('x-user-role') userRole: string,
    ) {
      return this.eventsServiceService.publish(eventId, userId, userRole);
    }

    @Post(':id/cancel')
    cancel(
        @Param('id') eventId: string,
        @Headers('x-user-id') userId: string,
        @Headers('x-user-role') userRole: string,
    ) {
      return this.eventsServiceService.cancelEvent(eventId, userId, userRole);
    }
}
