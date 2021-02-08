ns('bbq.sounds.config');

bbq.sounds.config.effects = {
    list: [
        'buttonClick.mp3',
        'unitDeath.mp3',
        'unitHit.mp3',
        'unitSelect.mp3',
        'unitWalk.mp3',
        'weaponHit.mp3',
        'weaponWindup.mp3'
    ],

    // paths
    default_: 'assets/sounds/effects/default/',
    SpearWarrior: 'assets/sounds/effects/SpearWarrior/',
    DartBlower: 'assets/sounds/effects/DartBlower/',
    Enforcer: 'assets/sounds/effects/Enforcer/',
    Harvester: 'assets/sounds/effects/Harvester/',
    Catapult: 'assets/sounds/effects/Catapult/'    
};

bbq.sounds.config.ambience = {
    list: [
        '01.mp3',
        '02.mp3',
        '03.mp3',
        '04.mp3',
        '05.mp3'
    ],

    // paths
    default_: 'assets/sounds/ambience/default/',
    Forest : 'assets/sounds/ambience/forest/'    
};

bbq.sounds.config.music = {
    list: [
        '01.mp3', //required
        '02.mp3', //rest is optional
        '03.mp3',
        '04.mp3',
        '05.mp3'
    ],

    // paths
    default_: 'assets/sounds/music/default/', // must exist!
    Forest: 'assets/sounds/music/forest/' // this overwrites!
};