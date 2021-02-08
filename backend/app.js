//setup initial stuff
var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

//setup express stuff
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 0);

//app.engine('html', require('ejs').renderFile);

// my dependencies
var DataStore = require('./mydatastore').DataStore;
var Recaptcha = require('recaptcha').Recaptcha;
var RSA = require('./libs/RSA').RSA;
var GameGenerator = require('./libs/gamegenerator').GameGenerator;
var GameScoring = require('./libs/gamescoring').GameScoring;
var Maps = require('./resources/maps.js').Maps;

var jade = require('jade');
var nodemailer = require('nodemailer');

// route handlers
var transact = require('./libs/routing/transaction').transact;
var purchaseUnit = require('./libs/routing/unitPurchasing').purchaseUnit;
var adminService = require('./libs/routing/admin').admin;

var socketServer = require('./libs/socketServer');
var matchMaker = require('./libs/matchmaker');
var backendUtils = require('./libs/utils');
var isTrustedDomain = backendUtils.isTrustedDomain;

var adminkey = backendUtils.ADMIN_KEY;
var ADMIN_PLAYERID = backendUtils.ADMIN_PLAYERID;
var ADMIN_IP = backendUtils.ADMIN_IP;


// my DBs
var db = {};       

// this is where maps are stored
// user created or out-of-the-box stuff
db.maps = new DataStore('maps');
db.maps.schema = {
	mapid : { type : 'string' },
	tileset : { type : 'string' },
	width : { type : 'int' },
	height : { type : 'int' },
	terrain : { type : 'string' },
	props: { type: 'string' },
	averageTurnsToWin: { type: 'int' },
	ready : { type : 'bool' },
	startstate: { type: 'object' }
};

// this is where games are stored
// the game as in the terrain, units, buildings, and everything else
db.games = new DataStore('games');
db.games.schema = {
	gameid : { type : 'string' },
	turn : { type : 'string' }, // whose turn (playerid) it is
	winner: { type: 'string', internalWriteOnly : true }, // the winner!
	state : { type : 'object' }, // the state of the game
	moves : { type : 'array' }, // the moves performed in the game - for replays
	mapid : { type : 'string' }, // the map this game uses
	summary : { type : 'object' }, // stats
	lastupdate : { type: 'int' } // the last time (UTC) the game was touched
}

/*
db.test = new DataStore('test');
db.test.schema = {
    id : {type:'string'},
    arr: {type:'array'}  
};
*/

// example state object
var stateObj = {
	player1 : {
		food : 10,
		turn : 1,
		team : 'Red',
		buildings : [
			{ 
				type : 'hut', 
				location : { x: 0, y: 0 },
				turnsUntilCapture : 1 
			},
			{ /* and so on */ }		
		],
		units : [
			{ 
				type : 'gatherer',
				location : { x: 1, y: 1 },
				state : 'idle',
				hp : 10,
				options : { isCapturing : false, isGathering: false } 
			},
			{ /* and so on */ }
		],
		lastSeen: { "0,0": "Red" }, // buildings last seen
        unitSet : [ 'Gatherer', 'Catapult', 'SpearWarrior' ]
	},
	
	player2 : { /* same as that guy */ }
}
//console.log(JSON.stringify(stateObj));
// move string
// protocol: TODO: write up
var movestring = "";

// TODO: uncomment internalWrite
// user information
db.players = new DataStore('players');
db.players.schema = {
	playerid : { type : 'string' },
	displayname : { type : 'string' },
	_password : { type : 'string' },
	email : { type : 'string' },
	wins : { type : 'int' },
	losses : { type : 'int' },
	rating : { type : 'int' },
	avatar : { type: 'string' },
	level : { type : 'int' },
	experience: { type: 'int' },
    unlockedUnits : { type : 'array' },
	skulls : { type : 'int' , internalWriteOnly : true }, // soft currency / BattleBadges
	shields: { type: 'int', internalWriteOnly: true }, // hard currency (purchased)  / TribeTokens
    tutorialCompleted : { type : 'bool' }
};

db.players.validateQuery = function(query, user) {
    if (user.playerid == ADMIN_PLAYERID) { return null; }
    if (!query.playerid || query.playerid != user.playerid) {
        return 'player cannot write to other players\' records';
    }    
    return null;
}

db.messages = new DataStore('messages');
db.messages.schema = {
	id : { type : 'string' },
	sender : { type : 'string' },
	recipient : { type : 'string' },
	subject : { type: 'string' },
	body : { type : 'string' },	
	recipientRead : { type : 'bool' }	
};

db.friends = new DataStore('friends');
db.friends.schema = {
	playerid : { type: 'string' },
	requestStatus : { type : 'string' }, // pending, confirm, decline
	friendid : { type : 'string' } // playerid
};



