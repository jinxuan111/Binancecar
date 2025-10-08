class ScreenShake {
    constructor() {
        this.duration = 0;
        this.intensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    start(duration = 300, intensity = 5) {
        this.duration = duration;
        this.intensity = intensity;
    }

    update(deltaTime) {
        if (this.duration > 0) {
            this.duration -= deltaTime;
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }

    isActive() {
        return this.duration > 0;
    }
}

class SpeedLines {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.initLines();
    }

    initLines() {
        for (let i = 0; i < 30; i++) {
            this.lines.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 50 + 20,
                speed: Math.random() * 3 + 2,
                opacity: Math.random() * 0.5
            });
        }
    }

    update(speedMultiplier) {
        this.lines.forEach(line => {
            line.y += line.speed * speedMultiplier * 3;
            if (line.y > this.canvas.height) {
                line.y = -line.length;
                line.x = Math.random() * this.canvas.width;
            }
        });
    }

    draw(ctx) {
        ctx.save();
        this.lines.forEach(line => {
            ctx.globalAlpha = line.opacity;
            ctx.strokeStyle = '#F0B90B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x, line.y + line.length);
            ctx.stroke();
        });
        ctx.restore();
    }
}

class RoadEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = 0;
    }

    update(speedMultiplier) {
        this.offset += 5 * speedMultiplier;
        if (this.offset > 100) this.offset = 0;
    }

    draw(ctx) {
        // Road gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Center line
        ctx.save();
        ctx.strokeStyle = '#F0B90B';
        ctx.lineWidth = 4;
        ctx.setLineDash([30, 30]);
        ctx.lineDashOffset = -this.offset;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#F0B90B';
        
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, 0);
        ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        ctx.stroke();
        ctx.restore();

        // Side lines with perspective
        ctx.strokeStyle = 'rgba(240, 185, 11, 0.3)';
        ctx.lineWidth = 3;
        
        // Left line
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(20, this.canvas.height);
        ctx.stroke();
        
        // Right line
        ctx.beginPath();
        ctx.moveTo(this.canvas.width - 50, 0);
        ctx.lineTo(this.canvas.width - 20, this.canvas.height);
        ctx.stroke();

        // Road markers with perspective
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 10; i++) {
            const y = (i * 80 + this.offset) % this.canvas.height;
            const progress = y / this.canvas.height;
            const width = 15 + progress * 10;
            const height = 3;
            
            // Left markers
            ctx.fillRect(50 - (30 * progress), y, width, height);
            
            // Right markers
            ctx.fillRect(this.canvas.width - 50 + (30 * progress) - width, y, width, height);
        }

        // Perspective grid
        ctx.strokeStyle = 'rgba(240, 185, 11, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
            const y = (i * 50 + this.offset * 0.5) % this.canvas.height;
            const progress = y / this.canvas.height;
            const leftX = 50 - (30 * progress);
            const rightX = this.canvas.width - 50 + (30 * progress);
            
            ctx.beginPath();
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
            ctx.stroke();
        }
    }
}

class ComboSystem {
    constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2 seconds
    }

    increment() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        this.comboTimer = this.comboTimeout;
    }

    update(deltaTime) {
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
    }

    reset() {
        this.combo = 0;
        this.comboTimer = 0;
    }

    getCombo() {
        return this.combo;
    }

    getMaxCombo() {
        return this.maxCombo;
    }

    getMultiplier() {
        return 1 + (this.combo * 0.1);
    }
}

class AudioSystem {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }

    // Simple beep generator using Web Audio API
    playSound(frequency, duration, type = 'sine') {
        if (this.muted) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }

    playCoinSound() {
        this.playSound(800, 0.1, 'sine');
        setTimeout(() => this.playSound(1000, 0.1, 'sine'), 50);
    }

    playBoostSound() {
        this.playSound(200, 0.3, 'sawtooth');
    }

    playCrashSound() {
        this.playSound(100, 0.5, 'square');
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}