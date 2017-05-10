var game;
var cars = [];
var carColors = [0xff0000, 0x0000ff];
var carTurnSpeed = 250;
var carGroup;
var obstacleGroup;
var targetGroup;
var obstacleSpeed = 150;
var obstacleDelay = 1400;
var overMessage;
var secondsElapsed;
var timer;
var counter = 0;
var highscore = 0;
var text;

window.onload = function() {	
    game = new Phaser.Game(320, 480, Phaser.AUTO, "");
    //adding the different game states 
    game.state.add("PlayGame",playGame);
    game.state.start("PlayGame");
    game.state.add("Boot", boot);
    game.state.add("Preload", preload); 
    game.state.add("TitleScreen", titleScreen);
    game.state.add("GameOverScreen", gameOverScreen);
    //kickstart the game with the Boot stae
    game.state.start("Boot");
}


// the boot state is an object with a prototype method and it accepts the game object as an argument
var boot = function(game){};
boot.prototype = {
    //preload function runs before the create function
    preload: function(){
         console.log("==boot state. Preload method");
        //preloading an asset that will be a preloading bar
         this.game.load.image("loading","asset/sprites/loading.png"); 
    },
    //create function sets up how the gamescreen is positioned
    create: function(){
         console.log("==boot state. Create method");
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        //keeps original aspect ratio while maximising size in browser window
         game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //triggering the next state
        this.game.state.start("Preload");
    }      
};

//preload state
var preload = function(game){};
preload.prototype = {
    preload: function(){
        console.log("==preload Screen state. Preload method");
          //preloading all assets that will be used in the game         
          game.load.bitmapFont("font", "asset/fonts/font.png", "asset/fonts/font.fnt");
          game.load.image("road", "asset/sprites/road.png");
          game.load.image("target", "asset/sprites/target.png");
          game.load.image("car", "asset/sprites/car.png");
          game.load.image("obstacle", "asset/sprites/obstacle.png");
          game.load.image("title", "asset/sprites/title.png");
          game.load.image("title2", "asset/sprites/title2.png");
          game.load.image("playbutton", "asset/sprites/playbutton.png");
          game.load.image("gameover", "asset/sprites/gameover.png");
          game.load.image("playagain", "asset/sprites/playagain.png");
          game.load.image("instructions", "asset/sprites/instructions.png");
          game.load.image("score", "asset/sprites/score.png");
          game.load.image("highscore", "asset/sprites/highscore.png");
          game.load.audio('theme', 'asset/sounds/theme.wav');
          game.load.audio('collect', 'asset/sounds/collect.wav');
          game.load.audio('die', 'asset/sounds/die.wav');
          game.load.audio('start', 'asset/sounds/Deep-Purple-Highway-Star-8bit.mp3');
          game.load.audio('sad', 'asset/sounds/crying.mp3');	        
    },
    create: function(){
         console.log("==preload Screen state. Create method");
         //Starts the title screen
        this.game.state.start("TitleScreen");
    }
};

var titleScreen = function(game){};
titleScreen.prototype = {  
     create: function(){  
         console.log("==title Screen state. Create method");
         start = game.add.audio('start');
         start.play();
         //Set BG colour and add title image
          game.stage.setBackgroundColor(0xA46BDD);
          var title = game.add.image(game.width / 2, 120, "title2");
          title.anchor.set(0.5);
          //Add play button
          var playbutton = game.add.button(game.width / 2, game.height - 150, "playbutton", this.startGame);
          playbutton.anchor.set(0.5);
          //Add instructions image
          var instructions = game.add.image(16, 420, "instructions");
          title.anchor.set(0.5);

         //adding a tween to the button
          var tween = game.add.tween(playbutton).to({
               width: 160,
               height:160
          }, 1500, "Linear", true, 0, -1); 
          tween.yoyo(true);
     },
     //will be triggered by button interaction
     startGame: function(){
         console.log("==title Screen state. startGame method");
         game.state.start("PlayGame"); 
     }
};

