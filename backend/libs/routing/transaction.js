// transaction API - insert and update - for GET/POST 
// 
// must be logged in
//
// if the key doesn't exist, will throw an error
// if any fields being updated doesn't exist, throw error
//
// 		transact/update/collection?query={ field1:'value', field2:'value'}&document={ field3:'newvalue' }
// 
// update in bulk
//
//		transact/update/collection?query[0]={}&document[0]={}&query[1]={}&document[1]={}
//
// pushing to an field that is an array
// if the field being pushed on does not exist, will throw an error
// 
//		transact/update/collection?query={}&document={ $push: { field:value1 } }
//
// to push in bulk
//
// 		transact/update/collection?query[0]={}&document[0]={}&...&query[0]={}&document[0]={}
//
// inserting a new record
// if a field doesn't match the schema, throw error
// 
//		transact/insert/collection?document={}
//
// to insert in bulk
//
//		transact/insert/collection?document[n]={}
//

function transact(req, res, method) {
    //_debug('transacting...');
    var user = req.bbq.authorized(req, method);
    if (!user) {
        res.bbq.respondError(res, 'not authorized');
        return;
    }
    if (!req.bbq.db[req.params.collection]) {
        res.bbq.respondError(res, 'no such collection ' + req.params.collection);
        return;
    }
    var kvps = method == 'post' ? req.body : req.query;
    var queryArr = null, docArr = null;
    try {

        if (kvps.query && kvps.query.constructor.toString().indexOf("Array()") < 0) {
            queryArr = [kvps.query];
        } else {
            queryArr = kvps.query;
        }

        if (kvps.document && kvps.document.constructor.toString().indexOf("Array()") < 0) {
            docArr = [kvps.document];
        } else {
            docArr = kvps.document;
        }

        var arr = queryArr ? queryArr : docArr;
        for (var i = 0; i < arr.length; i++) {
            var query = null, document = null;
            if (queryArr && queryArr[i]) {
                query = JSON.parse(queryArr[i]);
            }
            if (docArr && docArr[i]) {
                document = JSON.parse(docArr[i]);
            }

            if (queryArr) {
                queryArr[i] = query;
            }
            if (docArr) {
                docArr[i] = document;
            }
        }
    } catch (ex) {
        res.bbq.respondError(res, 'invalid values: ' + ex.message);
        return;
    }

    if (req.params.action == 'update') {
        transact_update(req.bbq.db, user, req.params.collection, queryArr, docArr, function (err, msg) {
            res.bbq.respondOk(res, msg);
        });
    }
    else if (req.params.action == 'insert') {
        transact_insert(req.bbq.db, user, req.params.collection, docArr, function (err, msg) {
            res.bbq.respondOk(res, msg);
        });
    }
    else {
        res.bbq.respondError(res, 'no such action ' + req.params.action);
    }
}

function transact_update(db, user, collection, queryArr, docArr, callback) {
    var msg = '';

    var numFinished = 0;
    function update(query, doc, index) {
        index++;
        var errmsg = db[collection].validateDocument(doc, user) || db[collection].validateQuery(query, user);
        if (!errmsg) {
            var docToUpdate = null;
            if (doc['$push'] || doc['$pushAll']) {
                docToUpdate = doc;
            } else {
                docToUpdate = { $set: doc };
            }
            db[collection].update(query, docToUpdate, { multi: true }, function (err, res) {
                numFinished++;
                if (numFinished == queryArr.length) {
                    if (callback) { callback(err, 'successfully updated ' + collection + msg); }
                } else {
                    if (doc['$push'] && doc['$push'].moves) {
                        _debug(index + '. pushed ' + doc['$push'].moves.command);
                    }
                    update(queryArr[index], docArr[index], index);
                }
            });
        } else {
            numFinished++;
            msg += (' skipping record ' + index + ' ' + errmsg);
            if (numFinished == queryArr.length) {
                if (callback) { callback(null, 'successfully updated ' + collection + msg); }
            } else {
                update(queryArr[index], docArr[index], index);
            }
        } // not a valid document    
    } // update

    update(queryArr[0], docArr[0], 0);

} // transact_update

function transact_insert(db, user, collection, docArr, callback) {
    var msg = '';

    var numFinished = 0;
    function insert(doc, rindex) {
        rindex++;        
        var errmsg = db[collection].validateDocument(doc, user);// || db[collection].validateQuery(query, user);
        if (!errmsg) {

            var newDoc = {}; // create a new record
            for (var f in db[collection].schema) {
                var val = null;
                if (doc[f]) { val = doc[f]; }
                newDoc[f] = val;
            }
            //_debug(newDoc);

            db[collection].add(newDoc, function (err, res) {
                numFinished++;
                if (numFinished == docArr.length) {
                    if (callback) { callback(err, 'successfully inserted into ' + collection + msg); }
                } else {
                    insert(numFinished[rindex], rindex)
                }
            });

        } else {
            numFinished++;
            msg += (' skipping record ' + rindex + ' ' + errmsg);
            if (numFinished == docArr.length) {
                if (callback) { callback(null, 'successfully inserted into ' + collection + msg); }
            } else {
                insert(numFinished[rindex], rindex)
            }
        } // not a valid document

    } // insert
    insert(docArr[0], 0);
} // transact_insert

module.exports.transact = transact;