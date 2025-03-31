// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables (example)
let playerX = 50;
let playerY = canvas.height - 100; // Start near the bottom
let playerWidth = 30;
let playerHeight = 30;
let playerColor = '#e74c3c'; // Red color for the player placeholder

// Physics variables
let playerVelX = 0;
let playerVelY = 0;
const gravity = 0.5;
const jumpStrength = -12; // Negative value for upward force
const moveSpeed = 5;
let isOnGround = false;

// Keyboard input state
const keys = {
    left: false,
    right: false,
    up: false
};

// --- Asset Placeholders ---
// TODO: Load images here
// let catImage = new Image(); catImage.src = 'assets/cat.png';
// let platformImage = new Image(); platformImage.src = 'assets/platform.png';
// let backgroundImage = new Image(); backgroundImage.src = 'assets/background.png';

// --- Level Data ---
let currentLevelIndex = 0;
let platforms = [];
const levels = [
    // Level 1
    [
        { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: '#2ecc71' }, // Ground
        { x: 150, y: canvas.height - 100, width: 150, height: 20, color: '#27ae60' },
        { x: 400, y: canvas.height - 180, width: 120, height: 20, color: '#27ae60' },
        { x: 600, y: canvas.height - 280, width: 100, height: 20, color: '#27ae60' }
    ],
    // Level 2 (Example - add more later)
    [
        { x: 0, y: canvas.height - 20, width: 150, height: 20, color: '#2ecc71' }, // Ground start
        { x: 250, y: canvas.height - 80, width: 100, height: 20, color: '#27ae60' },
        { x: 450, y: canvas.height - 160, width: 100, height: 20, color: '#27ae60' },
        { x: 650, y: canvas.height - 240, width: 150, height: 20, color: '#2ecc71' } // Ground end
    ]
];

function loadLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < levels.length) {
        platforms = levels[levelIndex];
        // Reset player position for the new level
        playerX = 50;
        playerY = canvas.height - 100;
        playerVelX = 0;
        playerVelY = 0;
        isOnGround = false;
    } else {
        console.error("Invalid level index:", levelIndex);
        // Handle end of game or error
    }
}

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
    } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && isOnGround) { // Jump only if on ground
        keys.up = true;
        playerVelY = jumpStrength;
        isOnGround = false; // Player is now in the air
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        keys.up = false; // Doesn't affect jump once initiated, but good practice
    }
});

// Game loop
function update() {
    // Horizontal movement
    playerVelX = 0; // Reset horizontal velocity each frame unless a key is pressed
    if (keys.left) {
        playerVelX = -moveSpeed;
    }
    if (keys.right) {
        playerVelX = moveSpeed;
    }

    // Apply horizontal velocity
    playerX += playerVelX;

    // --- Horizontal Collision with Platforms (Basic) ---
    // Prevent moving into platforms horizontally (simple side check)
    for (const platform of platforms) {
        // Check potential collision
        if (
            playerX < platform.x + platform.width &&
            playerX + playerWidth > platform.x &&
            playerY < platform.y + platform.height &&
            playerY + playerHeight > platform.y
        ) {
            // Collision detected, check which side
            if (playerVelX > 0) { // Moving right
                playerX = platform.x - playerWidth;
            } else if (playerVelX < 0) { // Moving left
                playerX = platform.x + platform.width;
            }
            playerVelX = 0; // Stop horizontal movement
        }
    }

    // Apply gravity
    playerVelY += gravity;

    // Apply vertical velocity
    playerY += playerVelY;
    isOnGround = false; // Assume not on ground until collision check

    // --- Platform Collision Detection ---
    for (const platform of platforms) {
        // Check if player is falling and overlapping horizontally with the platform
        if (
            playerVelY >= 0 && // Player is falling or stationary vertically
            playerY + playerHeight >= platform.y && // Player's bottom edge is below or at platform's top
            playerY + playerHeight <= platform.y + platform.height && // Ensure not too far below (prevents snagging bottom)
            playerX + playerWidth > platform.x &&    // Player's right edge is past platform's left
            playerX < platform.x + platform.width      // Player's left edge is before platform's right
        ) {
            // Check if player was above the platform in the previous frame (prevents snagging from side)
            // A simpler check for now: just snap to top if colliding from above
            if (playerY + playerHeight - playerVelY <= platform.y) { // Check if bottom was above platform top before last move
                 playerY = platform.y - playerHeight; // Place player on top of the platform
                 playerVelY = 0; // Stop vertical movement
                 isOnGround = true; // Player is on the ground (or a platform)
                 break; // Stop checking after finding a platform to stand on
            }
        }
        // Optional: Add check for hitting platform from below (bonking head)
        // if (playerVelY < 0 && /* collision conditions for hitting bottom */) { ... }
    }

    // --- Original ground collision (now part of platform logic if ground is a platform) ---
    // Note: The ground platform in level data handles the bottom boundary
    // if (playerY + playerHeight > canvas.height) { ... } // This logic is now handled by the ground platform

    // Basic boundary detection (left/right walls)
    if (playerX < 0) {
        playerX = 0;
    }
    if (playerX + playerWidth > canvas.width) {
        playerX = canvas.width - playerWidth;
    }
}

function draw() {
     // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // TODO: Draw background image here
    // ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw platforms
    for (const platform of platforms) {
        ctx.fillStyle = platform.color || '#95a5a6'; // Use platform color or default gray
        // TODO: Replace fillRect with drawImage for platforms
        // ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw the player
    // TODO: Replace fillRect with drawImage for the player
    // ctx.drawImage(catImage, playerX, playerY, playerWidth, playerHeight);
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
}

function gameLoop() {
    update(); // Update game state
    draw();   // Draw the game

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// --- Initial Setup ---
loadLevel(currentLevelIndex); // Load the first level

// Start the game loop
requestAnimationFrame(gameLoop); 