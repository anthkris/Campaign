var Campaign = Campaign || {};

//loading the game assets
Campaign.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets    
    this.load.image('space', 'assets/images/interwebsBG2.png');    
    this.load.image('player', 'assets/images/phone.png');    
    this.load.image('bulletLvl1', 'assets/images/heartAttackLvl1.png');
    this.load.image('bulletLvl2', 'assets/images/heartAttack.png');
    this.load.image('hurtBullet', 'assets/images/hurtYou.png');
    this.load.image('uneaseBullet', 'assets/images/unease.png');
    this.load.image('enemyParticle', 'assets/images/enemyExplosion.png');
    this.load.image('playerParticle', 'assets/images/explodeParticle.png');
    this.load.spritesheet('desktop', 'assets/images/desktopSprite.png', 583, 189, 3, 1, 1);   
    this.load.spritesheet('laptop', 'assets/images/laptopSprite.png', 417, 229, 3, 1, 1);   
    this.load.spritesheet('tablet', 'assets/images/tabletSprite.png', 103, 143, 3, 1, 1);
    this.load.spritesheet('explosion', 'assets/images/explosion.png', 102, 95, 6, 1, 1); 
    
    //load level data
    this.load.text('level1', 'assets/data/level1.json');
    this.load.text('level2', 'assets/data/level2.json');
    this.load.text('level3', 'assets/data/level3.json');
    
    //load audio
    this.load.audio('music', ['assets/audio/GasolineRainbows.mp3', 'assets/audio/GasolineRainbows.ogg']);

  },
  create: function() {
    this.state.start('Game');
  }
};