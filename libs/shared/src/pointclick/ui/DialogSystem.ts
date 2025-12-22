import {GameObject} from '../entities/GameObject';

export class DialogSystem extends GameObject {
    private messages: string[] = [];
    private currentMessage: string = '';
    private isVisible: boolean = false;
    private typingSpeed: number = 30; // ms per character
    private isTyping: boolean = false;
    private currentChar: number = 0;
    private typingTimeout?: number;

    constructor() {
        super({position: {x: 50, y: 400}, size: {x: 1180, y: 200}});
    }

    show(message: string | string[]) {
        this.messages = Array.isArray(message) ? [...message] : [message];
        this.nextMessage();
    }

    skipTyping() {
        if (this.isTyping) {
            clearTimeout(this.typingTimeout);
            this.currentChar = this.currentMessage.length;
            this.isTyping = false;
        } else {
            this.nextMessage();
        }
    }

    hide() {
        this.isVisible = false;
        this.messages = [];
        this.currentMessage = '';
    }

    update() {
        // Update logic if needed
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.isVisible) return;

        // Draw dialog box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);

        // Draw text
        const text = this.currentMessage.substring(0, this.currentChar);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textBaseline = 'top';

        const lines = this.wrapText(ctx, text, this.size.x - 40);
        lines.forEach((line, i) => {
            ctx.fillText(line, this.position.x + 20, this.position.y + 20 + (i * 25));
        });
    }

    private nextMessage() {
        if (this.messages.length === 0) {
            this.hide();
            return;
        }

        this.currentMessage = this.messages.shift()!;
        this.isVisible = true;
        this.isTyping = true;
        this.currentChar = 0;

        this.typeNextCharacter();
    }

    private typeNextCharacter() {
        if (this.currentChar < this.currentMessage.length) {
            this.currentChar++;
            this.typingTimeout = window.setTimeout(
                () => this.typeNextCharacter(),
                this.typingSpeed
            );
        } else {
            this.isTyping = false;
        }
    }

    private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;

            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}