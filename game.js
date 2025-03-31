// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cattyElement = document.getElementById('catty');

// Game variables (example)
let playerX = 50;
let playerY = canvas.height - 100; // Start near the bottom
let playerWidth = 52;
let playerHeight = 52;
let playerColor = '#e74c3c'; // Red color for the player placeholder
let playerDirection = 1; // 1 for right, -1 for left

// Counter for collectibles
let collectiblesCount = 0;
const totalCollectibles = 3;

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
let goalImage = new Image();
let doorImage = new Image();
let imagesLoaded = false;

// Track loading of images
let backgroundLoaded = false;
let platformLoaded = false;
let goalLoaded = false;
let doorLoaded = false;

backgroundImage.onload = function() {
    backgroundLoaded = true;
    checkAllImagesLoaded();
};
platformImage.onload = function() {
    platformLoaded = true;
    checkAllImagesLoaded();
};
goalImage.onload = function() {
    goalLoaded = true;
    checkAllImagesLoaded();
};
doorImage.onload = function() {
    doorLoaded = true;
    checkAllImagesLoaded();
};
backgroundImage.onerror = function() {
    console.error("Error loading background image");
};
platformImage.onerror = function() {
    console.error("Error loading platform image");
};
goalImage.onerror = function() {
    console.error("Error loading goal image");
};
doorImage.onerror = function() {
    console.error("Error loading door image");
};

function checkAllImagesLoaded() {
    imagesLoaded = backgroundLoaded && platformLoaded && goalLoaded && doorLoaded;
    console.log("Images loaded:", imagesLoaded);
}

// Set the source after setting up event handlers
backgroundImage.src = 'assets/background.jpeg';
platformImage.src = 'assets/platform.jpeg';
goalImage.src = 'assets/goal.png';
doorImage.src = 'assets/door.png';
// let catImage = new Image(); catImage.src = 'assets/cat.png';

// --- Level Data ---
let currentLevelIndex = 0;
let platforms = [];
let collectibles = [];
let door = null;

const levels = [
    // Level 1
    [
        { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: '#2ecc71' }, // Ground
        { x: 150, y: canvas.height - 100, width: 150, height: 20, color: '#27ae60' },
        { x: 400, y: canvas.height - 180, width: 120, height: 20, color: '#27ae60' },
        { x: 600, y: canvas.height - 280, width: 100, height: 20, color: '#27ae60' }
    ],
    // Level 2
    [
        { x: 0, y: canvas.height - 20, width: 150, height: 20, color: '#2ecc71' }, // Ground start
        { x: 250, y: canvas.height - 80, width: 100, height: 20, color: '#27ae60' },
        { x: 450, y: canvas.height - 160, width: 100, height: 20, color: '#27ae60' },
        { x: 650, y: canvas.height - 240, width: 150, height: 20, color: '#2ecc71' } // Ground end
    ],
    // Level 3 (New)
    [
        { x: 0, y: canvas.height - 20, width: 100, height: 20, color: '#2ecc71' }, // Ground start
        { x: 200, y: canvas.height - 100, width: 80, height: 20, color: '#27ae60' },
        { x: 350, y: canvas.height - 180, width: 80, height: 20, color: '#27ae60' },
        { x: 500, y: canvas.height - 260, width: 80, height: 20, color: '#27ae60' },
        { x: 650, y: canvas.height - 340, width: 150, height: 20, color: '#2ecc71' } // Highest platform
    ],
    // Level 4 (New)
    [
        { x: 0, y: canvas.height - 20, width: 120, height: 20, color: '#2ecc71' }, // Ground start
        { x: 180, y: canvas.height - 90, width: 60, height: 20, color: '#27ae60' },
        { x: 300, y: canvas.height - 160, width: 60, height: 20, color: '#27ae60' },
        { x: 420, y: canvas.height - 230, width: 60, height: 20, color: '#27ae60' },
        { x: 540, y: canvas.height - 300, width: 60, height: 20, color: '#27ae60' },
        { x: 660, y: canvas.height - 370, width: 120, height: 20, color: '#2ecc71' } // Highest platform
    ]
];

