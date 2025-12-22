import {GamePlugin} from '../types';
import {EventSystem} from '../utils/EventSystem';
import {logger} from '../utils/Logger';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockTime?: number;
    hidden: boolean;
    progress?: {
        current: number;
        target: number;
    };
}

export class AchievementPlugin implements GamePlugin {
    private eventSystem: EventSystem;
    private achievements: Map<string, Achievement> = new Map();
    private unlockedAchievements: Set<string> = new Set();

    constructor() {
        this.eventSystem = new EventSystem();
    }

    async init(): Promise<void> {
        // Load saved achievements from storage
        this.load();
        logger.info('Achievement plugin initialized');
    }

    register(achievement: Omit<Achievement, 'unlocked' | 'unlockTime'>): void {
        if (this.achievements.has(achievement.id)) {
            logger.warn(`Achievement with id '${achievement.id}' is already registered.`);
            return;
        }

        const newAchievement: Achievement = {
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id),
            unlockTime: this.unlockedAchievements.has(achievement.id) ? Date.now() : undefined
        };

        this.achievements.set(achievement.id, newAchievement);
    }

    unlock(achievementId: string): boolean {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) {
            return false;
        }

        achievement.unlocked = true;
        achievement.unlockTime = Date.now();
        this.unlockedAchievements.add(achievementId);

        // Save to storage
        this.save();

        // Notify listeners
        this.eventSystem.emit('achievement:unlocked', achievement);
        logger.info(`Achievement unlocked: ${achievement.name}`);

        return true;
    }

    getAchievement(achievementId: string): Achievement | undefined {
        return this.achievements.get(achievementId);
    }

    getUnlockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values())
            .filter(achievement => achievement.unlocked)
            .sort((a, b) => (a.unlockTime || 0) - (b.unlockTime || 0));
    }

    getLockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values())
            .filter(achievement => !achievement.unlocked && !achievement.hidden);
    }

    on(event: string, handler: (...args: any[]) => void): () => void {
        return this.eventSystem.on(event, handler);
    }

    reset(): void {
        this.unlockedAchievements.clear();
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            delete achievement.unlockTime;
        });
        localStorage.removeItem('achievements');
    }

    destroy(): void {
        this.eventSystem.clear();
        this.achievements.clear();
        this.unlockedAchievements.clear();
        logger.info('Achievement plugin destroyed');
    }

    private save(): void {
        const data = {
            version: 1,
            unlocked: Array.from(this.unlockedAchievements),
            timestamp: Date.now()
        };
        localStorage.setItem('achievements', JSON.stringify(data));
    }

    private load(): void {
        try {
            const data = localStorage.getItem('achievements');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.unlocked && Array.isArray(parsed.unlocked)) {
                    parsed.unlocked.forEach((id: string) => {
                        this.unlockedAchievements.add(id);
                    });
                }
            }
        } catch (error) {
            logger.error('Failed to load achievements:', error);
        }
    }
}