var bbq = bbq || {};
bbq.assets = bbq.assets || {};

/*
// safari sucks.
if (true||navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf('Android') == -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.indexOf("Nintendo") >= 0) {
    //alert('sound not supported!');
    bbq.assets.sounds = [];
}
else {
*/

bbq.assets.sound_extension =
    navigator.userAgent.indexOf('Firefox') === -1 ? '.m4a' : '.ogg';

bbq.assets.sounds = [
    // music
    'assets/sounds/music/forest',
    'assets/sounds/music/menu',

    // ambience


    // effects
    'assets/sounds/effects/buttonClick',
    'assets/sounds/effects/defeat',
    'assets/sounds/effects/victory',
    'assets/sounds/effects/default/unitGather',
    'assets/sounds/effects/default/unitTrain',
    'assets/sounds/effects/default/unitCollide',
    'assets/sounds/effects/default/unitDeath',
    'assets/sounds/effects/default/unitHit',
    'assets/sounds/effects/default/unitSelect',
    'assets/sounds/effects/default/unitWalk',
    'assets/sounds/effects/default/weaponHit',
    'assets/sounds/effects/default/weaponWindup'
];

for (var i = 0; i < bbq.assets.sounds.length; i++) {
    bbq.assets.sounds[i] += bbq.assets.sound_extension;
}

//}