// Define collectible positions for each level
const levelCollectibles = [
    // Level 1 collectibles
    [
        { x: 200, y: canvas.height - 150, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 0 },
        { x: 450, y: canvas.height - 230, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 1 },
        { x: 650, y: canvas.height - 330, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 2 }
    ],
    // Level 2 collectibles
    [
        { x: 50, y: canvas.height - 70, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 0 },
        { x: 300, y: canvas.height - 130, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 1 },
        { x: 700, y: canvas.height - 290, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 2 }
    ],
    // Level 3 collectibles
    [
        { x: 50, y: canvas.height - 70, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 0 },
        { x: 230, y: canvas.height - 150, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 1 },
        { x: 700, y: canvas.height - 390, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 2 }
    ],
    // Level 4 collectibles
    [
        { x: 50, y: canvas.height - 70, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 0 },
        { x: 330, y: canvas.height - 210, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 1 },
        { x: 700, y: canvas.height - 420, width: 32, height: 32, collected: false, floatY: 0, opacity: 1, floatOffset: 2 }
    ]
];

function loadLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < levels.length) {
        platforms = levels[levelIndex];
        collectibles = JSON.parse(JSON.stringify(levelCollectibles[levelIndex])); // Deep copy
        collectiblesCount = 0; // Reset counter when loading a new level
        
        // Reset player position for the new level
        playerX = 50;
        playerY = canvas.height - 100;
        playerVelX = 0;
        playerVelY = 0;
        isOnGround = false;
        
        // Add door to the highest platform
        let highestPlatform = platforms[0];
        for (const platform of platforms) {
            if (platform.y < highestPlatform.y) {
                highestPlatform = platform;
            }
        }
        
        // Place door at the right edge of the highest platform
        door = {
            x: highestPlatform.x + highestPlatform.width - 40,
            y: highestPlatform.y - 50, // Place door on top of platform
            width: 40,
            height: 50
        };
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
        // We're removing the collision response to allow climbing through platforms from below
        // Only keep the detection without stopping the player
        if (
            playerVelY < 0 && // Moving upward
            playerY <= platform.y + platform.height && // Player's top is above platform bottom
            playerY >= platform.y && // Player's top is below platform top
            playerX + playerWidth > platform.x + 2 && // Horizontal overlap with small buffer
            playerX < platform.x + platform.width - 2 // Horizontal overlap with small buffer
        ) {
            // No longer stopping the player - they can pass through
            // playerY = platform.y + platform.height; // Removed
            // playerVelY = 0; // Removed
        }
    }

    // --- Collectible collision detection and animation ---
    collectibles.forEach((collectible, index) => {
        // Only check collision if not already collected
        if (!collectible.collected) {
            // Simple rectangle collision detection
            if (
                playerX < collectible.x + collectible.width &&
                playerX + playerWidth > collectible.x &&
                playerY < collectible.y + collectible.height &&
                playerY + playerHeight > collectible.y
            ) {
                // Mark as collected and increment counter
                collectible.collected = true;
                collectiblesCount++;
            }
            
            // Animate non-collected items (gentle float up and down)
            collectible.floatOffset += 0.05; // Increment the offset for the sine wave
            collectible.floatY = Math.sin(collectible.floatOffset) * 5; // Sine wave with amplitude of 5px
        } else {
            // Animate collected items (float up and fade out)
            collectible.floatY += 1; // Move upward
            collectible.opacity = Math.max(0, collectible.opacity - 0.02); // Fade out
        }
    });

    // Door collision detection (transition to next level)
    if (door && collectiblesCount === totalCollectibles) {
        if (
            playerX < door.x + door.width &&
            playerX + playerWidth > door.x &&
            playerY < door.y + door.height &&
            playerY + playerHeight > door.y
        ) {
            // Go to next level
            if (currentLevelIndex < levels.length - 1) {
                currentLevelIndex++;
                loadLevel(currentLevelIndex);
            } else {
                // Game completed, could show a victory screen
                alert("Congratulations! You've completed all levels!");
                currentLevelIndex = 0; // Restart the game
                loadLevel(currentLevelIndex);
            }
        }
    }

    // --- Safety check for falling through the world ---
    // If player falls below the canvas height, reset to spawn position
    if (playerY > canvas.height) {
        // Teleport player back to spawn position for the current level
        playerX = 50;
        playerY = canvas.height - 100;
        playerVelX = 0;
        playerVelY = 0;
        isOnGround = false;
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
        // Create a nicer gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');   // Sky blue at top
        gradient.addColorStop(1, '#1E90FF');   // Darker blue at bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(100, 80, 30, 0, Math.PI * 2);
        ctx.arc(130, 90, 25, 0, Math.PI * 2);
        ctx.arc(160, 80, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(500, 120, 35, 0, Math.PI * 2);
        ctx.arc(540, 130, 30, 0, Math.PI * 2);
        ctx.arc(580, 120, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw platforms
    for (const platform of platforms) {
        if (platformLoaded) {
            // Draw platform with the platform image
            ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
        } else {
            // Enhanced fallback with gradient and texture
            const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
            gradient.addColorStop(0, '#3FA03F');  // Green-brown at top
            gradient.addColorStop(1, '#2D7D2D');  // Darker at bottom
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add a top grass highlight
            ctx.fillStyle = '#5AC75A';
            ctx.fillRect(platform.x, platform.y, platform.width, 3);
            
            // Add a subtle texture pattern
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let i = 0; i < platform.width; i += 8) {
                if (i % 16 === 0) {
                    ctx.fillRect(platform.x + i, platform.y + 3, 4, 2);
                }
            }
        }
    }

    // Draw collectibles
    collectibles.forEach(collectible => {
        if (goalLoaded) {
            // Apply opacity
            ctx.globalAlpha = collectible.opacity;
            
            // Draw at the adjusted position
            const drawY = collectible.collected 
                ? collectible.y - collectible.floatY  // Float away if collected
                : collectible.y + collectible.floatY; // Float up and down if not collected
            
            ctx.drawImage(goalImage, collectible.x, drawY, collectible.width, collectible.height);
            
            // Reset opacity for other elements
            ctx.globalAlpha = 1.0;
        } else {
            // Enhanced fallback if image not loaded
            const drawY = collectible.collected 
                ? collectible.y - collectible.floatY 
                : collectible.y + collectible.floatY;
            
            if (collectible.collected) {
                // Collected star/coin with fade-out effect
                ctx.globalAlpha = collectible.opacity;
                
                // Draw a star shape
                const centerX = collectible.x + collectible.width / 2;
                const centerY = drawY + collectible.height / 2;
                const spikes = 5;
                const outerRadius = collectible.width / 2;
                const innerRadius = collectible.width / 4;
                
                ctx.fillStyle = '#FFD700'; // Gold
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = Math.PI * i / spikes - Math.PI / 2;
                    if (i === 0) {
                        ctx.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                    } else {
                        ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                // Add glow
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.globalAlpha = 1.0;
            } else {
                // Not collected - animated coin/star
                // Draw a shiny coin
                const centerX = collectible.x + collectible.width / 2;
                const centerY = drawY + collectible.height / 2;
                const radius = collectible.width / 2 - 2;
                
                // Coin body
                ctx.fillStyle = '#FFD700'; // Gold
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight
                ctx.fillStyle = '#FFF8DC'; // Light gold/cream
                ctx.globalAlpha = 0.3 + 0.2 * Math.sin(collectible.floatOffset * 2);
                ctx.beginPath();
                ctx.arc(centerX - radius/3, centerY - radius/3, radius/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                
                // Add letter "C" for coin
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.font = 'bold ' + (radius) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('★', centerX, centerY);
            }
        }
    });

    // Draw door on the highest platform if all collectibles are collected
    if (door) {
        if (doorLoaded) {
            // Only show the door if all collectibles have been collected
            if (collectiblesCount === totalCollectibles) {
                ctx.drawImage(doorImage, door.x, door.y, door.width, door.height);
                
                // Add a glowing effect around the door
                ctx.save();
                ctx.globalAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 200); // Pulsating glow
                ctx.shadowColor = '#FFD700'; // Gold glow
                ctx.shadowBlur = 15;
                ctx.drawImage(doorImage, door.x, door.y, door.width, door.height);
                ctx.restore();
                
                // Add an indicator to tell player to use the door
                ctx.fillStyle = '#FFD700'; // Gold color
                ctx.font = 'bold 18px "Press Start 2P", "VT323", "Pixelify Sans", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('NEXT LEVEL →', door.x + door.width / 2, door.y - 10);
            } else {
                // Show a placeholder/inactive door
                ctx.globalAlpha = 0.3; // Semi-transparent
                ctx.drawImage(doorImage, door.x, door.y, door.width, door.height);
                ctx.globalAlpha = 1.0;
            }
        } else {
            // Fallback if image not loaded
            if (collectiblesCount === totalCollectibles) {
                // Draw a nicer door shape
                // Door frame
                ctx.fillStyle = '#8B4513'; // Brown for door frame
                ctx.fillRect(door.x, door.y, door.width, door.height);
                
                // Door panel
                ctx.fillStyle = '#A0522D'; // Lighter brown for door panel
                ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);
                
                // Door knob
                ctx.fillStyle = '#FFD700'; // Gold door knob
                ctx.beginPath();
                ctx.arc(door.x + door.width - 10, door.y + door.height / 2, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Add a glowing border
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(door.x, door.y, door.width, door.height);
                
                // Add pulsating effect
                ctx.save();
                ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 200);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(door.x - 2, door.y - 2, door.width + 4, door.height + 4);
                ctx.restore();
            } else {
                // Inactive door
                ctx.fillStyle = 'rgba(139, 69, 19, 0.3)'; // Semi-transparent brown
                ctx.fillRect(door.x, door.y, door.width, door.height);
                
                // Door panel with low opacity
                ctx.fillStyle = 'rgba(160, 82, 45, 0.2)'; // Lighter brown with low opacity
                ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);
                
                // Door knob with low opacity
                ctx.fillStyle = 'rgba(218, 165, 32, 0.2)'; // Gold with low opacity
                ctx.beginPath();
                ctx.arc(door.x + door.width - 10, door.y + door.height / 2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Position and style the cat element instead of drawing on canvas
    cattyElement.style.left = playerX + 'px';
    cattyElement.style.top = playerY + 'px';
    cattyElement.style.transform = playerDirection === 1 ? 'scaleX(-1)' : 'scaleX(1)';
    // Adjust the transform origin to center of cat
    cattyElement.style.transformOrigin = 'center';
    
    // Draw the counter in top right
    ctx.fillStyle = '#FF8C00'; // Orange color
    ctx.font = 'bold 36px "Press Start 2P", "VT323", "Pixelify Sans", monospace'; // Bigger game-style font
    ctx.textAlign = 'right';
    // Add a black outline for better visibility
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(`${collectiblesCount}/${totalCollectibles}`, canvas.width - 20, 40);
    ctx.fillText(`${collectiblesCount}/${totalCollectibles}`, canvas.width - 20, 40);

    // Draw level indicator
    ctx.textAlign = 'left';
    ctx.strokeText(`LEVEL ${currentLevelIndex + 1}`, 20, 40);
    ctx.fillText(`LEVEL ${currentLevelIndex + 1}`, 20, 40);
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