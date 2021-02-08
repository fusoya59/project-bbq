ns('boc.utils');

boc.utils._em = null;
boc.utils.setEntityManager = function (em) {
    boc.utils._em = em;
};

boc.utils.sessionKey = undefined;

boc.utils.isSafari = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.indexOf("Nintendo") >= 0;

// AJAX API - TODO : remove callback=?
boc.utils.getJson = function (service, params, onRequestComplete) {
    if (boc.utils.isSafari && SharedSession && SharedSession.sessionKey) {
        params['$boc_session'] = SharedSession.sessionKey;
    }
    var url = boc.constants.API_HOST + '/' + service + '?callback=?';
    var queryString = '';
    var paramLength = 0;
    for (var p in params) {
        if (params[p]) {
            queryString += ('&' + p + '=' + params[p]);
            paramLength += params[p].length;
        }
    }

    // do a POST instead
    if (paramLength > boc.constants.MAX_GET_LENGTH) {
        url = url.replace('callback=?', '');
        params.boc_session = typeof (SharedSession) != 'undefined' ? SharedSession.sessionKey : boc.utils.sessionKey;
        $.post(url, params, onRequestComplete);
    }
    else {
        $.getJSON(url + queryString, onRequestComplete);
    }
};

boc.utils.post = function (service, params, onRequestComplete) {
    var url = boc.constants.API_HOST + '/' + service;
    params.boc_session = typeof (SharedSession) != 'undefined' ? SharedSession.sessionKey : boc.utils.sessionKey;
    $.post(url, params, onRequestComplete);
}

//boc.utils.put = function (service, params, onRequestComplete) {
//    var url = boc.constants.API_HOST + '/' + service;
//    params.boc_session = typeof (SharedSession) != 'undefined' ? SharedSession.sessionKey : boc.utils.sessionKey;
//    $.ajax({
//        url: url,
//        data: params,
//        dataType : 'json',
//        type: 'PUT',
//        success : onRequestComplete
//    });
//}

boc.utils.API_KEY = null;

// request an API key from the backend
boc.utils.requestApiKey = function (callback) {
    boc.utils.getJson(
        'requestkey',
        {},
        function (json) {
            if (json.status == 'ok') {
                setMaxDigits(19);
                var key = json.result.key.split('_');

                // Put this statement in your code to create a new RSA key with these parameters
                boc.utils.API_KEY = new RSAKeyPair(
                        key[0],
                        null,
                        key[1]
                );
                if (callback) {
                    callback(boc.utils.API_KEY);
                }
            } // if ok
        } // callback
    ); // getJson
};

/**
 * multiplies the colors of the path images by 0.5
 */
boc.utils.createFilteredImage = function (imgPath, w, h, f) {
    if (typeof (f) == 'undefined') { f = 0.5; }

    function multiplyFilter(img, width, height, factor) {
        var cv = document.createElement("canvas")
        cv.width = 100;
        cv.height = 100;
        var ctx = cv.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var imgData = ctx.getImageData(0, 0, cv.width, cv.width);
        var px = imgData.data;
        for (var i = 0; i < px.length; i += 4) {
            px[i] = factor[0] * px[i];
            px[i + 1] = factor[1] * px[i + 1];
            px[i + 2] = factor[2] * px[i + 2];
            // ignore alpha
        }
        ctx.putImageData(imgData, 0, 0);
        return cv;
    }

    var key = imgPath + "_filtered";
    var im2 = boc.resources.GraphicsManager.getImage(key);
    if (im2) { return im2; }

    var im = boc.resources.GraphicsManager.getImage(imgPath);
    im2 = multiplyFilter(im, w, h, [f, f, f]);
    boc.resources.GraphicsManager.addImage(key, im2);

    return im2;
}

// returns radians
boc.utils.getAngle = function (v1, v2) {
    return Math.acos(
            (v1.x * v2.x + v1.y * v2.y) /
            Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2)));
}; // getANgle

boc.utils.degToRad = function (deg) {
    return deg * Math.PI / 180.0;
};

boc.utils.radToDeg = function (rad) {
    return rad * 180.0 / Math.PI;
};

// creates and entity and attaches the event component with a lifespan of 1 second. returns the entity id.
boc.utils.createEvent = function (eventcomp, em, options) {
    if (!em) { em = boc.utils._em; }
    var eventId = em.createEntity();
    em.addComponentToEntity(eventcomp, eventId);
    em.addComponentToEntity(new boc.components.Lifespan({ duration: (options && options.duration ? options.duration : 1000) }), eventId);
    return eventId;
};

// consumes an event and sets the lifespan time to 0
boc.utils.consumeEvent = function (entityId, eventName, em) {
    if (!em) { em = boc.utils._em; }
    var eventComp = em.getComponentForEntity(eventName, entityId);
    if (eventComp) {
        var lifespan = em.getComponentForEntity('Lifespan', entityId);
        if (lifespan) { lifespan.duration = 0; }
    }
};

