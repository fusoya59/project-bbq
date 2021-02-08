var Maps = require('./testRequire2').getMaps();

require('./testRequire2').fn();

Maps.MyMap.newAttr = 'hi';
Maps.YourMap = 'appended!';

require('./testRequire2').fn();