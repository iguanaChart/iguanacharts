IguanaChart = function (options) {

    "use strict";

    var _this = this;

    this.name = options.name || 'chart';

    this.container = options.container || '#iChart-chart-container';

    this.wrapper = options.wrapper;

    this.lib_path = options.lib_path || "/iguanachart/";

    this.toQueryString = function (params)
    {
        ///	<summary>
        ///	Converts the specified associative array to HTTP query string (starting '?' is omitted).
        ///	</summary>
        ///	<returns type="String" />

        var paramStrings = [];
        for (var key in params)
        {
            var value = params[key];
            if (typeof value === "undefined" || value === "")
            {
                continue;
            }

            if ($.isArray(value))
            {
                for (var i = 0; i < value.length; ++i)
                {
                    paramStrings.push(encodeURIComponent(key) + "=" + encodeURIComponent(value[i]));
                }
            }
            else
            {
                paramStrings.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            }
        }

        return paramStrings.join("&");
    };

    this.dataSource = new iChart.Charting.ChartDataSource(this, options.dataSource);

    this.userSettings = {
        chartSettings: {
            contextSettings: {
                fillStyle: 'rgba(82,175,201,.2)',
                strokeStyle: 'rgba(82,175,201,1)',
                lineWidth: 1,
                fontFamaly: 'Arial,Helvetica,sans-serif',
                fontColor: '#444444',
                fontSize: '14'
            },
            indicatorsColor: {},
            indicatorsWidth: {},

            showTransactionsMode: 0,
            tradingToolsEnable: 1,
            autochartistEnable: 0,
            showVolume: "inside",
            showVolumeByPrice: false,
            defaultTheme: 1
        },
        currentSecurity: {
            id: '',
            short_name: '',
            default_ticker: '',
            nt_ticker: '',
            firstDate: '',
            currency: '',
            min_step: ''
        }
    };

    this.viewData = {};
    this.viewData.indicators = iChart.indicators;

    this.timers = {};
    this.ajaxDataRequest = null;
    this.orders = {};
    this.userTransactionAmount = -1;
    this.updateUnlocked = true;

    this.initChart = function (settings)
    {
        /// <summary>
        /// Initializes the chart.
        /// </summary>

        this.uiGraphIndicatorsWindow2 = {element : $(this.wrapper).find(".js-chartTADialog." + this.name)};

        this.loadHash();

        if(typeof settings != "object") {
            settings = {};
        }

        this.settings = {};
        this.settings.paddingBottom      = typeof settings.paddingBottom != "undefined" ? settings.paddingBottom : 50;

        if(typeof this.viewData.chart == "undefined") {

            var chartOptions = {

                onPostRender: function () {
                    _this.checkDateInterval(new Date(this.areas[0].xSeries[this.areas[0].viewport.x.bounded.min] * 1000), new Date(this.areas[0].xSeries[this.areas[0].viewport.x.bounded.max] * 1000));
                    $('#chartLoading').remove();
                    _this.wrapper.trigger('iguanaChartEvents', ['RenderChartSuccess']);
                },
                onCreateAreas: this.chart_onCreateAreas,
                onDataSettingsChange: this.chart_onDataSettingsChange,
                onIntervalChange: this.chart_onIntervalChange,
                contextmenuCallback: settings.contextmenuCallback,

                "container": $(this.container).get(0),

                "dataSettings": this.getChartDataUserSettings(),

                "widget": settings.widget,
                "env": this
            };

            chartOptions = $.extend(true, chartOptions, settings);

            this.viewData.chart = new iChart.Charting.Chart(chartOptions);
            this.TA = new iChart.Charting.TA({chart: this.viewData.chart});
            this.viewData.chart.setDataSettings(this.dataSource.dataSettings);
            this.ui = new iChart.ui(this);
            this.dataRequestCounter = 0;
        } else {
            this.viewData.chart.chartOptions = $.extend(true, this.viewData.chart.chartOptions, settings);
            this.viewData.chart.overlay.deserialize(iChart.parseQueryString((this.dataSource.dataSettings.hash|| "#").substr(1)));
            this.viewData.chart.setDataSettings(this.getChartDataUserSettings());
            this.dataRequestCounter = 0;
        }

        this.ui.render();

        $(window).off('mousemove').on('mousemove', function(e){
            $(window).data('mousePosX', e.pageX);
            $(window).data('mousePosY', e.pageY);
        });

    };

    this.chart_dataAdapter = function (data, params) {
        var chartData = {
            "d": {
                "xSeries": [],
                "ySeries": [],
                "success": true,
                "warnings": [],
                "message": ''
            }
        };

        var hloc = {
            "chartType": "Column",
            "enabled": true,
            "formatProvider": {
                "decimalPlaces": "2",
                "decimalPrecision": null
            },
            "indicatorIndex": null,
            "indicatorIndex2": null,
            "kind": "HLOC",
            "name": params.id,
            "overlay": false,
            "points": [],
            "valuesPerPoint": 4
        };

        var volume = {
            "chartType": "Column",
            "enabled": true,
            "formatProvider": {
                "decimalPlaces": null,
                "decimalPrecision": null
            },
            "indicatorIndex": null,
            "indicatorIndex2": null,
            "kind": "Volume",
            "name": params.id + " - V",
            "overlay": false,
            "points": [],
            "valuesPerPoint": 1
        };

        if(data.hloc) {
            var tickers = Object.keys(data.hloc);

            if(tickers.length == 1) {
                chartData.d.ySeries[0] = $.extend(true,{},hloc);
                chartData.d.ySeries[1] = $.extend(true,{},volume);
                chartData.d.ySeries[0].name = tickers[0];

                for (var i = 0; i < data.xSeries[tickers[0]].length; i++) {
                    //chartData.d.xSeries.push(+(data.xSeries[tickers[0]][i]));
                    chartData.d.xSeries.push(+(data.xSeries[tickers[0]][i]) + getTimeOffsetServer(tzOffsetMoscow));
                    chartData.d.ySeries[0].points.push(data.hloc[tickers[0]][i]);
                    chartData.d.ySeries[1].points.push([data.vl[tickers[0]][i]]);
                }

            } else if (tickers.length > 1) {
                // При сравнении нескольких бумаг
                //Нормализация по времени
                var x = {}
                for (var j = 0; j < tickers.length; j++) {
                    for (var i = 0; i < data.xSeries[tickers[j]].length; i++) {
                        if(typeof x[data.xSeries[tickers[j]][i]] == "undefined") {
                            x[data.xSeries[tickers[j]][i]] = {}
                        }
                        x[data.xSeries[tickers[j]][i]][tickers[j]] = data.hloc[tickers[j]][i];
                    }
                }

                for (var j = 0; j < tickers.length; j++) {
                    chartData.d.ySeries[j] = $.extend(true,{},hloc);
                    chartData.d.ySeries[j].name = tickers[j];
                }
                //Распределение котировок
                for(var tmstmp in x) {
                    chartData.d.xSeries.push(+(tmstmp) + getTimeOffsetServer(tzOffsetMoscow));

                    for (var j = 0; j < tickers.length; j++) {
                        if(typeof x[tmstmp][tickers[j]] == "undefined") {
                            chartData.d.ySeries[j].points.push([null, null, null, null]);
                        } else {
                            chartData.d.ySeries[j].points.push(x[tmstmp][tickers[j]]);
                        }
                    }
                }
            }
        }
        return chartData;
    };

    this.chart_onCreateAreas = function () {};

    this.chart_onDataSettingsChange = function (bySchedule)
    {
        /// <summary>
        /// Called when the chart data settings change.
        /// </summary>

        var documentHash = _this.dataSource.dataSettings.useHash == false ? (_this.dataSource.dataSettings.hash || '#') : document.location.hash;
        var params = iChart.parseQueryString(documentHash.substr(1));
        var drawParams = _this.getDrawParams(params);

        delete _this.viewData.chart._dataSettings.hash;
        var hash = "#" + iChart.toQueryString($.extend(_this.viewData.chart._dataSettings, drawParams));

        _this.viewData.hash = hash;
        if(_this.dataSource.dataSettings.useHash == false) {
            if(_this.dataSource.dataSettings.hash != hash) {
                _this.dataSource.dataSettings.hash = hash;
                $(this.container).trigger('iguanaChartEvents', ['hashChanged', hash]);
            }
        } else {
            if(document.location.hash != hash) {
                document.location.hash = hash;
                $(this.container).trigger('iguanaChartEvents', ['hashChanged', hash]);
            }
        }
    };

    /**
     *
     * @param params
     * @returns {{}}
     */
    this.getDrawParams = function (params) {
        var drawParams = {};

        for (var paramKey in params) {
            if (paramKey.match(/^L$/) || paramKey.match((/^L[0-9]{1,2}_/))) {
                drawParams[paramKey] = params[paramKey];
            }
        }

        return drawParams;
    };

    this.chart_onIntervalChange = function (chart)
    {
        /// <summary>
        /// Called when the date/time interval of the visible viewport changes.
        /// </summary>
        if(_this.viewData.chart) {
            _this.viewData.chart.updateVolumeByPrice();
        }
    };

    this.toggleVolumeByPrice_onClick = function ()
    {
        this.viewData.chart.chartOptions.showVolumeByPrice = !this.viewData.chart.chartOptions.showVolumeByPrice;

        if (this.viewData.chart && this.viewData.chart.areas)
        {
            var volumeArea = $.grep(this.viewData.chart.areas, function (x) { return x.name === "ChartArea2"; })[0];
            if (volumeArea)
            {
                this.viewData.chart.updateVolumeByPrice();
                volumeArea.enabled = this.viewData.chart.chartOptions.showVolumeByPrice;
            }

            // Redraw the chart using new settings.
            this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    this.VolumeByPrice_onClick = function (state)
    {

        _this.viewData.chart.chartOptions.showVolumeByPrice = typeof state != "undefined" ? state : !_this.viewData.chart.chartOptions.showVolumeByPrice;

        if (_this.viewData.chart && _this.viewData.chart.areas)
        {
            var volumeArea = $.grep(_this.viewData.chart.areas, function (x) { return x.name === "VolumeByPriceArea"; })[0];
            if (volumeArea)
            {
                _this.viewData.chart.updateVolumeByPrice();
            }
            // Redraw the chart using new settings.
            _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    this.VolumeByDate_onClick = function (state)
    {
        if(state === true || state === false) {
            _this.viewData.chart.chartOptions.showVolume = state ? "inside" : "hidden";
        } else {
            _this.viewData.chart.chartOptions.showVolume = (state == "inside" || state == "outside") ? state :
            _this.viewData.chart.chartOptions.showVolume === "inside" || _this.viewData.chart.chartOptions.showVolume === "outside" ? "hidden" : "inside";
        }

        if (_this.viewData.chart && _this.viewData.chart.areas)
        {
            var volumeArea = $.grep(_this.viewData.chart.areas, function (x) { return x.name === "ChartArea2"; })[0];
            if (volumeArea)
            {
                volumeArea.enabled = _this.viewData.chart.chartOptions.showVolume === "inside" || _this.viewData.chart.chartOptions.showVolume === "outside";
            }
            // Redraw the chart using new settings.
            _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    /**********************************************************/
    this.apply_onClick = function () {
        _this.update();
    };
    this.chartType_onChange = function () {
        /// <summary>
        /// Called when selected chart type value changes.
        /// </summary>
        var chartType = $(this).val();
        if (_this.viewData.chart) {
            _this.viewData.chart.setChartType(chartType);
            _this.chartType_elementControl(chartType);
        }
        _this.setHashValue("type", chartType);
        _this.viewData.chart.setChartType(chartType);
    };

    this.chartType_elementControl = function (chartType) {
        $('div.chartType').removeClass('active');
        $('div.chartType div.isMenu').hide();
        $('div[value="'+chartType+'"]').addClass('active');
        $('div[value="'+chartType+'"] div.isMenu').show();
    };

    this.clearIndicators_onClick = function () {
        /// <summary>
        /// Removes all technical analysis indicators from the chart.
        /// </summary>
        for (var i = 0; i < 30; ++i) {
            $("[name='i" + i + "']").val("").trigger("change");
            _this.updateIndicatorDetails("i" + i, false);
        }
        if (_this.viewData.chart) {
            _this.viewData.chart.clearIndicators();
        }
    };

    this.getChartDataUserSettings = function () {
        /// <summary>
        /// Gets current chart parameters from the user settings.
        /// </summary>
        var params = {};
        params["id"] = this.dataSource.dataSettings.id;
        params.date_from = this.dataSource.dataSettings.date_from;
        params.date_to = this.dataSource.dataSettings.date_to;
        params.start = this.dataSource.dataSettings.date_from;
        params.end = this.dataSource.dataSettings.date_to;
        params.interval = this.dataSource.dataSettings.interval;
        params.timeframe = iChart.getChartTimeframe(this.dataSource.dataSettings.interval);
        params["type"] = this.dataSource.dataSettings.type;
        params["compareIds"] = this.dataSource.dataSettings.compareIds;
        params["compareTickets"] = this.dataSource.dataSettings.compareTickets;
        params["compareStocks"] = this.dataSource.dataSettings.compareStocks;
        //var p = $('[name=form_info_settings]').serializeArray();
        //for (var i = 0; i < p.length; i++) {
        //    params[p[i].name] = p[i].value;
        //}
        //$.extend(params, iChart.parseQueryString(localStorage.userSettingsGraphicIndicators));
        $.extend(params, iChart.parseQueryString(this.dataSource.dataSettings.graphicIndicators));
        return params;
    };

    this.getMinChartHeight = function ()
    {
        var container = $(this.container);
        if (container.length != 0) {
            return $(window).height() - container.offset().top - (this.settings && this.settings.paddingBottom ? this.settings.paddingBottom : 0);
        }
        return $(window).height();
    };

    this.indicator_onChange = function () {
        _this.updateIndicatorDetails($(this).attr('name').substr(1), {name: $(this).val()});
    };

    this.loadHash = function (bySchedule) {
        /// <summary>
        /// Updates form values based on the current page hash.
        /// </summary>
        var defaultIndicators = $("[name=graphicIndicators]").val();

        var hash = (this.dataSource.dataSettings.hash || ("#" + defaultIndicators) || "#&i0=SMA&i0_Period=10&i1=PSAR&i1_Acceleration=0.02&i1_Maximum=0.2");

        var params = iChart.parseQueryString(hash.substr(1));

        if(typeof this.viewData.chart !== 'undefined') {
            var graphicIndicators = iChart.parseQueryString(localStorage.userSettingsGraphicIndicators);
            if(typeof graphicIndicators == "object" && !$.isEmptyObject(graphicIndicators)) {
                $.extend(params, graphicIndicators);
            }
        }

        return params;
    };

    this.pan_onClick = function () {
        if (_this.viewData.chart) {
            _this.viewData.chart.pan($(this).attr("data-direction"));
        }
    };
    this.timeframe_onChange = function () {
        this.update();
    };
    this.removeSelectedInstrument_onClick = function () {
        if (_this.viewData.chart.overlay) {
            _this.viewData.chart.overlay.removeSelected();
        }
        return false;
    };
    this.removeAllInstruments_onClick = function () {
        if (_this.viewData.chart.overlay) {
            _this.viewData.chart.overlay.clear();
        }
        $(".m-chart-instrument-delete, .m-chart-instrument-settings").hide();
        return false;
    };
    this.resetZoom_onClick = function () {
        if (_this.viewData.chart) {
            _this.viewData.chart.resetZoom();
        }
    };
    this.update = function () {
        /// <summary>
        /// Forces a full chart data update.
        /// </summary>
        var dataSettings = this.getChartDataUserSettings();
        if (this.dataSource.dataSettings.useHash != false) {
            this.setHashValues(dataSettings);
        }
        if (this.viewData.chart) {
            this.viewData.chart.setDataSettings(dataSettings);
        }

    };
    this.updateForce = function () {
        var dataSettings = this.getChartDataUserSettings();
        if (this.dataSource.dataSettings.useHash != false) {
            this.setHashValues(dataSettings);
        }
        if (this.viewData.chart) {
            this.viewData.chart.setDataSettings(dataSettings, true);
        }
    };
    this.updateChart_onClick = function () {
        this.update();
    };

    this.removeIndicator_onClick = function () {
        $(this).parents('.js-chart-indiacator-block').remove();
    };

    this.addIndicator_onClick = function () {
        if(_this.uiGraphIndicatorsWindow2.element.is(':visible')) {
            var indicators = _this.deserializeIndicators(_this.uiGraphIndicatorsWindow2.element.find(':input').serialize(), false);
            _this.updateIndicatorDetails(indicators.length, '');
        }
    };

    this.serializeIndicators = function (indicators) {
        var query = '';
        for(var i=0; i<indicators.length; i++) {
            query += "i" + i + "=" + indicators[i].name + "&";

            if(indicators[i].params) {
                for(var paramKey in indicators[i].params) {
                    query += "i" + i + "_" + paramKey + "=" + indicators[i].params[paramKey] + "&";
                }
            }
        }
        return query;
    };

    this.deserializeIndicators = function (query, resetKey) {
        resetKey = typeof resetKey != "undefined" ? !!resetKey : true;
        var params = iChart.parseQueryString(query);
        var indicators = [];
        for (var paramKey in params)
        {
            if (paramKey === "fs" || paramKey.match(new RegExp("^i[0-9]+", "i")))
            {
                var regsIndParams = paramKey.match(new RegExp("^i([0-9])+_", "i"));
                var regsInd = paramKey.match(new RegExp("^i([0-9])+$", "i"));
                if (regsInd) {
                    if(!indicators[+regsInd[1]]) {
                        indicators[+regsInd[1]] = {};
                    }
                    indicators[+regsInd[1]].name = params[paramKey];
                } else if(regsIndParams) {
                    if(!indicators[+regsIndParams[1]]) {
                        indicators[+regsIndParams[1]] = {};
                    }
                    if(!indicators[+regsIndParams[1]].params) {
                        indicators[+regsIndParams[1]].params = {};
                    }
                    indicators[+regsIndParams[1]].params[paramKey.replace(/i[0-9]+_/i, '')] = +(params[paramKey]);
                }
            }
        }

        if(resetKey) {
            indicators = indicators.filter(function (n) {
                return n != undefined
            });
        }
        return indicators;
    };

    this.updateIndicatorDetails = function (id, indicator, updateChart) {

        updateChart = !!updateChart;

        var $root = this.uiGraphIndicatorsWindow2.element.find(".js-chartTADialog-i" + id + "-settings");

        if(!$root.length) {
            var indicatorOptions = '<option value="">'+  _t('14773', 'Выберите индикатор') +'</option>';

            for(var key in this.viewData.indicators) {
                if(this.viewData.indicators[key].type == "TA_LIB") {
                    indicatorOptions += '<option value="' + key + '" ' + ((key == indicator.name) ? 'selected' : '') + '>' + this.viewData.indicators[key].name + '</option>';
                }
            }

            var indForm =
            '<div style="border-bottom: 1px solid rgba(0, 0, 0, 0.12)" class="js-chart-indiacator-block tm-pad-large js-chartTADialog-i' + id + '-settings" id="iChart-i' + id + '-settings">' +
                '<div class="uk-panel">' +
                    '<div class="uk-flex uk-flex-middle uk-flex-space-between uk-margin-small-bottom">' +
                        '<div class="uk-h4">' + _t('12834','Индикатор') + ' ' + (id+1) + '</div>' +
                        '<div class="js-indicator-remove uk-icon-close uk-panel-hover uk-badge uk-button uk-button-mini"></div>' +
                    '</div>' +
                    '<div class="uk-form">' +
                        '<select name="i' + id + '" class="indicatorsSelect">' +
                        indicatorOptions +
                        '</select>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.uiGraphIndicatorsWindow2.element.find(".js-chartTADialogContainer").append(indForm);
            $root = this.uiGraphIndicatorsWindow2.element.find(".js-chartTADialog-i" + id + "-settings");
        }

        $(".iChart-indicator-description, .iChart-indicator-parameters, .iChart-indicator-colors, .iChart-indicator-width", $root).remove();

        var indicatorInfo = this.viewData.indicators[indicator.name] || {description:'',parameters:[]};

        $("<div/>", { "class":"iChart-indicator-description" }).html(indicatorInfo.description).appendTo($root);
        var indicatorParameters = indicatorInfo.parameters;

        for (var j = 0; j < indicatorParameters.length; ++j) {
            var parameterKey = "i" + id + "_" + indicatorParameters[j].Code;
            var $container = $("<div/>", { "class":"iChart-indicator-parameters uk-form", "text":indicatorParameters[j].Name + ": " }).appendTo($root);
            $("<input/>", { "name":parameterKey, "type":"text", "value":indicatorParameters[j].Value }).css({ "width":"50px" }).appendTo($container);
        }

        var $colorContainer = $("<div/>", {"class":"iChart-indicator-colors", "id":"iChart-indicator-colors"}).appendTo($root);
        var $widthContainer = $("<div/>", {"class":"iChart-indicator-width", "id":"iChart-indicator-width"}).appendTo($root);
        var colorIndex = id;

        if(this.viewData.indicators[indicator.name]) {
            for (var i = 0; i < this.viewData.indicators[indicator.name].output; i++) {
                if (typeof this.viewData.chart != 'undefined') {

                    var color = this.viewData.chart.chartOptions.indicatorColors[colorIndex][i];
                    if (this.userSettings.chartSettings.indicatorsColor[indicator.name] &&
                        this.userSettings.chartSettings.indicatorsColor[indicator.name][colorIndex] &&
                        this.userSettings.chartSettings.indicatorsColor[indicator.name][colorIndex][i]
                    ) {
                        color = this.userSettings.chartSettings.indicatorsColor[indicator.name][colorIndex][i];
                    }

                    $("<input/>", {
                            "type": "hidden",
                            "class": "iChart-indicator-color iChart-indicator-color-" + colorIndex + i,
                            "id": "iChart-indicator-color-" + colorIndex + i,
                            "indicator": indicator.name,
                            "colorIndex": colorIndex + "-" + i,
                            "ui-pos": (colorIndex < 2 ? "bottom" : "top")
                        }
                    ).val(color).appendTo($colorContainer);


                    this.initInsrMinicolors($(".iChart-indicator-color-" + colorIndex + i));

                    var width = 2;
                    if (this.userSettings.chartSettings.indicatorsWidth[indicator.name] &&
                        this.userSettings.chartSettings.indicatorsWidth[indicator.name][colorIndex] &&
                        this.userSettings.chartSettings.indicatorsWidth[indicator.name][colorIndex][i]) {
                        width = this.userSettings.chartSettings.indicatorsWidth[indicator.name][colorIndex][i];
                    }

                    var indicatorWidth = $('<span class="lineWidth indicatorWidthSelector-' + colorIndex + i + '" data-chartName="' + this.name + '" data-style="' + width + '"></span>').appendTo($widthContainer);
                    $('<div class="indicatorMenuHolder-' + colorIndex + i + '" data-chartName="' + this.name + '" style="display: none" widthIndex="' + colorIndex + "-" + i + '">' +
                        '<div widthIndex="' + colorIndex + "-" + i + '" indicator="' + indicator.name + '">' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="1"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="2"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="3"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="4"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="5"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="8"></span>' +
                        '<span class="lineWidth js-lineWidth ' + this.name + '" data-style="10"></span>' +
                        '</div>' +
                        '</div>').appendTo($widthContainer);
                    this.initIndicatorWidthMenu(indicatorWidth, $(".indicatorMenuHolder-" + colorIndex + i + "[data-chartName='" + this.name + "']").html());

                }
            }
        }

        if (updateChart) {
            this.update();
        }

    };

    this.setIndicators = function(graphicIndicators) {

        window.localStorage.setItem('userSettingsGraphicIndicators', graphicIndicators);
        this.dataSource.dataSettings.graphicIndicators = graphicIndicators;

        this.setScheduleUpdateState(0);
        this.TA.removeIndicator();
        if(typeof _this.TA != "undefined") {
            var indicators = iChart.parseQueryString(this.dataSource.dataSettings.graphicIndicators);
            $.each(indicators, function (n, i) {
                var params = {};
                if(i && n.match(/^i[0-9]+$/) && _this.viewData.indicators[i] && _this.viewData.indicators[i].type == "TA_LIB") {
                    var index = n.match(/^i([0-9]+)$/)[1];
                    for(var p = 0; p < _this.viewData.indicators[i].parameters.length; p++) {
                        var iParam = _this.viewData.indicators[i].parameters[p];
                        params[iParam.Code] = indicators[n + "_" + iParam.Code];
                    }
                    _this.TA[i](0, index);
                    _this.TA[i](1, index, params);
                }
            });
        }

        this.wrapper.trigger('iguanaChartEvents', ['hashChanged']);
        this.wrapper.trigger('iguanaChartEvents', ['indicatorsChanged', this.deserializeIndicators(this.dataSource.dataSettings.graphicIndicators)]);
        if(this.timers.updateInterval) {this.setScheduleUpdateState(1, this.timers.updateInterval)}

    };

    this.showIndicators = function (options) {
        options = options || {};
        //$("#iChart-tech-analysis-dialog").show();
        this.timers.updateInterval = this.viewData.chart.chartOptions.updateInterval;
        this.setScheduleUpdateState(0);

        var indicators = this.deserializeIndicators(this.dataSource.dataSettings.graphicIndicators);

        this.uiGraphIndicatorsWindow2.element.find(".js-chartTADialogContainer").empty();

        for(var i=0; i<indicators.length; i++) {
            this.updateIndicatorDetails(i, indicators[i], false);

            for (var paramKey in indicators[i].params)
            {
                var name = "i" + i + "_" + paramKey;
                this.uiGraphIndicatorsWindow2.element.find("[name='" + name + "']").val(indicators[i].params[paramKey]);
            }
        }

        if(!options.forAll) {
            this.uiGraphIndicatorsWindow2.element.find('.indicators-default').hide();
        }

        if(!this.uiGraphIndicatorsWindow2.UIkit) {

            $(this.wrapper).find(".js-chartTADialog." + this.name).appendTo('body');
            this.uiGraphIndicatorsWindow2 = UIkit.modal($(".js-chartTADialog." + this.name));

        }

        this.uiGraphIndicatorsWindow2.show();

        $(".indicators-set").off("click");
        $(".indicators-close").off("click");
        $(".indicators-set").on('click', function () {
            window.localStorage.setItem('userSettingsIndicatorsColor', JSON.stringify(_this.userSettings.chartSettings.indicatorsColor));
            window.localStorage.setItem('userSettingsIndicatorsWidth', JSON.stringify(_this.userSettings.chartSettings.indicatorsWidth));
            _this.setIndicators(_this.uiGraphIndicatorsWindow2.element.find(':input').serialize());
            _this.uiGraphIndicatorsWindow2.hide();
            return false;
        });
        $(".indicators-close").on('click', function () {
            _this.uiGraphIndicatorsWindow2.hide();
            if(_this.timers.updateInterval) {_this.setScheduleUpdateState(1, _this.timers.updateInterval)}
            return false;
        });
    };

    this.window_onHashChange = function () {
        if (typeof _this == 'undefined') return;

        if(_this.dataSource.dataSettings.useHash == false) {
            var hash = _this.dataSource.dataSettings.hash;
        } else {
            var hash = document.location.hash;
        }
        if (decodeURIComponent(hash) !== decodeURIComponent(_this.viewData.hash)) {
            _this.loadHash();
            _this.update();

            if (typeof _this.viewData.chart == 'undefined') return;
            if (_this.viewData.chart.overlay) {
                _this.viewData.chart.overlay.update();
            }
        }
    };

    this.zoom_onClick = function () {
        if (_this.viewData.chart) {
            _this.viewData.chart.zoom($(this).attr("data-zoom"));
        }
    };

    this.percentMode_onClick = function () {
        if(_this.viewData.chart.chartOptions.percentMode) {
            $('#percentMode').removeClass('active');
        } else {
            $('#percentMode').addClass('active');
        }
        _this.viewData.chart.chartOptions.percentMode = !_this.viewData.chart.chartOptions.percentMode;
        _this.updateForce();
        return _this.viewData.chart.chartOptions.percentMode;
    };

    this.iconsLoad = function () {
        $(["/i/admin/add.png",
            "/iguanachart/images/buy.png",
            "/iguanachart/images/down.png",
            "/iguanachart/images/icon-exclamation.png",
            "/iguanachart/images/icon-left.png",
            "/iguanachart/images/icon-leftDown.png",
            "/iguanachart/images/icon-leftUp.png",
            "/iguanachart/images/icon-question.png",
            "/iguanachart/images/icon-right.png",
            "/iguanachart/images/icon-rightDown.png",
            "/iguanachart/images/icon-rightUp.png",
            "/iguanachart/images/icon-sell.png",
            "/iguanachart/images/icon-smileDown.png",
            "/iguanachart/images/icon-smileUp.png",
            "/iguanachart/images/icon-up.png",
            "/i/logo_tradernet_min.png"]).preload();
    };
    this.drawLables = function (legend, context, x, y) {
        x = (typeof x == "undefined") ? 0 : x;
        y = (typeof y == "undefined") ? 0 : y;
        //var cl = $('.m-chart-t').eq(2).clone();
        var cl = $(legend).clone();
        $(cl).children('span').remove();
        var values = $(cl).html().split(/ &nbsp; /);
        var txtWidth = x;
        var str = '';
        str = values[0].replace(/&nbsp;/g, '');
        context.font = 'normal 9px Arial,Helvetica,sans-serif';
        context.fillStyle = '#636669';
        context.fillText(str, txtWidth, y);
        txtWidth += context.measureText(str).width + 10;
        $(legend).children('span:odd').each(function (i, obj) {
            str = $(obj).text();
            context.font = 'bold 9px Arial,Helvetica,sans-serif';
            context.fillStyle = $(obj).css('color');
            context.fillText(str, txtWidth, y);
            txtWidth += context.measureText(str).width;
            str = values[i + 1].replace(/&nbsp;/g, '');
            context.font = 'normal 9px Arial,Helvetica,sans-serif';
            context.fillStyle = '#636669';
            context.fillText(str, txtWidth, y);
            txtWidth += context.measureText(str).width + 10;
        });
    };

    this.setMousewheelZoomState = function (turnOn) {
        if(turnOn) {
            this.viewData.chart.chartOptions.mousewheelZoom = true;
        } else {
            this.viewData.chart.chartOptions.mousewheelZoom = false;
        }
    }

    this.setScheduleUpdateState = function (turnOn) {
        if(turnOn) {
            this.viewData.chart.chartOptions.updateInterval = true;
            this.viewData.chart.scheduleUpdate();
        } else {
            this.viewData.chart.chartOptions.updateInterval = false;
            this.viewData.chart.scheduleUpdate();
        }
    }

    this.scrollBack = function () {
        this.viewData.chart.viewport.x.min = this.viewData.chart.areas[0].viewport.x.min;
        this.viewData.chart.viewport.x.max = this.viewData.chart.areas[0].viewport.x.max;

        var length = this.viewData.chart.viewport.x.max - this.viewData.chart.viewport.x.min;
        var min = this.viewData.chart.viewport.x.min;
        var duration = 1500 + min;
        $('<p>').animate({
            width: min
        }, {
            duration: duration,
            step: function(now, fx){
                _this.viewData.chart.viewport.x.min = min - now;
                _this.viewData.chart.viewport.x.max = _this.viewData.chart.viewport.x.min + length;
                _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
            }
        });
    }

    this.scrollForward = function () {
        this.viewData.chart.viewport.x.min = this.viewData.chart.areas[0].viewport.x.min;
        this.viewData.chart.viewport.x.max = this.viewData.chart.areas[0].viewport.x.max;

        var length = this.viewData.chart.viewport.x.max - this.viewData.chart.viewport.x.min;
        var max = this.viewData.chart.areas[0].xSeries.length-1-this.viewData.chart.chartOptions.futureAmount;
        var p  = $('<p>').css({width: this.viewData.chart.viewport.x.max});
        var duration = 1500 + (max - this.viewData.chart.viewport.x.max);

        p.animate({
            width: max
        }, {
            duration: duration,
            step: function(now, fx){
                _this.viewData.chart.viewport.x.max = now;
                _this.viewData.chart.viewport.x.min = now - length;
                _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
            },
            complete: function() {
                _this.viewData.chart.onDataSettingsChange.call(_this.viewData.chart);
                _this.wrapper.trigger('iguanaChartEvents', ['hashChanged']);
            }
        });
    };

    this.scrollTo = function (toX) {
        if (toX == 0) {
            return false;
        }
        this.viewData.chart.viewport.x.min = this.viewData.chart.viewport.x.min === null ? this.viewData.chart.areas[0].viewport.x.min : this.viewData.chart.viewport.x.min;
        this.viewData.chart.viewport.x.max = this.viewData.chart.viewport.x.max === null ? this.viewData.chart.areas[0].viewport.x.max : this.viewData.chart.viewport.x.max ;

        var length = this.viewData.chart.viewport.x.max - this.viewData.chart.viewport.x.min;
        if(toX > 0) {
            var max = Math.min(this.viewData.chart.areas[0].xSeries.length-1, this.viewData.chart.viewport.x.max + toX);
        } else {
            var max = Math.max(0, this.viewData.chart.viewport.x.max + toX);
        }

        var p  = $('<p>').css({width: this.viewData.chart.viewport.x.max});
        var duration = 1000;

        p.animate({
            width: max
        }, {
            easing: 'easeOutCirc',
            duration: duration,
            step: function(now, fx){

                var area = _this.viewData.chart.areas[0];
                var deltaX = _this.viewData.chart.viewport.x.max - now;

                deltaX = area.getXIndex(deltaX) - area.getXIndex(0);
                if(((_this.viewData.chart.viewport.x.max - _this.viewData.chart.viewport.x.min) - deltaX) > 1) {
                    _this.viewData.chart.viewport.x.min += - deltaX;
                }

                if(((_this.viewData.chart.viewport.x.max) - deltaX) - _this.viewData.chart.viewport.x.min > 1) {
                    _this.viewData.chart.viewport.x.max += - deltaX;
                }

                _this.viewData.chart._fixViewportBounds();
                _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
            },
            complete: function() {
                _this.viewData.chart.onDataSettingsChange.call(_this.viewData.chart);
                _this.wrapper.trigger('iguanaChartEvents', ['hashChanged']);
            }
        });

        return p;
    };

    this.updateLastCandle = function (data) {
        if(!data) { return;}
        var element = data;
        if(typeof this.viewData.chart != "undefined" && !!this.viewData.chart.areas && this.viewData.chart.canvas && !!this.viewData.chart.chartOptions.updateInterval && element.ltp) {
            var chartDate = new Date(this.viewData.chart.areas[0].xSeries[this.viewData.chart.areas[0].xSeries.length-this.viewData.chart.chartOptions.futureAmount-1]*1000);
            var currentDate = new Date(data.ltt);
            if(currentDate.getTime() >= chartDate.getTime() && currentDate.getTime() < (chartDate.getTime() + this.viewData.chart._dataSettings.timeframe * 60000)) {
                var point = this.viewData.chart.areas[0].ySeries[0].points[this.viewData.chart.areas[0].ySeries[0].points.length-this.viewData.chart.chartOptions.futureAmount-1];
                point[3] = element.ltp;
                point[0] = Math.max(point[0], point[3]);
                point[1] = Math.min(point[1], point[3]);
                point[4] = element.bap;
                point[5] = element.bbp;

                var context = iChart.getContext(this.viewData.chart.canvas);
                this.viewData.chart.render({ "context": context, "forceRecalc": false, "resetViewport": false, "testForIntervalChange": false });
            } else if(currentDate.getTime() > (chartDate.getTime() + this.viewData.chart._dataSettings.timeframe * 60000)) {

                var point = this.getLastPoint();
                var newPoint = {
                    "hloc": {},
                    "vl": {},
                    "xSeries" : {}
                };

                var hloc = [];
                hloc[0] = element.ltp;
                hloc[1] = element.ltp;
                hloc[2] = element.ltp;
                hloc[3] = element.ltp;

                newPoint["hloc"][Object.keys(point.xSeries)[0]] = [hloc];
                newPoint["vl"][Object.keys(point.xSeries)[0]] = [element.vol];

                var tm = ((currentDate.getTime() - currentDate.getTime() % (this.viewData.chart._dataSettings.timeframe * 60000)) / 1000) - getTimeOffsetServer(tzOffsetMoscow);
                newPoint["xSeries"][Object.keys(point.xSeries)[0]] = [tm];

                this.addPoint(newPoint);
            }
        }
    };

    this.getLastPoint = function () {
        if(typeof this.viewData.chart != "undefined" && !!this.viewData.chart.areas && this.viewData.chart.canvas) {
            var _this = this;
            var lastPointIndex = this.viewData.chart.areas[0].ySeries[0].points.length-this.viewData.chart.chartOptions.futureAmount-1;
            var name = this.viewData.chart.areas[0].ySeries[0].name;

            var hloc = {},
                vl = {},
                xSeries = {};

            xSeries[name] = [this.viewData.chart.areas[0].xSeries[lastPointIndex]];

            $.each(this.viewData.chart.areas, function(i,area){
                $.each(area.ySeries, function(j,series){
                    if($.inArray(series.kind, ['HLOC', 'Volume']) >= 0) {
                        if(series.kind == 'HLOC') {
                            hloc[name] = [series.points[lastPointIndex]];
                        }
                        if(series.kind == 'Volume') {
                            vl[name] = [series.points[lastPointIndex]];
                        }
                    }
                });
            });

            var result = {
                "hloc": hloc,
                "vl": vl,
                "xSeries": xSeries
            };

            return result;
        }
    };

    this.getLastPointX = function () {
        if(typeof this.viewData.chart != "undefined" && !!this.viewData.chart.areas && this.viewData.chart.canvas) {
            var lastPointIndex = this.viewData.chart.areas[0].ySeries[0].points.length-this.viewData.chart.chartOptions.futureAmount-1;
            return this.viewData.chart.areas[0].xSeries[lastPointIndex];
        }
        return false;
    };

    this.addTransactions = function (data, mode) {
        if(typeof this.viewData.chart != "undefined") {
            DataLoop:
                for(var i=0; i < data.length; i++) {
                    var overlayHistory = this.viewData.chart.overlay.history;
                    for(var j=0; j < overlayHistory.length; j++) {
                        var element = overlayHistory[j];
                        if(element.elementType == "Trade" && element.id == data[i].id) {
                            continue  DataLoop;
                        }
                    }

                    var element = this.viewData.chart.overlay.createElement("Trade");
                    element.hasSettings = true;
                    element.settings = data[i];
                    element.settings.mode = mode;
                    element.points = [{'x':iChart.parseDateTime(data[i].date_time, "yyyy-MM-dd HH:mm:ss").getTime(), 'y':data[i].splitPrice}];
                    element.id = data[i].id;
                    this.viewData.chart.overlay.history.push(element);
                    this.userTransactionAmount++;
                }
            this.viewData.chart.overlay.render();
        }
    };

    this.removeTransactions = function () {
        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];
                if(element.elementType == "Trade") {
                    overlayHistory.splice(i, 1);
                    i--;
                }
            }
            this.userTransactionAmount = -1;
            this.viewData.chart.overlay.render();
        }
    }

    this.setButton = function (data) {
        if(typeof this.viewData.chart != "undefined") {
            var element = this.viewData.chart.overlay.createElement("Button");
            element.hasSettings = true;
            element.setSettings(data);
            element.points = [{'x':data.point, 'y':data.price}];
            //element.id = data[i].id;
            this.viewData.chart.overlay.history.push(element);
            //this.viewData.chart.overlay.render();
        }


    };

    this.updateNewOrderButton = function () {
        var lastPoint = this.viewData.chart.areas[0].getXPositionByIndex(this.viewData.chart.areas[0].xSeries.length-1-this.viewData.chart.chartOptions.futureAmount) + 50;
        lastPoint = Math.min(lastPoint, this.viewData.chart.areas[0].getXPositionByIndex(this.viewData.chart.areas[0].xSeries.length-1));
        var pointX = this.viewData.chart.areas[0].getXValue(lastPoint)*1000;
        var point = this.viewData.chart.areas[0].ySeries[0].points[this.viewData.chart.areas[0].ySeries[0].points.length-this.viewData.chart.chartOptions.futureAmount-1];

        var element = this.getNewOrderButton();
        if(element) {
            element.points[0].x = pointX;
            element.points[0].y = point[3];
        } else {
            var click = function () {
                var point = _this.viewData.chart.areas[0].ySeries[0].points[_this.viewData.chart.areas[0].ySeries[0].points.length-_this.viewData.chart.chartOptions.futureAmount-1];
                var callback = function(){
                    _this.addVisualTradeUI();
                };
                jNTChartTrading.show(_this.userSettings.currentSecurity.nt_ticker, 2, iChart.roundToPrecision(point[3], _this.userSettings.currentSecurity.min_step), null, null, callback);
                _this.removeNewOrderButton();
            }
            this.setButton({point: pointX, price: point[3], click: click});
        }

    }

    this.getNewOrderButton = function () {
        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];
                if(element.elementType == "Button") {
                    return element;
                }
            }
        }
        return false;
    };

    this.removeNewOrderButton = function () {
        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];
                if(element.elementType == "Button") {
                    overlayHistory.splice(i, 1);
                    i--;
                }
            }
        }
    };

    this.removeLevel = function () {
        if (typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for (var i = 0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];
                if (element.elementType == "Level") {
                    overlayHistory.splice(i, 1);
                    i--;
                }
            }
        }
    };

    this.addLevel = function (data) {
        if(typeof this.viewData.chart != "undefined") {
            this.removeLevel();

            var element = this.viewData.chart.overlay.createElement("Level");
            element.hasSettings = true;
            element.points = [{'x':new Date(), 'y':data.price}];
            element.setSettings(data);
            this.viewData.chart.overlay.history.push(element);
            this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });
            return element;
        }
        return false;
    };


    this.fixViewport = function () {
        if(typeof this.viewData.chart != "undefined" && this.viewData.chart.areas && this.viewData.chart.areas[0].viewport.x.max == this.viewData.chart.areas[0].viewport.x.min) {
            this.viewData.chart.viewport.x.max = this.viewData.chart.areas[0].viewport.x.max - this.viewData.chart.chartOptions.futureAmount;
            this.viewData.chart.viewport.x.min = Math.max(this.viewData.chart.areas[0].viewport.x.max - this.viewData.chart.chartOptions.futureAmount - 30 ,0);
            this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    this.switchTrading = function () {
        this.userSettings.chartSettings.tradingToolsEnable = this.userSettings.chartSettings.tradingToolsEnable ? 0 : 1;
        window.localStorage.setItem('userSettingsTradingToolsEnable', this.userSettings.chartSettings.tradingToolsEnable);
        //$(this.container).trigger('chartTradingTools');
        $(this.container).trigger('iguanaChartEvents', ['chartTradingTools', this.userSettings.chartSettings.tradingToolsEnable]);
    };

    this.tradingToolsControl = function() {
        if(this.userSettings.chartSettings.tradingToolsEnable) {

            //this.updateNewOrderButton();
            //this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        } else {

            //this.removeNewOrderButton();
            //this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    this.addEvents = function(events) {
        events = events || [];
        for (var i = 0; i < events.length; i++) {
            var element = this.viewData.chart.overlay.createElement("Event");
            element.hasSettings = true;
            var data = $.extend({}, events[i]);
            element.setSettings(data);
            element.points = [{x: data.x, y:data.y}];
            element.id = 'Event';
            this.viewData.chart.overlay.history.push(element);
        }
        this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
    };

    this.clearEvents = function() {
        if (typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for (var i = 0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];
                if (element.elementType == "Event") {
                    overlayHistory.splice(i, 1);
                    i--;
                }
            }
            this.viewData.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        }
    };

    this.checkDateInterval = function (new_date_from, new_date_to) {

        var date_from = iChart.formatDateTime(new Date(new_date_from), "dd.MM.yyyy HH:mm");
        var date_to = iChart.formatDateTime(new Date(new_date_to), "dd.MM.yyyy HH:mm");

        var fPeriodChanged = false;
        if (this.dataSource.dataSettings.date_from != date_from || this.dataSource.dataSettings.date_to != date_to) {
            fPeriodChanged = true;
        }

        this.dataSource.dataSettings.date_from = date_from;
        this.dataSource.dataSettings.date_to = date_to;
        this.dataSource.dataSettings.start = date_from;
        this.dataSource.dataSettings.end = date_to;
        //this.dataSource.dataSettings.end = date_to + ' 23:59';
        var interval_tmp = this.dataSource.dataSettings.interval;

        var interval = (new_date_to - new_date_from) / 86400000;
        var fromNow = (new Date().getTime() - new_date_from) / 86400000;

        var Allow1 = new Array;

        Allow1.push("I1");
        Allow1.push("I5");
        Allow1.push("I15");
        Allow1.push("H1");
        Allow1.push("D1");
        Allow1.push("D7"); //TODO: нету данных в mChartAnalysisJSON, нужна доработка сервера

        var restriction = {};

        if(fromNow > 93) { // больше полгода
            restriction = {"I1":"D1", "I5":"D3", "I15":"D7", "H1":"M1"}
        } else if (fromNow < 93 && fromNow >= 32) { // от трех месяцев до полгода
            restriction = {"I1":"D1", "I5":"D3", "I15":"D7"}
        } else if (fromNow < 32 && fromNow >= 10) { // от месяца до трех месяцев
            restriction = {"I1":"D1", "I5":"D3"}
        } else if (fromNow < 10 && fromNow >= 3) { // от недели до месяца
            restriction = {"I1":"D1"}
        } else if (fromNow < 3 && fromNow >= 0) { // от дня
        }

        var dataSource = new Array();

        for (var i = 0; i < Allow1.length; i++) {
            var text = intervalNames(Allow1[i]) + ((typeof restriction[Allow1[i]] != "undefined") ? (" > " + intervalShortNames(restriction[Allow1[i]])) : "");
            dataSource.push({ text: text, value: Allow1[i], restriction: restriction[Allow1[i]] });
        }


        this.dataSource.dataSettings.interval = interval_tmp;

        var result = {restriction: restriction, dataSource: dataSource, value: interval_tmp, text: intervalNames(interval_tmp)};
        if(JSON.stringify(this.dataSource.dataSettings.intervalRestriction) != JSON.stringify(restriction) && interval_tmp == this.dataSource.dataSettings.interval) {
            this.dataSource.dataSettings.intervalRestriction = restriction;
            $(this.container).trigger('iguanaChartEvents', ['intervalRestriction', result]);
        }

        return result;
    };

    this.checkPeriodInterval = function (obj, change) {

        if (change === undefined) change = true;
        var date_to = new Date();
        var date_from = new Date();
        var period;
        period = $(obj).val();
        // задание начальной даты
        switch (period) {
            case "D1":
                break;
            case "D7":
                date_from.setDate(date_to.getDate() - 7);
                break;
            case "M1":
                date_from.setMonth(date_to.getMonth() - 1);
                break;
            case "M3":
                date_from.setMonth(date_to.getMonth() - 3);
                break;
            case "M6":
                date_from.setMonth(date_to.getMonth() - 6);
                break;
            case "Y1":
                date_from.setFullYear(date_to.getFullYear() - 1);
                break;
            case "Y5":
                date_from.setFullYear(date_to.getFullYear() - 5);
                break;
            default:
                date_from.setMonth(date_to.getMonth() - 3);
        }

        if (period) {
            $('#date_to').val(iChart.formatDateTime(date_to, "dd.MM.yyyy"));
            $('#date_from').val(iChart.formatDateTime(date_from, "dd.MM.yyyy"));
        } else {
            var range = (Date.parse($("#date_to").val()) - Date.parse($("#date_from").val())) / 1000;
            if($("#interval").val() == "D1" && range < 86400) {
                $('#date_from').val(iChart.formatDateTime(new Date(Date.parse($("#date_from").val()).getTime() - 86400000 * 7), "dd.MM.yyyy"));
            } else if ($("#interval").val() == "D7" && range < 86400 * 7) {
                $('#date_from').val(iChart.formatDateTime(new Date(Date.parse($("#date_from").val()).getTime() - 86400000 * 14), "dd.MM.yyyy"));
            }
        }

    };

    this.checkPeriod = function (period) {

        var date_to = iChart.parseDateTime(this.dataSource.dataSettings.date_to);
        var date_from = new Date(date_to);

        // задание начальной даты

        var periodRegs = period.match(/([D,M,Y])(\d+)/);

        if(periodRegs) {
            switch (periodRegs[1]) {
                case "D":
                    date_from.setDate(date_to.getDate() - +(periodRegs[2]));
                    break;
                case "M":
                    date_from.setMonth(date_to.getMonth() - +(periodRegs[2]));
                    break;
                case "Y":
                    date_from.setFullYear(date_to.getFullYear() - +(periodRegs[2]));
                    break;
            }
        } else {
            period = "D1";
        }

        if (period) {
            this.dataSource.dataSettings.date_from = iChart.formatDateTime(date_from, "dd.MM.yyyy");
            this.dataSource.dataSettings.date_to = iChart.formatDateTime(date_to, "dd.MM.yyyy");
        } else {
            var range = (iChart.parseDateTime(this.dataSource.dataSettings.date_from).getTime() - iChart.parseDateTime(this.dataSource.dataSettings.date_to).getTime()) / 1000;
            if (this.dataSource.dataSettings.interval == "D1" && range < 86400) {
                this.dataSource.dataSettings.date_from = iChart.formatDateTime(new Date(iChart.parseDateTime(this.dataSource.dataSettings.date_from).getTime() - 86400000 * 7), "dd.MM.yyyy");
            } else if (this.dataSource.dataSettings.interval == "D7" && range < 86400 * 7) {
                this.dataSource.dataSettings.date_from = iChart.formatDateTime(new Date(iChart.parseDateTime(this.dataSource.dataSettings.date_from).getTime() - 86400000 * 14), "dd.MM.yyyy");
            }
        }
        this.checkDateInterval(iChart.parseDateTime(this.dataSource.dataSettings.date_from), iChart.parseDateTime(this.dataSource.dataSettings.date_to));
    };

    this.setInterval = function (interval) {

        var period = "M1";
        switch (interval) {
            case "I1":
                period = "D1";
                break;
            case "I5":
                period = "D3";
                break;
            case "I15":
                period = "D7";
                break;
            case "H1":
                period = "D14";
                break;
            case "D1":
                period = "M6";
                break;
            case "D7":
                period = "Y1";
                break;
        }

        var date_to = new Date(this.getLastPointX() * 1000);
        date_to.setHours(0);
        date_to.setMinutes(0);
        date_to.setSeconds(0);
        date_to.setDate(date_to.getDate()+1);

        this.dataSource.dataSettings.date_to = date_to;
        this.dataSource.dataSettings.interval = interval;
        this.dataSource.dataSettings.timeframe = iChart.getChartTimeframe(interval);
        this.checkPeriod(period);
        this.updateForce();
    };

    this.setHashValue = function (key, value)
    {
        /// <summary>
        /// Sets value at the specified key in the location hash.
        /// </summary>
        /// <param name="key">A key at which the value should be stored.</param>
        /// <param name="value">A value to set.</param>

        if (this.dataSource.dataSettings.useHash == false) {
            var currentHash = this.dataSource.dataSettings.hash;
        } else {
            var currentHash = document.location.hash;
        }
        var values = iChart.parseQueryString(currentHash.substr(1));
        values[key] = value;
        var hash = "#" + iChart.toQueryString(values);
        if (hash !== currentHash)
        {
            if (this.dataSource.dataSettings.useHash == false) {
                this.dataSource.dataSettings.hash = hash;
            } else {
                document.location.hash = hash;
            }
            $(this.container).trigger('iguanaChartEvents', ['hashChanged', hash]);
        }
    };

    this.setHashValues = function (valuesNew)
    {
        /// <summary>
        /// Sets values at the specified keys in the location hash.
        /// </summary>
        /// <param name="valuesNew" type="Object">A dictionary of values to set.</param>

        if (this.dataSource.dataSettings.useHash == false) {
            var currentHash = this.dataSource.dataSettings.hash;
        } else {
            var currentHash = document.location.hash;
        }

        var values = iChart.parseQueryString(currentHash.substr(1));
        for (var key in valuesNew)
        {
            if (valuesNew.hasOwnProperty(key))
            {
                values[key] = valuesNew[key];
            }
        }
        var hash = "#" + iChart.toQueryString(values);
        if (hash !== currentHash && !$.isEmptyObject(values))
        {
            if (this.dataSource.dataSettings.useHash == false) {
                this.dataSource.dataSettings.hash = hash;
            } else {
                document.location.hash = hash;
            }
            $(this.container).trigger('iguanaChartEvents', ['hashChanged', hash]);
        }
    };

    this.initInsrMinicolors = function (element) {
        var color = element.val();

        $(element).minicolors({
            animationSpeed: 50,
            animationEasing: 'swing',
            change: null,
            changeDelay: 0,
            control: 'hue',
            defaultValue: color,
            hide: null,
            hideSpeed: 100,
            inline: false,
            letterCase: 'lowercase',
            opacity: false,
            position: element.attr('ui-pos') + ' left',
            show: null,
            showSpeed: 100,
            theme: 'default'
        }).change(function(){
            var serialIndex = $(this).attr('colorIndex').split('-')[0];
            var colorIndex = $(this).attr('colorIndex').split('-')[1];
            var indicator = $(this).attr('indicator');
            if($.isArray(_this.userSettings.chartSettings.indicatorsColor)) {
                _this.userSettings.chartSettings.indicatorsColor = {};
            }
            if(!_this.userSettings.chartSettings.indicatorsColor[indicator]) {
                _this.userSettings.chartSettings.indicatorsColor[indicator] = [];
            }
            if(!_this.userSettings.chartSettings.indicatorsColor[indicator][serialIndex]) {
                _this.userSettings.chartSettings.indicatorsColor[indicator][serialIndex] = Array(_this.viewData.indicators[indicator].output);
            }
            _this.userSettings.chartSettings.indicatorsColor[indicator][serialIndex][colorIndex] = $(this).val();
        });
    };

    this.initIndicatorWidthMenu = function (element, menu) {
        $(element).qtip({
            style: {
                classes: 'qtip-light'
            },
            position: {
                at: 'left bottom',
                my: 'top left',
                effect: false
            },
            content: {
                text: menu
            },
            hide: {
                fixed: true,
                delay: 300,
                effect: function() {
                    //$(this).hide('slide', 500);
                    $(this).slideUp(500);
                }
            },
            show: {
                solo: true,
                effect: function() {
                    //$(this).show('slideDown', 500);
                    $(this).slideDown(500);
                }
            },
            events: {
                show: function(event, api) {
                }
            }
        });
    };

    this.setIndicatorWidth = function (element) {

        var serialIndex = $(element).parent().attr('widthIndex').split('-')[0];
        var lineIndex = $(element).parent().attr('widthIndex').split('-')[1];
        var indicator = $(element).parent().attr('indicator');

        if($.isArray(this.userSettings.chartSettings.indicatorsWidth)) {
            this.userSettings.chartSettings.indicatorsWidth = {};
        }

        if(!this.userSettings.chartSettings.indicatorsWidth[indicator]) {
            this.userSettings.chartSettings.indicatorsWidth[indicator] = [];
        }
        if(!this.userSettings.chartSettings.indicatorsWidth[indicator][serialIndex]) {
            this.userSettings.chartSettings.indicatorsWidth[indicator][serialIndex] = Array(this.viewData.indicators[indicator].output);
        }
        $(".indicatorWidthSelector-" + serialIndex + lineIndex + "[data-chartName='" + this.name +"']").attr('data-style', $(element).attr('data-style'));
        this.userSettings.chartSettings.indicatorsWidth[indicator][serialIndex][lineIndex] = $(element).attr('data-style');
    };

    this.getIndicatorParameters = function (indicator) {
        var params = {};
        if(typeof this.viewData.indicators[indicator] != "undefined") {
            for(var i=0; i<this.viewData.indicators[indicator].parameters.length;i++) {
                params[this.viewData.indicators[indicator].parameters[i].Code] = this.viewData.indicators[indicator].parameters[i].Value;
            }
        }
        return params;
    };

    this.setIndicator = function (indicator, params, number) {
        number = number || 0;

        if(typeof this.viewData.indicators[indicator] == "undefined") {
            throw new Error("Indicator '" + indicator + "' is not supported.");
        }

        params = params || this.getIndicatorParameters(indicator);

        var newIndicator = {};

        newIndicator['i'+number] = indicator;
        for(var param in params) {
            newIndicator['i' + number + '_' + param] = params[param];
        }

        var oldIndicators = iChart.parseQueryString(this.dataSource.dataSettings.graphicIndicators);
        for (var paramKey in oldIndicators)
        {
            if (paramKey.match(new RegExp("^i" + number + '_', "i"))) {
                delete  oldIndicators[paramKey];
            }
        }

        oldIndicators['i' + number] = '';
        this.dataSource.dataSettings.graphicIndicators = iChart.toQueryString($.extend({}, oldIndicators, newIndicator));
        this.updateForce();
    };

    this.getPeriodDates = function (period) {
        var date_to = new Date();
        var date_from = new Date();

        date_to.setHours(0);
        date_to.setMinutes(0);
        date_to.setSeconds(0);
        date_to.setDate(date_to.getDate()+1);
        date_from.setHours(0);
        date_from.setMinutes(0);
        date_from.setSeconds(0);

        var periodRegs = period.match(/([D,M,Y])(\d+)/);

        if(periodRegs) {
            switch (periodRegs[1]) {
                case "D":
                    date_from.setDate(date_to.getDate() - +(periodRegs[2]));
                    break;
                case "M":
                    date_from.setMonth(date_to.getMonth() - +(periodRegs[2]));
                    break;
                case "Y":
                    date_from.setFullYear(date_to.getFullYear() - +(periodRegs[2]));
                    break;
            }
        } else {
            date_from.setMonth(date_to.getMonth() - +(3));
        }

        return {
            date_from: iChart.formatDateTime(date_from, "dd.MM.yyyy"),
            date_to: iChart.formatDateTime(date_to, "dd.MM.yyyy")
        };
    };

    this.addPoint = function (point) {
        var data = this.dataSource.dataAdapter(point, {});
        this.viewData.chart._mergeData(data, {});
        this.viewData.chart.render({
            "forceRecalc": true,
            "resetViewport": false,
            "testForIntervalChange": false
        });
    };

    this.setStyleToCanvas = function (color, prop) {
        var selected = this.viewData.chart.overlay.selected;
        if (selected != null && selected.hasSettings) {
            var settings = selected.settings;
            settings[prop] = color;
            selected.setSettings(settings);
            if(this.viewData.chart.chartOptions.elementStyle[selected.elementType]) {
                this.viewData.chart.chartOptions.elementStyle[selected.elementType][prop] = color;
            }
        }
        this.userSettings.chartSettings.contextSettings[prop] = color;
    };

    this.setLineWidthToCanvas = function (width) {
        var selected = this.viewData.chart.overlay.selected;
        if (selected != null && selected.hasSettings) {
            selected.settings.lineWidth = width;
            selected.setSettings(selected.settings);
        }

        this.userSettings.chartSettings.contextSettings.lineWidth = width;
    };

    if(typeof jNTChartTrading != 'undefined') {
        /*//РИСОВАНИЕ ПРИКАЗОВ*/

        if (typeof jNTUserinfo !== "undefined" && jNTUserinfo.isDemo) {
            if (typeof extendIChartWithTrandorders == 'function') {
                extendIChartWithTrandorders.call(this);
            }
        } else {
            if (typeof extendIChartWithOrders == 'function') {
                extendIChartWithOrders.call(this);
            }
        }

        /*РИСВАНИЕ ПОЗИЦИИ*/
        if (typeof extendIChartWithPositions == 'function') {
            extendIChartWithPositions.call(this);
        }

        /*РИСВАНИЕ ТОРГОВЫХ ПАНЕЛЕЙ*/
        if (typeof extendIChartWithTradePanels == 'function') {
            extendIChartWithTradePanels.call(this);
        }
    }

//----------------------------------------------------------------------------------------------------------------------
    this.setTrendorder = function (data) {

        if(typeof this.viewData.chart != "undefined") {

            var element = this.viewData.chart.overlay.createElement("Trendorder");
            element.hasSettings = true;
            element.setSettings(data);

            this.viewData.chart.overlay.history.push(element);

        }
    };

    this.drawTrendorder = function () {

        var data = {
            date: 1461569774688.537,
            price: 2890.65358452394,
            date2: 1461584727590.7007,
            price2: 2883.7317157761254,
            fillStyle: '#7cb342',
            strokeStyle: '#36BDF4',
            textColor: '#ffffff',
            text: 'Трендовый приказ',
            mode: "trend",
            onCancel: function() {console.log(this);}
        };

        var data3 = {
            date: 1461531600000,
            price: 2893,
            date2: 1461618000000,
            price2: 2879,
            fillStyle: '#7cb342',
            strokeStyle: '#36BDF4',
            textColor: '#ffffff',
            text: 'Трендовый приказ',
            mode: "trend",
            onCancel: function() {console.log(this);}
        };

        var data4 = {
            date: 1472798700000,
            price: 142.73127071556314,
            date2: 1472799600000,
            price2: 142.75374359194433,
            tf: 900,
            fillStyle: '#7cb342',
            strokeStyle: '#36BDF4',
            textColor: '#ffffff',
            text: 'Трендовый приказ',
            mode: "trend",
            onCancel: function() {console.log(this);}
        };

        var data2 = {
            date: 1472553953049000,
            price: 135,
            fillStyle: '#7cb342',
            strokeStyle: '#36BDF4',
            textColor: '#ffffff',
            text: 'Трендовый приказ',
            mode: "line",
            onCancel: function() {console.log(this);}
        };


        this.setTrendorder(data4);
        this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });
    };

