ns('bbq.scenes');
bbq.scenes.HtmlTribeMemberSelect = function (user, id) {
    bbq.scenes.TribeMemberSelect.call(this, user);
    this.id = function () { return id; }

    var _this = this;

    $('#' + id + ' a[href="mainMenu2.html"]').attr('href', '#').click(function () {
        _this.emit('back');
    });
    $('#' + id + ' #btnContinue').attr('href', '#').click(function () {
        _this.emit('done');
    });

    $('#' + id + ' .imageSquareUnlocked').click(function () {
        _this.emit('loadout', { loadout: this._loadout });
    });

    $('#' + this.id() + ' #unitInfoClose').click(function () {
        hideWindow(1);
    });

    this.refresh(user);
};
boc.utils.inherits(bbq.scenes.HtmlTribeMemberSelect, bbq.scenes.TribeMemberSelect);
(function (c) {
    // class: btnUnitFirst, btnUnitLast
    var unlockedHtml = '<div class="unitContainer"> <div class="unitBg loadoutSlot"> <img class="unitImage" /> <div class="unitPriceBg"> <div class="vAlign center"> <span class="unitPriceSmall">Unlocked!</span></div></div></div></div>';

    var lockedHtml = '<div class="unitContainer"> <div class="unitBg loadoutSlot"> <img class="unitImage" /> <div class="unitPriceBg"> <div class="vAlign"> <img class="unitPriceIcon icon$currency" /></div><div class="vAlign"> <span class="unitPriceValue">$price</span></div></div></div></div>';
	
	var infoHtml = '<div class="unitInfo center"> <div class="unitNameBg"> <span>$displayName</span> </div> <!-- unitNameBg --> <div class="unitDesc"> $description </div> <!-- unitDesc --> <div class="unitPriceBg"> <div class="vAlign"> <div class="trainButton center buttonContainer button buttonBlue"> <div class="content"> <span id="actionButton" class="labelLarge btnWord"> $btnLabel </span> </div> <!-- content --> </div> <!-- buttonContainer --> </div> <!-- vAlign --> </div> <!-- unitPriceBg --> </div> <!-- unitInfo -->'


    c.prototype.refresh = function (user) {
        var _this = this;
        if (this.footer_) {
            this.footer_.user(user);
            this.footer_.refresh();
        }
        var units = bbq.units.configuration.unlockableUnits;
        var spinePaths = [];
        for (var u = 0; u < units.length; u++) {
            spinePaths.push(bbq.units.configuration[units[u]].spinePath);
        }

        $('#' + this.id() + ' #unitContainer').empty();

        var panelsAdded = 0;
        if (user.unlockedUnits) {
            for (var i = 0; i < user.unlockedUnits.length; i++) {
                if (!bbq.units.configuration[user.unlockedUnits[i]]) {
                    continue;
                }
                //var html = unlockedHtml.replace(/\$unitType/g, user.unlockedUnits[i])
                //                       .replace('$currency', bbq.units.configuration[user.unlockedUnits[i]].unlock.currency)
                //                       .replace('$price', bbq.units.configuration[user.unlockedUnits[i]].unlock.price);
                
				var html = unlockedHtml;
				debugger;
				var $panel = $(html);
                if (panelsAdded == 0) {
                    $panel.addClass('btnUnitFirst');
                }
                $panel.find('.btnSquareInfo').click(function () {
                    _this.emit('unitInfo', { unitType: $(this).attr("unitType") });
                });

                $panel.find('.imageSquareUnlocked').click(function () {
                    _this.emit('unit', { unitType: $(this).attr('unitType') });
                });

                $('#' + _this.id() + ' #unitContainer').append($panel);
                panelsAdded++;
				
				var $unit = user.unlockedUnits[i]; 
				console.log($unit);
				
				$panel.attr('id', $unit);
				
                $panel.click(function (e) {
 					$('#' + _this.id() + ' .unitContainerExpand').removeClass('unitContainerExpand');
 					$('#' + _this.id() + ' .unitInfo').remove();
					var target = e.currentTarget;
					
					target.classList.add('unitContainerExpand');

					var targetUnit = target.id;
					
					var infoHtmlParse = infoHtml.replace(/\$displayName/g, bbq.units.configuration[targetUnit].displayName).replace(/\$description/g, bbq.units.configuration[targetUnit].description).replace(/\$btnLabel/g, 'Choose');

					var $infoHtml = $(infoHtmlParse);
										
					$infoHtml.prependTo(target);
					$(target).find("#actionButton").click(function () {
					    _this._loadout = target.id;
					    _this.emit('done', { selected: bbq.units.configuration[targetUnit].displayName });
					})

										
                });
            }
        }

        for (var i = 0; i < units.length; i++) {
            var unitType = units[i];
            if (user.unlockedUnits && user.unlockedUnits.indexOf(unitType) >= 0) {
                continue;
            }
            var html = lockedHtml.replace(/\$unitType/g, unitType)
                                 .replace('$currency', bbq.units.configuration[unitType].unlock.currency)
                                 .replace('$price', bbq.units.configuration[unitType].unlock.price);
            var $panel = $(html);
            if (panelsAdded == 0) {
                $panel.addClass('btnUnitFirst');
            }
            $panel.find('.btnSquareInfo').click(function () {
                _this.emit('unitInfo', { unitType: $(this).attr("unitType") });
            });

			$panel.attr('id', unitType);
			
            $('#' + this.id() + ' #unitContainer').append($panel);
            panelsAdded++;

			$panel.click(function (e) {
				/*
				$('#' + _this.id() + ' .imageSquareSelected')
					.removeClass('imageSquareSelected')
					.addClass('imageSquareUnlocked');
				$unitBtn.find('.imageSquareUnlocked')
					.removeClass('imageSquareUnlocked')
					.addClass('imageSquareSelected');
				unitSet.select(_i);
				*/
				
				
				$('#' + _this.id() + ' .unitContainerExpand').removeClass('unitContainerExpand');
				
				var target = e.currentTarget;
				
				target.classList.add('unitContainerExpand');
				targetUnit = target.id;

				var infoHtmlParse = infoHtml.replace(/\$displayName/g, bbq.units.configuration[targetUnit].displayName).replace(/\$description/g,bbq.units.configuration[targetUnit].description).replace(/\$btnLabel/g, 'Purchase');

				
				var $infoHtml = $(infoHtmlParse);
				$(target).find('.unitInfo').remove();
				$infoHtml.prependTo(target);
									
				//$panel.addClass('unitContainerExpand');
				$infoHtml.find(".trainButton").click(function() {
					_this.emit('trainok', { selected : _this._selected });
				});
				
				$(target).find("#actionButton").click(function () {
					_this.emit('unitPurchase', { unitType: target.id });
				});
				//target.find('#actionButton').click(function () {
					//_this.emit('unitPurchase', { unitType: target.id });
				//});
			});
        }
		/*
        if ($panel) {
            $panel.addClass('btnUnitLast');
        }
		*/

        boc.spine.loadSpineAssets(
            spinePaths,
            {
                teams: ['blue', 'red'],
                onload: function (assets) {
                    boc.spine.SkeletonManager.load(assets);
                    for (var i = 0; i < units.length; i++) {
                        var img = boc.resources.GraphicsManager.getImage(units[i] + '_blue');
                        if (!img) {
                            var canvas = document.createElement('canvas');
                            canvas.width = 100;
                            canvas.height = 100;
                            var context = canvas.getContext('2d');
                            var skele = boc.spine.SkeletonManager.createSkeleton(units[i].toLowerCase() + '_blue', { x: 50, y: -50 });
                            skele.setSkinByName('defaultSkin');
                            skele.setSlotsToSetupPose();
                            boc.spine.renderSkeleton(skele, context);
                            img = document.createElement('img');
                            img.width = 100;
                            img.height = 100;
                            img.src = canvas.toDataURL();
                            boc.resources.GraphicsManager.addImage(units[i] + '_blue', img);
                        }
                     
					    $('#' + _this.id() + ' #' + units[i]).find('img').attr('src', img.src);
                    }
                }
            }
        );
    };
    c.prototype.loadout = function (unitTypes) {
        if (arguments && arguments.length == 0) {
			return this._loadout;
        }
        else {
            this._loadout = unitTypes;
            if (unitTypes) {
                for (var i = 0; i < unitTypes.length; i++) {
                    var img = document.createElement('img');
                    img.width = 100;
                    img.height = 100;
                    img.src = $('#' + unitTypes[i] + ' img').attr('src');
                    $('#' + this.id() + ' .loadoutSlot').removeClass('iconPlaceholder')
                        .empty().append(img);
                }
            }
            else {
                $('#' + this.id() + ' .loadoutSlot').empty().addClass('iconPlaceholder');
            }
        }
    };

    c.prototype.showUnitInfoWindow = function (unitType) {
        var $unitWindow = $('#' + this.id() + ' #unitInfoWindow');
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
        showWindow('#' + this.id() + ' #unitInfoWindow');
    };
    c.prototype.footer = function (htmlFooter) {
        if (typeof (htmlFooter) != 'undefined') {
            $('#' + this.id() + ' #footer').html(htmlFooter);
            this.footer_ = new bbq.scenes.HtmlFooter(this.user(), this.id() + ' #footer');
        }
        return this.footer_;
    };
})(bbq.scenes.HtmlTribeMemberSelect);