// match information. a match is between two or more players and is related to only
// one game. 
db.matches = new DataStore('matches');
db.matches.schema = {
	matchid : { type : 'string' },
	playerid : { type : 'string' },
	gameid : { type : 'string' },
	status : { type : 'string' }, // pending, active, retired, challenging, challenged; i.e. seeking, ongoing, finished
	timerequested : { type : 'long' },
	rating : { type : 'int' }, // for convenience; player's rating
	mapid : { type : 'string' }, // if challenged and a mapid was selected, this will have a value
	challengeid : { type : 'string' }, // if challenged the matching matchid
	opponentid : { type : 'string' } // if challenged, your opponent
};

db.matches.validateQuery = function(query, user) {
    if (user.playerid == ADMIN_PLAYERID) { return null; }
    if (!query.playerid || query.playerid != user.playerid) {
        return 'player cannot write to other players\' records';
    }    
    return null;
}

// start match making
matchMaker.runMatchmakingService(db);

// middleware crap
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(jade);

// attaches some methods and objects to the req and res object
app.use(function (req, res, next) {
    req.bbq = req.bbq || {};
    req.bbq.db = req.bbq.db || db;
    req.bbq.authorized = req.bbq.authorize || authorized;
    res.bbq = res.bbq || {};
    res.bbq.respondError = res.bbq.respondError || _respondError;
    res.bbq.respondOk = res.bbq.respondOk || _respondOk;
    next();
});

io.bbq = {};
io.bbq.db = db;

// some constants
//var RECAPTCHA_PUBLIC_KEY = '6Lf73NsSAAAAAFSkoNRw_rdyKP5IfR4ldas0B_UN';
//var RECAPTCHA_PRIVATE_KEY = '6Lf73NsSAAAAAO5ltRsHmDExoWeGRRNWh_tZnjRc';
var RECAPTCHA_PUBLIC_KEY = '6LckmuMSAAAAADLg6hMl0l58dc9-IWPC_uk30iqy';
var RECAPTCHA_PRIVATE_KEY = '6LckmuMSAAAAALFreDmhGKSwSYoHDmHNQ6uuGUZh';

// generated using RSA Key Generator
// should be generated every week or so
var RSA_PUBLIC_KEY = backendUtils.RSA_PUBLIC_KEY;// '92c1dc2ef9f860e92c8f89ce945a4f3';
var RSA_PRIVATE_KEY = backendUtils.RSA_PRIVATE_KEY; //'c35f26b8d8d30e33cc57eeec12f303b';
var RSA_MOD = backendUtils.RSA_MOD; //'15347369bcfe3b41bca0778fe872f35f';
var RSA_KEY_OBJ = backendUtils.RSA_KEY_OBJ; //new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);;

var NODEMAILER_SERVICE = 'Gmail';
var NODEMAILER_USER = 'bagofchips.labs'
var NODEMAILER_PW = 'BoC1234!'

var COOKIE_EXPIRATION = 3; //days

if (process.env.PRODUCTION) {
    //app.use(express.compress()); // this is broken on cloudfoundry 
    app.use(express.errorHandler( { dumpExceptions:true} ));
    app.set('json spaces', 0);
} else {
    app.use(express.errorHandler( { dumpExceptions:true, showStack:true } ));
}

/*
app.get(/^\/toptribe\/(.*)$/, function(req, res) {    
    res.sendfile('frontend/' + req.params[0]);    
});
*/

// request the RSA key for encryption/decryption purposes
app.get('/requestkey', function(req, res) {
	var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
	
	//var encMsg = RSA.encryptString(key, 'hello world!');
	//console.log(encMsg);
	//_debug(RSA.decryptString(key, encMsg));
	
	_respondOk(res, { key : RSA_PUBLIC_KEY + '_' + RSA_MOD });					
});

