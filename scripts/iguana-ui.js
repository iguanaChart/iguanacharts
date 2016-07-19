(function ()
{
    "use strict";

    iChart.ui = function (chart) {

        this.chart = chart;
        var _this = this;

        this.$topToolsBarContainer = this.chart.wrapper.find('.iChartToolsTop');

        this.render = function () {
            var chartOptionsUiTools = this.chart.viewData.chart.chartOptions.uiTools;
            if(chartOptionsUiTools.top) {
                this.renderTopBar();
            }
        };

        this.renderTopBar = function () {
            this.$topToolsBarContainer.empty();
            this.renderIndicators();
            this.renderOptionsList();
            this.renderInstrumentsList();
            this.$topToolsBarContainer.show();
        };

        /**
         *
         */
        this.renderIndicators = function () {
            var data = {
                indicators: Object.keys(iChart.indicators).map(function(k) { return iChart.indicators[k] }),
                userData: this.chart.deserializeIndicators(this.chart.dataSource.dataSettings.graphicIndicators)
            };

            var indicatorsDropdownHtml = $.render.indicatorsDropdownTmpl(data);

            this.$topToolsBarContainer.append(indicatorsDropdownHtml);

            $(this.chart.wrapper).off('click touchend', '.js-add-indicator').on('click touchend', '.js-add-indicator', function () {
                var ind = $(this).data('value');
                var params = {};
                iChart.indicators[ind].parameters.forEach(function(n){
                    params[n.Code] = n.Value
                });
                var indicators = _this.chart.deserializeIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                indicators.push({name: ind, params: params});
                _this.chart.dataSource.dataSettings.graphicIndicators = _this.chart.serializeIndicators(indicators);
                _this.chart.setIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                _this.renderIndicatorsCurrent();
            });


            $(this.chart.wrapper).off('click touchend', '.js-remove-indicator').on('click touchend', '.js-remove-indicator', function (e) {
                var ind = _this.chart.deserializeIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                ind.splice($(this).data('index'), 1);
                _this.chart.dataSource.dataSettings.graphicIndicators = _this.chart.serializeIndicators(ind);
                _this.chart.setIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                _this.renderIndicatorsCurrent();
                e.stopPropagation();
                e.preventDefault();
            });

            $(this.chart.wrapper).off('click touchend', '.js-edit-indicator').on('click touchend', '.js-edit-indicator', function (e) {
                var indicators = _this.chart.deserializeIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                var inx = $(this).data('index');

                var uis = $.extend({}, iChart.indicators[indicators[inx].name]);
                uis.parameters.forEach(function(n){
                    n.Value = indicators[inx].params[n.Code];
                });

                _this.renderIndicatorDialog(uis, inx);
            });
        };

        /**
         *
         */
        this.renderIndicatorsList = function () {
            var data = {
                indicators: Object.keys(iChart.indicators).map(function(k) { return iChart.indicators[k] }),
            };

            var indicatorsListHtml = $.render.indicatorsListTmpl(data);

            this.$topToolsBarContainer.find('.js-iChartTools-indicators-list').html(indicatorsListHtml);
        };

        /**
         *
         */
        this.renderIndicatorsCurrent = function () {
            var data = {
                userData: this.chart.deserializeIndicators(this.chart.dataSource.dataSettings.graphicIndicators)
            };

            var indicatorsCurrentHtml = $.render.indicatorsCurrentTmpl(data);

            this.$topToolsBarContainer.find('.js-iChartTools-indicators-current').html(indicatorsCurrentHtml);

        };

        /**
         *
         * @param data
         * @param index
         */
        this.renderIndicatorDialog = function (data, index) {
            if($.modal.impl.d.data) {
                $.modal.impl.close();
            }

            $('.iChartDialog').remove();
            var $indicatorDialogHtml = $($.render.indicatorDialogTmpl(data));

            var $colorContainer = $indicatorDialogHtml.find('.js-iChartTools-indicators-colorContainer');
            var $widthContainer = $indicatorDialogHtml.find('.js-iChartTools-indicators-widthContainer');
            var colorIndex = index;

            if(iChart.indicators[data.value]) {
                for (var i = 0; i < iChart.indicators[data.value].output; i++) {
                    if (typeof this.chart.viewData.chart != 'undefined') {

                        var color = this.chart.viewData.chart.chartOptions.indicatorColors[colorIndex][i];
                        if (this.chart.userSettings.chartSettings.indicatorsColor[data.value] &&
                            this.chart.userSettings.chartSettings.indicatorsColor[data.value][colorIndex] &&
                            this.chart.userSettings.chartSettings.indicatorsColor[data.value][colorIndex][i]
                        ) {
                            color = this.chart.userSettings.chartSettings.indicatorsColor[data.value][colorIndex][i];
                        }

                        $("<input/>", {
                                "type": "hidden",
                                "class": "iChart-indicator-color iChart-indicator-color-" + colorIndex + i,
                                "id": "iChart-indicator-color-" + colorIndex + i,
                                "indicator": data.value,
                                "colorIndex": colorIndex + "-" + i,
                                "ui-pos": (colorIndex < 2 ? "bottom" : "top")
                            }
                        ).val(color).appendTo($colorContainer);


                        this.chart.initInsrMinicolors($colorContainer.find(".iChart-indicator-color-" + colorIndex + i));

                        var width = 2;
                        if (this.chart.userSettings.chartSettings.indicatorsWidth[data.value] &&
                            this.chart.userSettings.chartSettings.indicatorsWidth[data.value][colorIndex] &&
                            this.chart.userSettings.chartSettings.indicatorsWidth[data.value][colorIndex][i]) {
                            width = this.chart.userSettings.chartSettings.indicatorsWidth[data.value][colorIndex][i];
                        }

                        var indicatorWidth = $('<span class="lineWidth indicatorWidthSelector-' + colorIndex + i + '" data-chartName="' + this.chart.name + '" data-style="' + width + '"></span>').appendTo($widthContainer);
                        $('<div class="indicatorMenuHolder-' + colorIndex + i + '" data-chartName="' + this.chart.name + '" style="display: none" widthIndex="' + colorIndex + "-" + i + '">' +
                            '<div widthIndex="' + colorIndex + "-" + i + '" indicator="' + data.value + '">' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="1"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="2"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="3"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="4"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="5"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="8"></span>' +
                            '<span class="lineWidth js-lineWidth ' + this.chart.name + '" data-style="10"></span>' +
                            '</div>' +
                            '</div>').appendTo($widthContainer);
                        this.chart.initIndicatorWidthMenu(indicatorWidth, $widthContainer.find(".indicatorMenuHolder-" + colorIndex + i + "[data-chartName='" + this.chart.name + "']").html());

                    }
                }
            }

            $(document).off('click touchend', '.js-set-params-indicator').on('click touchend', '.js-set-params-indicator', function (e) {
                var indicators = _this.chart.deserializeIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                var newParams = $('.js-iChartTools-indicators-params input').serializeArray();

                newParams.forEach(function(param){
                    indicators[index].params[param.name] = param.value;
                });

                indicators = _this.chart.serializeIndicators(indicators);
                _this.chart.setIndicators(indicators);
                $.modal.impl.close();
            });

            this.chart.wrapper.append($indicatorDialogHtml);
            $('.iChartDialog').modal({modal: false, zIndex: 1500, title: _t('', 'Настройки индикатора')});
        };

        this.renderThemeConfigDialog = function (additionButtons) {
            additionButtons = additionButtons || [];
            var $windowContent = $($.render.themeConfigTmpl());

            if(additionButtons) {

                var $additionButtonsContainer = $windowContent.find('.js-themeAdditionButtons');
                $additionButtonsContainer.empty();

                additionButtons.forEach(function(row){
                    var $button = $('<button/>', {class: 'uk-button ' + row.class, text: row.title});
                    $additionButtonsContainer.append($button);

                });
            }

            $windowContent.find('.js-themeConfigOptions').empty().append(this.renderThemeConfigOptions());
            $windowContent.find('.js-themeConfigSelector').empty().append(this.renderThemeConfigSelector());

            $windowContent.data("chartOptions", $.extend(true, {}, this.chart.wrapper.iguanaChart('chartOptions')));


            this.chart.wrapper.find('.js-themeConfig').remove();
            this.chart.wrapper.append($windowContent);

            var $themeConfig = this.chart.wrapper.find('.js-themeConfig');


            var onCloseModal = function() {
                _this.chart.wrapper.iguanaChart('chartOptions', $windowContent.data("chartOptions"));
                if($.modal.impl.d.data) {
                    $.modal.impl.close();
                }
            };

            $themeConfig.modal({
                modal: false,
                draggable: true,
                maxWidth: 600,
                zIndex: 1500,
                title: _t('13754', "Настройки вида"),
                onClose: onCloseModal
            });


            $themeConfig.on('click touchend','.js-chartOptions', function(){
                switch ($(this).attr('data-value')) {
                    case 'ok':
                        _this.chart.wrapper.trigger('iguanaChartEvents', ['hashChanged']);
                        _this.chart.userSettings.chartSettings.defaultTheme = 0;
                        if($.modal.impl.d.data) {
                            $.modal.impl.close(false);
                        }
                        break;
                    case 'cancel':
                        onCloseModal();
                        break;
                }
            });

            $themeConfig.on('click touchend', '.js-themeSelect', function(){
                _this.chart.wrapper.iguanaChart('setTheme', $(this).data('theme'));
                $windowContent.find('.js-themeConfigOptions').empty().append(_this.renderThemeConfigOptions());
                return false;
            });

            $themeConfig.on('click touchend', '.js-themeSaveAs', function(){

                UIkit.modal.prompt(_t('5228', "Название") + ':', '', function(title){
                    if(title) {
                        var data = {
                            name: title,
                            settings: iChart.Charting.ChartOptions.getThemeOptions(_this.chart.viewData.chart.chartOptions)
                        };

                        $iguanaChart.thems.push($.extend({custom: true}, data));
                        data = JSON.stringify(data);
                        _this.chart.wrapper.trigger('iguanaChartEvents', ['themeSave', data]);
                        $windowContent.find('.js-themeConfigSelector').empty().append(_this.renderThemeConfigSelector());
                    }
                });
                return false;
            });

            $themeConfig.on('click touchend', '.js-themeDelete', function(e){
                var name = $(this).data('name');
                var pos = $.grep($iguanaChart.thems, function(n, i){ return (n.name == name) ? (n.i = i) : null})[0];
                $iguanaChart.thems.splice(pos,1);
                $themeConfig.find('.js-themeSelect[data-theme="' + name + '"]').remove();
                _this.chart.wrapper.trigger('iguanaChartEvents', ['themeDelete', name]);
                e.stopPropagation();
                return false;
            });


            return $themeConfig;

        };

        this.renderThemeConfigSelector = function () {
            var $themeConfigSelector = $($.render.themeConfigSelectorTmpl({themes: $iguanaChart.thems}));
            return $themeConfigSelector;
        };


        this.renderThemeConfigOptions = function () {
            var $themeConfigOptions = $($.render.themeConfigOptionsTmpl({chartOptions: _this.chart.viewData.chart.chartOptions}));

            $themeConfigOptions.find('.js-widthSlector').each(function(){
                var $this = $(this),
                    menu = $this.find('.menuHolder').html();

                $this.qtip({
                    style: {
                        classes: 'qtip-light'
                    },
                    position: {
                        at: 'center right',
                        my: 'left center',
                        effect: false
                    },
                    content: {
                        text: menu
                    },
                    hide: {
                        fixed: true,
                        delay: 300,
                        effect: function() {
                            $(this).slideUp(500);
                        }
                    },
                    show: {
                        solo: true,
                        effect: function() {
                            $(this).slideDown(500);
                        }
                    },
                    events: {
                        show: function(event, api) {
                            $(this).find('.js-widthSlectorWrapper').each(function(){
                                var $wrapper = $(this);
                                $wrapper.off().on('click touchend', '.js-lineWidth', function(){
                                    var value = $(this).attr('data-style');
                                    _this.chart.wrapper.iguanaChart('chartOptions', $wrapper.attr('data-option'), value);
                                    $this.find('.js-widthSlectorValue').attr('data-style', value);
                                });
                            });
                        }
                    }
                });
            });

            var onMinicolorsChange = function(){
                var color = $(this).val(),
                    opacity = $(this).attr('data-opacity'),
                    colorRGBA = iChart.hexToRGB(color, opacity),
                    option = $(this).attr('data-option');

                _this.chart.wrapper.iguanaChart('chartOptions', option, colorRGBA);
                $(".js-colorSelector[data-option='" + option + "']").css({'background-color': colorRGBA});

                $(this).minicolors('value', color);
                $(this).minicolors('opacity', opacity);
            };

            var onPaletteChange = function() {
                var color = this.value,
                    colorRGBA = iChart.hexToRGB(color, 1),
                    option = this.element.attr('data-option');

                _this.chart.wrapper.iguanaChart('chartOptions', option, colorRGBA);
                $(".js-colorSelector[data-option='" + option + "']").css({'background-color': colorRGBA});

                this.element.parent().find('.js-colorPicker').minicolors('value', color);
            };

            $themeConfigOptions.find('.js-colorSelector').each(function(){

                var $this = $(this),
                    menu = $this.find('.menuHolder').html();

                $this.qtip({
                    style: {
                        classes: 'qtip-light'
                    },
                    position: {
                        at: 'center right',
                        my: 'left center',
                        effect: false,
                        viewport: $(window),
                        adjust: {
                            method: 'shift none'
                        }
                    },
                    content: {
                        //title: title,
                        text: menu
                    },
                    hide: {
                        fixed: true,
                        delay: 300
                    },
                    show: {
                        solo: true
                    },
                    events: {
                        show: function(event, api) {
                            $(event.currentTarget).find('.js-colorPicker').each(function(){
                                _this.addMinicolors(this, event.currentTarget, onMinicolorsChange, onPaletteChange);
                            });
                        }
                    }
                });
            });

            $themeConfigOptions.find('.js-checkbox').on('click touchend', '.js-flag', function(){
                _this.chart.wrapper.iguanaChart('chartOptions', $(this).attr('data-option'), $(this).prop('checked'));
            });

            return $themeConfigOptions;
        };


        this.initMinicolors = function (element, onMinicolorsChange) {

            onMinicolorsChange = typeof onMinicolorsChange == "function" ? onMinicolorsChange : function(){};

            var $input = $(element),
                opacityTrue = ($input.first().attr('data-opacity'))?true:false,
                opacity = $input.first().attr('data-opacity'),
                color = $input.first().val();

            $(element).minicolors({
                animationSpeed: 50,
                animationEasing: 'swing',
                change: null,
                changeDelay: 0,
                control: 'hue',
                defaultValue: color,
                hide: null,
                hideSpeed: 100,
                inline: true,
                letterCase: 'lowercase',
                opacity: true,
                position: 'bottom left',
                show: null,
                showSpeed: 100,
                theme: 'default'
            }).change(onMinicolorsChange);
            if(color.match(/^rgb.*/)) {
                opacity = iChart.rgbaGetAlfa(color);
                color = iChart.rgbToHex(color);
            }
            $(element).minicolors('value', color);
            $(element).minicolors('opacity', opacity);

        };

        this.initColorPalette = function (holder, onPaletteChange) {
            onPaletteChange = typeof onPaletteChange == "function" ? onPaletteChange : function(){};
            $(holder).find('.js-colorPalette').each( function() {
                if($(this).data("palette") == undefined) {
                    $(this).palette({
                        palette: "basic",
                        columns: 2,
                        size: 13,
                        change: onPaletteChange
                    });
                }
             });
        };

        this.addMinicolors = function (element, holder, onMinicolorsChange, onPaletteChange) {
            if($(element).hasClass('minicolors-input')) {
                var color = $(element).val();
                var opacity = $(element).attr('data-opacity');
                if(color.match(/^rgb.*/)) {
                    opacity = iChart.rgbaGetAlfa(color);
                    color = iChart.rgbToHex(color);
                }
                $(element).minicolors('value', color);
                $(element).minicolors('opacity', opacity);
                return;
            }
            this.initMinicolors(element, onMinicolorsChange);
            this.initColorPalette(holder, onPaletteChange);
        };


        this.renderOptionsList = function () {

            var chartOptions = this.chart.viewData.chart.chartOptions;

            var options = {
                chartType: chartOptions.chartType,
                percentMode: chartOptions.percentMode,
                showVolume: chartOptions.showVolume,
                showVolumeByPrice: chartOptions.showVolumeByPrice
            };

            var $optionsHtml = $($.render.iChart_optionsTmpl(options));

            $optionsHtml.on('click touchend', '.js-iChartTools-themeDialog', function(){
                _this.renderThemeConfigDialog();
            }).on('click touchend', '.js-iChartTools-chartType', function(){
                var $this = $(this);
                $optionsHtml.find('.js-iChartTools-chartType i').removeClass('uk-icon-circle').addClass('uk-icon-circle-o');
                $this.find('i').addClass('uk-icon-circle');
                _this.chart.viewData.chart.setChartType($this.data("value"));
            }).on('click touchend', '.js-iChartTools-percentMode', function(){
                if(_this.chart.percentMode_onClick()) {
                    $optionsHtml.find('.js-iChartTools-percentMode i').removeClass('uk-icon-toggle-off').addClass('uk-icon-toggle-on');
                } else {
                    $optionsHtml.find('.js-iChartTools-percentMode i').removeClass('uk-icon-toggle-on').addClass('uk-icon-toggle-off');
                }
            }).on('click touchend', '.js-iChartTools-volumeByPrice', function(){
                _this.chart.VolumeByPrice_onClick();
                if(_this.chart.viewData.chart.chartOptions.showVolumeByPrice) {
                    $optionsHtml.find('.js-iChartTools-volumeByPrice i').removeClass('uk-icon-toggle-off').addClass('uk-icon-toggle-on');
                } else {
                    $optionsHtml.find('.js-iChartTools-volumeByPrice i').removeClass('uk-icon-toggle-on').addClass('uk-icon-toggle-off');
                }
            }).on('click touchend', '.js-iChartTools-volumeByDate', function(){
                _this.chart.VolumeByDate_onClick();
                var showVolume = _this.chart.viewData.chart.chartOptions.showVolume;
                if(showVolume == "inside" || showVolume == "outside") {
                    $optionsHtml.find('.js-iChartTools-volumeByDate i').removeClass('uk-icon-toggle-off').addClass('uk-icon-toggle-on');
                } else {
                    $optionsHtml.find('.js-iChartTools-volumeByDate i').removeClass('uk-icon-toggle-on').addClass('uk-icon-toggle-off');
                }
            });



            this.$topToolsBarContainer.append($optionsHtml);

        };


        this.renderInstrumentsList = function () {
            var $instrumentsHtml = $($.render.iChart_instrumentsTmpl());

            var onMinicolorsChange = function(){
                var color = $(this).val(),
                    opacity = $(this).attr('data-opacity'),
                    colorRGBA = iChart.hexToRGB(color, opacity),
                    option = $(this).attr('data-option');

                _this.chart.userSettings.chartSettings.contextSettings[option] = colorRGBA;

                $(".js-colorSelector[data-option='" + option + "']").css({'background-color': colorRGBA});

                $(this).minicolors('value', color);
                $(this).minicolors('opacity', opacity);
                _this.chart.setStyleToCanvas(colorRGBA, option);
            };
            var onPaletteChange = function(){
                var color = this.value,
                    colorRGBA = iChart.hexToRGB(color, 1),
                    option = this.element.attr('data-option');

                _this.chart.userSettings.chartSettings.contextSettings[option] = colorRGBA;
                $(".js-colorSelector[data-option='" + option + "']").css({'background-color': colorRGBA});
                this.element.parent().find('.js-colorPicker').minicolors('value', color);
                _this.chart.setStyleToCanvas(colorRGBA, option);
            };

            $instrumentsHtml.find('.js-colorSelector[data-option="strokeStyle"]').css('background-color', _this.chart.userSettings.chartSettings.contextSettings.strokeStyle);
            if(_this.chart.userSettings.chartSettings.contextSettings.strokeStyle) {
                $instrumentsHtml.find('.js-colorPicker[data-option="strokeStyle"]').val(_this.chart.userSettings.chartSettings.contextSettings.strokeStyle);
            }
            $instrumentsHtml.find('.js-colorSelector[data-option="fillStyle"]').css('background-color', _this.chart.userSettings.chartSettings.contextSettings.fillStyle);
            if(_this.chart.userSettings.chartSettings.contextSettings.fillStyle) {
                $instrumentsHtml.find('.js-colorPicker[data-option="fillStyle"]').val(_this.chart.userSettings.chartSettings.contextSettings.fillStyle);
            }
            $instrumentsHtml.find('.js-colorSelector[data-option="fontSettingsColor"]').css('background-color', _this.chart.userSettings.chartSettings.fontSettings.color);
            if(_this.chart.userSettings.chartSettings.fontSettings.color) {
                $instrumentsHtml.find('.js-colorPicker[data-option="fontSettingsColor"]').val(_this.chart.userSettings.chartSettings.fontSettings.color);
            }
            //if(iguanaChart.userSettings.chartSettings.fontSettings.size) {
            //    $('#fontSettingsSize').val(iguanaChart.userSettings.chartSettings.fontSettings.size);
            //}



            $instrumentsHtml.find('.js-colorSelector').each(function(){

                var $this = $(this),
                    menu = $this.find('.menuHolder').html();

                $this.qtip({
                    style: {
                        classes: 'qtip-light'
                    },
                    position: {
                        at: 'center right',
                        my: 'left top',
                        effect: false,
                        viewport: $instrumentsHtml,
                        adjust: {
                            method: 'shift none'
                        }
                    },
                    content: {
                        title: $this.data('title'),
                        text: menu
                    },
                    hide: {
                        fixed: true,
                        delay: 300
                    },
                    show: {
                        solo: true
                    },
                    events: {
                        show: function(event, api) {
                            $(event.currentTarget).find('.js-colorPicker').each(function(){
                                _this.addMinicolors(this, event.currentTarget, onMinicolorsChange, onPaletteChange);
                            });
                        }
                    }
                });
            });

            $instrumentsHtml.find('.js-lineWidthSelector').each(function(){

                var $this = $(this),
                    menu = $this.find('.menuHolder').html();

                $this.qtip({
                    style: {
                        classes: 'qtip-light'
                    },
                    position: {
                        at: 'center right',
                        my: 'left top',
                        effect: false,
                        viewport: $instrumentsHtml,
                        adjust: {
                            method: 'shift none'
                        }
                    },
                    content: {
                        title: $this.data('title'),
                        text: menu
                    },
                    hide: {
                        fixed: true,
                        delay: 300
                    },
                    show: {
                        solo: true
                    },
                    events: {
                        show: function(event, api) {
                            $(event.currentTarget).find('[data-option="fontSettingsColor"]').each(function(){
                                var $wrapper = $(this);
                                $wrapper.off().on('click touchend', function(){
                                    var value = $(this).attr('data-style'),
                                        option = $(this).data('option');
                                    $(".js-lineWidthSelector[data-option='" + option + "'] .js-currentLineWidth").attr('data-style', value);
                                    _this.chart.setLineWidthToCanvas(value);
                                });
                            });

                        }
                    }
                });
            });

            $instrumentsHtml.on('click touchend', '.js-iChartTools-instrument', function(){
                var $this = $(this);

                var settings = {
                    fillStyle: _this.chart.userSettings.chartSettings.contextSettings.fillStyle,
                    strokeStyle: _this.chart.userSettings.chartSettings.contextSettings.strokeStyle
                };

                _this.chart.wrapper.iguanaChart("toolStart", $this.data("instrument"), settings);
            }).on('click touchend', '.js-iChartTools-removeInstrument', function(){
                _this.chart.removeAllInstruments_onClick();
            });

            this.$topToolsBarContainer.append($instrumentsHtml);
        };

    };
})();