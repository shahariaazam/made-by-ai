/**
 * Main entry point for the Train Simulator game 
 * Initializes the game when the DOM is loaded
 */
import Game from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get game container element
    const gameContainer = document.getElementById('gameContainer');
    
    // Display loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.style.position = 'absolute';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.color = 'white';
    loadingMessage.style.fontSize = '24px';
    loadingMessage.style.fontWeight = 'bold';
    loadingMessage.textContent = 'Loading Train Simulator...';
    gameContainer.appendChild(loadingMessage);
    
    // Initialize game once resources are loaded
    setTimeout(() => {
        try {
            // Initialize game
            window.trainGame = new Game(gameContainer);
            
            // Remove loading message
            gameContainer.removeChild(loadingMessage);
        } catch (error) {
            console.error('Error initializing game:', error);
            loadingMessage.textContent = 'Error loading game. Please check console for details.';
        }
    }, 500);
});

// Add error handling
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    const gameContainer = document.getElementById('gameContainer');
    
    // Display error message
    const errorMessage = document.createElement('div');
    errorMessage.style.position = 'absolute';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.color = 'white';
    errorMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    errorMessage.style.padding = '20px';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.fontSize = '16px';
    errorMessage.textContent = 'An error occurred. Please check console for details.';
    
    gameContainer.appendChild(errorMessage);
}); 