// create a user
// validates input
// validates CAPTCHA
// validates if user exists
// sends email with random password if all is ok
app.get('/createuser', function(req, res) {
	if (req.query.name && req.query.email) {
		if (!/^\w+$/.test(req.query.name) || !/([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/.test(req.query.email)) {
			_respondError(res, 'invalid name and/or email');
			return;
		}
		
		var data = {
	        remoteip:  req.connection.remoteAddress,
	        challenge: req.query.recaptcha_challenge_field,
	        response:  req.query.recaptcha_response_field
		};

		var addPlayer = function () {
		    db.players.get({ playerid: insensitivize(req.query.name) }, function (docs) {
		        if (docs.length > 0) {
		            _respondError(res, 'user ' + req.query.name + ' already exists.');
		        } else {
		            var pw = generatePassword(); // yep. gonna store it clear text. mwahahaha. (TODO: don't do this)	    
		            if (req.query.password) {
		                var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
		                pw = RSA.decryptString(key, req.query.password);
		                if (pw && pw.indexOf('^') == 0 && pw.indexOf('$') == 1) {
		                    pw = pw.substring(2);
		                } else {
		                    _respondError(res, 'invalid password given');
		                    return;
		                }
		            } // if password given				
		            db.players.add(
                        {
                            playerid: req.query.name,
                            displayname: req.query.name,
                            _password: pw,
                            email: req.query.email,
                            wins: 0,
                            losses: 0,
                            rating: 0,
                            level: 1,
                            avatar: null,
                            experience: 0,
                            skulls: 0,
                            shields: 0,
                            tutorialComplete: false
                        },
                        function (err, data) {
                            if (err) {
                                _respondError(res, 'error creating user: please try again.');
                            } else { // success!!!
                                var transport = nodemailer.createTransport('SMTP',
                                {
                                    service: NODEMAILER_SERVICE,
                                    auth: {
                                        user: NODEMAILER_USER,
                                        pass: NODEMAILER_PW
                                    }
                                });
                                var plainBody = 'Welcome to the game!\r\nUser name: ' + req.query.name + '\r\nPassword: ' + pw;
                                var htmlBody = 'Welcome to the game!<br/><br/>User name: ' + req.query.name + '<br/>Password: ' + pw;

                                var mailoptions = {
                                    from: 'Bag of Chips Laboratories <bagofchips.labs@gmail.com>',
                                    to: req.query.email,
                                    subject: 'Your user account has been created.',
                                    text: plainBody,
                                    html: htmlBody
                                };

                                transport.sendMail(mailoptions, function (error, response) {
                                    if (error) {
                                        _debug(error);
                                    } else {
                                        _debug('message sent: ' + response.message);
                                    }
                                });

                                _respondOk(res, 'successfully create user ' + req.query.name);
                            }
                        }
                    ); // add to db
		        } // user not exist
		    }); // see if user exists in db	
		};

		console.log(req.query.recaptcha_ignore);
		if (req.query.recaptcha_ignore) {
		    addPlayer();
		}
		else {
		    var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);
		    recaptcha.verify(function (success, err) {
		        if (success) {
		            addPlayer();
		        } else {
		            _respondError(res, 'invalid captcha.');
		        }
		    });
		}
	    
	} else {
		_respondError(res, 'not enough parameters.');
	}
});

// login mechanism
// given a token of "userid+password+time", which is encrypted in RSA with given public key,
// set a cookie on the client, which will expire COOKIE_EXPIRATION days from now.
app.get('/login/:token', function(req, res) {	
	
	if (/^[\w\s]+$/.test(req.params.token)) {
		var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
		var loginPass = RSA.decryptString(key, req.params.token);
		//01f0c5e9a43d8a0eb93185072c00afe5%20109157b9d8afee24b35cf034921211e2
		//1351b809e1a8f82cd154fa8393838693 09beb1da55050d77a1e509dff20f6000
		//console.log(req.params.token);
		//	console.log(loginPass);
		var delimIndex = loginPass.indexOf('+');
		var timeDelimIndex = loginPass.lastIndexOf('+');
		if (delimIndex > 0 && timeDelimIndex > 0) {
			var login = loginPass.substring(0, delimIndex);
			var pass = loginPass.substring(delimIndex + 1, timeDelimIndex);

			db.players.get({playerid: insensitivize(login), _password:pass}, function(docs) {
				if (docs.length > 0) {
					res.set('P3P','CP="NOI CURa OUR NOR UNI"');
					var expiredate = new Date();
					expiredate.setDate(expiredate.getDate() + COOKIE_EXPIRATION);
					var timecreated = loginPass.indexOf(timeDelimIndex + 1);
					var cookie = generateSessionCookie(docs[0].playerid, req.connection.remoteAddress, timecreated);			
					res.cookie('boc_session', cookie, { expires: expiredate, httpOnly: true});
					// TODO: insert to session table
					_respondOk(res, { boc_session: cookie, message: 'login successful' });		
				} else {
					_respondError(res, 'invalid name or password.')
				} // not found
			});											
		} else {
			_respondError(res, 'invalid token');
		}
		//console.log(loginPass);
		
	} else {
		_respondError(res, 'invalid token');
	}
});

// username+oldpassword+newpassword
app.get('/changepassword/:token', function(req, res) {
	if (/^[\w\s]+$/.test(req.params.token)) {
		var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
		var loginOldNew = RSA.decryptString(key, req.params.token).split('+');
		if (loginOldNew.length == 3) {
			db.players.get({ playerid : insensitivize(loginOldNew[0]), _password: loginOldNew[1] }, function(docs) {
				if (docs.length > 0) {					
					db.players.update(
						{ playerid : insensitivize(loginOldNew[0]) }, //query 
						{ $set : { _password : loginOldNew[2] } }, //document
						{ multi:true }, 
						function(err, result) {
							if (!err) {
								_respondOk(res, 'successfully changed password');
							}
							else {
								_respondError(res, 'error in db. try again later');
							}
						} // callback
					); // update
				} // match
				else {
					_respondError(res, 'invalid name or password did not match');
				} // no match
			});
		}
		else {
			_respondError(res, 'invalid token');
		}	
	} // test
	else {
		_respondError(res, 'invalid token');
	} // failed test
});

// admin access stuff to manage the database
// needs a key as defined in adminkey var
// action=truncate, collection=collectionname - truncates all data in the given collection
// action=startmm, action=stopmm - starts or stops the matchmaking service
// action=get, collection=collectionname, _field=value, _field2=value... - gets the rows that match _fields (and together)
// action=remove, collection=collectionname, _field=value, _field2=value... - removes the rows that match _fields (and together)
app.get('/admin', adminService);

// user-level get
// gets the rows associated with the get/:collectionname
// query is passed as query string parameters, which are ANDed together
app.get(/^\/get\/(\w+)$/, function(req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}
	
    var collection = req.params[0];    
    if (db[collection]) {
        var queryObj = {};
        var projection = {};
        for (var qp in req.query) {
            var val = insensitivize(req.query[qp]);
            if (qp == 'callback' || qp == '' || qp == '__adminkey' || qp == '_' || qp == '$boc_session') { continue; }
            if (val == '$null') {
                val = null;
            }
            if (qp == '_fields') {
                var proj = req.query[qp].split(',');
                for (var p = 0; p < proj.length; p++) {
                    projection[proj[p]] = 1;    
                } // p
            } 
            else { // setup projection 
                queryObj[qp] = val;
            }           
        }                
        db[collection].getcollection().find(queryObj, projection).toArray(function(err, docs) {
        	// hide system fields
        	var toReturn = [];
        	for (var i = 0; i < docs.length; i++) {
        		var doc = docs[i];
        		var newdoc = {};
        		for (var f in doc) {
        			if (user.playerid != ADMIN_PLAYERID && f.charAt(0) == '_') {
        				//console.log('skipping ' + f);
        				continue;
        			}
        			newdoc[f] = doc[f];        			
        		}
        		toReturn.push(newdoc);
        	}
            _respondOk(res, toReturn);
        });
    } else {
        _respondError(res, '\'' + collection + '\' not found');
    }    
});

