// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cattyElement = document.getElementById('catty');

// Game variables (example)
let playerX = 50;
let playerY = canvas.height - 100; // Start near the bottom
let playerWidth = 40;
let playerHeight = 40;
let playerColor = '#e74c3c'; // Red color for the player placeholder
let playerDirection = 1; // 1 for right, -1 for left

// Physics variables
let playerVelX = 0;
let playerVelY = 0;
const gravity = 0.5;
const jumpStrength = -12; // Negative value for upward force
const moveSpeed = 5;
let isOnGround = false;

// Animation variables 
let lastTimestamp = 0;

// Keyboard input state
const keys = {
    left: false,
    right: false,
    up: false
};

// --- Asset Loading ---
// Load images
let backgroundImage = new Image(); 
let platformImage = new Image();
let imagesLoaded = false;

// Track loading of images
let backgroundLoaded = false;
let platformLoaded = false;

backgroundImage.onload = function() {
    backgroundLoaded = true;
    checkAllImagesLoaded();
};
platformImage.onload = function() {
    platformLoaded = true;
    checkAllImagesLoaded();
};
backgroundImage.onerror = function() {
    console.error("Error loading background image");
};
platformImage.onerror = function() {
    console.error("Error loading platform image");
};

function checkAllImagesLoaded() {
    imagesLoaded = backgroundLoaded && platformLoaded;
    console.log("Images loaded:", imagesLoaded);
}

// Set the source after setting up event handlers
backgroundImage.src = 'assets/background.jpeg';
platformImage.src = 'assets/platform.jpeg';
// let catImage = new Image(); catImage.src = 'assets/cat.png';

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
        playerDirection = -1;
    }
    if (keys.right) {
        playerVelX = moveSpeed;
        playerDirection = 1;
    }

    // Apply horizontal velocity
    playerX += playerVelX;

    // --- Horizontal Collision with Platforms (Improved) ---
    for (const platform of platforms) {
        // Check horizontal collision
        if (
            playerY + playerHeight > platform.y + 5 && // More than 5px into platform vertically
            playerY < platform.y + platform.height - 5 && // Not too close to the top or bottom
            playerX + playerWidth > platform.x &&
            playerX < platform.x + platform.width
        ) {
            // Collision detected, check which side
            if (playerVelX > 0) { // Moving right
                playerX = platform.x - playerWidth;
            } else if (playerVelX < 0) { // Moving left
                playerX = platform.x + platform.width;
            }
            playerVelX = 0;
        }
    }

    // Apply gravity
    playerVelY += gravity;

    // Apply vertical velocity
    playerY += playerVelY;
    isOnGround = false; // Assume not on ground until collision check

    // --- Platform Collision Detection (Vertical) ---
    for (const platform of platforms) {
        // Check if player is falling and overlapping horizontally with the platform
        if (
            playerVelY >= 0 && // Player is falling or stationary vertically
            playerY + playerHeight >= platform.y && // Player's bottom edge is below or at platform's top
            playerY + playerHeight <= platform.y + platform.height && // Changed from height/2 to full height for better collision
            playerX + playerWidth > platform.x + 2 &&    // Player's right edge is past platform's left (with small buffer)
            playerX < platform.x + platform.width - 2      // Player's left edge is before platform's right (with small buffer)
        ) {
            // Make sure player was above the platform in the previous frame or falling fast enough
            if (playerY + playerHeight - playerVelY <= platform.y + 10 || playerVelY > 10) {
                 playerY = platform.y - playerHeight; // Place player on top of the platform
                 playerVelY = 0; // Stop vertical movement
                 isOnGround = true; // Player is on the ground (or a platform)
                 break; // Stop checking after finding a platform to stand on
            }
        }
        
        // Check for hitting platform from below (bonking head)
        if (
            playerVelY < 0 && // Moving upward
            playerY <= platform.y + platform.height && // Player's top is above platform bottom
            playerY >= platform.y && // Player's top is below platform top
            playerX + playerWidth > platform.x + 2 && // Horizontal overlap with small buffer
            playerX < platform.x + platform.width - 2 // Horizontal overlap with small buffer
        ) {
            playerY = platform.y + platform.height; // Place player at bottom of platform
            playerVelY = 0; // Stop upward movement
        }
    }

    // --- Safety check for falling through the world ---
    // If player falls below the canvas height, reset to ground level
    if (playerY > canvas.height) {
        // Find the ground platform (usually the first platform in the level)
        const groundPlatform = platforms.find(p => p.y >= canvas.height - 30);
        if (groundPlatform) {
            playerY = groundPlatform.y - playerHeight;
        } else {
            // If no ground platform found, use canvas height as fallback
            playerY = canvas.height - playerHeight;
        }
        playerVelY = 0;
        isOnGround = true;
    }

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

    // Draw background image or fallback
    if (backgroundLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback to a color
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw platforms
    for (const platform of platforms) {
        if (platformLoaded) {
            // Draw platform with the platform image
            ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
        } else {
            // Fallback to the original colored rectangles
            ctx.fillStyle = platform.color || '#95a5a6';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    // Position and style the cat element instead of drawing on canvas
    cattyElement.style.left = playerX + 'px';
    cattyElement.style.top = playerY + 'px';
    cattyElement.style.transform = playerDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
}

function gameLoop(timestamp) {
    // Calculate time elapsed since last frame for animation
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    update(); // Update game state
    draw();   // Draw the game

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// --- Initial Setup ---
loadLevel(currentLevelIndex); // Load the first level

// Start the game loop
requestAnimationFrame(gameLoop); 