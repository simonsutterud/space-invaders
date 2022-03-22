let gameContainer;
let playerElement;
let playerHealthBarContainer;
let playerHealthBarGreen;
let playerHealthBarRed;
let bossHealthBarContainer;
let bossHealthBarGreen;
let bossHealthBarRed;
let bossElement;
let muteButton;

let GAME_WIDTH = 800;
let GAME_HEIGHT = 800;
const PLAYER_SPEED = 7;
const LASER_SPEED = 10;
let LASER_COOLDOWN = 0;
const LASER_COOLDOWN_TIME = 25;

const GAME_STATE = {
  playing: true,
  leftPressed: false,
  rightPressed: false,
  upPressed: false,
  downPressed: false,
  spacePressed: false,
  playerHealth: 100,
  playerX: 0,
  playerY: 0,
  bossHealth: 100,
  bossX: 0,
  bossY: -GAME_HEIGHT + 200,
  lasers: [],
  enemies: [],
  enemyLasers: [],
  level: 0,
  muted: false,
};

const audioClips = [
  "audio/Burp_BW.61628.wav",
  "audio/CannonBlast_BW.54934.wav",
  "audio/DNF_vocal_one_shot_ouch.wav",
  "audio/ESM_Explainer_Video_One_Shot_Positive_Notification_Alert_Fanfare_Ta_Da_Brass_Horn_1.wav",
  "audio/ESM_Game_Over_v2_Sound_FX_Arcade_Casino_Kids_Mobile_App.wav",
  "audio/ESM_High_Elf_Vocal_Pain_Vocal_Hurt_Ouch_Male_Voice.wav",
  "audio/ESM_High_Elf_Vocal_Pain_Vocal_Ouch_Ahh_Male_Voice.wav",
  "audio/ESM_High_Elf_Vocal_Pain_Vocal_Ouch_Oof_Male_Voice.wav",
  "audio/ESM_Morphed_Touch_4_Hybrid_Mobile_Collect_Special_Power_Up_Buff.wav",
  "audio/ESM_Orc_Pain_Vocal_Ouch_Doof_Male_Voice_Creature_Monster_Fantasy.wav",
  "audio/ESM_Vocal_Painful_Human_AI_Ouch_3_Male_Computer_Voice_Emote.wav",
  "audio/laser bright.wav",
  "audio/laser dark.wav",
  "audio/PE-Laser_BW.36570.wav",
  "audio/VR_FX_laser_4.wav",
];

const loadedClips = [];

class App {
  constructor() {
    gameContainer = document.createElement("div");
    document.body.append(gameContainer);
    gameContainer.classList.add("game-container");
    this.createPlayer();
    this.loadAudio();
    muteButton = document.createElement("div");
    muteButton.innerHTML = `<i class="fas fa-volume-up"></i>`;
    muteButton.classList.add("mute-button");
    gameContainer.append(muteButton);
    if (localStorage.getItem("mute") === "true") toggleMute();
  }

  createPlayer() {
    playerElement = document.createElement("img");
    playerElement.classList.add("player-element");
    playerHealthBarContainer = document.createElement("div");
    playerHealthBarContainer.classList.add("healthbar-container");
    playerHealthBarGreen = document.createElement("div");
    playerHealthBarGreen.classList.add("healthbar-green");
    playerHealthBarRed = document.createElement("div");
    playerHealthBarRed.classList.add("healthbar-red");
    playerElement.src = "images/alex.png";
    gameContainer.append(playerElement);
    playerHealthBarContainer.append(playerHealthBarGreen);
    playerHealthBarContainer.append(playerHealthBarRed);
    gameContainer.append(playerHealthBarContainer);
  }

  loadAudio() {
    audioClips.forEach((clip) => {
      const audio = new Audio();
      audio.src = clip;
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        loadedClips.push(audio);
        audio.volume = 0;
        audio.play();
      });
    });
  }
}

const setPosition = function (el, x, y) {
  el.style.transform = `translate(${x}px, ${y}px)`;
};

const rectsIntersect = function (r1, r2) {
  return !(
    r2.left + 15 > r1.right ||
    r2.right - 15 < r1.left ||
    r2.top + 15 > r1.bottom ||
    r2.bottom - 15 < r1.top
  );
};

const createLaser = function (x, y) {
  let laserEl = document.createElement("img");
  laserEl.src = "images/laser-blue-1.png";
  laserEl.classList.add("laser");
  gameContainer.append(laserEl);
  setPosition(laserEl, x, y);
  const laser = { laserEl, x, y, traveled: 0 };
  GAME_STATE.lasers.push(laser);
  if (!GAME_STATE.muted) {
    const audio = new Audio("audio/PE-Laser_BW.36570.wav");
    audio.volume = 0.2;
    audio.play();
  }
};

