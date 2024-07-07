// Game configuration
const GAME_CONFIG = {
    TOTAL_OBJECTS: 10,  // Total objects before the game ends
};

class Game {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.player = document.getElementById('player');
        this.scoreValue = document.getElementById('score-value');
        this.missedValue = document.getElementById('missed-value');
        this.statsDiv = document.getElementById('stats');
        this.introScreen = document.getElementById('intro-screen');
        this.rulesDiv = document.getElementById('rules');
        this.startButton = document.getElementById('start-button');

        this.score = 0;
        this.missed = 0;
        this.totalProcessed = 0;
        this.gameSpeed = 2;
        this.lastSpeedIncrease = 0;
        this.playerName = "";
        this.selectedTheme = "";
        this.gameInterval = null;
        this.gameObjects = [];
        this.objectStats = {};

        this.bindEvents();
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.gameContainer.addEventListener('mousemove', (e) => this.movePlayer(e));
        this.gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.movePlayer(e.touches[0]);
        });
    }

    startGame() {
        this.playerName = document.getElementById('player-name').value || "Player";
        this.selectedTheme = document.getElementById('theme-select').value;
        this.gameObjects = themes[this.selectedTheme];
        this.objectStats = {};
        this.gameObjects.forEach(obj => this.objectStats[obj.name] = 0);
        this.introScreen.style.display = 'none';
        this.updateStats();
        this.gameInterval = setInterval(() => this.createGameObject(), 1000);
        this.updateRules();
    }

    updateStats() {
        this.statsDiv.innerHTML = `<h2>${this.playerName}'s Scorecard</h2>`;
        Object.entries(this.objectStats).forEach(([name, count]) => {
            const obj = this.gameObjects.find(o => o.name === name);
            this.statsDiv.innerHTML += `
                <div class="stat-item">
                    <span>${obj.symbol} ${name}</span>
                    <span>${count}</span>
                </div>
            `;
        });
        this.statsDiv.innerHTML += `
            <div class="stat-item">
                <span>Objects Left</span>
                <span>${GAME_CONFIG.TOTAL_OBJECTS - this.totalProcessed}</span>
            </div>
        `;
    }

    updateRules() {
        const slowObject = this.gameObjects.find(obj => obj.special === 'slow');
        const fastObject = this.gameObjects.find(obj => obj.special === 'fast');
        const rulesListItem = this.rulesDiv.querySelector('ul li:nth-child(4)');
        rulesListItem.innerHTML = `Special objects:
            <ul>
                <li>Slow object (${slowObject.symbol} ${slowObject.name}): Decreases game speed</li>
                <li>Fast object (${fastObject.symbol} ${fastObject.name}): Increases game speed</li>
            </ul>`;
    }

    movePlayer(e) {
        const gameRect = this.gameContainer.getBoundingClientRect();
        const playerRect = this.player.getBoundingClientRect();
        const maxX = gameRect.width - playerRect.width;
        let x;
        if (e.clientX) {
            // Mouse event
            x = e.clientX - gameRect.left - playerRect.width / 2;
        } else {
            // Touch event
            x = e.pageX - gameRect.left - playerRect.width / 2;
        }
        x = Math.max(0, Math.min(x, maxX));
        this.player.style.left = x + 'px';
    }

    createGameObject() {
        if (this.totalProcessed >= GAME_CONFIG.TOTAL_OBJECTS) {
            this.endGame();
            return;
        }

        const object = document.createElement('div');
        const gameObject = this.gameObjects[Math.floor(Math.random() * this.gameObjects.length)];
        object.className = 'game-object';
        object.innerHTML = gameObject.symbol;
        object.style.left = Math.random() * (this.gameContainer.offsetWidth - 30) + 'px';
        object.style.top = '0px';
        this.gameContainer.appendChild(object);

        let isRemoved = false;

        const moveObject = () => {
            if (isRemoved) return;

            let topPosition = parseInt(object.style.top);
            if (topPosition < this.gameContainer.offsetHeight) {
                object.style.top = (topPosition + this.gameSpeed) + 'px';
                requestAnimationFrame(moveObject);

                const playerRect = this.player.getBoundingClientRect();
                const objectRect = object.getBoundingClientRect();

                if (
                    objectRect.bottom >= playerRect.top &&
                    objectRect.right >= playerRect.left &&
                    objectRect.left <= playerRect.right
                ) {
                    if (!isRemoved) {
                        this.gameContainer.removeChild(object);
                        isRemoved = true;
                        this.score += gameObject.points;
                        this.scoreValue.textContent = this.score;
                        this.objectStats[gameObject.name]++;
                        this.totalProcessed++;
                        this.updateStats();

                        if (gameObject.special === 'slow') {
                            this.gameSpeed = Math.max(1, this.gameSpeed - 1);
                        } else if (gameObject.special === 'fast') {
                            this.gameSpeed += 1;
                        }

                        // Increase speed every 20 points
                        if (this.score > this.lastSpeedIncrease + 20) {
                            this.gameSpeed += 0.5;
                            this.lastSpeedIncrease = this.score;
                        }

                        if (this.totalProcessed >= GAME_CONFIG.TOTAL_OBJECTS) {
                            this.endGame();
                        }
                    }
                }
            } else {
                if (!isRemoved) {
                    this.gameContainer.removeChild(object);
                    isRemoved = true;
                    this.missed++;
                    this.missedValue.textContent = this.missed;
                    this.totalProcessed++;
                    this.updateStats();

                    if (this.totalProcessed >= GAME_CONFIG.TOTAL_OBJECTS) {
                        this.endGame();
                    }
                }
            }
        };

        requestAnimationFrame(moveObject);
    }

    endGame() {
        clearInterval(this.gameInterval);
        this.gameContainer.innerHTML = `
            <div id="game-over">
                <h2>Game Over!</h2>
                <p>Final Score: ${this.score}</p>
                <p>Objects Missed: ${this.missed}</p>
                <button id="restart-button">Play Again</button>
            </div>
        `;
        document.getElementById('restart-button').addEventListener('click', () => this.resetGame());
    }

    resetGame() {
        this.score = 0;
        this.missed = 0;
        this.totalProcessed = 0;
        this.gameSpeed = 2;
        this.lastSpeedIncrease = 0;
        this.scoreValue.textContent = '0';
        this.missedValue.textContent = '0';
        this.gameContainer.innerHTML = `
            <div id="player"></div>
            <div id="score">Score: <span id="score-value">0</span></div>
            <div id="missed">Missed: <span id="missed-value">0</span></div>
        `;
        this.player = document.getElementById('player');
        this.scoreValue = document.getElementById('score-value');
        this.missedValue = document.getElementById('missed-value');
        this.introScreen.style.display = 'flex';
    }
}

// Initialize the game
const game = new Game();