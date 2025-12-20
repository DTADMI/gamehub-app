// libs/shared/src/lib/particles.ts
// Lightweight, pooled particle system for canvas games (spark burst + dust puff)

export type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number; // ms remaining
    maxLife: number; // ms total (for fade)
    size: number; // px
    color: string;
    type: "spark" | "puff";
    active: boolean;
};

export type ParticlePoolOptions = {
    maxParticles?: number;
};

export class ParticlePool {
    private pool: Particle[];
    private max: number;

    constructor(opts: ParticlePoolOptions = {}) {
        this.max = Math.max(8, Math.min(512, opts.maxParticles ?? 64));
        this.pool = Array.from({length: this.max}, () => ({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 0,
            size: 0,
            color: "#fff",
            type: "spark" as const,
            active: false,
        }));
    }

    clear() {
        for (const p of this.pool) {
            p.active = false;
        }
    }

    emitSparkBurst(x: number, y: number, color: string, count = 10) {
        // 8–12 rays by default; ~300 ms lifetime
        const n = Math.min(count, this.max);
        for (let i = 0; i < n; i++) {
            const p = this.alloc();
            if (!p) {
                break;
            }
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.6 + Math.random() * 2.4; // logical px/ms
            const life = 220 + Math.random() * 130; // ms
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = life;
            p.maxLife = life;
            p.size = 2 + Math.random() * 2;
            p.color = color;
            p.type = "spark";
            p.active = true;
        }
    }

    emitDustPuff(
        x: number,
        y: number,
        baseColor = "rgba(255,255,255,0.9)",
        count = 5,
    ) {
        // 4–6 round puffs; 250–300 ms lifetime; slower, upward bias
        const n = Math.min(count, this.max);
        for (let i = 0; i < n; i++) {
            const p = this.alloc();
            if (!p) {
                break;
            }
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2);
            const speed = 0.4 + Math.random() * 0.9;
            const life = 220 + Math.random() * 120;
            p.x = x + (Math.random() - 0.5) * 6;
            p.y = y + (Math.random() - 0.5) * 4;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = life;
            p.maxLife = life;
            p.size = 3 + Math.random() * 4;
            p.color = baseColor;
            p.type = "puff";
            p.active = true;
        }
    }

    update(dtMs: number) {
        for (const p of this.pool) {
            if (!p.active) {
                continue;
            }
            p.life -= dtMs;
            if (p.life <= 0) {
                p.active = false;
                continue;
            }
            p.x += p.vx * dtMs;
            p.y += p.vy * dtMs;
            // simple gravity for sparks
            if (p.type === "spark") {
                p.vy += 0.004 * dtMs;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        // Round caps make thin lines more visible
        const prevComp = ctx.globalCompositeOperation;
        ctx.globalAlpha = 1;
        ctx.lineCap = "round";
        for (const p of this.pool) {
            if (!p.active) {
                continue;
            }
            const t = 1 - p.life / p.maxLife;
            const alpha = Math.max(0, 1 - t * 0.9);
            if (p.type === "spark") {
                // Force normal composition so sparks are visible across browsers/themes
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = this.withAlpha(p.color, Math.min(1, alpha * 1.1));
                ctx.lineWidth = Math.max(2.5, p.size * 1.35);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 22, p.y - p.vy * 22);
                ctx.stroke();
            } else {
                // Puffs: normal composition with slightly larger radius
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = this.withAlpha(p.color, Math.min(1, alpha * 1.2));
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(2.5, p.size * 1.1), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalCompositeOperation = prevComp;
        ctx.restore();
    }

    private withAlpha(color: string, alpha: number): string {
        // If color already has rgba, replace alpha; else wrap
        if (color.startsWith("rgba")) {
            return color.replace(
                /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,
                (_m, r, g, b) => `rgba(${r},${g},${b},${alpha})`,
            );
        }
        if (color.startsWith("#")) {
            // naive hex -> rgba
            const c = color.replace("#", "");
            const bigint = parseInt(
                c.length === 3
                    ? c
                        .split("")
                        .map((ch) => ch + ch)
                        .join("")
                    : c,
                16,
            );
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r},${g},${b},${alpha})`;
        }
        return color; // assume CSS color name; rely on global alpha if needed
    }

    private alloc(): Particle | null {
        for (const p of this.pool) {
            if (!p.active) {
                return p;
            }
        }
        return null; // pool saturated
    }
}
