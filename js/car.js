class Car {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.speed = 8;
        this.canvas = canvas;
        this.color = '#F0B90B'; // Binance yellow
        this.moving = null;
    }

    draw(ctx) {
        // Car body (Binance colors)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Racing stripes
        ctx.fillStyle = '#0B0E11';
        ctx.fillRect(this.x + 10, this.y, 5, this.height);
        ctx.fillRect(this.x + 35, this.y, 5, this.height);
        
        // Windshield
        ctx.fillStyle = 'rgba(11, 14, 17, 0.7)';
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 20);
        
        // Binance logo on car
        ctx.fillStyle = '#0B0E11';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BNB', this.x + this.width / 2, this.y + 50);
        
        // Wheels
        ctx.fillStyle = '#1E2329';
        ctx.fillRect(this.x - 5, this.y + 15, 8, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 15, 8, 15);
        ctx.fillRect(this.x - 5, this.y + 50, 8, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 50, 8, 15);
        
        // Headlights
        ctx.fillStyle = '#FCD535';
        ctx.fillRect(this.x + 5, this.y + this.height - 5, 15, 3);
        ctx.fillRect(this.x + 30, this.y + this.height - 5, 15, 3);
    }

    moveLeft() {
        if (this.x > 0) {
            this.x -= this.speed;
        }
    }

    moveRight() {
        if (this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    update() {
        if (this.moving === 'left') {
            this.moveLeft();
        } else if (this.moving === 'right') {
            this.moveRight();
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
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
}