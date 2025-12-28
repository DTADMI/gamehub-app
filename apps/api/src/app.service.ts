import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
    getMeta(): any {
        return {
            name: 'GameHub API',
            version: '1.0.0',
            description: 'Unified backend for GameHub platform',
        };
    }
}