//----------------------------------------------------------------------------------------------------------------------

    $(document).on("change", ".indicatorsSelect", this.indicator_onChange);
    $(document).on("click", ".js-indicator-remove", this.removeIndicator_onClick);
    $(document).on("click", ".js-indicator-add", this.addIndicator_onClick);
    $(document).on("change", "[name='timeframe']", this.timeframe_onChange);
    //$(document).on("change", "[name=graphic_format]", this.chartType_onChange);
    $(document).on("click", "[name='apply']", this.apply_onClick);
    $(document).on("click", "[name='clearIndicators']", this.clearIndicators_onClick);
    $(document).on("click", "[name='pan']", this.pan_onClick);
    $(document).on("click", ".js-lineWidth." + this.name, function(){
        _this.setIndicatorWidth(this)
    });
    //    $(document).on("click", "[name='removeAllInstruments']", this.removeAllInstruments_onClick);
    //    $(document).on("click", "[name='removeSelectedInstrument']", this.removeSelectedInstrument_onClick);
    $(document).on("click", "[name='resetZoom']", this.resetZoom_onClick);
    //$(document).on("click", "[name='SelectInstrument']", this.selectInstrument_onClick);
    $(document).on("click", "[name='updateChart']", this.updateChart_onClick);
    $(document).on("click", "[name='zoom']", this.zoom_onClick);
    $(document).on("dblclick", function () {
        _this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });
    });
    $(_this.wrapper).on('iguanaChartEvents', function(event, name, data) {
        if(name === 'chartDataReady') {
            if(_this.viewData.chart && _this.dataRequestCounter == 0) {
                _this.viewData.chart.updateVolumeByPrice();
                _this.ui.initStatesControls();
            }
        } else if(name === 'selectInstrument') {
            _this.ui.onSelectInstrument(data);
        } else if(name === 'drawComplete') {
            _this.ui.setUiStateForInstrumentLine(null, 0);
            _this.ui.setUiStateForInstrumentForm(null, 0);
            _this.ui.setUiStateForInstrumentText(null, 0);
        }
    });

    $(_this.wrapper).on("click", ".iChart-indicator-description a", function(e){
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    });

    //$(window).on("hashchange", this.window_onHashChange);

    $(window).on("resize", function(){
        _this.wrapper.trigger('iguanaChartEvents', ['chartResize']);
    });

    $(document).on("click", "[name='toggleVolumeByPrice']", this.toggleVolumeByPrice_onClick);

};
