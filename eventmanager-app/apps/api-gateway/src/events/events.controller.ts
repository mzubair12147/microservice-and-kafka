import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common'; 
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto, UpdateEventDto } from '@app/common';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Get()
    async findAll() {
        console.log("getting all the events");
        return await this.eventsService.findAll();
    }

    // protected routes
    @UseGuards(AuthGuard('jwt'))
    @Get('my-events')
    findMyEvents(@Request() req: { user: { userId: string } }) {
        return this.eventsService.findMyEvents(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(
        @Body() createEventDto: CreateEventDto,
        @Request() req: { user: { userId: string; userRole?: string } },
    ) {
        return this.eventsService.create(
            createEventDto,
            req.user.userId,
            req.user.userRole || 'USER',
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(
        @Param('id') eventId: string,
        updateEventDto: UpdateEventDto,
        @Request() req: { user: { userId: string; userRole?: string } },
    ) {
        return this.eventsService.update(
            eventId,
            updateEventDto,
            req.user.userId,
            req.user.userRole || 'USER',
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id/publish')
    publish(
        @Param('id') eventId: string,
        @Request() req: { user: { userId: string; userRole?: string } },
    ) {
        return this.eventsService.publish(
            eventId,
            req.user.userId,
            req.user.userRole || 'USER',
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id/cancel')
    cancel(
        @Param('id') eventId: string,
        @Request() req: { user: { userId: string; userRole?: string } },
    ) {
        return this.eventsService.cancel(
            eventId,
            req.user.userId,
            req.user.userRole || 'USER',
        );
    }
}
