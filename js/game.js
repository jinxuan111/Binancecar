class BinanceRacingGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        this.score = 0;
        this.bnbCollected = 0;
        this.speedMultiplier = 1;
        this.gameRunning = false;
        this.animationId = null;
        this.lastTime = 0;
        
        this.car = new Car(
            this.canvas.width / 2 - 25,
            this.canvas.height - 120,
            this.canvas
        );
        
        this.obstacleManager = new ObstacleManager(
            this.canvas.width,
            this.canvas.height
        );
        
        this.setupEventListeners();
        this.setupControls();
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            if (e.key === 'ArrowLeft') {
                this.car.moving = 'left';
            } else if (e.key === 'ArrowRight') {
                this.car.moving = 'right';
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.car.moving = null;
            }
        });
    }

    startGame() {
        this.showScreen('game-screen');
        this.gameRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    gameLoop(currentTime) {
        if (!this.gameRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clear canvas
        this.ctx.fillStyle = '#1E2329';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road lines
        this.drawRoad(currentTime);

        // Update and draw car
        this.car.update();
        this.car.draw(this.ctx);

        // Spawn obstacles
        this.obstacleManager.spawn(currentTime);

        // Update and draw obstacles
        this.obstacleManager.update(this.speedMultiplier);
        this.obstacleManager.draw(this.ctx);

        // Check collisions
        this.checkCollisions();

        // Update score
        this.score += Math.floor(this.speedMultiplier);
        this.updateUI();

        // Increase difficulty over time
        if (this.score % 500 === 0 && this.score > 0) {
            this.increaseDifficulty();
        }

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    drawRoad(currentTime) {
        const lineHeight = 40;
        const lineWidth = 5;
        const lineSpeed = 10 * this.speedMultiplier;
        const offset = (currentTime * lineSpeed / 100) % (lineHeight * 2);

        this.ctx.strokeStyle = '#F0B90B';
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([lineHeight, lineHeight]);
        this.ctx.lineDashOffset = -offset;

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    checkCollisions() {
        const obstacles = this.obstacleManager.getObstacles();
        
        for (let obstacle of obstacles) {
            if (this.car.checkCollision(obstacle)) {
                if (obstacle.type === 'obstacle') {
                    this.gameOver();
                    return;
                } else if (obstacle.type === 'coin') {
                    this.bnbCollected++;
                    this.score += 50;
                    this.obstacleManager.removeObstacle(obstacle);
                }
            }
        }
    }

    increaseDifficulty() {
        this.speedMultiplier += 0.1;
        this.obstacleManager.increaseSpeed();
    }

    updateUI() {
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('bnb-collected').textContent = this.bnbCollected;
        document.getElementById('speed').textContent = this.speedMultiplier.toFixed(1) + 'x';
    }

    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        
        // Update final stats
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-bnb').textContent = this.bnbCollected;
        document.getElementById('final-speed').textContent = this.speedMultiplier.toFixed(1) + 'x';
        
        this.showScreen('game-over-screen');
    }

    resetGame() {
        this.score = 0;
        this.bnbCollected = 0;
        this.speedMultiplier = 1;
        this.car.x = this.canvas.width / 2 - 25;
        this.car.y = this.canvas.height - 120;
        this.car.moving = null;
        this.obstacleManager.clear();
        this.obstacleManager.spawnInterval = 1500;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new BinanceRacingGame();
});