class Car {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.speed = 10;
        this.canvas = canvas;
        this.moving = null;
        this.nitroActive = false;
        this.angle = 0;
        this.targetAngle = 0;
        this.tilt = 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Smooth angle transition
        this.angle += (this.targetAngle - this.angle) * 0.15;
        
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

        // Car shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.width, this.height);

        // Main body with gradient
        const bodyGradient = ctx.createLinearGradient(
            this.x, this.y, this.x + this.width, this.y
        );
        bodyGradient.addColorStop(0, '#FCD535');
        bodyGradient.addColorStop(0.5, '#F0B90B');
        bodyGradient.addColorStop(1, '#E0A008');
        
        ctx.fillStyle = bodyGradient;
        this.drawCarShape(ctx);

        // Glossy effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 10, this.y + 15, this.width - 20, 30);

        // Windshield with reflection
        const windshieldGradient = ctx.createLinearGradient(
            this.x, this.y + 20, this.x, this.y + 45
        );
        windshieldGradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
        windshieldGradient.addColorStop(1, 'rgba(11, 14, 17, 0.9)');
        
        ctx.fillStyle = windshieldGradient;
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y + 20);
        ctx.lineTo(this.x + 45, this.y + 20);
        ctx.lineTo(this.x + 40, this.y + 45);
        ctx.lineTo(this.x + 20, this.y + 45);
        ctx.closePath();
        ctx.fill();

        // Racing stripes
        ctx.fillStyle = '#0B0E11';
        ctx.fillRect(this.x + 15, this.y, 3, this.height);
        ctx.fillRect(this.x + 42, this.y, 3, this.height);

        // BNB Logo on hood
        ctx.fillStyle = '#0B0E11';
        ctx.font = 'bold 16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('BNB', this.x + this.width / 2, this.y + 65);

        // Wheels with details
        this.drawWheel(ctx, this.x - 8, this.y + 20);
        this.drawWheel(ctx, this.x + this.width + 2, this.y + 20);
        this.drawWheel(ctx, this.x - 8, this.y + 65);
        this.drawWheel(ctx, this.x + this.width + 2, this.y + 65);

        // Headlights
        if (this.nitroActive) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#00F0FF';
        }
        ctx.fillStyle = this.nitroActive ? '#00F0FF' : '#FFE066';
        ctx.fillRect(this.x + 8, this.y + this.height - 8, 18, 4);
        ctx.fillRect(this.x + 34, this.y + this.height - 8, 18, 4);
        ctx.shadowBlur = 0;

        // Nitro flames
        if (this.nitroActive) {
            this.drawNitroFlames(ctx);
        }

        ctx.restore();
    }

    drawCarShape(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y);
        ctx.lineTo(this.x + 55, this.y);
        ctx.lineTo(this.x + this.width, this.y + 10);
        ctx.lineTo(this.x + this.width, this.y + this.height - 10);
        ctx.lineTo(this.x + 55, this.y + this.height);
        ctx.lineTo(this.x + 5, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height - 10);
        ctx.lineTo(this.x, this.y + 10);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawWheel(ctx, x, y) {
        // Wheel body
        ctx.fillStyle = '#1E2329';
        ctx.fillRect(x, y, 12, 20);
        
        // Rim
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 2, y + 2, 8, 16);
        
        // Highlight
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 3, y + 3, 3, 14);
    }

    drawNitroFlames(ctx) {
        const flameColors = [
            { color: '#00F0FF', alpha: 0.8 },
            { color: '#B721FF', alpha: 0.6 },
            { color: '#F0B90B', alpha: 0.4 }
        ];

        flameColors.forEach((flame, index) => {
            ctx.save();
            ctx.globalAlpha = flame.alpha;
            ctx.fillStyle = flame.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = flame.color;
            
            const offset = index * 15;
            ctx.beginPath();
            ctx.moveTo(this.x + 15, this.y - offset);
            ctx.lineTo(this.x + 10, this.y - 20 - offset);
            ctx.lineTo(this.x + 20, this.y - 15 - offset);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.x + 45, this.y - offset);
            ctx.lineTo(this.x + 40, this.y - 15 - offset);
            ctx.lineTo(this.x + 50, this.y - 20 - offset);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    moveLeft() {
        if (this.x > 0) {
            this.x -= this.speed;
            this.targetAngle = -0.15;
        }
    }

    moveRight() {
        if (this.x < this.canvas.width - this.width) {
            this.x += this.speed;
            this.targetAngle = 0.15;
        }
    }

    update() {
        if (this.moving === 'left') {
            this.moveLeft();
        } else if (this.moving === 'right') {
            this.moveRight();
        } else {
            this.targetAngle = 0;
        }
    }

    activateNitro() {
        this.nitroActive = true;
    }

    deactivateNitro() {
        this.nitroActive = false;
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }

    checkCollision(obstacle) {
        const carBounds = this.getBounds();
        const obsBounds = obstacle.getBounds();

        return (
            carBounds.x < obsBounds.x + obsBounds.width &&
            carBounds.x + carBounds.width > obsBounds.x &&
            carBounds.y < obsBounds.y + obsBounds.height &&
            carBounds.y + carBounds.height > obsBounds.y
        );
    }

    getExhaustPosition() {
        return {
            left: { x: this.x + 15, y: this.y },
            right: { x: this.x + 45, y: this.y }
        };
    }
}