// Initialize variables
let orbs = [];
let isAnimating = true;
const maxOrbs = 50;
let followingOrbs = []; // Track orbs that are following the mouse
let edgePenaltyActive = false; // To prevent multiple edge penalties in quick succession
let score = 0; // Player's score
let gameTime = 60; // Game time in seconds
let gameActive = false; // Whether the game is active
let gameTimer = null; // Timer for the game

// Difficulty settings
const difficultySettings = {
  easy: {
    captureDistance: 150,     // Easier to capture (larger radius)
    releaseDistance: 400,     // Harder to lose (larger tolerance)
    followSpeed: 0.15,        // Faster following (smoother)
    scoreMultiplier: 1        // Base score
  },
  medium: {
    captureDistance: 100,     // Medium capture radius
    releaseDistance: 300,     // Medium release tolerance
    followSpeed: 0.1,         // Medium follow speed
    scoreMultiplier: 2        // Double score
  },
  hard: {
    captureDistance: 60,      // Harder to capture (smaller radius)
    releaseDistance: 200,     // Easier to lose (smaller tolerance)
    followSpeed: 0.07,        // Slower following (more delay)
    scoreMultiplier: 3        // Triple score
  }
};

// Default to medium difficulty
let currentDifficulty = difficultySettings.medium;

// Edge boundary for penalty (how close to edge before penalty)
const edgeBoundary = 30;

// Get the first orb and add it to our collection
const firstOrb = document.querySelector('.orb');
if (firstOrb) {
  orbs.push({
    element: firstOrb,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2,
    hue: Math.random() * 360,
    isFollowing: false,
    followAngle: 0,
    value: Math.floor(Math.random() * 5) + 1 // Random value for score
  });
}

// Mouse position tracking
let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let mouseIsDown = false;

document.addEventListener('mousemove', (e) => {
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Check for edge boundary collision
  if (followingOrbs.length > 0 && !edgePenaltyActive && gameActive) {
    if (mouseX < edgeBoundary || mouseX > window.innerWidth - edgeBoundary || 
        mouseY < edgeBoundary || mouseY > window.innerHeight - edgeBoundary) {
      edgeCrash();
      edgePenaltyActive = true;
      setTimeout(() => {
        edgePenaltyActive = false;
      }, 1000); // Prevent multiple penalties in quick succession
    }
  }
});

