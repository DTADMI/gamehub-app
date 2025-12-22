import {GamePlugin} from '../types';
import {EventSystem} from '../utils/EventSystem';
import {logger} from '../utils/Logger';

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    quantity: number;
    maxStack: number;
    metadata?: any;
}

export class InventoryPlugin implements GamePlugin {
    private eventSystem: EventSystem;
    private items: Map<string, InventoryItem> = new Map();
    private maxSlots: number = 20;
    private onChangeCallbacks: Array<() => void> = [];

    constructor() {
        this.eventSystem = new EventSystem();
    }

    async init(): Promise<void> {
        logger.info('Inventory plugin initialized');
    }

    addItem(item: Omit<InventoryItem, 'quantity'>, quantity: number = 1): boolean {
        if (this.items.size >= this.maxSlots && !this.hasItem(item.id)) {
            return false; // No more slots available
        }

        const existingItem = this.items.get(item.id);
        if (existingItem) {
            // Stack items if possible
            const newQuantity = existingItem.quantity + quantity;
            if (existingItem.maxStack > 1 && newQuantity <= existingItem.maxStack) {
                existingItem.quantity = newQuantity;
                this.notifyChange();
                return true;
            }
            return false; // Can't stack more
        }

        // Add new item
        this.items.set(item.id, {...item, quantity});
        this.notifyChange();
        return true;
    }

    removeItem(itemId: string, quantity: number = 1): boolean {
        const item = this.items.get(itemId);
        if (!item) return false;

        if (item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            this.items.delete(itemId);
        }

        this.notifyChange();
        return true;
    }

    hasItem(itemId: string, quantity: number = 1): boolean {
        const item = this.items.get(itemId);
        return item ? item.quantity >= quantity : false;
    }

    getItem(itemId: string): InventoryItem | undefined {
        return this.items.get(itemId);
    }

    getAllItems(): InventoryItem[] {
        return Array.from(this.items.values());
    }

    clear(): void {
        this.items.clear();
        this.notifyChange();
    }

    on(event: string, handler: (...args: any[]) => void): () => void {
        return this.eventSystem.on(event, handler);
    }

    onChange(callback: () => void): () => void {
        this.onChangeCallbacks.push(callback);
        return () => {
            this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
        };
    }

    destroy(): void {
        this.eventSystem.clear();
        this.items.clear();
        this.onChangeCallbacks = [];
        logger.info('Inventory plugin destroyed');
    }

    private notifyChange(): void {
        this.eventSystem.emit('inventory:change', {items: this.getAllItems()});
        this.onChangeCallbacks.forEach(callback => callback());
    }
}