app.get('/userinfo', function(req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}
	db.players.getcollection().find({ playerid: insensitivize(user.playerid) }).toArray(function(err, docs) {
		var toReturn = {};
    	for (var i = 0; i < docs.length; i++) {
    		var doc = docs[i];
    		var newdoc = {};
    		for (var f in doc) {
    			if (user.playerid != ADMIN_PLAYERID && f.charAt(0) == '_') {
    				//console.log('skipping ' + f);
    				continue;
    			}
    			newdoc[f] = doc[f];        			
    		}
    		toReturn = newdoc;
    	}
        _respondOk(res, toReturn);
	});
});

// gets friends - optional query parameter : requestStatus ['pending', 'confirmed']
/*
app.get('/friend', function(req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}	
	var query = { playerid : user.playerid };
	if (req.query.requestStatus) {
		query.requestStatus = req.query.requestStatus;
	}
	
	db.friends.get(
		query,
		function(docs) {
			for (var i = 0; i < docs.length; i++) {
				delete docs[i].playerid;
				delete docs[i].requestStatus;
			}
			_respondOk(res, docs);
		}
	);
});
*/

// request a friend - required : playerid (the player you're requesting)
// confirm a friend - required : requestStatus, playerid
// action : confirm, decline, request
app.post('/friend/:action', function(req, res) {
	var origin = req.get('Origin');    
    if (origin && isTrustedDomain(origin)) {
    	res.set('Access-Control-Allow-Origin', origin);        
    }    
	var user = authorized(req, 'POST');
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}
	if (!req.body.playerid) {
		_respondError(res, 'need playerid');
		return;
	}
	if (req.body.playerid == user.playerid) {
		_respondError(res, 'cannot request yourself!');
		return;
	}
	
	if (req.params.action == 'request') {
		db.players.get(
			{ playerid : insensitivize(req.body.playerid) },
			function(docs) {
				if (!docs || docs.length == 0) {
					_respondError(res, req.body.playerid + ' does not exist.');
					return;
				}
				// check if friend already requested
				db.friends.get(
					{ 
						$or : 
						[ 
							{ // i'm already requesting this friend 
								playerid : insensitivize(user.playerid), // requester 
								friendid : insensitivize(req.body.playerid), // recipient
								$or : [ { requestStatus : 'confirm' }, { requestStatus : 'pending' } ] 
							},
							{ // some friend is already requesting for me
								friendid : insensitivize(user.playerid),
								playerid : insensitivize(req.body.playerid),
								$or : [ { requestStatus : 'confirm' }, { requestStatus : 'pending' } ]
							}
						] 
					},
					function(docs) {					
						if (docs && docs.length > 0) {
							_respondError(res, 'friend already requested or confirmed or you\'re being requested for');							
						}					
						else {
							var friendRequest = {
								playerid : user.playerid,
								friendid : req.body.playerid,
								requestStatus : 'pending'
							};
							db.friends.add(friendRequest, function(err, result) {
								if (!err) {
									_respondOk(res, 'successfully requested friend ' + req.body.playerid);
								}
								else {
									_respondError(res, err);
								}
							});
						}
					} // callback
				); // friend already requested?			
			} // callback
		); // player exists?	
	} // request
	else if (req.params.action == 'decline' || req.params.action == 'confirm') {		
		db.friends.get(
			{ playerid : insensitivize(req.body.playerid), friendid : insensitivize(user.playerid), requestStatus : 'pending' },
			function(docs) {
				if (docs && docs.length > 0) {
					// update request status
					db.friends.update(
						{ playerid : req.body.playerid, friendid : user.playerid, requestStatus : 'pending' },
						{ $set : { requestStatus : req.params.action } },
						null,
						function(err, result) {
							if (!err) {
								if (req.params.action == 'decline') {
									_respondOk(res, 'successfully ' + req.params.action + 'd friend!');
								} 
								else { // add another entry for the other guy
									db.friends.add(
										{ playerid : user.playerid, friendid : req.body.playerid, requestStatus : 'confirm' }, 
										function(err2, result2) {
											_respondOk(res, 'successfully ' + req.params.action + 'ed friend!');
										}
									);								
								} 								
							}
							else {
								_respondError(res, err);
							}
						}
					); // update request status
				}
				else {
					_respondError(res, 'friend request not found!');
				}
			}
		);				
	} // decline/confirm
	else {
		_respondError(res, 'Invalid action');
	}
	
});


