var Campaign = Campaign || {};


/* Some Code uses the logic from this tutorial: 
http://codeperfectionist.com/articles/phaser-js-tutorial-building-a-polished-space-shooter-game-part-1/  */

Campaign.GameState = {

  //initiate game settings
  init: function(currentLevel) {
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //Game constants
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;
    this.PLAYER_ACCLERATION = 600;
    this.PLAYER_DRAG = 400;
    this.PLAYER_MAXSPEED = 400;
    
    //level data
    // this.numLevels = 3;
    // this.currentLevel = currentLevel ? currentLevel : 1;
    // console.log('current level:' + this.currentLevel);
    
    this.score = 4000;
    this.playerWeaponLevel = 1;
  },
  //executed after everything is loaded
  create: function() {
    /* SOUND AND MUSIC */
    if (!Campaign.game.technoMusic) {
      Campaign.game.technoMusic = this.game.add.audio('music');
    	Campaign.game.technoMusic.onDecoded.add(this.musicStart, this);
    	Campaign.game.technoMusic.loopFull();
    }
  	
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
    this.background.autoScroll(0, 30);
    
    // Player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 70, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.5);
    this.player.health = 50;
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true; //player sprite cannot leave the screen
    this.player.body.maxVelocity.setTo(this.PLAYER_MAXSPEED, this.PLAYER_MAXSPEED);
    this.player.body.drag.setTo(this.PLAYER_DRAG, this.PLAYER_DRAG);
    
     //  Add an emitter for the ship's trail
    this.shipTrail = this.game.add.emitter(this.player.x, this.player.y + 15, 400);
    this.shipTrail.width = 10;
    this.shipTrail.makeParticles('playerParticle');
    this.shipTrail.setXSpeed(30, -30);
    this.shipTrail.setYSpeed(200, 180);
    this.shipTrail.setRotation(50,-50);
    this.shipTrail.setAlpha(1, 0.01, 800);
    this.shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    this.shipTrail.start(false, 5000, 10);
    
    //  Big explosion
    this.playerDeath = this.game.add.emitter(this.player.x, this.player.y);
    this.playerDeath.width = 50;
    this.playerDeath.height = 50;
    this.playerDeath.makeParticles('explosion', [0,1,2,3,4,5], 10);
    this.playerDeath.setAlpha(0.9, 0, 800);
    this.playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);
    
    // initiate bullet pool
    this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND/5, this.createPlayerBullet, this);
    this.bulletTimer = 0;

    this.tabletEnemies = this.add.group();
    this.laptopEnemies = this.add.group();
    
    this.tabletEnemyBullets = this.add.group();
    this.tabletEnemyBullets.enableBody = true;
    this.laptopEnemyBullets = this.add.group();
    this.laptopEnemyBullets.enableBody = true;
    
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
    this.playerBullets.createMultiple(30, 'bulletLvl2');
    this.playerBullets.setAll('outOfBoundsKill', true);
    this.playerBullets.setAll('checkWorldBounds', true);
    
    this.tabletEnemyLaunchTimer;
    this.tabletEnemySpacing = 1000;
    this.laptopEnemyLaunchTimer;
    this.laptopEnemyLaunched = false;
    
    
    //  Score and shields
    var style = {font: '14px Arial', fill: '#ffffff'};
    this.scoreText = this.game.add.text(10, 10, style);
    this.shieldsText = this.game.add.text(this.game.world.width - 250, 10, style)
    this.updateGUI(this.score, this.scoreText, this.shieldsText, this.player.health);
    
    // load levels
    this.loadLevel();
    
  },
  update: function() {
    console.log(this.player.health);
    this.game.physics.arcade.overlap(this.playerBullets, this.tabletEnemies, this.damageEnemy, null, this);
    this.game.physics.arcade.overlap(this.player, this.tabletEnemies, this.shipCollide, null, this);
    this.game.physics.arcade.overlap(this.playerBullets, this.laptopEnemies, this.damageEnemy, null, this);
    this.game.physics.arcade.overlap(this.player, this.laptopEnemies, this.shipCollide, null, this);
    
    this.game.physics.arcade.overlap(this.tabletEnemyBullets, this.player, this.damagePlayer, null, this);
    this.game.physics.arcade.overlap(this.laptopEnemyBullets, this.player, this.damagePlayer, null, this);
    
    this.player.body.velocity.x = 0;
    // check that user is touching down
    if (this.game.input.activePointer.isDown) {
      var targetX = this.game.input.activePointer.position.x;
      // check which side is being touched and set direction variable accordingly
      var direction = targetX >= this.game.world.centerX ? 1: -1;
      this.player.body.velocity.x = direction * this.PLAYER_SPEED; 
    }
    
    if (this.cursors.left.isDown) {
      var direction =  -1;
      this.player.body.velocity.x = direction * this.PLAYER_SPEED; 
    }
    
    if (this.cursors.right.isDown) {
      var direction =  1;
      this.player.body.velocity.x = direction * this.PLAYER_SPEED; 
    }
    
    //  Squish and rotate ship for illusion of "banking"
    var bank = this.player.body.velocity.x / this.PLAYER_MAXSPEED;
    this.player.angle = bank * 30;

    //  Keep the shipTrail lined up with the ship
    this.shipTrail.x = this.player.x;
  },
  createPlayerBullet: function() {
    var bullet = this.playerBullets.getFirstExists(false);
    //  Make bullet come out of tip of ship with correct angle
    var bulletOffset = 20 * Math.sin(this.game.math.degToRad(this.player.angle));
      
      if (this.playerWeaponLevel === 1) {
         
        if (bullet) {
          // set velocity
          bullet.body.velocity.y = this.BULLET_SPEED;
          bullet.anchor.setTo(0.5);
          bullet.scale.setTo(0.4);
          bullet.reset(this.player.x + bulletOffset, this.player.top);
          bullet.angle = this.player.angle;
          this.game.physics.arcade.velocityFromAngle(bullet.angle + 90, this.BULLET_SPEED, bullet.body.velocity);
          bullet.body.velocity.x += this.player.body.velocity.x;
        }
      } else if (this.playerWeaponLevel === 2) {
        if (this.game.time.now > this.bulletTimer) {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 550;


            for (var i = 0; i < 3; i++) {
                var bullet = this.playerBullets.getFirstExists(false);
                if (bullet) {
                    //  Make bullet come out of tip of ship with right angle
                    var bulletOffset = 20 * Math.sin(this.game.math.degToRad(this.player.angle));
                    bullet.reset(this.player.x + bulletOffset, this.player.top);
                    bullet.anchor.setTo(0.5);
                    bullet.scale.setTo(0.4);
                    //  "Spread" angle of 1st and 3rd bullets
                    var spreadAngle;
                    if (i === 0) spreadAngle = -20;
                    if (i === 1) spreadAngle = 0;
                    if (i === 2) spreadAngle = 20;
                    bullet.angle = this.player.angle + spreadAngle;
                    this.game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                    bullet.body.velocity.x += this.player.body.velocity.x;
                }
                this.bulletTimer = this.game.time.now + BULLET_SPACING;
            }
        }
      }
  },
  damageEnemy: function(bullet, enemy) {
    // if(enemy.key === "laptop") {
    //   console.log(enemy);
    // }
    enemy.damage(1);
    bullet.kill();
    if (enemy.health <= 0) {
      // Increase score
      this.score += enemy.damageAmount * 10;
      this.updateGUI(this.score, this.scoreText, this.shieldsText, this.player.health);
    }
    
    //  Pacing
    //  Enemies come quicker as score increases
    this.tabletEnemySpacing *= 0.9;
    //  Laptop enemies come in after a score of 1000
    if (!this.laptopEnemyLaunched && this.score > 1000) {
      this.laptopEnemyLaunched = true;
      this.launchLaptopEnemy();
      //  Slow tablet enemies down now that there are other enemies
      this.tabletEnemySpacing *= 2;
    }
    
    //  Weapon upgrade
    if (this.score > 4000 && this.playerWeaponLevel < 2) {
      this.playerWeaponLevel = 2;
    }
  },
  shipCollide: function(player, enemy) {
    enemy.damage(10);
    player.damage(enemy.damageAmount);
    this.updateGUI(this.score, this.scoreText, this.shieldsText, player.health);
    if (player.health <= 0) {
      this.shipTrail.kill();
      this.shootingTimer.timer.stop();
      this.playerDeath.x = player.x;
      this.playerDeath.y = player.y;
      this.playerDeath.start(false, 1000, 10, 10);
    }
  },
  damagePlayer: function(player, enemyBullet) {
    enemyBullet.kill();
    player.damage(enemyBullet.damageAmount);
    this.updateGUI(this.score, this.scoreText, this.shieldsText, player.health);
    if (player.health <= 0) {
      this.shipTrail.kill();
      this.shootingTimer.timer.stop();
      this.playerDeath.x = player.x;
      this.playerDeath.y = player.y;
      this.playerDeath.start(false, 1000, 10, 10);
      //this.game.state.start('Game', true, false, this.currentLevel);
    }
  },
  loadLevel: function() {
    
    this.launchTabletEnemy();
    
  },
  
  launchTabletEnemy: function() {
    
    var TABLET_ENEMY_SPEED_Y = 300;
    var TABLET_ENEMY_SPEED_X = this.game.rnd.integerInRange(-300, 300);
    var TABLET_ENEMY_HEALTH = 1;
    var TABLET_ENEMY_SHOOT_FREQ = 3;
    var TABLET_ENEMY_BULLET_VELOCITY = 600;
    var TABLET_ENEMY_BULLET = 'uneaseBullet';

    var enemy = this.tabletEnemies.getFirstExists(false);
    
    if (!enemy) {
      enemy = new Campaign.Enemy(this.game, this.game.rnd.integerInRange(0, this.game.width), -20,  TABLET_ENEMY_HEALTH, 'tablet', 0.5, TABLET_ENEMY_SPEED_X, TABLET_ENEMY_SPEED_Y, this.tabletEnemyBullets, TABLET_ENEMY_SHOOT_FREQ, TABLET_ENEMY_BULLET_VELOCITY, TABLET_ENEMY_BULLET, 10);
      this.tabletEnemies.add(enemy);
    } else {
      enemy.reset(this.game.rnd.integerInRange(0, this.game.width), -20, TABLET_ENEMY_HEALTH, 'tablet', 0.5, TABLET_ENEMY_SPEED_X, TABLET_ENEMY_SPEED_Y);
    }

    //  Send another enemy soon
   this.tabletEnemyLaunchTimer = this.game.time.events.add(this.game.rnd.integerInRange(this.tabletEnemySpacing, this.tabletEnemySpacing + 1000), this.launchTabletEnemy, this);
  },
  launchLaptopEnemy: function() {
    var startingX = this.game.rnd.integerInRange(100, this.game.width - 100);
    var verticalSpacing = -150;
    var spread = 60;
    var frequency = 70;
    var numEnemiesInWave = 5;
    var timeBetweenWaves = 7000;
    var LAPTOP_ENEMY_SPEED_Y = 180;
    var LAPTOP_ENEMY_SPEED_X = this.game.rnd.integerInRange(-200, 200);
    var LAPTOP_ENEMY_HEALTH = 2;
    var LAPTOP_ENEMY_SHOOT_FREQ = 1;
    var LAPTOP_ENEMY_BULLET_VELOCITY = 600;
    var LAPTOP_ENEMY_BULLET = 'hurtBullet';

    //  Launch wave
    for (var i = 0; i < numEnemiesInWave; i++) {
        var enemy = this.laptopEnemies.getFirstExists(false);
        if (!enemy) {
          enemy = new Campaign.Enemy(this.game, startingX, verticalSpacing * i,  LAPTOP_ENEMY_HEALTH, 'laptop', 0.4, LAPTOP_ENEMY_SPEED_X, LAPTOP_ENEMY_SPEED_Y, this.laptopEnemyBullets, LAPTOP_ENEMY_SHOOT_FREQ, LAPTOP_ENEMY_BULLET_VELOCITY, LAPTOP_ENEMY_BULLET, 30);
          this.laptopEnemies.add(enemy);
        } else {
            enemy.reset(startingX, verticalSpacing * i, LAPTOP_ENEMY_HEALTH, 'laptop', 0.4, LAPTOP_ENEMY_SPEED_X, LAPTOP_ENEMY_SPEED_Y);
        }
        //  Update function for each enemy
        enemy.update = function() {
          this.body.x = startingX + Math.sin((this.y) / frequency) * spread;
          this.trail.x = this.x;
          this.trail.y = this.y - 30;
        }
    }

    //  Send another wave soon
    this.laptopLaunchTimer = this.game.time.events.add(this.game.rnd.integerInRange(timeBetweenWaves, timeBetweenWaves + 4000), this.launchLaptopEnemy, this);
  },
  musicStart: function() {
    Campaign.game.technoMusic.fadeIn(2000);
  },
  render: function() {
    this.tabletEnemies.forEachAlive(function(enemy){
      //this.game.debug.body(enemy);
    }, this);
    
  },
  updateGUI: function(score, scoreText, shieldText, playerHealth) {
    console.log(playerHealth);
    scoreText.text = 'Followers: ' + score;
    shieldText.text = 'Hater Shields: ' + Math.max(playerHealth, 0) + '%';
  }

};