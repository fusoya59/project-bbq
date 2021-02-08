var RSA = require('./RSA').RSA;

var RSA_PUBLIC_KEY = '92c1dc2ef9f860e92c8f89ce945a4f3';
var RSA_PRIVATE_KEY = 'c35f26b8d8d30e33cc57eeec12f303b';
var RSA_MOD = '15347369bcfe3b41bca0778fe872f35f';
var RSA_KEY_OBJ = new RSA.RSAKeyPair(RSA_PUBLIC_KEY, RSA_PRIVATE_KEY, RSA_MOD);

var adminkey = 'BoC1234';
var ADMIN_PLAYERID = '__admin';
var ADMIN_IP = '127.0.0.1';

function insensitivize(str) {
    return new RegExp('^' + str + '$', 'i');
}


// debug stuff to sdout
function _debug(msg) {
    if (!process.env.PRODUCTION) {
        console.log(msg);
    }
}

// for CORS
var ACCEPTED_DOMAINS = [
    '^http://www.bagofchips.ca$',
    '^http://bagofchips.ca$',
    '^http://localhost(:\\d+)*$',
    '^http://127.0.0.1(:\\d+)*$',
    '^http://toptribe.mooo.com(:\\d+)*$',
    '^file://.*$'
];


function isTrustedDomain(origin) {
    if (!origin)
        return false;

    for (var i = 0; i < ACCEPTED_DOMAINS.length; i++) {
        var regex = new RegExp(ACCEPTED_DOMAINS[i]);
        if (regex.test(origin)) {
            return true;
        }
    }
    return false;
}

function decryptSession(boc_session) {
    if (boc_session) {
        var dcookie = RSA.decryptString(RSA_KEY_OBJ, boc_session);        
        dcookie = dcookie.split('+');
        if (dcookie.length == 3) {
            return { logindate: dcookie[0], playerid: dcookie[1], ip: dcookie[2] };
        }
    }
    return null;
}

module.exports.insensitivize = insensitivize;

module.exports.debug = _debug;
module.exports.isTrustedDomain = isTrustedDomain;
module.exports.decryptSession = decryptSession;
module.exports.RSA_PRIVATE_KEY = RSA_PRIVATE_KEY;
module.exports.RSA_PUBLIC_KEY = RSA_PUBLIC_KEY;
module.exports.RSA_MOD = RSA_MOD;
module.exports.RSA_KEY_OBJ = RSA_KEY_OBJ;
module.exports.ADMIN_IP = ADMIN_IP;
module.exports.ADMIN_PLAYERID = ADMIN_PLAYERID;
module.exports.ADMIN_KEY = adminkey;