// get messages - optional query parameters : id, subjectOnly
app.get('/message', function(req, res) {	
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}	
	
	var query = { recipient : insensitivize(user.playerid) };
	if (req.query.id) {
		query.id = req.query.id;
	}
	db.messages.get(
		query, 
		function(docs) {
			for (var i = 0; i < docs.length; i++) {
				if (req.query.subjectOnly) {
					delete docs[i].body;	
				}
			}
			_respondOk(res, toReturn);
		}
	);	
});

// post a new message
app.post('/message', function(req, res) {
	var origin = req.get('Origin');    
    if (origin && isTrustedDomain(origin)) {
    	res.set('Access-Control-Allow-Origin', origin);        
    }    
    var user = authorized(req, 'POST');
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}	
    if (!req.body.recipient || !req.body.sender) {
    	_respondError(res, 'Missing either recipient or sender.')
    }
    else {
    	var message = {
    		id : +new Date(),
    		sender : req.body.sender,
    		recipient : req.body.recipient,
    		recipientRead : false,
    		subject : req.body.subject,
    		body : req.body.body    		
    	};
    	db.messages.add(
    		message,
    		function(err, result) {
    			if (!err) {
    				_respondOk(res, 'Successfully sent message!');
    			} else {
    				_respondError(res, err);
    			}
    		}
    	)
    }
});

// transaction API - insert and update - for GET/POST 
app.get('/transact/:action/:collection', function(req, res) {
	transact(req, res, 'get');	
});

app.post('/transact/:action/:collection', function(req, res) {
    var origin = req.get('Origin');
    _debug(origin);
    if (origin && isTrustedDomain(origin)) {
    	res.set('Access-Control-Allow-Origin', origin);        
    }
	transact(req, res, 'post');	
});