// Function to handle edge crash
function edgeCrash() {
  if (followingOrbs.length > 0) {
    // Release all orbs with extreme force
    followingOrbs.forEach(orb => {
      orb.isFollowing = false;
      
      // Give them a strong chaotic push away from edges
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Calculate direction away from nearest edge
      let forceX = 0;
      let forceY = 0;
      
      // Determine which edge was hit and push away from it
      if (mouseX < edgeBoundary) { // Left edge
        forceX = 15 + Math.random() * 10; // Strong push right
      } else if (mouseX > window.innerWidth - edgeBoundary) { // Right edge
        forceX = -15 - Math.random() * 10; // Strong push left
      }
      
      if (mouseY < edgeBoundary) { // Top edge
        forceY = 15 + Math.random() * 10; // Strong push down
      } else if (mouseY > window.innerHeight - edgeBoundary) { // Bottom edge
        forceY = -15 - Math.random() * 10; // Strong push up
      }
      
      // Add randomness
      forceX += (Math.random() - 0.5) * 10;
      forceY += (Math.random() - 0.5) * 10;
      
      orb.speedX = forceX;
      orb.speedY = forceY;
      
      // Flash the orb red
      orb.element.style.transition = 'background 0.1s';
      orb.element.style.background = 'radial-gradient(circle at 30% 30%, #ff5555, #aa0000)';
      orb.element.style.boxShadow = '0 0 20px #ff0000';
      
      setTimeout(() => {
        updateOrbColor(orb);
        orb.element.style.transition = '';
      }, 300);
    });
    
    // Reduce score
    if (gameActive) {
      const penalty = Math.min(10, score);
      score = Math.max(0, score - penalty);
      updateScoreDisplay();
    }
    
    followingOrbs = [];
    
    // Show crash notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = "EDGE CRASH! Orbs scattered!";
    notification.style.position = 'absolute';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '15px 30px';
    notification.style.borderRadius = '5px';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
    notification.style.fontSize = '24px';
    
    // Add crash sound effect
    const crashSound = new Audio('data:audio/wav;base64,UklGRjQnAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAnAAAAAAEA/v8CAP3/AgD+/wIA/f8CAP7/AQD//wAAAAAAAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD+/wIA/v8AAAAA/v8DAP3/AgD//wAA//8AAAAA//8AAAAAAAD//wAA//8BAAAA//8AAAAA//8AAP//AAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wEA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA//8AAAAAAAD//wAA//8AAP//AAD//wAA//8AAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAAAAAAAAAAAAAA//8AAP//AAAAAAAAAAAAAAAAAAD//wAA//8AAP7/AgD+/wIA/v8BAAAA//8AAP//AAAAAAAAAAAAAAAA//8AAAAA//8AAAAA/v8DAP3/AwD9/wMA/f8DAP3/AwD8/wQA/P8EAPz/BAD8/wQA/P8DAP3/AwD9/wMA/f8DAP3/AwD9/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP3/BAD8/wQA/P8EAPz/BAD8/wQA/P8EAPz/BAD8/wQA/P8EAPz/BAD8/wQA/P8EAPz/BAD8/wQA/P8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD+/wEAAAAAAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAAAAAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAAAAAAAAAP//AAAAAAAAAAAAAAAA//8AAAAAAAAAAP//AAAAAAAAAAAAAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    crashSound.play();
    
    document.querySelector('.canvas').appendChild(notification);
    
    // Remove notification after a delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 1500);
  }
}

// Start a new game
function startGame() {
  // Reset everything
  score = 0;
  gameTime = 60;
  gameActive = true;
  
  // Update UI
  updateScoreDisplay();
  updateTimeDisplay();
  
  // Clear existing timer if any
  if (gameTimer) clearInterval(gameTimer);
  
  // Start the countdown
  gameTimer = setInterval(() => {
    gameTime--;
    updateTimeDisplay();
    
    // Check if time's up
    if (gameTime <= 0) {
      endGame();
    } else if (gameTime <= 10) {
      // Flash time warning when time is running out
      const timeDisplay = document.querySelector('.time-display');
      timeDisplay.style.color = '#ff3333';
      setTimeout(() => {
        timeDisplay.style.color = '#ffffff';
      }, 500);
      
      // Play tick sound when time is running low
      if (gameTime <= 5) {
        const tickSound = new Audio('data:audio/wav;base64,UklGRl4EAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YToEAAAAAAAA//8BAPr/GgA1ACkAQQAUACwA4P/o/9D/Cf/o/vr+FP9v/7r/CABLAHEAXAA0APz/zf+Q/2D/T/9v/6n/+/9NAH0AZgBXAFgALQD5/97/0//G/8b/3f/0/w0AIgA0AD0AOgA1ACgAGQALAAEA9v/s/+T/2//X/9b/1v/Y/9v/3//k/+r/8P/2//v//v8CAAUABwAJAAoACgALAAsACgAKAAkACAAIAAcABgAFAAUABAADAAAAAAAAAAAA/v/9//z/+v/5//f/9v/1//T/9P/z//P/8v/y//L/8v/y//P/8//0//T/9f/2//f/+P/5//r/+//8//3//v//////AAAAAAEAAgADAAQABQAFAAYABgAHAAcABwAHAAgACAAIAAgACAAIAAgACAAHAAcABgAGAAUABQAEAAMAAgABAAEAAAAAAAAA///+//7//f/9//z//P/8//v/+//7//r/+v/6//r/+v/6//r/+v/6//r/+//7//v/+//8//z//P/9//3//f/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//f/9//3//f/8//z//P/8//v/+//7//v/+v/6//r/+v/6//r/+v/6//r/+v/6//r/+v/6//r/+v/6//r/+v/6//r/+v/6//v/+//7//v/+//7//z//P/8//z//P/9//3//f/9//3//v/+//7//v//////AAAAAAAAAAAAAAEAAQABAAEAAQACAAIAAAAAAAAAAAAAAAAAAAD//////////////////////////wAAAQACAAMABQAGAAgACQALAAwADgAPABAAEQASABMAFAAUABUAFQAVABYAFgAVABUAFQAUABQAEwATABIAEgARABAADwAOAA0ADAALAAoACAAHAAYABQAEAAIAAQAAAP7//f/7//r/+P/3//X/9P/y//H/7//u/+z/6//p/+j/5v/l/+P/4v/h/9//3v/d/9z/2v/Z/9j/1//W/9X/1P/T/9P/0v/R/9H/0P/Q/9D/0P/P/8//z//P/9D/0P/Q/9H/0v/S/9P/1P/V/9b/1//Y/9r/2//c/97/3//h/+L/5P/m/+j/6v/s/+7/8P/y//T/9v/5//v//v8AAAMABAAHAA8AEgAZAB8AJAApAC4AMwA3ADsAPwBBAEQARQBHAEgASABJAEgASABHAEYARQBDAEIAQAA+ADsAOQA2ADMALAA+AE8AWwBpAHEAeQCDAIsAlACdAKYAsAC5AMEAygDTANsA4QDoAO4A8wD4APwA/wABAQIBAwEEAQMBAgEBAQAB/wD8APoA9gDyAO4A6QDjAN0A1gDRAMoAwgC7ALMArAClAJ0AlgCPAIcAgAB5AHEAawBkAF0AVwBQAEoAQwA9ADcAMQArACUAIAAaABUAEAALAAYAAgD9//j/9P/v/+v/5//j/9//3P/Y/9X/0f/O/8v/yP/F/8L/v/+9/7r/uP+2/7T/sv+w/67/rf+r/6r/qP+n/6X/pP+j/6L/of+g/5//nv+e/53/nP+c/5v/m/+b/5v/mv+a/5r/mv+a/5r/mv+b/5v/m/+b/5z/nP+d/53/nv+f/5//oP+h/6L/o/+j/6T/pf+m/6f/qP+p/6r/q/+t/67/r/+w/7H/s/+0/7X/t/+4/7r/u/+9/77/wP/C/8P/xf/H/8j/yv/M/87/0P/S/9T/1v/Y/9r/3P/e/+H/4//l/+f/6v/s/+//8f/0//b/+f/8//7/AQAEAAYA');
        tickSound.play();
      }
    }
  }, 1000);
}

// End the game
function endGame() {
  gameActive = false;
  clearInterval(gameTimer);
  
  // Release all orbs
  followingOrbs.forEach(orb => {
    orb.isFollowing = false;
  });
  followingOrbs = [];
  
  // Show game over message with final score
  const gameOver = document.createElement('div');
  gameOver.className = 'game-over';
  gameOver.innerHTML = `
    <h2>GAME OVER!</h2>
    <p>Your final score: ${score}</p>
    <button id="play-again">Play Again</button>
  `;
  
  gameOver.style.position = 'absolute';
  gameOver.style.top = '50%';
  gameOver.style.left = '50%';
  gameOver.style.transform = 'translate(-50%, -50%)';
  gameOver.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  gameOver.style.color = 'white';
  gameOver.style.padding = '30px';
  gameOver.style.borderRadius = '10px';
  gameOver.style.textAlign = 'center';
  gameOver.style.zIndex = '1000';
  gameOver.style.boxShadow = '0 0 50px rgba(0, 0, 255, 0.5)';
  
  document.querySelector('.canvas').appendChild(gameOver);
  
  // Add event listener to play again button
  document.getElementById('play-again').addEventListener('click', () => {
    gameOver.remove();
    startGame();
  });
}

// Update score display
function updateScoreDisplay() {
  const scoreDisplay = document.querySelector('.score-display');
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}`;
  } else {
    const newScoreDisplay = document.createElement('div');
    newScoreDisplay.className = 'score-display';
    newScoreDisplay.textContent = `Score: ${score}`;
    newScoreDisplay.style.position = 'absolute';
    newScoreDisplay.style.top = '10px';
    newScoreDisplay.style.left = '10px';
    newScoreDisplay.style.color = 'white';
    newScoreDisplay.style.fontSize = '18px';
    newScoreDisplay.style.fontWeight = 'bold';
    newScoreDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    newScoreDisplay.style.padding = '5px 10px';
    newScoreDisplay.style.borderRadius = '5px';
    newScoreDisplay.style.zIndex = '100';
    
    document.querySelector('.canvas').appendChild(newScoreDisplay);
  }
}

// Update time display
function updateTimeDisplay() {
  const timeDisplay = document.querySelector('.time-display');
  if (timeDisplay) {
    timeDisplay.textContent = `Time: ${gameTime}s`;
  } else {
    const newTimeDisplay = document.createElement('div');
    newTimeDisplay.className = 'time-display';
    newTimeDisplay.textContent = `Time: ${gameTime}s`;
    newTimeDisplay.style.position = 'absolute';
    newTimeDisplay.style.top = '10px';
    newTimeDisplay.style.left = '120px';
    newTimeDisplay.style.color = 'white';
    newTimeDisplay.style.fontSize = '18px';
    newTimeDisplay.style.fontWeight = 'bold';
    newTimeDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    newTimeDisplay.style.padding = '5px 10px';
    newTimeDisplay.style.borderRadius = '5px';
    newTimeDisplay.style.zIndex = '100';
    
    document.querySelector('.canvas').appendChild(newTimeDisplay);
  }
}

document.addEventListener('mousedown', () => {
  mouseIsDown = true;
});

document.addEventListener('mouseup', () => {
  mouseIsDown = false;
});

// Add orb button functionality
document.getElementById('add-orb').addEventListener('click', () => {
  if (orbs.length < maxOrbs) {
    addNewOrb();
  }
});

// Toggle animation button
document.getElementById('toggle-animation').addEventListener('click', (e) => {
  isAnimating = !isAnimating;
  e.target.textContent = isAnimating ? 'Pause' : 'Play';
});

// Difficulty selector
document.getElementById('difficulty').addEventListener('change', (e) => {
    currentDifficulty = difficultySettings[e.target.value];
    
    // Update the difficulty info text
    const difficultyInfo = document.querySelector('.difficulty-info');
    if (e.target.value === 'easy') {
      difficultyInfo.textContent = 'Easy: Orbs are captured from farther away and stay with you longer. (1x points)';
    } else if (e.target.value === 'medium') {
      difficultyInfo.textContent = 'Medium: Balanced capture distance and release threshold. (2x points)';
    } else if (e.target.value === 'hard') {
      difficultyInfo.textContent = 'Hard: Orbs are harder to capture and break free more easily. (3x points)';
    }
  });
// Difficulty selector (continued)
document.getElementById('difficulty').addEventListener('change', (e) => {
  currentDifficulty = difficultySettings[e.target.value];
  
  // Update the difficulty info text
  const difficultyInfo = document.querySelector('.difficulty-info');
  if (e.target.value === 'easy') {
    difficultyInfo.textContent = 'Easy: Orbs are captured from farther away and stay with you longer. (1x points)';
  } else if (e.target.value === 'medium') {
    difficultyInfo.textContent = 'Medium: Balanced capture distance and release threshold. (2x points)';
  } else if (e.target.value === 'hard') {
    difficultyInfo.textContent = 'Hard: Orbs are harder to capture and break free more easily. (3x points)';
  }
});

// Speed and size controls
const speedControl = document.getElementById('speed');
const sizeControl = document.getElementById('size');

// Create canvas for connections
const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
document.querySelector('.canvas').appendChild(canvas);
const ctx = canvas.getContext('2d');

// Draw edge boundary indicators
function drawEdgeBoundaries() {
  ctx.strokeStyle = followingOrbs.length > 0 ? 'rgba(255, 50, 50, 0.5)' : 'rgba(200, 200, 200, 0.1)';
  ctx.lineWidth = 2;
  
  // Draw danger zone rectangles
  ctx.beginPath();
  
  // Top boundary
  ctx.rect(0, 0, window.innerWidth, edgeBoundary);
  
  // Right boundary
  ctx.rect(window.innerWidth - edgeBoundary, 0, edgeBoundary, window.innerHeight);
  
  // Bottom boundary
  ctx.rect(0, window.innerHeight - edgeBoundary, window.innerWidth, edgeBoundary);
  
  // Left boundary
  ctx.rect(0, 0, edgeBoundary, window.innerHeight);
  
  ctx.stroke();
  
  // Add warning if orbs are being followed
  if (followingOrbs.length > 0) {
    ctx.fillStyle = 'rgba(255, 50, 50, 0.1)';
    ctx.fill();
    
    // Pulsing effect for danger zones
    const pulseIntensity = Math.sin(Date.now() / 200) * 0.2 + 0.3;
    ctx.fillStyle = `rgba(255, 50, 50, ${pulseIntensity})`;
    ctx.fill();
  }
}

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Main animation loop
function animate() {
  if (isAnimating) {
    const speedFactor = speedControl.value / 5;
    
    // Clear canvas for connections
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edge boundaries
    drawEdgeBoundaries();
    
    // Calculate mouse velocity
    const mouseVelocityX = mouseX - prevMouseX;
    const mouseVelocityY = mouseY - prevMouseY;
    
    // Process orbs
    orbs.forEach(orb => {
      // Check if orb should start following the mouse
      const dx = mouseX - orb.x;
      const dy = mouseY - orb.y;
      const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
      
      // Determine if the orb should follow the mouse based on difficulty
      if (distanceToMouse < currentDifficulty.captureDistance && !orb.isFollowing && gameActive) {
        orb.isFollowing = true;
        orb.followAngle = Math.random() * Math.PI * 2; // Random position around mouse
        followingOrbs.push(orb);
        
        // Add points when capturing an orb
        if (gameActive) {
          score += orb.value * currentDifficulty.scoreMultiplier;
          updateScoreDisplay();
          
          // Visual feedback for points
          const pointPopup = document.createElement('div');
          pointPopup.textContent = `+${orb.value * currentDifficulty.scoreMultiplier}`;
          pointPopup.style.position = 'absolute';
          pointPopup.style.left = `${orb.x}px`;
          pointPopup.style.top = `${orb.y - 20}px`;
          pointPopup.style.color = `hsl(${orb.hue}, 100%, 70%)`;
          pointPopup.style.fontWeight = 'bold';
          pointPopup.style.textShadow = '0 0 5px black';
          pointPopup.style.zIndex = '50';
          pointPopup.style.pointerEvents = 'none';
          pointPopup.style.transition = 'transform 1s, opacity 1s';
          document.querySelector('.canvas').appendChild(pointPopup);
          
          // Animate point popup
          setTimeout(() => {
            pointPopup.style.transform = 'translateY(-30px)';
            pointPopup.style.opacity = '0';
            setTimeout(() => pointPopup.remove(), 1000);
          }, 10);
          
          // Play capture sound
          const captureSound = new Audio('data:audio/wav;base64,UklGRrQFAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YZAFAACBgIF/gn6Cf4GAgoCDgIKAgn+CgIKAg3+CgH+AgX6Afn9+f4B/gX+BgH+Af35/fn9/gIGAgn+AfX58fHx9fn+Af4B+fXx8fH1+gIF/f318e3t8fX+BgoKAfXp5eHl7foKEhIJ+eXZ1dXd8goaIh4N9d3Fyc3h+hYmKiIR+eHRydHh9hIeIhoJ9eHZ2eHx/g4SGhIB8eXh4eXx+gYKDgoB9e3p7fH6AgYKCgX9+fX19fn+AgYGBgIB/f39/gICAgIB/fn5+fn+AgICAgH9+fn5+f4CAgICAf35+fn5/gICAgIB/fn5+fn+AgICAgH9+fn5+f4CAgICAf35+fn9/gICAgH9/fn5+f3+AgICAf39+fn5/f4CAgIB/f35+fn9/gICAf39/fn5+f3+AgIB/f39+fn5/f4CAf39/f35+fn9/gIB/f39/fn5+f39/gH9/f39+fn5/f39/f39/f35+fn9/f39/f39/fn5+f39/f39/f39+fn5/f39/f39/f35+fn9/f39/f39/fn5+f39/f39/f39+fn9/f39/f39/f35+f39/f39/f39/fn5/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f4KFhoaFg4KBgoKDhIWFhIKAfn17e3t8fH19fXx7enl4d3d3eHl6e3t7e3p5eHd3d3h5ent8fHt6eXh3d3d4eXp7fHx7enl4d3d3eHl6e3x8e3p5eHd3d3h5ent8fHt6eXh3d3d4eXp7fHx7enl4d3d3eHl6e3x8e3p5eHd3d3h5ent8fHt6eXh3d3h5ent7fHt6eXh3d3h5ent7fHt6eXh3d3h5ent7fHt6eXh4eHl6e3t8e3p5eHh4eXp7e3x7enl4eHh5ent7fHt6eXh4eHl6e3t8e3p5eHh4eXp7e3t7enl4eHh5ent7e3t6eXh4eHl6e3t7e3p5eHh4eXp7e3t7enl4eHh5ent7e3t6eXh4eHl6e3t7e3p5eHh4eXp7e3t7enl4eHl6e3t7e3p5eHh5ent7e3t6eXh4eXp7e3t7enl4eHl6e3t7e3p5eHh5ent7e3t6eXh4eXp7e3t7enl4eHl6e3t7e3p5eHl5ent7e3t6eXl5ent7e3t6eXl5ent7e3t7enl5eXp7e3t7e3p5eXl6e3t7e3t6eXl5ent7e3t7enl5eXp7e3t7e3p5eXl6e3t7e3t6eXl5ent7e3t7enl5enp7e3t7e3p5eXp6e3t7e3t6eXl6ent7e3t7enl5enp7e3t7e3p5eXp6e3t7e3t6eXp6e3t7e3t6enl6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7enp6ent7e3t7e3p6ent7e3t7e3p6ent7e3t7e3p6ent7e3t7e3p6ent7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3p6e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7');
          captureSound.play();
        }
      } else if (distanceToMouse > currentDifficulty.releaseDistance && orb.isFollowing) {
        // Stop following if mouse moves too far away (based on difficulty)
        orb.isFollowing = false;
        followingOrbs = followingOrbs.filter(o => o !== orb);
      }
      
      if (orb.isFollowing) {
        // Follow the mouse with a slight delay (based on difficulty)
        // Position the orb behind the mouse based on its follow angle
        const followDistance = 50; // Distance to follow behind mouse
        const targetX = mouseX + Math.cos(orb.followAngle) * followDistance;
        const targetY = mouseY + Math.sin(orb.followAngle) * followDistance;
        
        // Smoothly move toward target position with difficulty-based speed
        orb.x += (targetX - orb.x) * currentDifficulty.followSpeed * speedFactor;
        orb.y += (targetY - orb.y) * currentDifficulty.followSpeed * speedFactor;
        
        // Update orb's follow angle based on mouse movement
        if (Math.abs(mouseVelocityX) > 1 || Math.abs(mouseVelocityY) > 1) {
          // Gradually adjust follow angle to be opposite of mouse movement direction
          const mouseAngle = Math.atan2(mouseVelocityY, mouseVelocityX);
          const targetAngle = mouseAngle + Math.PI; // Opposite direction
          
          // Smooth angle transition
          let angleDiff = targetAngle - orb.followAngle;
          // Normalize angle difference
          if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          orb.followAngle += angleDiff * 0.1;
        }
        
        // Draw trail effect
        ctx.beginPath();
        ctx.moveTo(orb.x, orb.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `hsla(${orb.hue}, 80%, 70%, 0.2)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Normal movement for non-following orbs
        orb.x += orb.speedX * speedFactor;
        orb.y += orb.speedY * speedFactor;
        
        // Bounce off walls
        if (orb.x < 0 || orb.x > window.innerWidth) {
          orb.speedX *= -1;
          updateOrbColor(orb);
        }
        if (orb.y < 0 || orb.y > window.innerHeight) {
          orb.speedY *= -1;
          updateOrbColor(orb);
        }
        
        // Subtle attraction to mouse
        if (distanceToMouse < 200 && !orb.isFollowing) {
          const force = 0.001 * speedFactor;
          orb.speedX += (dx / distanceToMouse) * force;
          orb.speedY += (dy / distanceToMouse) * force;
        }
      }
      
      // Apply speed limits for free-moving orbs
      if (!orb.isFollowing) {
        const maxSpeed = 3 * speedFactor;
        orb.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, orb.speedX));
        orb.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, orb.speedY));
      }
      
      // Apply position
      orb.element.style.left = `${orb.x}px`;
      orb.element.style.top = `${orb.y}px`;
      
      // Make following orbs glow more intensely
      if (orb.isFollowing) {
        const hue = orb.hue;
        const color1 = `hsl(${hue}, 90%, 75%)`;
        const color2 = `hsl(${(hue + 30) % 360}, 70%, 45%)`;
        orb.element.style.background = `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`;
        orb.element.style.boxShadow = `0 0 20px ${color1}`;
      } else {
        updateOrbColor(orb);
      }
    });
    
    // Process orb interactions
    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const orb1 = orbs[i];
        const orb2 = orbs[j];
        const dx = orb1.x - orb2.x;
        const dy = orb1.y - orb2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          // Draw connection
          ctx.beginPath();
          ctx.moveTo(orb1.x, orb1.y);
          ctx.lineTo(orb2.x, orb2.y);
          
          // Blend colors of both orbs
          const hue = (orb1.hue + orb2.hue) / 2;
          const alpha = 1 - distance / 120;
          
          ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
          ctx.lineWidth = 2 * (1 - distance / 120);
          ctx.stroke();
          
          // Only apply repulsion to non-following orbs
          if (!orb1.isFollowing && !orb2.isFollowing) {
            // Repulsion force
            const force = 0.002 * speedFactor;
            const repulsion = (1 - distance / 120) * force;
            
            orb1.speedX += (dx / distance) * repulsion;
            orb1.speedY += (dy / distance) * repulsion;
            orb2.speedX -= (dx / distance) * repulsion;
            orb2.speedY -= (dy / distance) * repulsion;
          }
        }
      }
    }
    
    // Display current capture stats and time
    updateCaptureInfo();
  }
  
  requestAnimationFrame(animate);
}

