let player;
let gravity;
let obstacles = [];
let points = [];
let score = 0;
let gravityDirection = 1;
let obstacleSpeed = 5;
let spawnRate = 100;
let pointSpawnRate = 200;
let gameOver = false;

function setup() {
  createCanvas(1024, 600); // Adjusted for a laptop screen
  player = new Player();
  gravity = createVector(0, 0.3);
}

function draw() {
  if (!gameOver) {
    background(135, 206, 235);

    if (frameCount % 500 === 0 && spawnRate > 30) {
      spawnRate -= 10;
      obstacleSpeed += 0.5;
    }

    textSize(24);
    fill(0);
    text('Score: ' + score, 10, 30);

    player.applyGravity();
    player.update();
    player.display();

    if (frameCount % spawnRate === 0) {
      obstacles.push(new Obstacle());
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].display();

      if (obstacles[i].hits(player)) {
        gameOver = true;
      }

      if (obstacles[i].offscreen()) {
        obstacles.splice(i, 1);
      }
    }

    if (frameCount % pointSpawnRate === 0) {
      let validPoint = true;
      let newPoint;

      do {
        validPoint = true;
        newPoint = new Point();

        for (let i = 0; i < obstacles.length; i++) {
          if (newPoint.isNear(obstacles[i])) {
            validPoint = false;
            break;
          }
        }
      } while (!validPoint);

      points.push(newPoint);
    }

    for (let i = points.length - 1; i >= 0; i--) {
      points[i].update();
      points[i].display();

      if (points[i].collected(player)) {
        points.splice(i, 1);
        score++;
      }

      if (points[i].offscreen()) {
        points.splice(i, 1);
      }
    }
  } else {
    // Game over screen
    textSize(48);
    fill(255, 0, 0);
    textAlign(CENTER);
    text("Game Over!", width / 2, height / 2);
    textSize(24);
    text("Score: " + score, width / 2, height / 2 + 50);
    text("Tap to Restart", width / 2, height / 2 + 100);
  }
}

function touchStarted() {
  if (!gameOver) {
    gravityDirection *= -1;
  } else {
    resetGame();
  }
}

function resetGame() {
  player = new Player();
  gravityDirection = 1;
  obstacles = [];
  points = [];
  score = 0;
  obstacleSpeed = 5;
  spawnRate = 100;
  gameOver = false;
}

class Player {
  constructor() {
    this.pos = createVector(50, height / 2);
    this.vel = createVector(0, 0);
    this.size = 30;
    this.drag = 0.95;
  }

  applyGravity() {
    this.vel.add(p5.Vector.mult(gravity, gravityDirection));
  }

  update() {
    this.vel.mult(this.drag);
    this.pos.add(this.vel);
    this.vel.limit(10);

    if (this.pos.y > height - this.size / 2) {
      this.pos.y = height - this.size / 2;
      this.vel.y = 0;
    } else if (this.pos.y < this.size / 2) {
      this.pos.y = this.size / 2;
      this.vel.y = 0;
    }
  }

  display() {
    fill(255, 255, 0);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class Obstacle {
  constructor() {
    this.pos = createVector(width, random(50, height - 50));
    this.size = random(30, 60);
    this.speed = obstacleSpeed;
  }

  update() {
    this.pos.x -= this.speed;
  }

  display() {
    fill(255, 0, 0);
    rect(this.pos.x, this.pos.y, this.size, this.size);
  }

  hits(player) {
    return (
      player.pos.x + player.size / 2 > this.pos.x &&
      player.pos.x - player.size / 2 < this.pos.x + this.size &&
      player.pos.y + player.size / 2 > this.pos.y &&
      player.pos.y - player.size / 2 < this.pos.y + this.size
    );
  }

  offscreen() {
    return this.pos.x + this.size < 0;
  }
}

class Point {
  constructor() {
    this.pos = createVector(width, random(50, height - 50));
    this.size = 20;
    this.speed = obstacleSpeed;
  }

  update() {
    this.pos.x -= this.speed;
  }

  display() {
    fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  collected(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    return d < player.size / 2 + this.size / 2;
  }

  isNear(obstacle) {
    let d = dist(this.pos.x, this.pos.y, obstacle.pos.x, obstacle.pos.y);
    return d < this.size + obstacle.size + 50;
  }

  offscreen() {
    return this.pos.x + this.size < 0;
  }
}
