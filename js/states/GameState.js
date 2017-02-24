var Campaign = Campaign || {};

Campaign.GameState = {

  //initiate game settings
  init: function(currentLevel) {
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //Game constants
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;
    
    //level data
    this.numLevels = 3;
    this.currentLevel = currentLevel ? currentLevel : 1;
    console.log('current level:' + this.currentLevel)

  },
  //executed after everything is loaded
  create: function() {
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
    this.background.autoScroll(0, 30);
    
    // Player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true; //player sprite cannot leave the screen
    
    // initiate bullet pool
    this.initBullets();
    this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND/5, this.createPlayerBullet, this);
    
    // enemy
    this.initEnemies();
    
    // load levels
    this.loadLevel();
    
    this.orchestra = this.add.audio('orchestra');
    this.orchestra.play();
    
  },
  update: function() {
    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);
    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.damagePlayer, null, this);
    
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
  },
  initBullets: function() {
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
  },
  createPlayerBullet: function() {
    var bullet = this.playerBullets.getFirstExists(false);
    if (!bullet) {
      bullet = new Campaign.PlayerBullet(this.game, this.player.x, this.player.top);
      this.playerBullets.add(bullet);
    } else {
      // reset position
      bullet.reset(this.player.x, this.player.top);
    }
    
    // set velocity
    bullet.body.velocity.y = this.BULLET_SPEED;
  },
  initEnemies: function() {
    this.enemies = this.add.group();
//     this.enemies.enableBody = true;
    
    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;
    
  },
  damageEnemy: function(bullet, enemy) {
    enemy.damage(1);
    bullet.kill();
  },
  damagePlayer: function(){
    this.player.kill();
    this.orchestra.stop();
    this.game.state.start('Game', true, false, this.currentLevel);
  },
  createEnemy: function(x, y, health, key, scale, speedX, speedY, shootFreq, bulletVelocity){
  
    var enemy = this.enemies.getFirstExists(false);
   
    if (!enemy) {
      enemy = new Campaign.Enemy(this.game, x, y, health, key, this.enemyBullets, shootFreq, bulletVelocity);
      this.enemies.add(enemy);
    }
    
    enemy.reset(x, y, health, key, scale, speedX, speedY);
  },
  loadLevel: function() {
    
    this.currentEnemyIndex = 0;
    
    this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
    
    //end of level timer
    this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function() {
      console.log('level ended!');
      this.orchestra.stop();
      if (this.currentLevel < this.numLevels) {
        this.currentLevel++;
      } else {
        this.currentLevel = 1;
      }
      
      this.game.state.start('Game', true, false, this.currentLevel);
    }, this);
    
    this.scheduleNextEnemy();
    
  },
  
  scheduleNextEnemy: function() {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];
    //console.log(nextEnemy);
    if (nextEnemy) {
      var nextTime = 1000 * ( nextEnemy.time - (this.currentEnemyIndex === 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));
      
      this.nextEnemyTimer = this.game.time.events.add(nextTime, function() {
        var fixed = Math.random().toFixed(1);
        // fixed rounds to 1 decimal place
        // BUT: returns string!
        // to get it back to number format
        var x = parseFloat(fixed);
        this.createEnemy((x * this.game.world.width), -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY, nextEnemy.shootFreq, nextEnemy.bulletVelocity);
        
        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }

};