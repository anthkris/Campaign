var Campaign = Campaign || {};

Campaign.EnemyBullet = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'enemyBullet'); // create a sprite using predefined key
  
  this.anchor.setTo(0.5);
  this.scale.setTo(0.3);
  
  //Check which sprites are dead
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
};

Campaign.EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
Campaign.EnemyBullet.prototype.constructor = Campaign.EnemyBullet; //note which method is the constructor