var playGame = function(game){};
    playGame.prototype = {
        create: function(){
              console.log("==playGame state. Create method");
              start.stop();
              //Add music and sounds to the playGame state
              theme = game.add.audio('theme');
              collect = game.add.audio('collect');
              die = game.add.audio('die');
              theme.play();
              //Set score counter
              counter = 0;
              //add road and score text to the screen
              game.add.image(0, 0, "road");
              text = game.add.text(5, 460, "score: 0", {fontSize: "16px", fill: "#AAAAAA" });
              game.physics.startSystem(Phaser.Physics.ARCADE);
              //add cars, obstacles and targets to the screen
              carGroup = game.add.group();
              obstacleGroup = game.add.group();
              targetGroup = game.add.group();
              for(var i = 0; i < 2; i++){
                   //creates position, colour and movement of cars
                   cars[i] = game.add.sprite(0, game.height - 80, "car");
                   cars[i].positions = [game.width * (i * 4 + 1) / 8, game.width * (i * 4 + 3) / 8];
                   cars[i].anchor.set(0.5);
                   cars[i].tint = carColors[i];  
                   cars[i].canMove = true;
                   cars[i].side = i;
                   cars[i].x = cars[i].positions[cars[i].side];
                   game.physics.enable(cars[i], Phaser.Physics.ARCADE); 
                   cars[i].body.allowRotation = false;
                   cars[i].body.moves = false;  
                   carGroup.add(cars[i]);
              }
              //calls moveCar function when player presses
              game.input.onDown.add(moveCar);
              game.time.events.loop(obstacleDelay, function(){
                   //loop for adding targets and obstacles
                   for(var i = 0; i < 2; i++){
                        if(game.rnd.between(0, 1) == 1){
                             var obstacle = new Obstacle(game, i);
                             game.add.existing(obstacle);
                             obstacleGroup.add(obstacle);  
                        }
                        else{
                             var target = new Target(game, i);
                             game.add.existing(target);
                             targetGroup.add(target);        
                        }
                   }
              });			
},

//update fuction adds collision detection for targets and obstacles
 update: function(){
      game.physics.arcade.collide(carGroup, obstacleGroup, function(){
        //when car collides with obstacle group playGame function is killed and GameOver state is started
           die.play();
           game.state.start("GameOverScreen");  
      });
      game.physics.arcade.collide(carGroup, targetGroup, function(c, t){
        //when car collides with target target is destroyed and 'collect' audio is played
           t.destroy();
           collect.play();
           //score counter is incremented by 10 and diplayed
           counter += 10;
           text.text = 'Score: ' + counter;
           //if score count is larger than highscore and larger than zero highscore is set to the score count
           if(counter > highscore && counter != 0) { 
            highscore = counter;
            }
            else if(counter <= highscore && counter != 0) { 
            highscore = highscore;
            }
      });
 }
}

function moveCar(e){
    //function for moving cars
    //carToMove is equation used for move tween and steer tween
     var carToMove = Math.floor(e.position.x / (game.width / 2));
     if(cars[carToMove].canMove){
          cars[carToMove].canMove = false;
          //add tween to animate steering effect
          //moves car from car to move to new angle
          var steerTween = game.add.tween(cars[carToMove]).to({
               angle: 20 - 40 * cars[carToMove].side
          }, carTurnSpeed / 2, Phaser.Easing.Linear.None, true);
          steerTween.onComplete.add(function(){
               var steerTween = game.add.tween(cars[carToMove]).to({
                    angle: 0
               }, carTurnSpeed / 2, Phaser.Easing.Linear.None, true);
          })
          cars[carToMove].side = 1 - cars[carToMove].side;
          var moveTween = game.add.tween(cars[carToMove]).to({ 
               x: cars[carToMove].positions[cars[carToMove].side],
          }, carTurnSpeed, Phaser.Easing.Linear.None, true);
          moveTween.onComplete.add(function(){
               cars[carToMove].canMove = true;
          })
     }
}

Obstacle = function (game, lane) {
    //random positioning of obstacles
    var position = game.rnd.between(0, 1) + 2 * lane;
    Phaser.Sprite.call(this, game, game.width * (position * 2 + 1) / 8, -20, "obstacle");
    //enable physics on obstacles
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    // add colour
    this.tint = carColors[Math.floor(position / 2)];
};

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.update = function() {
    //adding a speed to the obstacles
    this.body.velocity.y = obstacleSpeed;
    //if obstacle moves off screen it is destroyed
    if(this.y > game.height){
        this.destroy();
    }
};

Target = function (game, lane) {
    //random position
    var position = game.rnd.between(0, 1) + 2 * lane;
    Phaser.Sprite.call(this, game, game.width * (position * 2 + 1) / 8, -20, "target");
    //enable physics on targets
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    //adding colour
    this.tint = carColors[Math.floor(position / 2)];
};

Target.prototype = Object.create(Phaser.Sprite.prototype);
Target.prototype.constructor = Target;

Target.prototype.update = function() {
    //adding speed to target
    this.body.velocity.y = obstacleSpeed;
    if(this.y > game.height - this.height / 2){
        // if target moves past bottom of screen GameOverScreen state is called
        game.state.start("GameOverScreen");   
    }
};

var gameOverScreen = function(game) {}
    gameOverScreen.prototype = {
        create: function() {
            console.log("==gameOverScreen state. Create method");
            //theme music is stopped
            theme.stop();

            game.stage.setBackgroundColor(0x2d2d2d);
            //add gameover image
              var title = game.add.image(game.width / 2, 50, "gameover");
              title.anchor.set(0.5);
              //add score image
              var score = game.add.image(game.world.centerX / 2 + 20, 100, "score");
              title.anchor.set(0.5);
              //add highscore image
              var highscoreImage = game.add.image(10, 150, "highscore");
              title.anchor.set(0.5);
              //add score count beside score image
              text = game.add.text(220, 97, "score: 0", {fontSize: "32px", fill: "#AAAAAA" });
              text.text = counter;
              //add highscore beside highscore image
              text = game.add.text(220, 148, "score: 0", {fontSize: "32px", fill: "#AAAAAA" });
              text.text = highscore;
              //add button to play again
              var playbutton = game.add.button(game.width / 2, game.height - 150, "playagain", this.startGame);
              playbutton.anchor.set(0.5);
              //reset score count to zero
              counter = 0;
            },
                startGame: function(){
             console.log("==title Screen state. startGame method");
             game.state.start("PlayGame"); 
         }
        }
