export class Logger {
    private static instance: Logger;
    private enabled: boolean = true;
    private context: string = 'Game';
    private history: string[] = [];
    private maxHistory: number = 1000;

    private constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = this;
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    enable(): void {
        this.enabled = true;
    }

    disable(): void {
        this.enabled = false;
    }

    setContext(context: string): void {
        this.context = context;
    }

    debug(message: string, ...args: any[]): void {
        this.log('debug', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.log('info', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.log('warn', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.log('error', message, ...args);
    }

    getHistory(): string[] {
        return [...this.history];
    }

    clearHistory(): void {
        this.history = [];
    }

    private log(level: string, message: string, ...args: any[]): void {
        if (!this.enabled) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${this.context}] [${level.toUpperCase()}] ${message}`;

        // Add to history
        this.history.push(logMessage);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Log to console
        const logArgs = [logMessage, ...args];
        switch (level) {
            case 'debug':
                console.debug(...logArgs);
                break;
            case 'info':
                console.info(...logArgs);
                break;
            case 'warn':
                console.warn(...logArgs);
                break;
            case 'error':
                console.error(...logArgs);
                break;
            default:
                console.log(...logArgs);
        }
    }
}

// Singleton export
export const logger = Logger.getInstance();