// returns a xmin, ymin, xmax, ymax object from a Spatial component
boc.utils.toBounds = function (spatial) {
    return {
        xmin: spatial.x,
        xmax: spatial.x + spatial.width * spatial.scale,
        ymin: spatial.y,
        ymax: spatial.y + spatial.height * spatial.scale,
        containsPoint: function (point) {
            return point.x < this.xmax && point.x > this.xmin &&
                   point.y < this.ymax && point.y > this.ymin;
        },
        intersects: function (otherBounds) {
            return this.xmin < otherBounds.xmax && this.xmax > otherBounds.xmin &&
                   this.ymin < otherBounds.ymax && this.ymax > otherBounds.ymin;
        }
    };
}

// returns the center point of the spatial bounds
boc.utils.toPoint = function (spatial) {
    return {
        x: spatial.x + spatial.width / 2,
        y: spatial.y + spatial.height / 2
    };
}

// Stopwatch class for benchmarking
boc.utils.Stopwatch = function () {
    var starttime = null,
        endtime = null,
        duration = null;

    this.start = function () {
        starttime = +new Date;
    }
    this.stop = function () {
        if (starttime == null) { return; }
        endtime = +new Date;
        duration += (endtime - starttime);
        starttime = null;
    }
    this.reset = function () {
        duration = 0;
    }
    this.duration = function () {
        return duration;
    }
    this.toString = function () {
        return duration + ' ms';
    }
}

// followingEnt will follow (Spatial.x, y) entToFollow
// this completely breaks if there's a circular relationship. so don't do it.
boc.utils.follow = function (entToFollow, followingEnt, em) {
    if (!em) { em = boc.utils._em; }
    var parentSpatial = em.getComponentForEntity('Spatial', entToFollow);
    var childSpatial = em.getComponentForEntity('Spatial', followingEnt);
    if (!parentSpatial || !childSpatial) { return; }

    boc.utils.unfollow(followingEnt, em);

    childSpatial.following = entToFollow;
    childSpatial.followCallback = function (eventArgs) {
        var dx = eventArgs.newDimension.x - eventArgs.oldDimension.x;
        var dy = eventArgs.newDimension.y - eventArgs.oldDimension.y;
        var dz = eventArgs.newDimension.z - eventArgs.oldDimension.z;
        childSpatial.update({ x: childSpatial.x + dx, y: childSpatial.y + dy, z: childSpatial.z + dz });
    }
    parentSpatial.addListener('onchange', childSpatial.followCallback);

    //var parentCameraFollow = $em(entToFollow).comp('CameraFollow');
    //if (parentCameraFollow) {
    //    var childCameraFollow = $em(followingEnt).comp('CameraFollow');
    //    if (!childCameraFollow) {
    //        childSpatial.attachedCamera = true;
    //        childCameraFollow = new boc.components.CameraFollow({ camera: parentCameraFollow.camera });
    //        $em(followingEnt).add(childCameraFollow);
    //    }
    //}

    // gotta unfollow if parent entity is killed
    em.addListenerForEntity(entToFollow, 'onKill', function () {
        boc.utils.unfollow(followingEnt, em);
    });
};

boc.utils.unfollow = function (entToDisarm, em) {
    if (!em) { em = boc.utils._em; }
    var spatial = em.getComponentForEntity('Spatial', entToDisarm);
    if (spatial && spatial.following && spatial.followCallback) {
        var followingSpatial = em.getComponentForEntity('Spatial', followingSpatial);
        if (followingSpatial) {
            followingSpatial.removeListener('onchange', spatial.followCallback);
            //if (followSpatial.attachedCamera) {
            //    $em(entToDisarm).remove('CameraFollow');
            //    delete followSpatial['attachedCamera']
            //}
        }
        delete spatial['followCallback'];
        delete spatial['following'];
    }
};

// loops thru all the different types of drawables and returns the approriate one
boc.utils.getDrawableComponent = function (ent, em) {
    if (!em) { em = boc.utils._em; }
    for (var i = 0; i < boc.components.drawables.length; i++) {
        var drawable = em.getComponentForEntity(boc.components.drawables[i], ent);
        if (drawable) { return drawable; }
    }
    return null;
};

boc.utils.createBouncingAnimation = function (entity, options) {
    if (!options) { options = {}; }
    if (!options.height) { options.height = 30; }
    if (!options.duration) { options.duration = 900; }

    var bounceAnim = new boc.utils.AnimationSequence({
        entity: entity,
        loop: false,
        onLoopComplete: options.onLoopComplete,
        animations: [
            new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { y: -options.height },
                duration: options.duration * 1 / 3,
                easing: 'easeOutQuad'
            }),
            new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { y: options.height },
                duration: options.duration * 2 / 3,
                easing: 'easeOutBounce'
            })
        ]
    });
    return bounceAnim;
}; // createBouncingAnimation

