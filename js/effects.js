// ClassPet Pro - 粒子特效和动画效果

// 粒子系统
class ParticleSystem {
    constructor(container) {
        this.container = container || document.body;
        this.particles = [];
        this.isRunning = false;
    }

    // 创建进化烟花效果
    createEvolutionFireworks(x, y, color) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(x, y, color, 'firework');
        }
        this.start();
    }

    // 创建加分粒子效果
    createScoreParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.createParticle(x, y, color, 'score');
        }
        this.start();
    }

    // 创建连击效果
    createComboEffect(x, y, combo) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FF00FF'];
        const color = colors[Math.min(combo - 1, colors.length - 1)];
        
        for (let i = 0; i < 20 + combo * 5; i++) {
            this.createParticle(x, y, color, 'combo');
        }
        this.start();
    }

    createParticle(x, y, color, type) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        this.container.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 100;
        
        this.particles.push({
            element: particle,
            vx: vx,
            vy: vy,
            life: 1,
            type: type
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.particles = this.particles.filter(p => {
            p.life -= 0.02;
            p.vy += 5; // 重力
            
            const currentLeft = parseFloat(p.element.style.left);
            const currentTop = parseFloat(p.element.style.top);
            
            p.element.style.left = (currentLeft + p.vx * 0.016) + 'px';
            p.element.style.top = (currentTop + p.vy * 0.016) + 'px';
            p.element.style.opacity = p.life;
            
            if (p.life <= 0) {
                p.element.remove();
                return false;
            }
            return true;
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isRunning = false;
        }
    }
}

// 连击管理器
class ComboManager {
    constructor() {
        this.combo = 0;
        this.lastClickTime = 0;
        this.comboTimeout = 2000;
        this.onComboChange = null;
    }

    addClick() {
        const now = Date.now();
        
        if (now - this.lastClickTime < this.comboTimeout) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        
        this.lastClickTime = now;

        if (this.onComboChange) {
            this.onComboChange(this.combo);
        }

        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => {
            this.combo = 0;
            if (this.onComboChange) {
                this.onComboChange(0);
            }
        }, this.comboTimeout);

        return this.combo;
    }

    getComboText() {
        if (this.combo < 3) return '';
        if (this.combo < 5) return 'Nice!';
        if (this.combo < 8) return 'Great!';
        if (this.combo < 10) return 'Amazing!';
        return 'Unbelievable!';
    }

    getBonusScore() {
        if (this.combo < 5) return 0;
        if (this.combo < 10) return 2;
        return 5;
    }
}

// 导出
window.ParticleSystem = ParticleSystem;
window.ComboManager = ComboManager;
