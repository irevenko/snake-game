class Game {
  constructor(x, y, angle, length, context) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.coordinates = [];
  }

  render() {
    this.context.beginPath();
    this.context.fillStyle = Game.SNAKE_COLOR;
    this.context.arc(this.x, this.y, Game.SNAKE_HEAD_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();
  }

  launch(canvasSize, game) {
    const radian = ((this.angle * Math.PI) / 180);
    this.x += Game.SNAKE_SPEED * Math.cos(radian);
    this.y += Game.SNAKE_SPEED * Math.sin(radian);
    this.validateCoordinates(canvasSize, game);
    this.pushCoordinates();
    this.render();
    this.checkSnakeСollision(game);
  }

  pushCoordinates() {
    this.coordinates.push({
      x: this.x,
      y: this.y,
    })
    this.snakeLengthControl();
  }

  directionControl(e) {
    switch(e.keyCode) {
      case 37: {
        this.turnLeft();
        break;
      }
      case 39: {
        this.turnRight();
        break;
      }
    }
  }

  turnLeft() {
    this.angle -= Game.SNAKE_ROTATION_SPEED;
  }

  turnRight() {
    this.angle += Game.SNAKE_ROTATION_SPEED;
  }

  snakeLengthControl() {
    if (this.coordinates.length > this.length) {
      const { x, y } = this.coordinates[0];
      this.context.beginPath();
      this.context.fillStyle = '#fff';
      this.context.arc(x, y, Game.SNAKE_HEAD_RADIUS + 2, 0, 2 * Math.PI);
      this.context.fill();
      this.context.closePath();
      this.coordinates.shift();
    }
  }

  validateCoordinates({mapW, mapH}, game) {
    if (
      (this.x < 0) || (this.x > mapW) ||
      (this.y < 0) || (this.y > mapH)
    ) {
      finishGame(game);
    }
  }

  checkSnakeСollision(game) {
    this.coordinates.slice(0, -Game.SNAKE_HEAD_RADIUS).forEach(({x, y}) => {
      const distance = Math.sqrt(((x - this.x) ** 2) + ((y - this.y) ** 2));
      if (distance < Game.SNAKE_HEAD_RADIUS + 2) {
        finishGame(game);
      }
    })
  }
}
Game.SNAKE_COLOR = '#0185ff';
Game.SNAKE_INITIAL_LENGTH = 50;
Game.SNAKE_HEAD_RADIUS = 8;
Game.SNAKE_SPEED = 2;
Game.SNAKE_ROTATION_SPEED = 20;


class Fruit {
  constructor(x, y, color, context) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.render(context);
  }

  render(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, Fruit.RADIUS, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
  }

  bite(context) {    //to destroy fruit
    context.beginPath();
    context.fillStyle = '#fff';
    context.strokeStyle = '#fff';
    context.arc(this.x, this.y, Fruit.RADIUS, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
  }

  static fruitGenerator(fruits = [], context) {
    let difference = Fruit.MAX_QUANTITY_OF_FRUIT - fruits.length;
    while (difference > 0) {
      const x = (Math.random() * 900) >> 0; //map width
      const y = (Math.random() * 550) >> 0; //map height
      const color = '#27e30a';
      const fruit = new Fruit(x, y, color, context);
      fruits.push(fruit);
      difference--;
    }
  }

  static checkFruitCollision(fruits, snake, context) {
    for (const fruit of fruits) {
      if (
        (snake.x > fruit.x - 10) && (snake.x < fruit.x + 10) &&
        (snake.y > fruit.y - 10) && (snake.y < fruit.y + 10)
      ) {
        fruit.bite(context);
        fruits.splice(fruits.indexOf(fruit), 1);
        snake.length += 1;
        updateScore(snake.length - Game.SNAKE_INITIAL_LENGTH);
      }
    }
  }
}
Fruit.RADIUS = 7;
Fruit.MAX_QUANTITY_OF_FRUIT = 100;

//game setup and launch

const updateScore = (score) => {
  const scoreElem = document.getElementById('score');
  scoreElem.innerHTML = `🏆 ${score}`;
}

const startGame = (game, context) => {
  const { snake, fruits } = game;
  Fruit.fruitGenerator(fruits, context);

  const canvasSize = {mapW: 900, mapH: 550};
  game.snakeInterval = setInterval(snake.launch.bind(snake), 30, canvasSize, game);
  game.fruitInterval = setInterval(Fruit.checkFruitCollision, 30, fruits, snake, context);

  addEventListener('keydown', snake.directionControl.bind(snake));
}

const finishGame = (game) => {
  if(game.finished) return
  const { snakeInterval, fruitInterval } = game;
  clearInterval(snakeInterval);
  clearInterval(fruitInterval);
  game.finished = true;
  alert('Try again');
  window.location.reload(true);
}

window.onload = () => {
  const canvas = document.getElementById('map');
  const context = canvas.getContext('2d');

  const snake = new Game(100, 100, 0, Game.SNAKE_INITIAL_LENGTH, context);
  const game = {
    snake,
    fruits: [],
  };

  startGame(game, context);
} 