boc.utils.createBouncingText = function (text, x, y, options) {
    if (!options) { options = {}; }
    if (!options.font) { options.font = 'bold 14 Helvetica'; }
    if (!options.fillStyle) { options.fillStyle = 'rgb(255,100,100)'; }
    if (!options.z) { options.z = 0; }
    if (!options.em) { options.em = boc.utils._em; }
    if (!options.shadow) { options.shadow = { x: 1, y: 1 }; }

    var bounce = new boc.core.Entity({ entityManager: options.em });
    bounce.addComponent(
        new boc.components.Spatial({
            x: x,
            y: y,
            z: options.z,
            width: 16,
            height: 16
        })
    );
    bounce.addComponent(
        new boc.components.DrawableText({
            font: options.font,
            fillStyle: options.fillStyle,
            text: text,
            shadow: options.shadow
        })
    );
    boc.utils.createBouncingAnimation(
        bounce,
        {
            onLoopComplete: function () {
                bounce.kill();
            }
        }
    ).start();
}


boc.utils.leftPad = function (n, totalDigits) {
    n = n.toString();
    var pd = '';
    if (totalDigits > n.length) {
        for (i = 0; i < (totalDigits - n.length) ; i++) {
            pd += '0';
        }
    }
    return pd + n.toString();
}


boc.utils.createBlinkingAnimation = function (ent, options, em) {
    if (!em) { em = boc.utils._em; }
    if (!options) { options = {}; }
    if (!options.loopLength) { options.loopLength = 1000; }
    if (!options.drawableName) { options.drawableName = 'DrawableRect'; }
    if (!options.easing) { options.easing = 'linearTween'; }
    if (!options.delta) { options.delta = 0.75; }

    var blinkAnim = new boc.utils.AnimationSequence({
        entity: ent,
        entityManager: em,
        loop: true,
        animations: [
            new boc.components.Animation({
                duration: options.loopLength * 0.5,
                componentName: options.drawableName,
                propertyDeltas: { alpha: -options.delta },
                easing: options.easing
            }),
            new boc.components.Animation({
                duration: options.loopLength * 0.5,
                componentName: options.drawableName,
                propertyDeltas: { alpha: options.delta },
                easing: options.easing
            })
        ]
    });
    return blinkAnim;
};

boc.utils.createBlinkingRect = function (x, y, z, w, h, options, em) {
    if (!em) { em = boc.utils._em; }
    if (!options) { options = {}; }
    if (!options.fillStyle) { options.fillStyle = 'rgb(0,0,0)'; }
    if (!options.lineWidth) { options.lineWidth = 0; }

    var ent = new boc.core.Entity({ entityManager: em });
    ent.addComponent(new boc.components.Spatial({ x: x, y: y, z: z, width: w, height: h }));
    ent.addComponent(new boc.components.DrawableRect({ fillStyle: options.fillStyle, lineWidth: options.lineWidth }));
    boc.utils.createBlinkingAnimation(ent.id(), options, em).start();
    return ent.id();
};//createBlinkingRect

boc.utils.toTileKey = function (mapElement) {
    return mapElement.x + ',' + mapElement.y;
}

boc.utils.toTile = function (tileKey) {
    tileKey = tileKey.split(',');
    return { x: +tileKey[0], y: +tileKey[1] };
}

boc.utils.inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
        }
    });
};

// special html load
// does a GET request for the html page
// adds all links, excluding anything from exclude array
// then adds the body text and returns that onload
boc.utils.loadHtml = function (htmlpage, linkPrefix, onload, exclude) {
    $.get(htmlpage, function (data) {
        var html = '';
        var links = /<link.*\/>/g, l = null;
        while (l = links.exec(data)) {
            var include = true;
            if (exclude) {
                for (var i = 0; i < exclude.length; i++) {
                    var regex = new RegExp('href="' + exclude[i] + '\"');
                    if (regex.test(l[0])) {
                        include = false;
                        break;
                    }
                }
            }
            if (include) {
                html += l[0].replace(/href="(.+)"/, 'href="' + linkPrefix + '\$1"');
            }
        }
        if (onload) {
            onload(html.trim() + /<body.*>([\s\S]*)<\/body>/mg.exec(data)[1].trim());
        }
    });
};

boc.utils.centerCamera = function(camera, onEntity) {	
	var cx = (camera.xmin + camera.xmax) / 2;
    var cy = (camera.ymin + camera.ymax) / 2;
    var uspatial = $em(onEntity).comp('Spatial');
    var ux = uspatial.x + uspatial.width / 2;
    var uy = uspatial.y + uspatial.height / 2;
    camera.move(Math.round(ux - cx), Math.round(uy - cy));	
};

boc.utils.waitForClick = function(p) {
	$em($em.create()).ns('boc.components').add('WaitForClick', p);
}