import {GamePlugin} from '../types';
import {EventSystem} from '../utils/EventSystem';
import {logger} from '../utils/Logger';

export class DialoguePlugin implements GamePlugin {
    private eventSystem: EventSystem;
    private isActive: boolean = false;
    private currentDialogue: any = null;
    private currentOptions: any[] = [];
    private currentCallback: (() => void) | null = null;

    constructor() {
        this.eventSystem = new EventSystem();
    }

    async init(): Promise<void> {
        logger.info('Dialogue plugin initialized');
    }

    show(text: string, options: any[] = [], onComplete?: () => void): void {
        this.currentDialogue = {text};
        this.currentOptions = options;
        this.currentCallback = onComplete || null;
        this.isActive = true;

        this.eventSystem.emit('dialogue:show', {
            text,
            options
        });
    }

    selectOption(optionIndex: number): void {
        if (!this.isActive || optionIndex < 0 || optionIndex >= this.currentOptions.length) {
            return;
        }

        const option = this.currentOptions[optionIndex];
        if (option && typeof option.onSelect === 'function') {
            option.onSelect();
        }

        this.hide();
    }

    hide(): void {
        this.isActive = false;
        this.currentDialogue = null;
        this.currentOptions = [];

        if (this.currentCallback) {
            this.currentCallback();
            this.currentCallback = null;
        }

        this.eventSystem.emit('dialogue:hide');
    }

    update(deltaTime: number): void {
        // Update logic for animations or timed dialogues
    }

    on(event: string, handler: (...args: any[]) => void): () => void {
        return this.eventSystem.on(event, handler);
    }

    destroy(): void {
        this.eventSystem.clear();
        logger.info('Dialogue plugin destroyed');
    }
}