const createEnemyLaser = function (x, y, el) {
  if (!GAME_STATE.playing) return;
  let enemyLaserEl = document.createElement("img");
  enemyLaserEl.src = "images/laser-red-4.png";
  if (bossElement) enemyLaserEl.src = "images/laser-red-14.png";
  let audio = new Audio("audio/laser bright.wav");
  audio.volume = 0.1;
  if (el === "luiza") {
    enemyLaserEl.src = "images/poop.png";
    audio = new Audio("audio/Burp_BW.61628.wav");
    audio.volume = 0.3;
  }
  if (el === "simon") {
    enemyLaserEl.src = "images/laser-green-9.png";
    audio = new Audio("audio/laser dark.wav");
  }
  audio.volume = 0.2;
  if (el === "emilia") {
    enemyLaserEl.src = "images/laser-blue-14.png";
    audio = new Audio("audio/VR_FX_laser_4.wav");
    audio.volume = 0.15;
  }
  if (el === "boss") audio.volume = 0;

  enemyLaserEl.classList.add("laser");
  gameContainer.append(enemyLaserEl);
  setPosition(enemyLaserEl, x, y);
  if (!GAME_STATE.muted) {
    audio.play();
  }
  const enemyLaser = { enemyLaserEl, x, y };
  GAME_STATE.enemyLasers.push(enemyLaser);
};

const updatePlayer = function () {
  if (GAME_STATE.leftPressed && GAME_STATE.playerX > -GAME_WIDTH / 2 + 57)
    GAME_STATE.playerX -= PLAYER_SPEED;
  if (GAME_STATE.rightPressed && GAME_STATE.playerX < GAME_WIDTH / 2 - 57)
    GAME_STATE.playerX += PLAYER_SPEED;
  if (GAME_STATE.upPressed && GAME_STATE.playerY > -GAME_HEIGHT + 145)
    GAME_STATE.playerY -= PLAYER_SPEED;
  if (GAME_STATE.downPressed && GAME_STATE.playerY < 0)
    GAME_STATE.playerY += PLAYER_SPEED;
  if (GAME_STATE.spacePressed && LASER_COOLDOWN === 0) {
    createLaser(GAME_STATE.playerX, GAME_STATE.playerY - 80);
    setCooldown();
  }
  setPosition(playerElement, GAME_STATE.playerX, GAME_STATE.playerY);
  setPosition(
    playerHealthBarContainer,
    GAME_STATE.playerX - 50,
    GAME_STATE.playerY
  );
};

const gameOver = function () {
  GAME_STATE.playing = false;
  document.querySelector(".game-over").classList.remove("hidden");
  gameContainer.classList.add("blur");
  if (!GAME_STATE.muted) {
    const audio = new Audio(
      "audio/ESM_Game_Over_v2_Sound_FX_Arcade_Casino_Kids_Mobile_App.wav"
    );
    audio.play();
  }
};

const gameWon = function () {
  document.querySelector(".game-won").classList.remove("hidden");
  gameContainer.classList.add("blur");
  if (!GAME_STATE.muted) {
    const audio = new Audio(
      "audio/ESM_Explainer_Video_One_Shot_Positive_Notification_Alert_Fanfare_Ta_Da_Brass_Horn_1.wav"
    );
    audio.play();
  }
};