// challenge, accept, or decline a battle with a friend
// action - challenge, accept, decline 
// challenge query - opponentid, mapid (optional)
// decline query - matchid, challengeid
// accept query - matchid, challengeid
app.get('/battle/:action', function(req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}
	var action = req.params.action;
	if (action == 'challenge') {
		var mapid = req.query.mapid;
		if (!mapid) { // find a random one
			var maps = [];
			for (var m in Maps) {
				maps.push(m);
			}	
			mapid = maps[Math.floor(Math.random() * maps.length)];
		}
		else { // make sure the mapid passed in is good
			if (!Maps[mapid]) {
				_respondError(res, 'mapid not found');
				return;
			}
		}		
		var opponentid = req.query.opponentid;
		if (!opponentid) {
			_respondError(res, 'opponent not given');
			return;
		}
		
		db.friends.get(
			{ playerid : insensitivize(user.playerid), friendid : insensitivize(opponentid) },
			function(docs) {
				if (docs && docs.length > 0) {
					var datenow = +new Date();
					var matchid = user.playerid + '_' + datenow;	
					var challengeid = opponentid + '_' + datenow;
					db.matches.add(
						{ 
							matchid : matchid, // the match request id 
							playerid : user.playerid, // the player requesting the match
							gameid : null,  // the game id that was matched, if any
							status : 'challenging', // status of this request: 'pending', 'ready', 'timeout'
							timerequested: datenow, // time this was requested
							rating:0, // rating of the player request (not implemented, but soon)
							mapid : mapid,
							challengeid : challengeid,
							opponentid : opponentid
						 },
						function(err, result) {
							if (!err) {
								//_respondOk(res, 'successfully challenged ' + opponentid);
								
								db.matches.add(
									{
										matchid : challengeid,  
										playerid : opponentid, 
										gameid : null,  
										status : 'challenged', 
										timerequested: datenow, 
										rating:0, 
										mapid : mapid,
										challengeid : matchid,
										opponentid : user.playerid
									},
									function(err2,result2) {
										if (!err2) {
											_respondOk(res, 'successfully challenged ' + opponentid);
										}
										else {
											_respondError(res, 'failed to challenge. try again.');
										}
									} // callback
								); // add opponent entry
							} else {
								_respondError(res, 'failed to challenge. try again.');
							}
						} // callback
					); // add user entry
				}
				else {
					_respondError(res, 'opponent is not your friend!');
					return;
				}
			}
		); // see if this opponent is my friend
	}
	else if (action == 'accept') {
		if (!req.query.matchid || !req.query.challengeid) {
			_respondError(res, 'matchid or challengeid is missing');
			return;
		}
		db.matches.get(
			{ matchid : req.query.matchid, challengeid : req.query.challengeid, status : 'challenged' },
			function(docs) {
				if (docs && docs.length > 0) {
					// should only be one
					var doc = docs[0];															
					
					db.matches.get(
						{ matchid : req.query.challengeid },
						function(cdocs) {
							var cdoc = cdocs[0];
							var opponentid = cdoc.playerid;
							var gameId = 'game_' + user.playerid + '_' + opponentid + '_' + (+new Date());
							
							db.matches.update(
								{ matchid : req.query.matchid },
								{ $set : { gameid : gameId, status : 'active'} }
							);
							db.matches.update(
								{ matchid : req.query.challengeid },
								{ $set : { gameid : gameId, status : 'active'} }
							);
							
							GameGenerator.generateGame(gameId, user.playerid, [user.playerid, opponentid], mapid, db, function (gameObj) {
							    db.games.add(
		                    	gameObj,
		                    	function (err2, result2) {
		                    	    if (!err2) {
		                    	        _respondOk(res, 'successfully accepted challenge');
		                    	    } else {
		                    	        _respondError(res, err);
		                    	    }
		                    	}
	                    	);
                            }); // gameid, turn, players
						}
					); // get the challenger match										                	                    
				}
				else {
					_respondError(res, 'challenge not found');
					return;
				}
			}
		);
	}
	else if (action == 'decline') {
		if (!req.query.matchid || !req.query.challengeid) {
			_respondError(res, 'matchid is missing');
			return;
		}
		db.matches.get(
			{ matchid : req.query.matchid, challengeid : req.query.challengeid, status : 'challenged' },
			function(docs) {
				if (docs && docs.length > 0) {
					// should only be one
					var doc = docs[0];					
					db.matches.remove({ matchid : doc.challengeid });
					db.matches.remove({ matchid : doc.matchid }, function(err, result) {
						_respondOk(res, 'successfully declined challenge!')
					});
				}
				else {
					_respondError(res, 'challenge not found');
					return;
				}
			}
		);
	}
	else {
		_respondError(res, 'action not valid');		
	}		
}); // battle service

// server generates a match id and returns it
// the match making service will later match games with other pending games
app.get('/matchmake', function(req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	}
		
	var datenow = +new Date();
	var matchid = user.playerid + '_' + datenow;	
		
	db['matches'].add(
		{ matchid : matchid, // the match request id 
		  playerid : user.playerid, // the player requesting the match
		  gameid : null,  // the game id that was matched, if any
		  status : 'pending', // status of this request: 'pending', 'ready', 'timeout'
		  timerequested: datenow, // time this was requested
		  rating:0 // rating of the player request (not implemented, but soon) 
		 }, 
		  
		  function(err, result) {
		  	if (err) {
		  		_respondError(res, 'match making failed. try again.');
		  	} else {
		  		_respondOk(res, {matchid: matchid});
		  	}		  	
		  } // callback
	);	
});

