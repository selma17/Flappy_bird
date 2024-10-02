//board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//bird
let birdWidth = 70;
let birdHeight = 45;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let initialVelocityX = -2; // Initial pipes speed
let velocityX = initialVelocityX; // Variable to control pipes speed
let velocityY = 4;  // Bird jump speed
let gravity = 0.5;

let gameOver = false;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0; // Load best score from localStorage

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    birdImg = new Image();
    birdImg.src = "blueflappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "finallybluetop.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "finallybluebottom.png";

    // Game Over Image
    let gameOverImage = document.createElement("img");
    gameOverImage.src = "GAME_OVER.png"; // Set your image path
    gameOverImage.id = "gameOverImage";
    document.body.appendChild(gameOverImage);

    requestAnimationFrame(update);
    setInterval(placePipes, 1000);
    document.addEventListener("keydown", moveBird);

    // Create Reset Button
    let resetButton = document.createElement("button");
    resetButton.innerHTML = "Reset";
    resetButton.style.display = "none";
    resetButton.style.position = "absolute";
    resetButton.style.top = "60%";
    resetButton.style.left = "50%";
    resetButton.style.transform = "translate(-50%, -50%)";
    resetButton.style.padding = "10px 20px";
    resetButton.style.fontSize = "20px";
    resetButton.addEventListener("click", resetGame);
    document.body.appendChild(resetButton);

    function resetGame() {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        velocityY = 0;
        velocityX = initialVelocityX; // Reset the velocity to the initial value
        gravity = 0.5;
        gameOver = false;
        resetButton.style.display = "none";
        gameOverImage.style.display = "none"; // Hide the Game Over image
    
        requestAnimationFrame(update); // Start a new animation loop
    }
    function moveBird(e) {
        if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
            velocityY = -9; //speed of moving up
    
            if (gameOver) {
                resetGame()
            }
        }
    }
}

function update() {
    if (gameOver) {
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        updateBestScore();  // Update best score when the game ends
        document.querySelector("#gameOverImage").style.display = "block"; 
        document.querySelector("button").style.display = "block"; 
        return;
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        //console.log(velocityX);
        pipe.x += velocityX-1;
        //console.log(pipe.x);
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;

            // Increase speed at every multiple of 5 points
            if (Math.floor(score) % 5 === 0) {

                velocityX -= 1; // Slightly increase the speed
                
            }
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            updateBestScore();  // Update best score when the game ends
            document.querySelector("#gameOverImage").style.display = "block"; 
            document.querySelector("button").style.display = "block"; 
        }
    }

    // Remove off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Display score
    context.fillStyle = "blue";
    context.font = "35px 'Press Start 2P', cursive";
    let formattedScore = "Score: " + Math.floor(score);
    let formattedBestScore = "Best score: " + bestScore;  // Display best score
    context.fillText(formattedScore, 20, 40);
    context.fillText(formattedBestScore, 20, 80);  // Add best score below the current score
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 3; // Adjust this value for more space between pipes

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}



function detectCollision(a, b) {
    return a.x < b.x + b.width-10  && a.x + a.width - 10 > b.x && a.y < b.y + b.height - 10 && a.y + a.height > b.y + 15;
} 
function updateBestScore() {
    if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem("bestScore", bestScore);  // Save best score to localStorage
    }
}

