/// <reference path="components.js" />
/// <reference path="systems.js" />
/// <reference path="commands.js" />
/// <reference path="algorithms.js" />
/// <reference path="ui.js" />
/// <reference path="units.js" />
/// <reference path="../core/pfx.js" />
/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/systems.js" />
/// <reference path="../core/utils.js" />

if (!window.bbq) { window.bbq = {}; }
if (!bbq.ui) { bbq.ui = {}; }

bbq.ui.configuration = {
    ringPositions : [
	
		// one command
		[{ 	
		    offsetX: 0,
		    offsetY: -50,
		    anchorX: 0.5,
		    anchorY: 0.5
		}],
		
		// for two commands
		[{
		    offsetX: 0,
		    offsetY: -50,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: 50,
		    anchorX: 0.5,
		    anchorY: 0.5
		}],
		
		// for three commands
		[{
		    offsetX: -50,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: -50,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 50,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		}],
		
		// for four commands
		[{
		    offsetX: -50,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: -50,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 50,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: 50,
		    anchorX: 0.5,
		    anchorY: 0.5
		}],
		
		// for five commands
		[{
		    offsetX: -60,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: -40,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 60,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 60,
		    offsetY: -40,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
		{
		    offsetX: 0,
		    offsetY: 40,
		    anchorX: 0.5,
		    anchorY: 0.5
		}],
		
		// six commands!!
		[{
		    offsetX: -60,
		    offsetY: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
		},
        {
            offsetX: 0,
            offsetY: -40,
            anchorX: 0.5,
            anchorY: 0.5
        },
        {
            offsetX: 60,
            offsetY: 0,
            anchorX: 0.5,
            anchorY: 0.5
        },
        {
            offsetX: 60,
            offsetY: -40,
            anchorX: 0.5,
            anchorY: 0.5
        },
        {
            offsetX: 0,
            offsetY: 40,
            anchorX: 0.5,
            anchorY: 0.5
        },
        {
            offsetX: -60,
            offsetY: 40,
            anchorX: 0.5,
            anchorY: 0.5
        }
		]
    ]
};

// { entityManager, followCamera, context, x, y, text, textFillStyle }
bbq.ui.createButton = function (p) {
    var em = p.entityManager;
    if (!p.scale) { p.scale = 1.0; }
    //debugger;
    var ent = new boc.core.Entity({ entityManager: em, description: 'button' })
    var width = 50, height = 50;
    //if (p.text == 'Move' ) {
    //    width = 69;
    //    height = 24;
    //}
    ent.addComponent(
        new boc.components.Spatial({
            x: p.x,
            y: p.y,
            z: bbq.zindex.UI,
            width: width,
            height: height,
            scale : p.scale
        })
    );
    if (p.followCamera) {
        ent.addComponent(
            new boc.components.CameraFollow({
                camera: p.followCamera
            })
        );
    }
    var dsprite = new boc.components.DrawableSprite({
        //image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_command.png')
        image: //p.text == 'Move' ?
            //boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_command.png') :
            boc.resources.GraphicsManager.getImage('assets/graphics/' + p.text.toLowerCase() + 'Button.png')
    });
    dsprite.alpha = 1;
    ent.addComponent(dsprite);
    ent.addComponent(
        new boc.components.UIElement({
            onclick: p.onclick
        })
    );
    ent.addComponent(new boc.components.Identifiable({}));

    //if (p.text == 'Move' ) {
    //    var textEnt = new boc.core.Entity({ entityManager: em });
    //    var textOffset = { x: 0, y: 14 / p.scale };
    //    if (p.context) {
    //        p.context.save();
    //        p.font = 'bold 8pt Helvetica';
    //        var textMetric = p.context.measureText(p.text);
    //        textOffset.x = (ent.Spatial.width - textMetric.width) / 2;
    //        p.context.restore();
    //    }
    //    textEnt.addComponent(
    //        new boc.components.Spatial({
    //            x: p.x,
    //            y: p.y,
    //            z: bbq.zindex.UI + 1,
    //            width: 69,
    //            height: 24,
    //            scale: p.scale
    //        })
    //    );
    //    textEnt.addComponent(
    //        new boc.components.DrawableText({
    //            text: p.text,
    //            fillStyle: p.textFillStyle,
    //            font: 'bold 8pt Helvetica',
    //            offset: textOffset
    //        })
    //    );

    //    boc.utils.follow(ent.id(), textEnt.id(), em);
    //    ent.addListener('onKill', function () {
    //        textEnt.kill();
    //    });
    //}

    return ent.id();
}; //createButton

// { playerid, avatar, entityManager, followCamera, x,y }
bbq.ui.createAvatarOverlay = function (p) {
    if (!p.scale) { p.scale = 1.0; }
    var em = p.entityManager;

    var mainEntity = new boc.core.Entity({ description: 'avatarOverlay', entityManager: em });
    mainEntity.addComponent(
        new boc.components.Spatial({
            x: p.x,
            y: p.y,
            z: bbq.zindex.UI,
            width: 186,
            height: 56,
            scale: p.scale || 1.0
        })
    );
    if (p.followCamera) {
        mainEntity.addComponent(
            new boc.components.CameraFollow({
                camera: p.followCamera
            })
        );
    }
    mainEntity.addComponent(
        new boc.components.DrawableSprite({
            image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/avatar_overlay.png')
        })
    );

    mainEntity.addComponent(new boc.components.UIElement({})); // arm this later
    mainEntity.addComponent(new boc.components.Identifiable({}));
    mainEntity.addComponent(new bbq.components.PlayerStats(null));

    var upButton = new boc.core.Entity({ entityManager: em });
    var upButtonId = upButton.id();
    upButton.addComponent(
        new boc.components.Spatial({
            x: p.x + 168 * p.scale,
            y: p.y + 21 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 14,
            height: 14,
            scale : p.scale || 1.0
        })
    );
    upButton.addComponent(
       new boc.components.DrawableSprite({
           image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_up.png')
       })
    );
    boc.utils.follow(mainEntity.id(), upButton.id(), em);

    var downButton = new boc.core.Entity({ entityManager: em });
    var downButtonId = downButton.id();
    downButton.addComponent(
        new boc.components.Spatial({
            x: p.x + 168 * p.scale,
            y: p.y + 21 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 14,
            height: 14,
            scale: p.scale || 1.0
        })
    );
    downButton.addComponent(
       new boc.components.DrawableSprite({
           image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_down.png')
       })
    );
    downButton.DrawableSprite.visible = false;
    boc.utils.follow(mainEntity.id(), downButton.id(), em);

    var player = boc.utils.getPlayer(p.playerid, em);

    var nameTextEnt = new boc.core.Entity({ entityManager: em });
    nameTextEnt.addComponent(
        new boc.components.Spatial({
            x: p.x + 64 * p.scale,
            y: p.y + 14 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 120,
            height: 14,
            scale: p.scale || 1.0
        })
    );
    nameTextEnt.addComponent(
        new boc.components.DrawableText({
            text: p.playerid,
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    
    boc.utils.follow(mainEntity.id(), nameTextEnt.id(), em);

    // i don't wanna keep a reference to this entity outside the scope of this function
    var foodTextEnt = new boc.core.Entity({ entityManager: em });
    foodTextEnt.addComponent(
        new boc.components.Spatial({
            x: p.x + 84 * p.scale,
            y: p.y + 31 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 34,
            height: 17,
            scale: p.scale || 1.0
        })
    );
    foodTextEnt.addComponent(
        new boc.components.DrawableText({
            text: player.food,
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );

    var foodTextId = foodTextEnt.id();

    // i don't have to worry about disarming this; it only occurs once every new game
    var allPlayers = $em('Player').all();
    for (var i = 0; i < allPlayers.length; i++) {
        (function (pl) {
            $em(pl).comp('Player').addListener('onFoodChange', function (evArg) {
                var nameDrawable = em.getComponentForEntity('DrawableText', foodTextId);
                nameDrawable.text = evArg.newFood;
            });
        })(allPlayers[i])
    }    

    boc.utils.follow(mainEntity.id(), foodTextEnt.id(), em);

    // i don't wanna keep a reference to this entity outside the scope of this function
    var turnTextEnt = new boc.core.Entity({ entityManager: em });
    turnTextEnt.addComponent(
        new boc.components.Spatial({
            x: p.x + 140 * p.scale,
            y: p.y + 31 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 34,
            height: 17,
            scale: p.scale || 1.0
        })
    );
    turnTextEnt.addComponent(
        new boc.components.DrawableText({
            text: player.turn,
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );

    var turnTextId = turnTextEnt.id();
    var nameTextId = nameTextEnt.id();
    //player.addListener('onTurnChange', function (evArg) {
    //    var turnDrawable = em.getComponentForEntity('DrawableText', turnTextId);
    //    turnDrawable.text = evArg.newTurn;
    //});

    boc.utils.follow(mainEntity.id(), turnTextEnt.id(), em);

    var hidden = false;
    mainEntity.UIElement.onclick = function (eventArgs) {
        if (hidden) { // show
            if (mainEntity.Animation) {
                mainEntity.removeComponent('Animation');
            }
            mainEntity.addComponent(
                new boc.components.Animation({
                    entity: mainEntity.id(),
                    duration: 150,
                    state: boc.constants.ANIMATION_PLAYING,
                    componentName: 'Spatial',
                    propertyDeltas: { x: 55 * p.scale, y: 18 * p.scale }
                })
            );
            em.getComponentForEntity('DrawableSprite', upButtonId).visible = true;
            em.getComponentForEntity('DrawableSprite', downButtonId).visible = false;
            hidden = false;
        }
        else { // hide
            if (mainEntity.Animation) {
                mainEntity.removeComponent('Animation');
            }
            mainEntity.addComponent(
                new boc.components.Animation({
                    entity: mainEntity.id(),
                    duration: 150,
                    state: boc.constants.ANIMATION_PLAYING,
                    componentName: 'Spatial',
                    propertyDeltas: { x: -55 * p.scale, y: -18 * p.scale }
                })
            );
            em.getComponentForEntity('DrawableSprite', upButtonId).visible = false;
            em.getComponentForEntity('DrawableSprite', downButtonId).visible = true;
            hidden = true;
        }
    };

    //var turnEnt = em.getAllEntitiesWithComponent('Turn')[0];
    //em.getComponentForEntity('Turn', turnEnt).addListener('onchange', function (param) {
    //    em.getComponentForEntity('DrawableText', nameTextId).text = param.newPlayerId;
    //});

    mainEntity.PlayerStats.addListener('onTargetChange', function (eventArgs) {
        em.getComponentForEntity('DrawableText', nameTextId).text = eventArgs.newTarget.id;
        em.getComponentForEntity('DrawableText', turnTextId).text = eventArgs.newTarget.turn;
        $em(foodTextId).comp('DrawableText').text = eventArgs.newTarget.food;
    });

    return mainEntity.id();
}; //createAvatarOverlay 

// { entityManager, x, y, followCamera }
bbq.ui.createStatsOverlay = function (p) {
    if (!p.scale) { p.scale = 1.0; }
    var em = p.entityManager;
    var mainEntity = new boc.core.Entity({ description: 'statsOverlay', entityManager: em });
    var mainEntityId = mainEntity.id();

    mainEntity.addComponent(
        new boc.components.Spatial({
            x: p.x,
            y: p.y,
            z: bbq.zindex.UI,
            width: 238,
            height: 54,
            scale: p.scale || 1.0
        })
    );
    if (p.followCamera) {
        mainEntity.addComponent(
            new boc.components.CameraFollow({
                camera: p.followCamera
            })
        );
    }
    mainEntity.addComponent(
        new boc.components.DrawableSprite({
            image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/stats_overlay.png')
        })
    );
    mainEntity.addComponent(new boc.components.UIElement({})); // arm this later
    mainEntity.addComponent(new boc.components.Identifiable({}));
    mainEntity.addComponent(new bbq.components.UnitStats(null)); // arm this later

    var unitText = new boc.core.Entity({ entityManager: em });
    var unitTextId = unitText.id();
    unitText.addComponent(
        new boc.components.Spatial({
            x: p.x + 16 * p.scale,
            y: p.y + 17 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    unitText.addComponent(
        new boc.components.DrawableText({
            text: '',  // class Lv. 1
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, unitTextId, em);

    var healthText = new boc.core.Entity({ entityManager: em });
    var healthTextId = healthText.id();
    healthText.addComponent(
        new boc.components.Spatial({
            x: p.x + 31 * p.scale,
            y: p.y + 38 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    healthText.addComponent(
        new boc.components.DrawableText({
            text: '', 
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, healthTextId, em);

    var strengthText = new boc.core.Entity({ entityManager: em });
    var strengthTextId = strengthText.id();
    strengthText.addComponent(
        new boc.components.Spatial({
            x: p.x + 72 * p.scale,
            y: p.y + 38 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    strengthText.addComponent(
        new boc.components.DrawableText({
            text: '',
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, strengthTextId, em);

    var rangeText = new boc.core.Entity({ entityManager: em });
    var rangeTextId = rangeText.id();
    rangeText.addComponent(
        new boc.components.Spatial({
            x: p.x + 117 * p.scale,
            y: p.y + 38 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    rangeText.addComponent(
        new boc.components.DrawableText({
            text: '',
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, rangeTextId, em);

    var moveText = new boc.core.Entity({ entityManager: em });
    var moveTextId = moveText.id();
    moveText.addComponent(
        new boc.components.Spatial({
            x: p.x + 170 * p.scale,
            y: p.y + 38 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    moveText.addComponent(
        new boc.components.DrawableText({
            text: '',
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, moveTextId, em);

    var visionText = new boc.core.Entity({ entityManager: em });
    var visionTextId = visionText.id();
    visionText.addComponent(
        new boc.components.Spatial({
            x: p.x + 215 * p.scale,
            y: p.y + 38 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 38,
            height: 19,
            scale: p.scale || 1.0
        })
    );
    visionText.addComponent(
        new boc.components.DrawableText({
            text: '',
            fillStyle: 'white',
            font: 'bold 8pt Helvetica'
        })
    );
    boc.utils.follow(mainEntityId, visionTextId, em);
    
    var upButton = new boc.core.Entity({ entityManager: em });
    var upButtonId = upButton.id();
    upButton.addComponent(
        new boc.components.Spatial({
            x: p.x + 139 * p.scale,
            y: p.y + 6 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 14,
            height: 14,
            scale: p.scale || 1.0
        })
    );    
    upButton.addComponent(
       new boc.components.DrawableSprite({
           image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_up.png')
       })
    );
    upButton.DrawableSprite.visible = false;

    boc.utils.follow(mainEntity.id(), upButton.id(), em);

    var downButton = new boc.core.Entity({ entityManager: em });
    var downButtonId = downButton.id();
    downButton.addComponent(
        new boc.components.Spatial({
            x: p.x + 139 * p.scale,
            y: p.y + 6 * p.scale,
            z: bbq.zindex.UI + 1,
            width: 14,
            height: 14,
            scale: p.scale || 1.0
        })
    );
    downButton.addComponent(
       new boc.components.DrawableSprite({
           image: boc.resources.GraphicsManager.getImage('assets/UI/HUD/button_down.png')
       })
    );
    downButton.DrawableSprite.visible = true;
    boc.utils.follow(mainEntity.id(), downButton.id(), em);
        
    mainEntity.UnitStats.addListener('onTargetChange', function (eventArgs) {
        if (eventArgs.newTarget && em.getComponentForEntity('Unit', eventArgs.newTarget)) {
            // TODO: adjust for bonuses
            var uMapElement = $em(eventArgs.newTarget).comp('MapElement');
            var unit = em.getComponentForEntity('Unit', eventArgs.newTarget);
            em.getComponentForEntity('DrawableText', unitTextId).text = bbq.units.configuration[unit.type].displayName + ' Lv. ' + unit.level;
            var health = em.getComponentForEntity('Health', eventArgs.newTarget);
            em.getComponentForEntity('DrawableText', healthTextId).text = health.current;
            var attack = em.getComponentForEntity('Attack', eventArgs.newTarget);
            em.getComponentForEntity('DrawableText', strengthTextId).text = attack.damage;
            em.getComponentForEntity('DrawableText', rangeTextId).text = Math.floor(attack.minRange / 100) + '-' + Math.floor(attack.maxRange / 100);
            var movement = em.getComponentForEntity('Movement', eventArgs.newTarget);
            em.getComponentForEntity('DrawableText', moveTextId).text = Math.floor(movement.range / 100);
            var vision = em.getComponentForEntity('Vision', eventArgs.newTarget);
            var visionBonus = 0;
            var propEnts = p.map.getEntities(uMapElement.x, uMapElement.y, 'Prop');
            for (var i = 0; i < propEnts.length; i++) {
                var prop = $em(propEnts[i]).comp('Prop');
                if (prop && prop.type == 'tree') {
                    var bonus = bbq.tilesets.forest.props.properties.tree.visionBonus * 100;
                    visionBonus += bonus;
                }
            }
            em.getComponentForEntity('DrawableText', visionTextId).text = Math.floor((vision.range + visionBonus) / 100);
            if (visionBonus > 0) {
                $em(visionTextId).comp('DrawableText').fillStyle = 'lime';
            }
            else if (visionBonus < 0) {
                $em(visionTextId).comp('DrawableText').fillStyle = 'red';
            }
            else {
                $em(visionTextId).comp('DrawableText').fillStyle = 'white';
            }
        }
        else {
            em.getComponentForEntity('DrawableText', unitTextId).text = '';
            em.getComponentForEntity('DrawableText', healthTextId).text = '';            
            em.getComponentForEntity('DrawableText', strengthTextId).text = '';
            em.getComponentForEntity('DrawableText', rangeTextId).text = '';
            em.getComponentForEntity('DrawableText', moveTextId).text = '';            
            em.getComponentForEntity('DrawableText', visionTextId).text = '';
        }
    });

    var hidden = false;
    mainEntity.UIElement.onclick = function (eventArgs) {
        if (hidden) { // show
            if (mainEntity.Animation) {
                mainEntity.removeComponent('Animation');
            }
            mainEntity.addComponent(
                new boc.components.Animation({
                    entity: mainEntity.id(),
                    duration: 150,
                    state: boc.constants.ANIMATION_PLAYING,
                    componentName: 'Spatial',
                    propertyDeltas: { x: 0, y: -29 * p.scale }
                })
            );
            em.getComponentForEntity('DrawableSprite', upButtonId).visible = false;
            em.getComponentForEntity('DrawableSprite', downButtonId).visible = true;
            hidden = false;
        }
        else { // hide
            if (mainEntity.Animation) {
                mainEntity.removeComponent('Animation');
            }
            mainEntity.addComponent(
                new boc.components.Animation({
                    entity: mainEntity.id(),
                    duration: 150,
                    state: boc.constants.ANIMATION_PLAYING,
                    componentName: 'Spatial',
                    propertyDeltas: { x: 0, y: 29 * p.scale }
                })
            );
            em.getComponentForEntity('DrawableSprite', upButtonId).visible = true;
            em.getComponentForEntity('DrawableSprite', downButtonId).visible = false;
            hidden = true;
        }
    }; // onclick
    

    return mainEntityId;
}; // createStatsOverlay

bbq.ui.createTrainingWindow = function (camera, options) {
    if (!options) { options = {}; }
    if (typeof (options.x) == 'undefined') { options.x = 0; }
    if (typeof (options.y) == 'undefined') { options.y = 0; }
    if (!options.scale) { options.scale = 1.0; }

    var x = (camera.xmin + options.x) * options.scale,
        y = (camera.ymin + options.y) * options.scale,
        w = 420, h = 224;

    if (!options.units) { options.units = ['Harvester', 'SpearWarrior', 'DartBlower', 'Scout', 'Enforcer', 'Catapult']; }
    if (!options.team) { options.team = 'Blue'; }

    // onBackClick, onTrainClick

    var zoverlay = 11, zbody = 21, ztext = 111;
    var ent = $em.create('trainingWindow');

    var overlay = $em.create();
    $em(overlay).add(new boc.components.Spatial({ x: camera.xmin, y: camera.ymin, z: bbq.zindex.UI + zoverlay, width: camera.xmax - camera.xmin, height: camera.ymax - camera.ymin, scale : options.scale }))
                .add(new boc.components.DrawableRect({ fillStyle: 'rgba(0,0,0,0.75)', lineWidth: 0, visible : true }));

    $em(ent).add(new boc.components.Spatial({ x: x, y: y, z: bbq.zindex.UI + zbody, width: w, height: h, scale: options.scale }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/UI/UnitTraining/layout.png'), visible: true }));

    
    var back = $em.create();
    $em(back).add(new boc.components.Spatial({ x: x + 2 * options.scale, y: y + 2 * options.scale, z: bbq.zindex.UI + ztext, width: 54, height: 22, scale: options.scale }))
             .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/button.png"), visible: true }))
             .add(new boc.components.Identifiable())
             .add(new boc.components.UIElement({})); // arm this later

    var backText = $em.create();
    $em(backText).add(new boc.components.Spatial({ x: x + 14 * options.scale, y: y + (4 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                 .add(new boc.components.DrawableText({ text: 'Back', fillStyle: 'white', font: 'bold 10pt Helvetica', shadow: { x: 1, y: 1 }, visible: true }));
    
    var title = $em.create();
    $em(title).add(new boc.components.Spatial({ x: x + 144 * options.scale, y: y + (4 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 11, height: 100, scale: options.scale }))
              .add(new boc.components.DrawableText({ text: 'Train a tribe member', fillStyle: 'white', font: 'bold 11pt Helvetica', shadow: { x: 1, y: 1 }, visible: true }));
    
    var train = $em.create();
    $em(train).add(new boc.components.Spatial({ x: x + (w - 2 - 54) * options.scale, y: y + 2 * options.scale, z: bbq.zindex.UI + ztext, width: 54, height: 22, scale: options.scale }))
              .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/button.png"), visible: true }))
              .add(new boc.components.Identifiable())
              .add(new boc.components.UIElement({})); // arm this later

    var trainText = $em.create();
    $em(trainText).add(new boc.components.Spatial({ x: x + (w - 2 - 54 + 10) * options.scale, y: y + (4 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                  .add(new boc.components.DrawableText({ text: 'Train', fillStyle: 'white', font: 'bold 10pt Helvetica', shadow: { x: 1, y: 1 }, visible: true }));

    
    var playerText = $em.create();
    $em(playerText).add(new boc.components.Spatial({ x: x + 82 * options.scale, y: y + (48 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                   .add(new boc.components.DrawableText({ text: boc.utils.getCurrentPlayer($em()).id, fillStyle: 'black', font: 'bold 11pt Helvetica', visible: true }));

    var foodText = $em.create();
    $em(foodText).add(new boc.components.Spatial({ x: x + 87 * options.scale, y: y + (76 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                   .add(new boc.components.DrawableText({ text: 'Food', fillStyle: 'black', font: 'bold 9pt Helvetica', visible: true }));
    
    var foodIcon = $em.create();
    $em(foodIcon).add(new boc.components.Spatial({ x: x + 123 * options.scale, y: y + 77 * options.scale, z: bbq.zindex.UI + ztext, width: 9, height: 13, scale: options.scale }))
                 .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true }))

    var currFoodText = $em.create();
    $em(currFoodText).add(new boc.components.Spatial({ x: x + 138 * options.scale, y: y + (76 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                     .add(new boc.components.DrawableText({ text: boc.utils.getCurrentPlayer($em()).food, fillStyle: 'black', font: 'bold 9pt Helvetica', visible: true }));
    
    var statsHealthText = $em.create();
    $em(statsHealthText).add(new boc.components.Spatial({ x: x + 260 * options.scale, y: y + (50 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                        .add(new boc.components.DrawableText({ text: 'Health: ', fillStyle: 'black', font: 'bold 10pt Helvetica', visible: true }));

    var statsMoveText = $em.create();
    $em(statsMoveText).add(new boc.components.Spatial({ x: x + 260 * options.scale, y: y + (64 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                        .add(new boc.components.DrawableText({ text: 'Speed: ', fillStyle: 'black', font: 'bold 10pt Helvetica', visible: true }));

    var statsVisionText = $em.create();
    $em(statsVisionText).add(new boc.components.Spatial({ x: x + 260 * options.scale, y: y + (78 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                        .add(new boc.components.DrawableText({ text: 'Vision: ', fillStyle: 'black', font: 'bold 10pt Helvetica', visible: true }));

    var statsAttackRangeText = $em.create();
    $em(statsAttackRangeText).add(new boc.components.Spatial({ x: x + 260 * options.scale, y: y + (92 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                        .add(new boc.components.DrawableText({ text: 'Attack range: ', fillStyle: 'black', font: 'bold 10pt Helvetica', visible: true }));

    var statsAttackDamageText = $em.create();
    $em(statsAttackDamageText).add(new boc.components.Spatial({ x: x + 260 * options.scale, y: y + (106 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                        .add(new boc.components.DrawableText({ text: 'Attack damage: ', fillStyle: 'black', font: 'bold 10pt Helvetica', visible: true }));
    
    var unitTypeText = $em.create();
    $em(unitTypeText).add(new boc.components.Spatial({ x: x + 14 * options.scale, y: y + (124 + 12) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                     .add(new boc.components.DrawableText({ text: '', fillStyle: 'black', font: 'bold 12pt Helvetica', visible: true }));
    
    var cursor = $em.create();
    $em(cursor).add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.UI + ztext, width: 50, height: 50, scale: options.scale }))
               .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'), visible: false }));

    var selectedUnit = null;
    var ents = [];
    var currPlayer = boc.utils.getCurrentPlayer();
    var j = 0;
    for (var i = 0; i < options.units.length; i++) {
        (function (unit) {
            var unitConfig = bbq.units.configuration[unit];
            var u = $em.create();
            // TODO: bonuses
            $em(u).add(new boc.components.Spatial({ x: x + (22 + 65 * j) * options.scale, y: y + 154 * options.scale, z: bbq.zindex.UI + zbody + 1, width: 50, height: 50, scale: options.scale }))
                  .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(unitConfig.defaultImagePath.replace('$(team)', currPlayer.team)), visible: true }))
                  .add(new boc.components.Identifiable())
                  .add(new boc.components.UIElement({
                      onclick: function (evArgs) {
                          $em(statsHealthText).comp('DrawableText').text = 'Health: ' + unitConfig.health;
                          $em(statsMoveText).comp('DrawableText').text = 'Speed: ' + unitConfig.moveRange;
                          $em(statsVisionText).comp('DrawableText').text = 'Vision: ' + unitConfig.visionRange;
                          $em(statsAttackRangeText).comp('DrawableText').text = 'Attack range: ' + unitConfig.attackMinRange + '-' + unitConfig.attackMaxRange;
                          $em(statsAttackDamageText).comp('DrawableText').text = 'Attack damage: ' + unitConfig.attackDamage;
                          $em(unitTypeText).comp('DrawableText').text = unitConfig.displayName;
                          var clickSpatial = $em(evArgs.entity).comp('Spatial');
                          $em(cursor).comp('Spatial').update({ x: clickSpatial.x, y: clickSpatial.y });
                          $em(cursor).comp('DrawableSprite').visible = true;
                          selectedUnit = unit;
                      }
                  })); // arm this later
            var f = $em.create();
            $em(f).add(new boc.components.Spatial({ x: x + (32 + 65 * j) * options.scale, y: y + 206 * options.scale, z: bbq.zindex.UI + ztext, width: 9, height: 13, scale: options.scale }))
                  .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true }));

            var foodCost = unitConfig.foodCost;
            var c = $em.create();
            $em(c).add(new boc.components.Spatial({ x: x + (45 + 65 * j) * options.scale, y: y + (206 + 10) * options.scale, z: bbq.zindex.UI + ztext + 1, width: 54, height: 22, scale: options.scale }))
                  .add(new boc.components.DrawableText({ text: foodCost, fillStyle: 'black', font: 'bold 8pt Helvetica', visible: true }));

            j++;
            ents.push(u);
            ents.push(f);
            ents.push(c);

        })(options.units[i]);
    } // i
    //e = new Entity();
    //e.id = "trainSelectCursor";
    //e.selectedUnitIndex = -1;

    //e.addComponent(new Spatial(0, 0, 50, 50));
    //e.addComponent(DrawableFactory.createCursorDrawable());
    //e.enabled = true;
    //e.Drawable.isVisible = false;
    //windowEnt.childrenEntities.add(e, "trainSelectCursor");
    //windowEnt.cursor = e;
    //layer.addEntity(e);

    $em(back).comp('UIElement').onclick = function () {
        if (options.onBackClick) {
            options.onBackClick(ent);
        }
    };

    $em(train).comp('UIElement').onclick = function () {
        if (options.onTrainClick) {
            options.onTrainClick(ent, selectedUnit);
        }
    };

    $em(ent).listen('onKill', function (p) {
        $em(overlay).kill();
        $em(back).kill();
        $em(backText).kill();
        $em(title).kill();
        $em(train).kill();
        $em(trainText).kill();
        $em(foodText).kill();
        $em(foodIcon).kill();
        $em(playerText).kill();
        $em(currFoodText).kill();
        $em(statsHealthText).kill();
        $em(statsMoveText).kill();
        $em(statsVisionText).kill();
        $em(statsAttackRangeText).kill();
        $em(statsAttackDamageText).kill();
        $em(unitTypeText).kill();
        $em(cursor).kill();
        for (var i in ents) {
            $em(ents[i]).kill();
        }
    });
    return ent;
};//createTrainingWindow