const updateLasers = function () {
  GAME_STATE.lasers.forEach((laser, i) => {
    const delta = LASER_SPEED + laser.traveled * 0.02;
    laser.y -= delta;
    laser.traveled += delta;
    setPosition(laser.laserEl, laser.x, laser.y);
    if (laser.y < -GAME_HEIGHT + 50) {
      laser.laserEl.remove();
      const index = GAME_STATE.lasers.indexOf(laser);
      if (index > -1) {
        GAME_STATE.lasers.splice(index, 1);
      }
    }
    const r1 = laser.laserEl.getBoundingClientRect();
    let r2;
    if (bossElement) {
      r2 = bossElement.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        laser.laserEl.remove();
        if (!bossElement.isShooting) {
          bossElement.src = "images/mariusz_shot.png";
          setTimeout(() => {
            if (!bossElement.isDead && !bossElement.isShooting)
              bossElement.src = "images/mariusz.png";
          }, 300);
        }
        if (!GAME_STATE.muted) {
          const random = () => Math.random() < 0.4;
          if (random()) {
            const audio = new Audio(
              Math.random() > 0.5
                ? "audio/ESM_Vocal_Painful_Human_AI_Ouch_3_Male_Computer_Voice_Emote.wav"
                : "audio/DNF_vocal_one_shot_ouch.wav"
            );
            audio.volume = 0.3;
            audio.play();
          }
        }
        GAME_STATE.bossHealth -= 5;
        if (GAME_STATE.bossHealth <= 0) {
          bossElement.isDead = true;
          bossElement.src = "images/explosion.gif";
          if (!GAME_STATE.muted) {
            const audio = new Audio("audio/CannonBlast_BW.54934.wav");
            audio.volume = 0.7;
            audio.play();
          }
          setTimeout(() => {
            bossElement.remove();
          }, 300);
          // bossElement.remove();
          setTimeout(() => {
            gameWon();
            GAME_STATE.playing = false;
          }, 1500);
        }
      }
    }
    if (GAME_STATE.enemies.length > 0) {
      GAME_STATE.enemies.forEach((enemy) => {
        r2 = enemy.element.getBoundingClientRect();
        if (rectsIntersect(r1, r2)) {
          const index = GAME_STATE.enemies.indexOf(enemy);
          if (index > -1) {
            GAME_STATE.enemies.splice(index, 1);
          }
          laser.laserEl.remove();
          if (!GAME_STATE.muted) {
            const audio = new Audio("audio/CannonBlast_BW.54934.wav");
            audio.volume = 0.5;
            audio.play();
          }
          enemy.element.src = "images/explosion.gif";
          setTimeout(() => {
            enemy.element.remove();
          }, 300);
          enemy.isDead = true;
        }
      });
    }
  });
};

const getHitAudio = function () {
  const random = Math.random();

  if (random > 0.75)
    return "audio/ESM_High_Elf_Vocal_Pain_Vocal_Hurt_Ouch_Male_Voice.wav";
  if (random > 0.5)
    return "audio/ESM_High_Elf_Vocal_Pain_Vocal_Ouch_Ahh_Male_Voice.wav";
  if (random > 0.25)
    return "audio/ESM_High_Elf_Vocal_Pain_Vocal_Ouch_Oof_Male_Voice.wav";
  if (random > 0)
    return "audio/ESM_Orc_Pain_Vocal_Ouch_Doof_Male_Voice_Creature_Monster_Fantasy.wav";
};

const updateEnemyLasers = function () {
  GAME_STATE.enemyLasers.forEach((laser) => {
    laser.y += LASER_SPEED;
    setPosition(laser.enemyLaserEl, laser.x, laser.y);
    if (laser.y > 100) {
      laser.enemyLaserEl.remove();
      const index = GAME_STATE.lasers.indexOf(laser);
      if (index > -1) {
        GAME_STATE.lasers.splice(index, 1);
      }
    }
    const r1 = playerElement.getBoundingClientRect();
    const r2 = laser.enemyLaserEl.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      GAME_STATE.playerHealth -= 10;
      playerElement.src = "images/alex_shot.png";
      setTimeout(() => {
        playerElement.src = "images/alex.png";
      }, 500);

      if (!GAME_STATE.muted) {
        const audio = new Audio(getHitAudio());
        audio.volume = 0.8;
        audio.play();
      }
      if (GAME_STATE.playerHealth <= 0) {
        GAME_STATE.playing = false;
        gameOver();
      }
      laser.enemyLaserEl.remove();
    }
  });
};

const setCooldown = function () {
  LASER_COOLDOWN = LASER_COOLDOWN_TIME;
  updateCooldown();
};

const updateCooldown = function () {
  if (LASER_COOLDOWN > 0) LASER_COOLDOWN--;
};

const keydown = function (e) {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
    GAME_STATE.leftPressed = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
    GAME_STATE.rightPressed = true;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
    GAME_STATE.upPressed = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
    GAME_STATE.downPressed = true;
  if (e.key === " ") GAME_STATE.spacePressed = true;
};
const keyup = function (e) {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
    GAME_STATE.leftPressed = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
    GAME_STATE.rightPressed = false;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
    GAME_STATE.upPressed = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
    GAME_STATE.downPressed = false;
  if (e.key === " ") GAME_STATE.spacePressed = false;
};

