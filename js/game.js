class BinanceRacingGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesCanvas = document.getElementById('particles-canvas');
        
        this.canvas.width = 500;
        this.canvas.height = 700;
        this.particlesCanvas.width = this.canvas.width;
        this.particlesCanvas.height = this.canvas.height;
        
        this.score = 0;
        this.bnbCollected = 0;
        this.speedMultiplier = 1;
        this.maxSpeed = 1;
        this.gameRunning = false;
        this.animationId = null;
        this.lastTime = 0;
        
        // Nitro system
        this.nitro = 100;
        this.nitroMax = 100;
        this.nitroActive = false;
        this.nitroDrain = 0.5;
        this.nitroRegen = 0.1;
        
        // Initialize game objects
        this.car = new Car(
            this.canvas.width / 2 - 30,
            this.canvas.height - 150,
            this.canvas
        );
        
        this.obstacleManager = new ObstacleManager(
            this.canvas.width,
            this.canvas.height
        );
        
        this.particleSystem = new ParticleSystem(this.particlesCanvas);
        this.stars = new BackgroundStars(this.canvas);
        this.screenShake = new ScreenShake();
        this.speedLines = new SpeedLines(this.canvas);
        this.roadEffect = new RoadEffect(this.canvas);
        this.comboSystem = new ComboSystem();
        this.audioSystem = new AudioSystem();
        
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
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.car.moving = 'right';
                e.preventDefault();
            } else if (e.key === ' ') {
                if (this.nitro > 0) {
                    this.activateNitro();
                }
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.car.moving = null;
            } else if (e.key === ' ') {
                this.deactivateNitro();
            }
        });
    }

    activateNitro() {
        if (!this.nitroActive && this.nitro > 0) {
            this.nitroActive = true;
            this.car.activateNitro();
            this.audioSystem.playBoostSound();
            document.getElementById('nitro-bar').classList.add('active');
        }
    }

    deactivateNitro() {
        this.nitroActive = false;
        this.car.deactivateNitro();
        document.getElementById('nitro-bar').classList.remove('active');
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
        this.ctx.save();
        
        // Apply screen shake if active
        if (this.screenShake.isActive()) {
            this.screenShake.update(deltaTime);
            this.screenShake.apply(this.ctx);
        }

        // Draw road effect
        this.roadEffect.draw(this.ctx);
        this.roadEffect.update(this.speedMultiplier);

        // Draw stars
        this.stars.draw(this.ctx);
        this.stars.update(this.speedMultiplier);

        // Draw speed lines
        if (this.speedMultiplier > 1.5) {
            this.speedLines.draw(this.ctx);
            this.speedLines.update(this.speedMultiplier);
        }

        // Update and draw car
        this.car.update();
        this.car.draw(this.ctx);

        // Create exhaust particles
        if (Math.random() > 0.7) {
            const exhaust = this.car.getExhaustPosition();
            this.particleSystem.createTrail(exhaust.left.x, exhaust.left.y, '#888');
            this.particleSystem.createTrail(exhaust.right.x, exhaust.right.y, '#888');
        }

        // Create nitro trail
        if (this.nitroActive) {
            const exhaust = this.car.getExhaustPosition();
            this.particleSystem.createNitroTrail(exhaust.left.x, exhaust.left.y);
            this.particleSystem.createNitroTrail(exhaust.right.x, exhaust.right.y);
        }

        // Spawn obstacles
        this.obstacleManager.spawn(currentTime, this.score);

        // Update and draw obstacles
        const currentSpeed = this.nitroActive ? this.speedMultiplier * 1.8 : this.speedMultiplier;
        this.obstacleManager.update(currentSpeed);
        this.obstacleManager.draw(this.ctx);

        this.ctx.restore();

        // Update and draw particles
        this.particleSystem.update();
        this.particleSystem.draw();

        // Check collisions
        this.checkCollisions();

        // Update nitro
        this.updateNitro();

        // Update combo system
        this.comboSystem.update(deltaTime);

        // Update score with combo multiplier
        const scoreGain = Math.floor(this.speedMultiplier * this.comboSystem.getMultiplier());
        this.score += scoreGain;
        
        // Update UI
        this.updateUI();

        // Increase difficulty over time
        if (this.score % 1000 === 0 && this.score > 0) {
            this.increaseDifficulty();
        }

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    checkCollisions() {
        const obstacles = this.obstacleManager.getObstacles();
        
        for (let obstacle of obstacles) {
            if (this.car.checkCollision(obstacle)) {
                if (obstacle.type === 'obstacle') {
                    this.handleCrash(obstacle);
                    return;
                } else if (obstacle.type === 'coin') {
                    this.handleCoinCollection(obstacle);
                } else if (obstacle.type === 'boost') {
                    this.handleBoostCollection(obstacle);
                }
            }
        }
    }

    handleCrash(obstacle) {
        const center = obstacle.getCenter();
        this.particleSystem.createExplosion(center.x, center.y, '#FF4655', 30);
        this.screenShake.start(500, 10);
        this.audioSystem.playCrashSound();
        this.comboSystem.reset();
        this.gameOver();
    }

    handleCoinCollection(obstacle) {
        const center = obstacle.getCenter();
        this.bnbCollected++;
        this.score += Math.floor(100 * this.comboSystem.getMultiplier());
        this.particleSystem.createExplosion(center.x, center.y, '#F0B90B', 15);
        this.obstacleManager.removeObstacle(obstacle);
        this.audioSystem.playCoinSound();
        this.comboSystem.increment();
        this.updateComboDisplay();
    }

    handleBoostCollection(obstacle) {
        const center = obstacle.getCenter();
        this.nitro = Math.min(this.nitroMax, this.nitro + 30);
        this.score += 200;
        this.particleSystem.createExplosion(center.x, center.y, '#00F0FF', 20);
        this.obstacleManager.removeObstacle(obstacle);
        this.audioSystem.playBoostSound();
    }

    updateNitro() {
        if (this.nitroActive && this.nitro > 0) {
            this.nitro -= this.nitroDrain;
            if (this.nitro <= 0) {
                this.nitro = 0;
                this.deactivateNitro();
            }
        } else if (!this.nitroActive && this.nitro < this.nitroMax) {
            this.nitro += this.nitroRegen;
            this.nitro = Math.min(this.nitroMax, this.nitro);
        }

        const nitroPercent = (this.nitro / this.nitroMax) * 100;
        document.getElementById('nitro-bar').style.width = nitroPercent + '%';
        document.getElementById('nitro-percentage').textContent = Math.floor(nitroPercent) + '%';
    }

    updateComboDisplay() {
        const combo = this.comboSystem.getCombo();
        if (combo > 1) {
            const comboDisplay = document.getElementById('combo-display');
            const comboValue = document.getElementById('combo-value');
            comboValue.textContent = combo + 'x';
            comboDisplay.classList.add('active');
            
            setTimeout(() => {
                comboDisplay.classList.remove('active');
            }, 1000);
        }
    }

    increaseDifficulty() {
        this.speedMultiplier += 0.15;
        if (this.speedMultiplier > this.maxSpeed) {
            this.maxSpeed = this.speedMultiplier;
        }
        this.obstacleManager.increaseSpeed();
    }

    updateUI() {
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('bnb-collected').textContent = this.bnbCollected;
        document.getElementById('speed').textContent = Math.floor(this.speedMultiplier * 100);
    }

    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        
        // Update final stats
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-bnb').textContent = this.bnbCollected;
        document.getElementById('final-speed').textContent = Math.floor(this.maxSpeed * 100);
        document.getElementById('final-combo').textContent = this.comboSystem.getMaxCombo();
        
        setTimeout(() => {
            this.showScreen('game-over-screen');
        }, 1000);
    }

    resetGame() {
        this.score = 0;
        this.bnbCollected = 0;
        this.speedMultiplier = 1;
        this.maxSpeed = 1;
        this.nitro = 100;
        this.nitroActive = false;
        this.car.x = this.canvas.width / 2 - 30;
        this.car.y = this.canvas.height - 150;
        this.car.moving = null;
        this.car.deactivateNitro();
        this.obstacleManager.clear();
        this.obstacleManager.spawnInterval = 1200;
        this.particleSystem.clear();
        this.comboSystem = new ComboSystem();
        this.screenShake = new ScreenShake();
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