// Update capture info
function updateCaptureInfo() {
  const captureInfo = document.createElement('div');
  captureInfo.style.position = 'absolute';
  captureInfo.style.top = '10px';
  captureInfo.style.right = '10px';
  captureInfo.style.color = 'white';
  captureInfo.style.fontSize = '14px';
  captureInfo.style.backgroundColor = 'rgba(0,0,0,0.5)';
  captureInfo.style.padding = '5px 10px';
  captureInfo.style.borderRadius = '5px';
  captureInfo.textContent = `Captured: ${followingOrbs.length} / ${orbs.length}`;
  
  // Remove previous capture info if exists
  const oldInfo = document.querySelector('.capture-info');
  if (oldInfo) oldInfo.remove();
  
  captureInfo.className = 'capture-info';
  document.querySelector('.canvas').appendChild(captureInfo);
}

// Start animation
animate();

// Function to add a new orb
function addNewOrb() {
  const canvasElement = document.querySelector('.canvas');
  const newOrb = document.createElement('div');
  newOrb.className = 'orb';
  
  const size = sizeControl.value;
  newOrb.style.width = `${size}px`;
  newOrb.style.height = `${size}px`;
  
  const orbData = {
    element: newOrb,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    speedX: (Math.random() - 0.5) * 3,
    speedY: (Math.random() - 0.5) * 3,
    hue: Math.random() * 360,
    isFollowing: false,
    followAngle: 0,
    value: Math.floor(Math.random() * 5) + 1, // Random value between 1-5 for score
    data: {
      type: ['energy', 'matter', 'time', 'space', 'light'][Math.floor(Math.random() * 5)],
      state: ['stable', 'unstable', 'neutral', 'charged', 'void'][Math.floor(Math.random() * 5)],
      intensity: Math.floor(Math.random() * 100)
    }
  };
  
  // Add click event
  newOrb.addEventListener('click', () => {
    alert(`Orb Data:\nType: ${orbData.data.type}\nState: ${orbData.data.state}\nIntensity: ${orbData.data.intensity}\nValue: ${orbData.value} points`);
  });
  
  updateOrbColor(orbData);
  canvasElement.appendChild(newOrb);
  orbs.push(orbData);
}