const spawnBoss = function () {
  setTimeout(() => {
    if (bossElement) return;
    bossElement = document.createElement("img");
    bossElement.classList.add("boss-element");
    bossElement.src = "images/mariusz.png";
    bossHealthBarContainer = document.createElement("div");
    bossHealthBarContainer.classList.add("healthbar-container");
    bossHealthBarContainer.classList.add("boss-healthbar");
    bossHealthBarGreen = document.createElement("div");
    bossHealthBarGreen.classList.add("healthbar-green");
    bossHealthBarRed = document.createElement("div");
    bossHealthBarRed.classList.add("healthbar-red");
    bossHealthBarContainer.append(bossHealthBarGreen);
    bossHealthBarContainer.append(bossHealthBarRed);
    gameContainer.append(bossHealthBarContainer);
    gameContainer.append(bossElement);
    setPosition(bossElement, GAME_STATE.bossX, GAME_STATE.bossY);
    setPosition(
      bossHealthBarContainer,
      GAME_STATE.bossX - 50,
      GAME_STATE.bossY
    );
  }, 3000);
};

const getRandomEnemy = function () {
  const oliwia = "images/oliwia.png";
  const luiza = "images/luiza.png";
  const simon = "images/simon.png";
  const emilia = "images/emilia.png";

  const random = Math.random();

  if (random > 0.75) return oliwia;
  if (random > 0.5) return luiza;
  if (random > 0.25) return simon;
  if (random > 0) return emilia;
};

console.log(window.innerWidth);
console.log((document.querySelector(":root").style["--game-width"] = "900px"));

const spawnEnemies = function (numEnemies) {
  for (let i = 0; i < numEnemies; i++) {
    let enemy = {};
    enemy.element = document.createElement("img");
    enemy.element.classList.add("enemy-element");
    enemy.element.src = getRandomEnemy();
    enemy.x = (Math.random() - 0.5) * (GAME_WIDTH - 100);
    enemy.y = (Math.random() - 1) * 2000 - 920;
    /* enemy.y = -(930 + i * 100 + (Math.random() - 0.5) * 10); */
    enemy.isDead = false;
    gameContainer.append(enemy.element);
    setPosition(enemy.element, enemy.x, enemy.y);
    GAME_STATE.enemies.push(enemy);
  }
};

const moveEnemies = function () {
  GAME_STATE.enemies.forEach((enemy) => {
    enemy.y += 0.8;
    if (enemy.y > 0) {
      GAME_STATE.playerHealth -= 10;
      if (GAME_STATE.playerHealth <= 0) gameOver();
      enemy.element.remove();
      const index = GAME_STATE.enemies.indexOf(enemy);
      if (index > -1) {
        GAME_STATE.enemies.splice(index, 1);
      }
    }
    setPosition(enemy.element, enemy.x, enemy.y);
  });
};

const bossShoot = function () {
  if (!GAME_STATE.playing || GAME_STATE.bossHealth <= 0) return;
  bossElement.src = "images/mariusz_shoot.png";
  bossElement.isShooting = true;
  createEnemyLaser(GAME_STATE.bossX - 20, GAME_STATE.bossY - 100, "boss");
  createEnemyLaser(GAME_STATE.bossX + 35, GAME_STATE.bossY - 100), "boss";
  if (!GAME_STATE.muted) {
    const audio = new Audio(
      "audio/ESM_Morphed_Touch_4_Hybrid_Mobile_Collect_Special_Power_Up_Buff.wav"
    );
    audio.volume = 0.4;
    audio.play();
  }
  setTimeout(() => {
    createEnemyLaser(GAME_STATE.bossX - 20, GAME_STATE.bossY - 100, "boss");
    createEnemyLaser(GAME_STATE.bossX + 35, GAME_STATE.bossY - 100, "boss");
  }, 50);
  setTimeout(() => {
    if (!bossElement.isDead) bossElement.src = "images/mariusz.png";
    bossElement.isShooting = false;
  }, 300);
};

const enemiesShoot = function () {
  GAME_STATE.enemies.forEach((enemy) => {
    if (enemy.y < -GAME_HEIGHT + 50) return;
    if (enemy.y > 0) return;
    setTimeout(() => {
      if (enemy.isDead) return;
      if (enemy.element.src.includes("images/oliwia.png")) {
        enemy.element.src = "images/oliwia_shoot.png";
        createEnemyLaser(enemy.x - 5, enemy.y);
        setTimeout(() => {
          enemy.isDead ? "" : (enemy.element.src = "images/oliwia.png");
        }, 300);
      }
      if (enemy.element.src.includes("images/luiza.png")) {
        enemy.element.src = "images/luiza_shoot.png";
        createEnemyLaser(enemy.x, enemy.y, "luiza");
        setTimeout(() => {
          enemy.isDead ? "" : (enemy.element.src = "images/luiza.png");
        }, 300);
      }
      if (enemy.element.src.includes("images/simon.png")) {
        enemy.element.src = "images/simon_shoot.png";
        createEnemyLaser(enemy.x, enemy.y, "simon");
        setTimeout(() => {
          enemy.isDead ? "" : (enemy.element.src = "images/simon.png");
        }, 300);
      }
      if (enemy.element.src.includes("images/emilia.png")) {
        enemy.element.src = "images/emilia_shoot.png";
        createEnemyLaser(enemy.x - 10, enemy.y - 20, "emilia");
        setTimeout(() => {
          enemy.isDead ? "" : (enemy.element.src = "images/emilia.png");
        }, 300);
      }
    }, Math.random() * 2000);
  });
};

