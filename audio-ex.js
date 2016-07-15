var Jtx = Jtx || {};

/**
 * Play music.
 * @param {String} url - The path of the music file without filename extension.
 * @param {Boolean} loop - Whether the music loop or not.
 * @example
 * //example
 * cc.audioEngine.playMusic(path, false);
 */
Jtx.playMusic = function(url, loop) {
  if (!this.__disableMusic && url) {
    cc.audioEngine.playMusic(url, loop);
  }
};

/**
 * Stop playing music.
 * @param {Boolean} [releaseData] If release the music data or not.As default value is false.
 * @example
 * //example
 * cc.audioEngine.stopMusic();
 */
Jtx.stopMusic = function(releaseData) {
  cc.audioEngine.stopMusic(releaseData);
};

Jtx.pauseMusic = function(){
  this.__disableMusic = true;
  cc.audioEngine.pauseMusic();
};

Jtx.resumeMusic = function(){
  this.__disableMusic = false;
  cc.audioEngine.resumeMusic();
};

/**
 * Play sound effect.
 * @param {String} url The path of the sound effect with filename extension.
 * @param {Boolean} loop Whether to loop the effect playing, default value is false
 * @return {Number|null} the audio id
 * @example
 * //example
 * var soundId = cc.audioEngine.playEffect(path);
 */
Jtx.playEffect = function(url, loop) {
  if (!this.__disableEffect && url) {
    cc.audioEngine.playEffect(url, loop);
  }
};

Jtx.stopAllEffects = function() {
  cc.audioEngine.stopAllEffects();
};

Jtx.enableMusic = function() {
  this.__disableMusic = false;
};

Jtx.disableMusic = function() {
  this.__disableMusic = true;
  cc.audioEngine.stopMusic();
};

Jtx.enableEffect = function() {
  this.__disableEffect = false;
};

Jtx.disableEffect = function() {
  this.__disableEffect = true;
  cc.audioEngine.stopAllEffects();
};