class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.type = type; // 'obstacle' or 'coin'
    }

    draw(ctx) {
        if (this.type === 'obstacle') {
            // Red obstacle (bear market)
            ctx.fillStyle = '#F6465D';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Warning symbol
            ctx.fillStyle = '#EAECEF';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚠', this.x + this.width / 2, this.y + 38);
            
        } else if (this.type === 'coin') {
            // BNB Coin
            ctx.fillStyle = '#F0B90B';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle
            ctx.fillStyle = '#FCD535';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // BNB text
            ctx.fillStyle = '#0B0E11';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BNB', this.x + this.width / 2, this.y + this.height / 2 + 5);
        }
    }

    update(speedMultiplier = 1) {
        this.y += this.speed * speedMultiplier;
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnInterval = 1500; // milliseconds
        this.lastSpawnTime = 0;
        this.coinProbability = 0.4; // 40% chance for coin
    }

    spawn(currentTime) {
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            const x = Math.random() * (this.canvasWidth - 50);
            const type = Math.random() < this.coinProbability ? 'coin' : 'obstacle';
            this.obstacles.push(new Obstacle(x, -50, type));
            this.lastSpawnTime = currentTime;
        }
    }

    update(speedMultiplier) {
        this.obstacles.forEach(obstacle => {
            obstacle.update(speedMultiplier);
        });

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(
            obstacle => !obstacle.isOffScreen(this.canvasHeight)
        );
    }

    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            obstacle.draw(ctx);
        });
    }

    getObstacles() {
        return this.obstacles;
    }

    removeObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
            this.obstacles.splice(index, 1);
        }
    }

    clear() {
        this.obstacles = [];
    }

    increaseSpeed() {
        // Decrease spawn interval to increase difficulty
        this.spawnInterval = Math.max(800, this.spawnInterval - 100);
    }
}