const levelController = function () {
  if (GAME_STATE.enemies.length > 0) return;
  if (GAME_STATE.level === 1) spawnEnemies(15);
  if (GAME_STATE.level === 2) spawnEnemies(30);
  if (GAME_STATE.level === 3) spawnBoss();
};

(function loop() {
  if (!GAME_STATE.playing) return;
  const rand = Math.round(Math.random() * 3000) + 1000;
  setTimeout(function () {
    if (bossElement && !GAME_STATE.bossHealth <= 0) bossShoot();
    if (GAME_STATE.enemies.length > 0) enemiesShoot();
    loop();
  }, rand);
})();

const moveBoss = function () {
  GAME_STATE.bossX =
    GAME_STATE.playerX < GAME_STATE.bossX
      ? (GAME_STATE.bossX -= 2)
      : (GAME_STATE.bossX += 2);

  GAME_STATE.bossY =
    GAME_STATE.bossY < GAME_STATE.playerY
      ? (GAME_STATE.bossY += 0.2)
      : (GAME_STATE.bossY -= 0.5);

  setPosition(bossElement, GAME_STATE.bossX, GAME_STATE.bossY);
  setPosition(bossHealthBarContainer, GAME_STATE.bossX - 50, GAME_STATE.bossY);
};

const checkHealth = function () {
  if (GAME_STATE.playerHealth < 10) {
    playerHealthBarGreen.style.transition = "none";
    playerHealthBarContainer.classList.remove("blink-class");
  }
  playerHealthBarGreen.style.width = `${GAME_STATE.playerHealth}px`;
  if (bossHealthBarGreen)
    bossHealthBarGreen.style.width = `${GAME_STATE.bossHealth}px`;
  if (GAME_STATE.bossHealth <= 0) bossHealthBarContainer.remove();

  if (GAME_STATE.playerHealth <= 20 && GAME_STATE.playerHealth >= 10) {
    if (!playerHealthBarContainer.classList.contains(".blink-class"))
      playerHealthBarContainer.classList.add("blink-class");
  }
};

const initMobile = function () {
  GAME_WIDTH = gameContainer.clientWidth;
  GAME_HEIGHT = gameContainer.clientHeight;
  if (GAME_HEIGHT < 800 || GAME_WIDTH < 800) {
    document.querySelector(".mobile").style.top = `${GAME_HEIGHT + 150}px`;
    document.querySelector(".mobile").classList.remove("hidden");
  }
};

const update = function () {
  checkHealth();
  if (!GAME_STATE.playing) return;
  if (GAME_STATE.enemies.length === 0 && !bossElement) {
    if (GAME_STATE.level < 3) GAME_STATE.level++;
    const level = document.querySelector(".level");
    setTimeout(() => {
      level.classList.remove("hidden");
      level.innerHTML = `<h1>Level ${GAME_STATE.level}</h1>`;
    }, 500);
    setTimeout(() => {
      level.classList.add("hidden");
    }, 3000);
  }
  levelController();
  updatePlayer();
  moveEnemies();
  updateLasers();
  updateEnemyLasers();
  updateCooldown();
  if (bossElement) moveBoss();

  window.requestAnimationFrame(update);
};

window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

const start = function () {
  initMobile();
  window.requestAnimationFrame(update);
  document.querySelector(".main-menu").classList.add("hidden");
};

const restart = function () {
  location.reload();
  start();
};

const toggleMute = function () {
  if (!GAME_STATE.muted) {
    muteButton.innerHTML = `<i class="fas fa-volume-mute"></i>`;
    GAME_STATE.muted = true;
    localStorage.clear();
    localStorage.setItem("mute", GAME_STATE.muted);
    return;
  } else if (GAME_STATE.muted) {
    muteButton.innerHTML = `<i class="fas fa-volume-up"></i>`;
    GAME_STATE.muted = false;
    localStorage.clear();
    localStorage.setItem("mute", GAME_STATE.muted);
    return;
  }
};

const app = new App();

muteButton.addEventListener("click", toggleMute);

document.querySelector(".start-game").addEventListener("click", start);

document.querySelector(".reset-game").addEventListener("click", restart);
document.querySelector(".reset-game2").addEventListener("click", restart);