// helper method to all player's match metadata
// returns [{ matchid, gameid, status, turn, winner, lastupdate }]
app.get('/getmatches', function (req, res) {
	var user = authorized(req);
	if (!user) {		
		_respondError(res, 'unauthorized access');
		return;
	} else if (!req.query.playerid) {
		_respondError(res, 'missing playerid');
		return;
	}
	
	// find all matches for this player
	db.matches.getcollection().find({playerid: insensitivize(req.query.playerid)}).toArray(function(matcherr, matchdocs) {
		if (matchdocs) {
			if (matchdocs.length == 0) {
				_respondOk(res, matchdocs);
				return;
			}
			var returnDoc = [];
			var matchinfo = {}; // keep the game status around, gameid -> status		
			var gameids = [];
			for (var i = 0; i < matchdocs.length; i++) {
				if (matchdocs[i].gameid) {
					// active or retired
					gameids.push(matchdocs[i].gameid);
					matchinfo[matchdocs[i].gameid] = { matchid : matchdocs[i].matchid, status: matchdocs[i].status };
				} else if (matchdocs[i].status == 'pending') {
					// pending
					returnDoc.push({ 
						matchid : matchdocs[i].matchid, 
						gameid : null,
						opponent : null,
						status : 'pending',
						turn : null,
						winner : null
					});
				} else if (matchdocs[i].status == 'challenged' || matchdocs[i].status == 'challenging') {
					returnDoc.push({
						matchid : matchdocs[i].matchid, 
						gameid : null,
						status : matchdocs[i].status,
						turn : null,
						winner : null,
						mapid : matchdocs[i].mapid,
						challengeid : matchdocs[i].challengeid,
						opponent : matchdocs[i].opponentid						
					});
				}
			} // for i 
			
			var gameQuery = { gameid : { $in: gameids } };
			
			// find all active or retired games for this player
			db.games.getcollection().find(gameQuery).toArray(function(gameerr, gamedocs) {
				if (!gamedocs) {
					_respondError(res, 'could not obtain games.');
					return;
				}
								
				for (var j = 0; j < gamedocs.length; j++) {	
					var gamedoc = gamedocs[j];
					var opponent = null;
					for (var p in gamedoc.state) {
						if (p != req.query.playerid) {
							opponent = p;
							break;
						}
					} // for p					
					
					var match = { 
						matchid : matchinfo[gamedoc.gameid].matchid,
						gameid : gamedoc.gameid,
						opponent : opponent,
						status: matchinfo[gamedoc.gameid].status,
						turn : gamedoc.turn,
						winner : gamedoc.winner,
						mapid : gamedoc.mapid,
						lastupdate : gamedoc.lastupdate 
					};
					returnDoc.push(match); 
				} //j
				_respondOk(res, returnDoc);
				
			});			
		} else {
			_respondError(res, 'could not obtain matches.');
		}
	});
});

// adds currency for player
app.get('/addCurrency/:token', function(req, res) {
	// timestamp+playerid+currencytype+amount
	// TODO: implement
	// have a currencyTransactions table
	// check transaction for playerid
	// if i don't have a row, insert a new one with this transaction, update player's currency
	// if i do have a row
	// - check if the time stamp's > than row timestamp
	// - if it is, update row with this transaction, update player's currency
	// - if not, throw error
	_respondError(res, 'not implemented');
});

// marks a winner for the game
app.get('/end/:token', function(req, res) {
    // timestamp+action+gameid
    // action: 0=lose, 1=win  
    var user = authorized(req);
    if (!user) {
        _respondError(res, 'unauthorized access');
        return;
    }
    //var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
    //var token = RSA.decryptString(key, req.params.token);
    var token = req.params.token;
    token = token.split('+');
    if (token.length != 3) {
        _respondError(res, 'invalid token');
        return;
    }
    
    function updateWinner(winner) {
        db.players.update({ playerid : insensitivize(winner) }, { $inc : { wins : 1 } }, {}, function(err, result) { /*do nothing*/ });
        db.games.update({ gameid : token[2] }, { $set : { winner : winner } }, {}, function(err, result) {            
            _respondOk(res, {winner : winner});
        });
    } //updateWinner
    
    function updateLoser(loser) {
        db.players.update({ playerid : insensitivize(loser) }, { $inc : { losses : 1 } }, {}, function(err, result) {
            // do nothing            
        });
    } // updateLoser
    
    // make sure game doesn't already have a winner
    db.games.get({ gameid: token[2] }, function(docs) {
        if (docs && docs.length > 0 && docs[0].winner) {
            _respondError(res, 'game already has a winner: ' + docs[0].winner);
            return;
        } // already a winner!
        
        db.matches.getcollection().find({ gameid : token[2] }).toArray(function(err, matchdocs) {
            var winner = null;
            var loser = null;
            
            // finds the winner and the loser
            for (var i = 0; i < matchdocs.length; i++) {
                var matchdoc = matchdocs[i];                
                if (matchdoc.playerid.toUpperCase() == user.playerid.toUpperCase()) { // if the player in question is the user 
                    if (token[1] == '1') { // if the token given is a winner
                        winner = matchdoc.playerid; // mark this player as the winner
                    } else { // the token given is a loser
                        loser = matchdoc.playerid; // mark this player as a loser
                    }                    
                } else { // if the player in question is not the user
                    if (token[1] == '1') { 
                        loser = matchdoc.playerid;                        
                    } else {
                        winner = matchdoc.playerid;
                    }
                } 
            } //i
            
            updateLoser(loser); 
            updateWinner(winner);
        });            
    });        
});

