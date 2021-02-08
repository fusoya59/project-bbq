var Maps = {
    MyMap : 'this is my map'
};

module.exports.getMaps = function () {
    var retObj = {};
    for (var i in Maps)
        retObj[i] = Maps[i];
    return retObj;
}

module.exports.fn = function () {
    console.log(Maps);
}