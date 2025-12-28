import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get('health')
    getHealth(): { status: string } {
        return {status: 'ok'};
    }

    @Get('meta')
    getMeta(): any {
        return this.appService.getMeta();
    }
}
