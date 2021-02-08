ns('bbq.scenes');

bbq.scenes.HtmlUnitInfoWindow = function (unitType, id) {
    bbq.scenes.Scene.call(this, unitType);
    var $unitWindow = $('#' + id + ' #unitInfoWindow');
    var unitImage = boc.resources.GraphicsManager.getImage(unitType + '_blue');
    var newImage = document.createElement('img');
    newImage.src = unitImage.src;
    $unitWindow.find('.windowTitle').html('<h1>' + bbq.units.configuration[unitType].displayName + '</h1>');
    $unitWindow.find('.btnUnitImage').empty().append(newImage);
    $unitWindow.find('.unitInfoStatHealth .unitInfoStatValue').text(bbq.units.configuration[unitType].health);
    $unitWindow.find('.unitInfoStatAttack .unitInfoStatValue').text(bbq.units.configuration[unitType].attackDamage);
    $unitWindow.find('.unitInfoStatRange .unitInfoStatValue').text(bbq.units.configuration[unitType].attackMinRange + ' - ' + bbq.units.configuration[unitType].attackMaxRange);
    $unitWindow.find('.unitInfoStatFood .unitInfoStatValue').text(bbq.units.configuration[unitType].foodCost);
    $unitWindow.find('.unitInfoStatVision .unitInfoStatValue').text(bbq.units.configuration[unitType].visionRange);
    $unitWindow.find('.unitInfoStatMovement .unitInfoStatValue').text(bbq.units.configuration[unitType].moveRange);
    $unitWindow.find('.unitInfoDesc').text(bbq.units.configuration[unitType].description);
    $('#' + id + ' #unitInfoClose').click(function () {
        hideWindow(1, function () {
            $('#' + id).remove();
        });
    });
    showWindow('#' + id + ' #unitInfoWindow');

};
boc.utils.inherits(bbq.scenes.HtmlUnitInfoWindow, bbq.scenes.UnitInfoWindow);