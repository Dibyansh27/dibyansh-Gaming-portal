const game = document.getElementById("game");

let score = 0;
let level = 1;
let timeLeft = 60;
let lives = 3;
let currentTarget = 1;
let spawnSpeed = 1400;

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");
const endMsg = document.getElementById("endMsg");
const finalStats = document.getElementById("finalStats");

let gameInterval, timerInterval;

/* RANDOM HELPER */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* SOUND EFFECTS */
const popSound = new Audio("https://www.fesliyanstudios.com/play-mp3/4381");
const wrongSound = new Audio("https://www.fesliyanstudios.com/play-mp3/6652");
const levelUpSound = new Audio("https://www.fesliyanstudios.com/play-mp3/6513");

function play(sound) {
  sound.volume = 0.5;
  sound.play();
}

/* PARTICLE EXPLOSION */
function createParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
    let p = document.createElement("div");
    p.className = "particle";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.background = color;
    p.style.setProperty("--tx", rand(-80, 80) + "px");
    p.style.setProperty("--ty", rand(-80, 80) + "px");
    game.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }
}

/* SCORE POPUP */
function scorePopup(x, y, txt, color) {
  const pop = document.createElement("div");
  pop.className = "score-popup";
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  pop.style.color = color;
  pop.innerText = txt;
  game.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

/* CLOUDS */
function spawnCloud() {
  const cloud = document.createElement("div");
  cloud.className = "cloud";
  cloud.style.top = rand(10, window.innerHeight - 200) + "px";
  cloud.style.left = "-300px";
  game.appendChild(cloud);
  setTimeout(() => cloud.remove(), 35000);
}

/* CREATE BALLOON */
function spawnBalloon(num, fake = false) {
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  balloon.textContent = num;
  balloon.dataset.num = num;
  balloon.dataset.fake = fake;

  balloon.style.left = rand(50, window.innerWidth - 120) + "px";
  balloon.style.top = window.innerHeight + "px";

  const color = `hsl(${rand(0, 360)}, 80%, 55%)`;
  balloon.style.background = color;

  game.appendChild(balloon);

  balloon.addEventListener("click", () => handleClick(balloon, color));

  let y = window.innerHeight;
  const speed = rand(1, 3) + level; // faster per level

  const move = setInterval(() => {
    y -= speed;
    balloon.style.top = y + "px";

    if (y < -150) {
      clearInterval(move);
      balloon.remove();
    }
  }, 16);
}

/* HANDLE CLICK */
function handleClick(bal, color) {
  const num = parseInt(bal.dataset.num);
  const fake = bal.dataset.fake === "true";

  const rect = bal.getBoundingClientRect();

  if (!fake && num === currentTarget) {
    // Correct
    play(popSound);
    createParticles(rect.left + 45, rect.top + 50, color);
    score += 10;
    scoreEl.textContent = score;

    scorePopup(rect.left + 30, rect.top, "+10", "yellow");

    currentTarget++;
    bal.remove();

    if (currentTarget > 10) {
      levelUp();
    }

  } else {
    // Wrong
    play(wrongSound);
    bal.style.transform = "scale(0.8)";
    setTimeout(() => (bal.style.transform = "scale(1)"), 150);

    lives--;
    updateLives();

    scorePopup(rect.left, rect.top, "-1 ❤️", "red");

    if (lives <= 0) {
      endGame(false);
    }
  }
}

/* UPDATE LIVES */
function updateLives() {
  livesEl.innerHTML = "❤️".repeat(lives);
}

/* LEVEL UP */
function levelUp() {
  level++;
  levelEl.textContent = level;
  play(levelUpSound);

  currentTarget = 1;

  spawnSpeed = Math.max(600, spawnSpeed - 200); // faster spawn

  scorePopup(window.innerWidth / 2, 80, "LEVEL UP!", "cyan");
}

/* GAME TIMER */
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(true);
    }
  }, 1000);
}

/* MAIN GAME LOOP */
function startGame() {
  score = 0;
  level = 1;
  timeLeft = 60;
  lives = 3;
  currentTarget = 1;

  scoreEl.textContent = 0;
  timeEl.textContent = 60;
  updateLives();
  levelEl.textContent = 1;

  startScreen.style.display = "none";
  endScreen.style.display = "none";

  startTimer();

  gameInterval = setInterval(() => {
    // Correct number balloon
    spawnBalloon(currentTarget);

    // Fake balloons
    for (let i = 0; i < level; i++) {
      spawnBalloon(rand(1, 20), true);
    }
  }, spawnSpeed);

  setInterval(spawnCloud, 7000);
}

/* END GAME */
function endGame(won) {
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  document.querySelectorAll(".balloon").forEach(b => b.remove());

  endMsg.textContent = won ? "🎉 You Win!" : "Game Over!";
  finalStats.innerHTML = `
    Score: <b>${score}</b><br>
    Levels Completed: <b>${level}</b>
  `;
  endScreen.style.display = "flex";
}

/* RESTART */
function restartGame() {
  startGame();
}
