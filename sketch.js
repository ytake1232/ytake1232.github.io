let paddle;
let balls = [];
let blocks = [];
let items = [];

let gameOver = false;
let gameClear = false;
let gameStarted = false;
let safetyBoard = false;
let safetyTimer = 0;

const rows = 5;
const cols = 10;

function setup() {
  createCanvas(800, 600);

  paddle = {
    x: width / 2,
    y: height - 30,
    w: 120,
    h: 15,
    speed: 8
  };

  balls.push(new Ball(width / 2, height - 60));

  let margin = 40;
  let bw = (width - margin * 2) / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      blocks.push(new Block(
        margin + c * bw,
        50 + r * 30,
        bw - 4,
        20
      ));
    }
  }
}

function draw() {

background(20);

// 開始前
if (!gameStarted) {

  fill(255);
  textAlign(CENTER, CENTER);

  textSize(40);
  text("ブロック崩し", width / 2, height / 2 - 40);

  textSize(24);
  text("クリックしてスタート", width / 2, height / 2 + 20);

  // パドルだけ表示
  rectMode(CENTER);
  fill(255);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);

  // ボールも表示
  balls[0].display();

  return;
}

  //-----------------------
  // パドル操作
  //-----------------------
  if (keyIsDown(LEFT_ARROW))
    paddle.x -= paddle.speed;

  if (keyIsDown(RIGHT_ARROW))
    paddle.x += paddle.speed;

  paddle.x = constrain(
    paddle.x,
    paddle.w / 2,
    width - paddle.w / 2
  );

  //-----------------------
  // パドル描画
  //-----------------------
  fill(255);
  rectMode(CENTER);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);

  //-----------------------
  // セーフティボード
  //-----------------------
  if (safetyBoard) {
    fill(255, 200, 0);
    rect(width / 2, height - 5, width, 10);

    safetyTimer--;

    if (safetyTimer <= 0)
      safetyBoard = false;
  }

  //-----------------------
  // ブロック
  //-----------------------
  let remain = 0;

  for (let b of blocks) {
    if (!b.dead) {
      b.display();
      remain++;
    }
  }

  if (remain == 0)
    gameClear = true;

  //-----------------------
  // ボール
  //-----------------------
  for (let i = balls.length - 1; i >= 0; i--) {

    balls[i].update();
    balls[i].display();

    if (balls[i].dead)
      balls.splice(i, 1);
  }

  if (balls.length == 0)
    gameOver = true;

  //-----------------------
  // アイテム
  //-----------------------
  for (let i = items.length - 1; i >= 0; i--) {

    items[i].update();
    items[i].display();

    if (items[i].dead)
      items.splice(i, 1);
  }

}

////////////////////////////////////////////////////////////

class Ball {

  constructor(x, y) {

    this.x = x;
    this.y = y;

    this.r = 8;

    this.vx = random([-4, 4]);
    this.vy = -5;

    this.dead = false;
  }

  update() {

    this.x += this.vx;
    this.y += this.vy;

    //-----------------
    // 壁
    //-----------------
    if (this.x < this.r) {
      this.x = this.r;
      this.vx *= -1;
    }

    if (this.x > width - this.r) {
      this.x = width - this.r;
      this.vx *= -1;
    }

    if (this.y < this.r) {
      this.y = this.r;
      this.vy *= -1;
    }

    //-----------------
    // パドル
    //-----------------
    if (
      this.y + this.r > paddle.y - paddle.h / 2 &&
      this.y - this.r < paddle.y + paddle.h / 2 &&
      this.x > paddle.x - paddle.w / 2 &&
      this.x < paddle.x + paddle.w / 2 &&
      this.vy > 0
    ) {

      let diff = (this.x - paddle.x) / (paddle.w / 2);

      this.vx = diff * 6;
      this.vy = -abs(this.vy);
    }

    //-----------------
    // セーフティ
    //-----------------
    if (safetyBoard) {

      if (this.y > height - 10 - this.r && this.vy > 0) {
        this.y = height - 10 - this.r;
        this.vy *= -1;
      }

    } else {

      if (this.y > height + this.r) {
        this.dead = true;
      }

    }

    //-----------------
    // ブロック
    //-----------------
    for (let b of blocks) {

      if (b.dead) continue;

      if (
        this.x > b.x &&
        this.x < b.x + b.w &&
        this.y - this.r < b.y + b.h &&
        this.y + this.r > b.y
      ) {

        b.dead = true;
        this.vy *= -1;

        spawnItem(
          b.x + b.w / 2,
          b.y + b.h / 2
        );

        break;
      }

    }

  }

  display() {
    fill(255);
    circle(this.x, this.y, this.r * 2);
  }

}

////////////////////////////////////////////////////////////

class Block {

  constructor(x, y, w, h) {

    this.x = x;
    this.y = y;

    this.w = w;
    this.h = h;

    this.dead = false;
  }

  display() {

    fill(80, 170, 255);
    rectMode(CORNER);
    rect(this.x, this.y, this.w, this.h, 4);

  }

}

////////////////////////////////////////////////////////////

class Item {

  constructor(x, y, type) {

    this.x = x;
    this.y = y;

    this.type = type;

    this.dead = false;
  }

  update() {

    this.y += 3;

    if (
      this.y > paddle.y - 10 &&
      abs(this.x - paddle.x) < paddle.w / 2
    ) {

      this.apply();
      this.dead = true;
    }

    if (this.y > height)
      this.dead = true;

  }

  apply() {

    if (this.type == 0) {

      balls.push(new Ball(this.x, this.y));

    } else if (this.type == 1) {

      paddle.w = min(220, paddle.w + 40);

    } else if (this.type == 2) {

      paddle.w = max(50, paddle.w - 30);

    } else if (this.type == 3) {

      safetyBoard = true;
      safetyTimer = 600;

    }

  }

  display() {

    noStroke();

    switch (this.type) {

      case 0:
        fill(0, 180, 255);
        break;

      case 1:
        fill(0, 255, 0);
        break;

      case 2:
        fill(255, 50, 50);
        break;

      case 3:
        fill(255, 220, 0);
        break;

    }

    circle(this.x, this.y, 18);

  }

}

////////////////////////////////////////////////////////////

function spawnItem(x, y) {

  if (random() > 0.3) return;

  let type = floor(random(4));

  items.push(new Item(x, y, type));

}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
  }
}