// collect your winnings!
app.get('/collect/:token', function(req, res) {
    
    // timestamp+gameid
    var user = authorized(req);
    if (!user) {
        _respondError(res, 'unauthorized access');
        return;
    }
    //var key = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);
    //var token = RSA.decryptString(key, req.params.token);
    var token = req.params.token;
    token = token.split('+');
    if (token.length != 2) {
        _respondError(res, 'invalid token');
        return;
    }
    
    // ensure the game is active and has a winner
    db.matches.get({gameid:token[1], playerid: insensitivize(user.playerid) }, function(docs) {
        var matchdoc = docs[0];
        if (matchdoc.status != 'active') {
            _respondError(res, 'cannot collect on a non-active game.')
            return;
        }
        db.games.get({gameid:token[1]}, function(docs) {
            var gamedoc = docs[0];
            if (!gamedoc.winner) {
                _respondError(res, 'game does not have a winner.');
                return;
            }
            else {
                getScoresAndUpdate();
            }
        })
    });
    
    function getScoresAndUpdate() {    
        // get the game object
        // store winner
        // get the game summary for this player
        // append the mapid to playersummary
        // run playersummary against scorer
        // update player's tokens and xp
        // return to client
        db.games.get({ gameid : token[1] }, function(docs) {
            var gamedoc = docs[0];
            var gamesummary = gamedoc.summary;
            var playersummary = null;
            for (var p = 0; p < gamesummary.players.length; p++) {
                if (gamesummary.players[p].playerid.toUpperCase() == user.playerid.toUpperCase()) {
                    playersummary = gamesummary.players[p];
                    break;
                }            
            } // p
            playersummary.turns = gamedoc.state[user.playerid].turn;
            playersummary.mapid = gamedoc.mapid;
            playersummary.isWinner = false;
            playersummary.itemsUsed = []; // name of items used
            
            // apply winner bonus
            if (user.playerid == gamedoc.winner) { 
                playersummary.isWinner = true;
            }
            
            // TODO: apply item bonus        
            
            //_respondOk(res, GameScoring.generateScore(playersummary));
            var scoring = GameScoring.generateScore(playersummary);
            var incXP = scoring.preBonusTotal.xp + scoring.winBonus.xp + scoring.itemBonus.xp;
            //_debug(incXP);
            var incTokens = scoring.preBonusTotal.tokens + scoring.winBonus.tokens + scoring.itemBonus.tokens;
            //_debug(incTokens);
            db.players.update(
                { playerid: insensitivize(user.playerid) }, 
                { $inc : { experience : incXP, skulls : incTokens } }, 
                {}, 
                function(err, result) {
                    _respondOk(res, scoring);                
                }
            );                                
        });
        
        // get match with this game and playerid 
        // update to retired
        db.matches.update(
            { gameid : token[1], playerid : insensitivize(user.playerid) },
            { $set : { status : 'retired' } },
            {},
            function(err, result) {} 
        );
            
    }
});

app.get('/levelup', function(req, res) {
	//  level * 1000 + ((level - 1) * 1000) * M where M in (0.0, 1.0]
});

app.get('/purchaseunit/:unitType', purchaseUnit);

socketServer(io);

// returns an object { playerid, ip, logindate }
// TODO: run against session table
//       check playerid's session
//       if cookie.createddate < session.createddate, throw invalid session error
function authorized(req, method) {
	if (req.query['__adminkey'] == adminkey || (req.body && req.body['__adminkey'] == adminkey) ) {		
		return { logindate: 9999, playerid : ADMIN_PLAYERID, ip: ADMIN_IP };
	}
	
	var boc_session = null;
	
	if (!method || method.toUpperCase() == 'GET') {
	    boc_session = req.cookies['boc_session'] || req.query['$boc_session'];
	}
	else if (method.toUpperCase() == 'POST') {
	    boc_session = req.body.boc_session; 
    }
	
	if (boc_session) {
		var dcookie = RSA.decryptString(RSA_KEY_OBJ, boc_session);
		dcookie = dcookie.split('+');
		if (dcookie.length == 3) {
			return { logindate : dcookie[0], playerid : dcookie[1], ip: dcookie[2]};
		} 
	} 
	return null;
}

// generates a cookie
// timecreated+playername+ip -> RSA encoded
function generateSessionCookie(playername, playerip, timecreated) {
	var cookiestring = timecreated + '+' + playername + '+' + playerip;	
	cookiestring = RSA.encryptString(RSA_KEY_OBJ, cookiestring);	
	//_debug(cookiestring);
	return cookiestring;
}




// debug stuff to sdout
function _debug(msg) {
    if (!process.env.PRODUCTION) {
        console.log(msg);
    }
}

// standard error response
function _respondError(res, obj) {
    res.jsonp({ status : 'error', result : obj });
}

// standard ok response
function _respondOk(res, obj) {
    res.jsonp({ status : 'ok', result : obj });
}

// cheap password generator for new user creation
function generatePassword() {
    var length = 8,
        charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function insensitivize(str) {
	return new RegExp('^' + str + '$', 'i');
}

//app.listen(port);
server.listen(port);