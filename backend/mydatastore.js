//setup mongodb stuff
var mongo = null;
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  console.log(env);
  //mongo = env['mongodb-2.0'][0]['credentials'];
  mongo = env['mongolab-n/a'][0]['credentials'];
}
else{
  mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db"
  }
}

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = mongo.uri || generate_mongo_url(mongo);
var db = null;
var pendingInits = [];

require('mongodb').connect(mongourl, function (err, dbObj) {
    db = dbObj;
    for (var i = 0; i < pendingInits.length; i++) {
        pendingInits[i]();
    }        
});

module.exports.DataStore = function(collectionName, onReadyCallback) {
		
	this.collectionName = collectionName ? collectionName : 'test';	
	this.collection = null;	
	
	var _this = this;	
	
	var init = function(dataStoreInstance) {
        db.collection(dataStoreInstance.collectionName, {}, function(err, coll) {
            if (coll) {
                console.log('retrieved collection ' + dataStoreInstance.collectionName);
                dataStoreInstance.collection = coll;                
            } else {                
                db.createCollection(_collectionName, {}, function(err, newColl) {
                    console.log('created collection ' + dataStoreInstance.collectionName);
                    dataStoreInstance.collection = newcoll;                    
                });
            }
        });            	
    }
    
    if (db) {
        init(this);
    } else {
        pendingInits.push(function() { init(_this); });
    }
        
	
	// should be overridden
	this.schema = {};	
	
	// can be overridden
	// validates the document to be transacted
	this.validateDocument = function(doc, user) {	    
		for (var f in doc) {
			if (f == '$push' || f == '$pushAll') {
			    var errmsg = this.validateDocument(doc[f]);
				if (!errmsg) {
					continue;
				} else {
					return errmsg;
				}
			}			
			if (!this.schema[f]) {
				return "field not found '"+ f +"'";
			}
			if (this.schema[f].internalWriteOnly) {
				return 'this field is not writable';
			}			
		}
		return null;
	}           
	
	this.validateQuery = function(query, user) {	    	    
	    return null;
	}

	
	this.add = function(doc, callback) {
		this.collection.insert(doc, {}, callback);
	}
	
	this.update = function(query, doc, options, callback) {
	    this.collection.update(query, doc, options, callback);
	}
	
	this.set = function(pkey, pvalue, callback) {	    
	    //console.log('setting key ' + pkey + ' as ' + pvalue);
		this.collection.update({ key : pkey }, { key : pkey, value : pvalue }, { upsert: true }, callback);		
	};	
	
	this.remove = function(pkey, callback) {
	    if (!pkey) {
	        this.collection.remove(null, {}, callback);
	    } else if (typeof pkey == 'string'){
	        this.collection.remove({key : pkey}, {}, callback);
		} else if (typeof pkey == 'object') {
			this.collection.remove(pkey, {}, callback);
		}
	}
	
	this.clear = function(callback) {		
		this.collection.remove(null, {}, callback);
	}
	
	this.get = function(pkey, callback) {
	    if (typeof pkey == 'string') {	     
    		this.collection.findOne({ key : pkey}, {}, function(err, doc) {
    		    var val = null;
    		    if (doc) { val = doc.value; }
    		    if (callback) { callback(val); }		       
    		});
		} else if (typeof pkey == 'object') {
			this.collection.find(pkey).toArray(function(err, docs) {
				if (callback) { callback(docs); }	
			}); 
		} else {
		    this.collection.find().toArray(function(err, docs) {
		        if (callback) { callback(docs); }		        
		    });
		}
	}
	
	this.getrandom = function(callback) {
	    this.collection.find().count(function(err, count) {
	        var num = Math.floor(Math.random() * count);
	        this.collection.find().limit(-1).skip(num).nextObject(function(err2, item) {
	            if (callback) { callback(item ? item.value : null); }
	        });	        
	    })	    
	   
	}
	
	this.getdistinct = function(field, query, callback) {
		this.collection.distinct(field, query, {}, callback);
	}
	
	this.getcollection = function() {
	    return this.collection;
	}		
};