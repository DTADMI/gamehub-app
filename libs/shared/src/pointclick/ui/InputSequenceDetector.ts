// In ui/InputSequenceDetector.ts
import {Vector2} from "../types";

export type InputType = 'keydown' | 'keyup' | 'pointerdown' | 'pointerup' | 'swipe' | 'longpress' | 'doubletap';

export interface InputSequenceEvent {
    type: InputType;
    key?: string;
    position?: Vector2;
}

export class InputSequenceDetector {
    private sequence: InputType[] = [];
    private maxSequenceLength: number;
    private onSequenceMatched: (sequence: InputType[]) => void;
    private targetSequence: InputType[];

    constructor(targetSequence: InputType[], onMatched: (sequence: InputType[]) => void) {
        this.targetSequence = targetSequence;
        this.maxSequenceLength = targetSequence.length;
        this.onSequenceMatched = onMatched;
    }

    processInput(event: InputSequenceEvent): void {
        // Add the new input to the sequence
        this.sequence.push(event.type);

        // Keep only the last N inputs
        if (this.sequence.length > this.maxSequenceLength) {
            this.sequence.shift();
        }

        // Check if the sequence matches
        if (this.sequence.length === this.targetSequence.length) {
            let match = true;
            for (let i = 0; i < this.targetSequence.length; i++) {
                if (this.sequence[i] !== this.targetSequence[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                this.onSequenceMatched([...this.sequence]);
                this.sequence = []; // Reset after match
            }
        }
    }

    reset(): void {
        this.sequence = [];
    }
}