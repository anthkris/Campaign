var Campaign = Campaign || {};

Campaign.PlayerBullet = function(game, x, y, bullet) {
  Phaser.Sprite.call(this, game, x, y, bullet); // create a sprite using predefined key
  this.game = game;
  this.anchor.setTo(0.5);
  this.scale.setTo(0.3);
  
  //Check which sprites are dead
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
};

Campaign.PlayerBullet.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
Campaign.PlayerBullet.prototype.constructor = Campaign.PlayerBullet; //note which method is the constructor