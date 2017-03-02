var Campaign = Campaign || {};

Campaign.Enemy = function(game, x, y, health, key, scale, speedX, speedY, enemyBullets, shootFreq, bulletVelocity, enemyBullet, damageAmount) {
  Phaser.Sprite.call(this, game, x, y, key); //create a sprite using a variable key
  this.game = game;
  this.game.physics.arcade.enable(this);
  //this.outOfBoundsKill = true;
  this.checkWorldBounds = true;
  this.addEnemyEmitterTrail();
  this.animations.add('getHit', [0, 1, 2, 1, 0], 25, false);
  this.anchor.setTo(0.5);
  this.health = health;
  this.shootingFrequency = shootFreq;
  this.bulletVelocity = bulletVelocity;
  this.enemyBullet = enemyBullet;
  this.damageAmount = damageAmount;
  
  // Wave variables
  this.startingX = x;
  this.spread = 60;
  this.frequency = 70;
  
  this.enemyBullets = enemyBullets;
  // timer for shooting (you can have a parameter for this to allow different enemies to shoot at different frequencies)
  this.enemyTimer = this.game.time.create(false);
  
  this.reset(x, y, health, key, scale, speedX, speedY);
};

Campaign.Enemy.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
Campaign.Enemy.prototype.constructor = Campaign.Enemy; //note which method is the constructor

Campaign.Enemy.prototype.update = function() {
  
  // // if top of sprite is below the height
  if (this.top > this.game.world.height) {
    this.kill(); // allows you to reuse the sprite in the pool
  }
  //console.log('not a wave of enemies');
  this.angle = 180 - this.game.math.radToDeg(Math.atan2(this.body.velocity.x, this.body.velocity.y));
  
  this.trail.x = this.x;
  this.trail.y = this.y - 10;
  
};

Campaign.Enemy.prototype.scheduleShooting = function(freq, bulletVelocity, enemyBullet) {
  // enemy shooting AI on a timer
  if (!freq){
    freq = this.shootingFrequency;
  }
  if (!bulletVelocity){
    bulletVelocity = this.bulletVelocity;
  }
  this.shoot(bulletVelocity, enemyBullet);
  this.enemyTimer.add(Phaser.Timer.SECOND * freq, this.scheduleShooting, this);
};

Campaign.Enemy.prototype.shoot = function(bulletVelocity, enemyBullet) {
  //pool of objects
  var bullet = this.enemyBullets.getFirstExists(false);
  if (!bullet){
    bullet = new Campaign.EnemyBullet(this.game, this.x, this.bottom, enemyBullet, this.damageAmount);
    this.enemyBullets.add(bullet);
  } else {
    bullet.reset(this.x, this.y);
  }
  bullet.body.velocity.y = bulletVelocity;
};

Campaign.Enemy.prototype.damage = function(amount) {
  // call the parent function first before extending damage method
  Phaser.Sprite.prototype.damage.call(this, amount);
  // play animation
  this.play('getHit');
  
  // on kill, particle explosion
  if (this.health <= 0) {
    var emitter = this.game.add.emitter(this.x, this.y, 50);
    emitter.makeParticles('enemyParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 500, null, 100);
    this.trail.kill();
    
    this.enemyTimer.stop(); //stops bullet creation when the enemy dies
  }
};

Campaign.Enemy.prototype.reset = function(x, y, health, key, scale, speedX, speedY) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);
  this.loadTexture(key); // changes sprite
  this.scale.setTo(scale);
  /* Fix body size: http://www.html5gamedevs.com/topic/13932-problem-with-arcade-bodysetsize/  */
  this.body.setSize(this.width / this.scale.x, this.height / this.scale.y);
  this.body.velocity.x = speedX;
  this.body.velocity.y = speedY;
  this.trail.start(false, 800, 1);
  //console.log(speedY);
  this.scheduleShooting(this.shootingFrequency, this.bulletVelocity, this.enemyBullet);
  
  this.enemyTimer.start();
};

Campaign.Enemy.prototype.addEnemyEmitterTrail = function () {
  var enemyTrail = this.game.add.emitter(this.x, this.y - 10, 100);
  enemyTrail.width = 10;
  enemyTrail.makeParticles('explosion', [1,2,3,4,5]);
  enemyTrail.setXSpeed(20, -20);
  enemyTrail.setRotation(50,-50);
  enemyTrail.setAlpha(0.4, 0, 800);
  enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
  this.trail = enemyTrail;
}