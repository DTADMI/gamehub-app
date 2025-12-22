import {Animation, AnimationConfig} from '../types';

export class AnimationManager {
    private animations: Map<string, Animation> = new Map();
    private activeAnimations: Set<Animation> = new Set();

    create(config: AnimationConfig): Animation {
        const animation: Animation = {
            ...config,
            currentFrame: 0,
            frameTime: 0,
            isPlaying: false,
            loop: config.loop ?? true,
            onComplete: config.onComplete || (() => {
            }),
            onFrame: config.onFrame || (() => {
            })
        };

        this.animations.set(config.name, animation);
        return animation;
    }

    get(name: string): Animation | undefined {
        return this.animations.get(name);
    }

    play(name: string, reset: boolean = false): void {
        const animation = this.animations.get(name);
        if (!animation) return;

        if (reset) {
            animation.currentFrame = 0;
            animation.frameTime = 0;
        }

        if (!animation.isPlaying) {
            animation.isPlaying = true;
            this.activeAnimations.add(animation);
        }
    }

    pause(name: string): void {
        const animation = this.animations.get(name);
        if (animation && animation.isPlaying) {
            animation.isPlaying = false;
            this.activeAnimations.delete(animation);
        }
    }

    stop(name: string): void {
        const animation = this.animations.get(name);
        if (animation) {
            animation.isPlaying = false;
            animation.currentFrame = 0;
            animation.frameTime = 0;
            this.activeAnimations.delete(animation);
        }
    }

    update(deltaTime: number): void {
        for (const animation of this.activeAnimations) {
            if (!animation.isPlaying) continue;

            animation.frameTime += deltaTime * 1000; // Convert to ms
            const frameDuration = 1000 / animation.frameRate;

            while (animation.frameTime >= frameDuration) {
                animation.frameTime -= frameDuration;
                animation.currentFrame++;

                if (animation.currentFrame >= animation.frames.length) {
                    if (animation.loop) {
                        animation.currentFrame = 0;
                        animation.onComplete();
                    } else {
                        animation.currentFrame = animation.frames.length - 1;
                        animation.isPlaying = false;
                        this.activeAnimations.delete(animation);
                        animation.onComplete();
                        break;
                    }
                }

                // Call the frame callback
                animation.onFrame(animation.currentFrame);
            }
        }
    }

    getCurrentFrame(name: string): any {
        const animation = this.animations.get(name);
        if (!animation) return null;
        return animation.frames[animation.currentFrame];
    }

    destroy(): void {
        this.animations.clear();
        this.activeAnimations.clear();
    }
}