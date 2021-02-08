/// <reference path="../core/utils.js" />
/// <reference path="units.js" />

var bbq = bbq || {};

bbq.UnitSet = function (team, unitTypes) {
    Array.call(this);

    var team_ = team;
    var selected_ = -1;

    this.team = function () {
        return team_;
    };

    this.selected_ = selected_;

    if (unitTypes) {
        for (var i = 0; i < unitTypes.length; i++) {
            this.push(unitTypes[i]);
        }
    }
};

boc.utils.inherits(bbq.UnitSet, Array);

(function (u) {
    u.prototype.select = function (nameOrIndex) {
        if (typeof (nameOrIndex) == 'number') {
            this.selected_ = nameOrIndex;
            if (this.selected_ < 0 || this.selected_ >= this.length) {
                throw new Error('index ' + this.selected_ + ' out of bounds');
            }
        }
        else {
            this.selected_ = this.indexOf(nameOrIndex);
            if (this.selected_ == -1) {
                throw new Error('unit type \'' + nameOrIndex + '\' not found');
            }
        }
    };

    u.prototype.selected = function () {
        return this.selected_;
    };

    u.prototype.info = function (index) {
        if (typeof (index) == 'undefined') {
            index = this.selected();
        }
        var unitinfo = bbq.units.configuration[this[index]];

        if (unitinfo.defaultImagePath) {
            unitinfo.defaultImagePath = unitinfo.defaultImagePath.replace(/\$\(team\)/g, this.team());
        }

        return unitinfo;
    };
})(bbq.UnitSet);