// Update orb color
function updateOrbColor(orb) {
  const hue = (orb.hue + 10) % 360;
  orb.hue = hue;
  const color1 = `hsl(${hue}, 80%, 70%)`;
  const color2 = `hsl(${(hue + 30) % 360}, 60%, 40%)`;
  orb.element.style.background = `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`;
  orb.element.style.boxShadow = `0 0 15px ${color1}`;
}

// Add 5 orbs to start
for (let i = 0; i < 5; i++) {
  addNewOrb();
}

// Resize handler
window.addEventListener('resize', () => {
  resizeCanvas();
  // Keep orbs within new window boundaries
  orbs.forEach(orb => {
    if (orb.x > window.innerWidth) orb.x = window.innerWidth - 20;
    if (orb.y > window.innerHeight) orb.y = window.innerHeight - 20;
  });
});

// Create start game button
const startGameBtn = document.createElement('button');
startGameBtn.textContent = 'Start Game';
startGameBtn.style.position = 'absolute';
startGameBtn.style.top = '50%';
startGameBtn.style.left = '50%';
startGameBtn.style.transform = 'translate(-50%, -50%)';
startGameBtn.style.padding = '15px 30px';
startGameBtn.style.fontSize = '24px';
startGameBtn.style.backgroundColor = '#4a4a8c';
startGameBtn.style.color = 'white';
startGameBtn.style.border = 'none';
startGameBtn.style.borderRadius = '10px';
startGameBtn.style.cursor = 'pointer';
startGameBtn.style.zIndex = '100';
startGameBtn.style.boxShadow = '0 0 20px rgba(100, 100, 255, 0.7)';

startGameBtn.addEventListener('click', () => {
  startGameBtn.remove();
  startGame();
});

document.querySelector('.canvas').appendChild(startGameBtn);