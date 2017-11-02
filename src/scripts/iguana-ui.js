(function ()
{
    "use strict";

    /**
     * @param {IguanaChart} chart
     */

    iChart.ui = function (chart) {

        this.chart = chart;
        var _this = this;

        this.$uiContainer = this.chart.wrapper;
        this.$topToolBarContainer = this.chart.wrapper.find('.iChartToolsTop');

        this.render = function () {
            var chartOptionsUiTools = this.chart.viewData.chart.chartOptions.uiTools;
            if(chartOptionsUiTools.top) {
                this.renderTopBar();
            }
            this.bindUiControls();
        };

        this.renderTopBar = function () {
            this.$topToolBarContainer.empty();
            //this.renderIndicators();
            this.renderTopToolBar();
            this.$topToolBarContainer.show();
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

            //this.$topToolBarContainer.append(indicatorsDropdownHtml);
            this.chart.wrapper.find('.js-chart-ui-indicators').append(indicatorsDropdownHtml);

            $(this.chart.wrapper).off('click', '.js-add-indicator').on('click', '.js-add-indicator', function () {
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


            $(this.chart.wrapper).off('click', '.js-remove-indicator').on('click', '.js-remove-indicator', function (e) {
                var ind = _this.chart.deserializeIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                ind.splice($(this).data('index'), 1);
                _this.chart.dataSource.dataSettings.graphicIndicators = _this.chart.serializeIndicators(ind);
                _this.chart.setIndicators(_this.chart.dataSource.dataSettings.graphicIndicators);
                _this.renderIndicatorsCurrent();
                e.stopPropagation();
                e.preventDefault();
            });

            $(this.chart.wrapper).off('click', '.js-edit-indicator').on('click', '.js-edit-indicator', function (e) {
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

            this.$topToolBarContainer.find('.js-iChartTools-indicators-list').html(indicatorsListHtml);
        };

        /**
         *
         */
        this.renderIndicatorsCurrent = function () {
            var data = {
                userData: this.chart.deserializeIndicators(this.chart.dataSource.dataSettings.graphicIndicators)
            };

            var indicatorsCurrentHtml = $.render.indicatorsCurrentTmpl(data);

            this.$topToolBarContainer.find('.js-iChartTools-indicators-current').html(indicatorsCurrentHtml);

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

            $(document).off('click', '.js-set-params-indicator').on('click', '.js-set-params-indicator', function (e) {
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
            $('.iChartDialog').modal({modal: false, zIndex: 1500, title: _t('17398', 'Настройки индикатора')});
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
                _this.setUiStateForThemeConfig(false);
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


            $themeConfig.on('click','.js-chartOptions', function(){
                switch ($(this).attr('data-value')) {
                    case 'ok':
                        _this.chart.wrapper.trigger('iguanaChartEvents', ['hashChanged']);
                        _this.chart.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', iChart.Charting.ChartOptions.getThemeOptions(_this.chart.viewData.chart.chartOptions)]);
                        _this.chart.userSettings.chartSettings.defaultTheme = 0;
                        _this.setUiStateForThemeConfig(false);
                        if($.modal.impl.d.data) {
                            $.modal.impl.close(false);
                        }
                        break;
                    case 'cancel':
                        onCloseModal();
                        break;
                }
            });

            $themeConfig.on('click', '.js-themeSelect', function(){
                _this.chart.wrapper.iguanaChart('setTheme', $(this).data('theme'));
                $windowContent.find('.js-themeConfigOptions').empty().append(_this.renderThemeConfigOptions());
                return false;
            });

            $themeConfig.on('click', '.js-themeSaveAs', function(){

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

            $themeConfig.on('click', '.js-themeDelete', function(e){
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
                                $wrapper.off().on('click', '.js-lineWidth', function(){
                                    var value = $(this).attr('data-style');
                                    _this.chart.wrapper.iguanaChart('chartOptions', $wrapper.attr('data-option'), value);
                                    $this.find('.js-widthSlectorValue').attr('data-style', value);
                                });
                            });
                        }
                    }
                });
            });

            var onMinicolorsChange = function(value, opacity){
                var color = $(this).val(),
                    colorRGBA = color,
                    option = $(this).attr('data-option');

                if(!color.match(/^rgb.*/)) {
                    colorRGBA = iChart.hexToRGB(color, opacity)
                }

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

            $themeConfigOptions.find('.js-checkbox').on('click', '.js-flag', function(){
                _this.chart.wrapper.iguanaChart('chartOptions', $(this).attr('data-option'), $(this).prop('checked'));
            });

            return $themeConfigOptions;
        };


        this.initMinicolors = function (element, onMinicolorsChange) {

            onMinicolorsChange = typeof onMinicolorsChange == "function" ? onMinicolorsChange : function(){};

            var $input = $(element);
            var opacityTrue = ($input.first().attr('data-opacity'))?true:false;
            var opacity = $input.first().attr('data-opacity');
            var color = $input.first().val();
            color = color ? color : 'rgba(82, 175, 201, 0.5)';

            $(element).minicolors({
                animationSpeed: 50,
                animationEasing: 'swing',
                change: onMinicolorsChange,
                changeDelay: 0,
                control: 'hue',
                defaultValue: color,
                hide: null,
                hideSpeed: 100,
                inline: true,
                letterCase: 'lowercase',
                opacity: opacityTrue,
                position: 'bottom left',
                show: null,
                showSpeed: 100,
                theme: 'default'
            });
            $(element).minicolors('value', color);
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
                $(element).minicolors('value', color);
                return;
            }
            this.initMinicolors(element, onMinicolorsChange);
            this.initColorPalette(holder, onPaletteChange);
        };

/* ================================================================================================================== */
        
        this.renderTopToolBar = function () {
            var $topToolBarHtml = $($.render.iChart_topToolBarTmpl());

            this.$topToolBarContainer.append($topToolBarHtml);
            this.renderIndicators();
        };

        /**
         * init states control elements
         */
        this.initStatesControls = function () {
            var type = this.chart.viewData.chart.chartOptions.chartType;
            this.setUiStateForChartType(type);

            var state = !!this.chart.viewData.chart.chartOptions.showVolumeByPrice;
            this.setUiStateForShowVolumeByPrice(state);

            var state = _this.chart.viewData.chart.chartOptions.showVolume;
            this.setUiStateForShowVolume(state);

            var state = _this.chart.viewData.chart.chartOptions.percentMode;
            this.setUiStateForPercentMode(state);

            this.setUiStateForDataInterval(_this.chart.dataSource.dataSettings.interval);
        };

        this.bindUiControls = function () {
            this.$uiContainer.off('click', '.js-chart-ui-control').on('click', '.js-chart-ui-control', function (e) {
                var $this = $(this);

                var property  = $this.data('property');
                var value = $this.data('value');

                var method = 'uiSet_' + property;

                if(typeof _this[method] === 'function') {
                    _this[method](value);
                }
            });

            this.$uiContainer.on('show.uk.dropdown', '.js-chart-ui-control[data-property="fillStyle"]', function(){
                var $this = $(this);
                $(this).find('.js-colorPicker').each(function(){
                    _this.addMinicolors(this, $this.find('.js-chart-ui-control-holder'), _this.onMinicolorsChange, _this.onPaletteChange);
                });
            });

            this.$uiContainer.on('show.uk.dropdown', '.js-chart-ui-control[data-property="strokeStyle"]', function(){
                var $this = $(this);
                $(this).find('.js-colorPicker').each(function(){
                    _this.addMinicolors(this, $this.find('.js-chart-ui-control-holder'), _this.onMinicolorsChange, _this.onPaletteChange);
                });
            });

        };

        this.uiSet_chartType = function (value) {
            this.chart.viewData.chart.setChartType(value);
            this.setUiStateForChartType(value);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', {"chartType" : value}]);
        };

        this.uiSet_showVolumeByPrice = function (value) {
            this.chart.VolumeByPrice_onClick();
            var state = !!this.chart.viewData.chart.chartOptions.showVolumeByPrice;
            this.setUiStateForShowVolumeByPrice(state);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', {"showVolumeByPrice" : state}]);
        };

        this.uiSet_showVolume = function (value) {
            this.chart.VolumeByDate_onClick();
            var state = _this.chart.viewData.chart.chartOptions.showVolume;
            this.setUiStateForShowVolume(state);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', {"showVolume" : state}]);
        };

        this.uiSet_percentMode = function (value) {
            var percentMode = this.chart.percentMode_onClick();
            this.setUiStateForPercentMode(percentMode);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', {"percentMode" : percentMode}]);
        };

        this.uiSet_themeConfig = function () {

            if($.modal.impl.d.data) {
                $.modal.impl.close();
                this.setUiStateForThemeConfig(false);
            } else {
                this.renderThemeConfigDialog();
                this.setUiStateForThemeConfig(true);
            }
        };

        this.uiSet_instrumentLine = function (value) {
            var settings = $.extend({}, this.chart.userSettings.chartSettings.contextSettings, this.chart.viewData.chart.chartOptions.elementStyle[value]);

            this.chart.wrapper.iguanaChart("toolStart", value, settings);
            this.setUiStateForInstrumentLine(value, 1);
            this.onSelectInstrument({settings: settings});
        };

        this.uiSet_instrumentForm = function (value) {
            var settings = $.extend({}, this.chart.userSettings.chartSettings.contextSettings, this.chart.viewData.chart.chartOptions.elementStyle[value]);

            this.chart.wrapper.iguanaChart("toolStart", value, settings);
            this.setUiStateForInstrumentForm(value, 1);
            this.onSelectInstrument({settings: settings});
        };

        this.uiSet_instrumentText = function (value) {
            var settings = $.extend({}, this.chart.userSettings.chartSettings.contextSettings, this.chart.viewData.chart.chartOptions.elementStyle[value]);

            this.chart.wrapper.iguanaChart("toolStart", value, settings);
            this.setUiStateForInstrumentText(value, 1);
            this.onSelectInstrument({settings: settings});
        };

        this.uiSet_clearInstruments = function () {
            this.chart.removeAllInstruments_onClick();
        };

        this.uiSet_lineWidthSelector = function (value) {
            this.chart.setLineWidthToCanvas(value);
            this.setUiStateForLineWidth(value);
        };

        this.uiSet_dataInterval = function (value) {
            this.chart.setInterval(value);
            this.setUiStateForDataInterval(value);
        };

        this.uiSet_captureImage = function () {
            var dataImage = this.chart.viewData.chart.toBase64('image/png');

            if($.modal.impl.d.data) {
                $.modal.impl.close();
            }

            $('.iChartDialog').remove();
            var $captureDialogTmpl = $($.render.captureDialogTmpl());

            $captureDialogTmpl.find('.js-iChartTools-capture').attr('src', 'data:image/png;base64, ' + dataImage);

            this.chart.wrapper.append($captureDialogTmpl);

            var width = $captureDialogTmpl.find('.js-iChartTools-capture').get(0).width;
            $('.iChartDialog').modal({modal: false, zIndex: 1500, maxWidth: width, title: _t('1724', 'Скачать картинку')});
        };

        this.onMinicolorsChange = function(value, opacity){
            var color = $(this).val(),
                colorRGBA = color,
                option = $(this).attr('data-option');

            if(!color.match(/^rgb.*/)) {
                colorRGBA = iChart.hexToRGB(color, opacity)
            }

            _this.chart.userSettings.chartSettings.contextSettings[option] = colorRGBA;
            _this.setUiStateForColorSelector(option, colorRGBA);

            $(this).minicolors('value', colorRGBA);
            _this.chart.setStyleToCanvas(colorRGBA, option);
        };

        this.onPaletteChange = function(){
            var color = this.value;
            var option = this.element.attr('data-option');
            var colorRGBA = color;

            if(!color.match(/^rgb.*/)) {
                colorRGBA = iChart.hexToRGB(color, 1);
            }

            _this.chart.userSettings.chartSettings.contextSettings[option] = colorRGBA;
            _this.setUiStateForColorSelector(option, colorRGBA);
            this.element.parent().find('.js-colorPicker').minicolors('value', colorRGBA);
            _this.chart.setStyleToCanvas(colorRGBA, option);
        };



// =====================================================================================================================
// Processing ui elements

        this.setUiStateForChartType = function (type, uiClass) {

            if(!!type) {
                uiClass = this.getUiStateForChartType(type);
            }

            this.$uiContainer.find('.js-chart-ui-control-state[data-property="chartType"]')
                .removeClass('sprite-icon-line sprite-icon-candle sprite-icon-bars')
                .addClass(uiClass);
        };

        this.getUiStateForChartType = function (type) {
            var uiClass = 'sprite-icon-line';

            switch (type) {
                case 'Candlestick':
                    uiClass = 'sprite-icon-candle';
                    break;
                case 'Stock':
                    uiClass = 'sprite-icon-bars';
                    break;
                case 'Line':
                    uiClass = 'sprite-icon-line';
                    break;
            }

            return uiClass;
        };

        this.setUiStateForShowVolumeByPrice = function (state) {
            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="showVolumeByPrice"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="showVolumeByPrice"]').removeClass('active');
            }
        };

        this.setUiStateForShowVolume = function (state) {
            if(state == "inside" || state == "outside") {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="showVolume"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="showVolume"]').removeClass('active');
            }
        };

        this.setUiStateForPercentMode = function (state) {
            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="percentMode"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="percentMode"]').removeClass('active');
            }
        };

        this.setUiStateForThemeConfig = function (state) {
            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="themeConfig"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="themeConfig"]').removeClass('active');
            }
        };

        this.setUiStateForLineWidth = function (width) {
            this.$uiContainer.find('.js-chart-ui-control-state[data-property="lineWidthSelector"]')
                .removeClass('sprite-icon-1px sprite-icon-2px sprite-icon-3px sprite-icon-4px sprite-icon-5px sprite-icon-8px sprite-icon-10px')
                .addClass('sprite-icon-' + width + 'px');
        };

        this.setUiStateForColorSelector = function (option, colorRGBA) {
            if(!colorRGBA.match(/^rgb.*/)) {
                colorRGBA = iChart.hexToRGB(colorRGBA, 1);
            }

            this.$uiContainer.find('.js-chart-ui-control-state[data-property="' + option + '"]').css({'background-color': colorRGBA});
            this.$uiContainer.find('.js-chart-ui-control[data-property="' + option + '"] .js-colorPicker').val(colorRGBA);
        };

        this.setUiStateForInstrumentLine = function (instrument, state) {
            state = !!state;

            var uiClass = '';

            switch (instrument) {
                case 'Line':
                    uiClass = 'sprite-icon-free-line';
                    break;
                case 'HorizontalLine':
                    uiClass = 'sprite-icon-h-line';
                    break;
                case 'VerticalLine':
                    uiClass = 'sprite-icon-v-line';
                    break;
                case 'Channel':
                    uiClass = 'sprite-icon-channel';
                    break;
                case 'Trend':
                    uiClass = 'sprite-icon-angle-trend';
                    break;
                case 'Arrow':
                    uiClass = 'sprite-icon-arrow-line';
                    break;
            }

            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentLine"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentLine"]').removeClass('active');
            }

            if(!!instrument) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentLine"] i.sprite')
                    .removeClass('sprite-icon-free-line sprite-icon-h-line sprite-icon-v-line sprite-icon-channel sprite-icon-angle-trend sprite-icon-arrow-line')
                    .addClass(uiClass);
            }
        };

        this.setUiStateForInstrumentForm = function (instrument, state) {
            state = !!state;

            var uiClass = '';

            switch (instrument) {
                case 'Polygon':
                    uiClass = 'sprite-icon-f-poligon';
                    break;
                case 'Rectangle':
                    uiClass = 'sprite-icon-f-square';
                    break;
                case 'Triangle':
                    uiClass = 'sprite-icon-f-triangle';
                    break;
                case 'Ellipse':
                    uiClass = 'sprite-icon-f-ellipse';
                    break;
                case 'FibonacciArc':
                    uiClass = 'sprite-icon-f-fibonacci-arcs';
                    break;
                case 'FibonacciFan':
                    uiClass = 'sprite-icon-f-fibonacci-fan';
                    break;
                case 'FibonacciCorrection':
                    uiClass = 'sprite-icon-f-fibonacci-correction';
                    break;
                case 'HorizontalRange':
                    uiClass = 'sprite-icon-h-line-double';
                    break;
            }

            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentForm"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentForm"]').removeClass('active');
            }

            if(!!instrument) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentForm"] i.sprite')
                    .removeClass('sprite-icon-f-poligon sprite-icon-f-square sprite-icon-f-triangle')
                    .removeClass('sprite-icon-f-ellipse sprite-icon-f-fibonacci-arcs sprite-icon-f-fibonacci-fan sprite-icon-f-fibonacci-correction')
                    .addClass(uiClass);
            }
        };

        this.setUiStateForInstrumentText = function (instrument, state) {
            state = !!state;

            if(state) {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentText"][data-value="' + instrument + '"]').addClass('active');
            } else {
                this.$uiContainer.find('.js-chart-ui-control-state[data-property="instrumentText"]').removeClass('active');
            }
        };

        this.onSelectInstrument = function (element) {
            if(element.settings) {
                if(element.settings.lineWidth) {
                    this.setUiStateForLineWidth(element.settings.lineWidth);
                }

                if(element.settings.fillStyle) {
                    this.setUiStateForColorSelector('fillStyle', element.settings.fillStyle);
                }

                if(element.settings.strokeStyle) {
                    this.setUiStateForColorSelector('strokeStyle', element.settings.strokeStyle);
                }
            }
        };

        this.setUiStateForDataInterval = function (value) {
            this.$uiContainer.find('.js-chart-ui-control[data-property="dataInterval"]').removeClass('active');
            if(!!value) {
                this.$uiContainer.find('.js-chart-ui-control[data-property="dataInterval"][data-value="' + value + '"]').addClass('active');
            }

        };


    };
})();