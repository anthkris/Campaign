var Campaign = Campaign || {};

Campaign.Enemy = function(game, x, y, health, key, enemyBullets, shootFreq, bulletVelocity) {
  Phaser.Sprite.call(this, game, x, y, key); //create a sprite using a variable key
  this.game = game;
  this.game.physics.arcade.enable(this);
  
  this.animations.add('getHit', [0, 1, 2, 1, 0], 25, false);
  this.anchor.setTo(0.5);
  this.health = health;
  this.shootingFrequency = shootFreq;
  this.bulletVelocity = bulletVelocity;
  
  
  this.enemyBullets = enemyBullets;
  // timer for shooting (you can have a parameter for this to allow different enemies to shoot at different frequencies)
  this.enemyTimer = this.game.time.create(false);
  this.enemyTimer.start();
  
  this.scheduleShooting(this.shootingFrequency, this.bulletVelocity);
};

Campaign.Enemy.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
Campaign.Enemy.prototype.constructor = Campaign.Enemy; //note which method is the constructor

Campaign.Enemy.prototype.update = function() {
  // check if the position is within 5% of the width
  // using percentages for responsiveness to different resolutions
  if (this.x < (0.05 * this.game.world.width)) {
    // if so, push it out a bit and change direction
    this.x = (0.05 * this.game.world.width) + 2;
    this.body.velocity.x *= -1;
  } else if (this.x > (0.95 * this.game.world.width)){
    this.x = (0.95 * this.game.world.width) - 2;
    this.body.velocity.x *= -1;
  }
  
  // if top of sprite is below the height
  if (this.top > this.game.world.height) {
    this.kill(); // allows you to reuse the sprite in the pool
  }
};

Campaign.Enemy.prototype.scheduleShooting = function(freq, bulletVelocity) {
  // enemy shooting AI on a timer
  if (!freq){
    freq = this.shootingFrequency;
  }
  if (!bulletVelocity){
    bulletVelocity = this.bulletVelocity;
  }
  this.shoot(bulletVelocity);
  this.enemyTimer.add(Phaser.Timer.SECOND * freq, this.scheduleShooting, this);
};

Campaign.Enemy.prototype.shoot = function(bulletVelocity) {
  //pool of objects
  var bullet = this.enemyBullets.getFirstExists(false);
  if (!bullet){
    bullet = new Campaign.EnemyBullet(this.game, this.x, this.bottom);
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
    var emitter = this.game.add.emitter(this.x, this.y, 100);
    emitter.makeParticles('enemyParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 500, null, 100);
    
    this.enemyTimer.pause(); //stops bullet creation when the enemy dies
  }
};

Campaign.Enemy.prototype.reset = function(x, y, health, key, scale, speedX, speedY) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);
  
  this.loadTexture(key); // changes sprite
  this.scale.setTo(scale);
  this.body.velocity.x = speedX;
  this.body.velocity.y = speedY;
  //console.log(speedY);
  
  
  this.enemyTimer.resume();
}