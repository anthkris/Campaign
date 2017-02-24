var Campaign = Campaign || {};

//initiate the Phaser framework
Campaign.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

Campaign.game.state.add('Boot', Campaign.BootState);
Campaign.game.state.add('Preload', Campaign.PreloadState);
Campaign.game.state.add('Game', Campaign.GameState);

Campaign.game.state.start('Boot');    

