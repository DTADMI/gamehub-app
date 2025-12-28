type EventHandler = (...args: any[]) => void;

export class EventSystem {
    private events: Map<string, Set<EventHandler>> = new Map();

    on(event: string, handler: EventHandler): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        const handlers = this.events.get(event)!;
        handlers.add(handler);

        // Return unsubscribe function
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        };
    }

    off(event: string, handler: EventHandler): void {
        if (this.events.has(event)) {
            const handlers = this.events.get(event)!;
            handlers.delete(handler);

            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }

    emit(event: string, ...args: any[]): void {
        if (this.events.has(event)) {
            for (const handler of this.events.get(event)!) {
                try {
                    handler(...args);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            }
        }
    }

    once(event: string, handler: EventHandler): void {
        const onceHandler = (...args: any[]) => {
            this.off(event, onceHandler);
            handler(...args);
        };
        this.on(event, onceHandler);
    }

    clear(): void {
        this.events.clear();
    }
}