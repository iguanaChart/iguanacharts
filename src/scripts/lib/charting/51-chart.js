/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    var id = 0;

    iChart.Charting.Chart = function (settings)
    {
        /// <summary>
        /// Initializes a new instance of the Chart class with the specified parameters.
        /// </summary>
        /// <param name="settings">Chart settings.</param>
        /// <field name="_chartType" type="String">Current chart type.</field>
        /// <field name="_dataEnd" type="Date">Data end date/time (empty means that the absolute end of the data has been reached).</field>
        /// <field name="_dataLoading" type="Boolean">A value indicating whether a data request is in progress.</field>
        /// <field name="_dataSettings" type="Object">Data settings for the AJAX data requests.</field>
        /// <field name="_dataStart" type="Date">Data start date/time (empty means that the absolute start of the data has been reached).</field>
        /// <field name="_id" type="Number">Unique numeric identifier.</field>
        /// <field name="axisColor" type="String">Chart axis color.</field>
        /// <field name="backgroundColor" type="String">Chart background color (default is white).</field>
        /// <field name="canvas" type="HTMLCanvasElement">Output canvas.</field>
        /// <field name="container" type="HTMLElement">A HTML element that serves as a container for the chart canvas.</field>
        /// <field name="dataCallback" type="Function">Called when the chart requests new data.</field>
        /// <field name="dataCountMin" type="Number">Minimum number of additional points to load (default is 500).</field>
        /// <field name="downStyle" type="String">Down candle (close price less than open price) style (default is #617db4).</field>
        /// <field name="gridColor" type="String">Grid color.</field>
        /// <field name="gridStyle" type="String">Grid style (dashed/solid).</field>
        /// <field name="historyEnd" type="Date">End date/time of the market data history.</field>
        /// <field name="indicatorColors" type="Array">Indicator color palette.</field>
        /// <field name="labelColor" type="String">Axis label color.</field>
        /// <field name="labelFont" type="String">Axis label font (the syntax is the same as for the CSS 'font' property).</field>
        /// <field name="labelPrecision" type="Number">Axis label numeric precision (default is 5).</field>
        /// <field name="minAreaHeight" type="Integer">Minimum allowed chart area height in pixels (default is 100). Does not include scroller (see 'scrollerHeight').</field>
        /// <field name="mousewheelZoom" type="Boolean">A value indicating whether the mousewheel zooms the chart.</field>
        /// <field name="onCreateAreas" type="Function">Called after the default areas are created. You can add new or modify existing areas here.</field>
        /// <field name="onIntervalChange" type="Function">Called when date/time interval of the visible viewport changes. It receives start and end date/time as the arguments (end can be empty). Fired before onPreRender.</field>
        /// <field name="onPositionAreas" type="Function">Called after the default area dimensions are calculated and before the canvas is initialized. You can change area positions and inner/outer dimensions here.</field>
        /// <field name="onPostRender" type="Function">Called after rendering to the canvas. It receives the same arguments as the render method itself, 'this' refers to the chart object.</field>
        /// <field name="onPreRender" type="Function">Called before rendering to the canvas. It receives the same arguments as the render method itself, 'this' refers to the chart object.</field>
        /// <field name="panStep" type="Number">A number from 0 to 1 indicating how far the viewport should shift during panning (default is 0.3, i.e. 30%).</field>
        /// <field name="primaryAreaHeight" type="Integer">Primary (containing HLOC series) area height in pixels (default is 450). Ignored if minHeight is specified.</field>
        /// <field name="primaryToSecondaryAreaHeightRatio" type="Number">Primary to secondary area height ratio (default is 3). Used both when minHeight is and is not specified.</field>
        /// <field name="renderer" type="iChart.Charting.ChartRenderer">Renderer for this chart.</field>
        /// <field name="scrollerHeight" type="Integer">Scroller height in pixels (default is 100). Set to 0 to hide the scroller.</field>
        /// <field name="seriesAreaColor" type="String">Area chart type secondary (background) color.</field>
        /// <field name="seriesColors" type="Array">Series color palette.</field>
        /// <field name="selection" type="iChart.Charting.ChartSelection">Current mouse selection.</field>
        /// <field name="showVolume" type="String">A value indicating how a volume series should be displayed if present. Possible values are hidden, inside and outside (default is inside).</field>
        /// <field name="updateInterval" type="Number">Chart update interval (in milliseconds).</field>
        /// <field name="upStyle" type="String">Up candle (close price greater than open price) style (default is #617db4).</field>
        /// <field name="volumeStyle" type="String">Volume series color, default is rgba(97, 125, 180, 0.3).</field>
        /// <field name="watermarkColor" type="String">Watermark color.</field>
        /// <field name="watermarkFont" type="String">Watermark font.</field>
        /// <field name="watermarkSubFont" type="String">Watermark sub font.</field>
        /// <field name="watermarkText" type="String">Watermark text (empty = no watermark).</field>
        /// <field name="watermarkSubText" type="String">Watermark sub text (empty = no watermark).</field>

        this.env = settings.env;
        this._id = id++;


        this.chartOptions = new iChart.Charting.ChartOptions();

        this.dataCountMin = 50;
        this.historyEnd = settings.historyEnd;
        this.labelPrecision = 5;

        this.dataCallback = settings.dataCallback;
        this.onCreateAreas = settings.onCreateAreas || $.noop;
        this.onDataSettingsChange = settings.onDataSettingsChange || $.noop;
        this.onIntervalChange = settings.onIntervalChange || $.noop;
        this.onPositionAreas = settings.onPositionAreas || $.noop;
        this.onPostRender = settings.onPostRender || $.noop;
        this.onPreRender = settings.onPreRender || $.noop;
        this.contextmenuCallback = settings.contextmenuCallback || $.noop;

        // Initial values.
        this._dataLoading = false;
        this.areas = null;
        this.canvas = null;
        this.isComparison = false;
        this.viewport = {
            x: {min: null, max: null},
            y: {min: null, max: null}
        };


        // Complex properties.
        this.container = settings.container;
        $(this.container).unbind("selectstart");
        $(this.container).attr("unselectable", "on").css("user-select", "none").on("selectstart", false);

        this.overlay = new iChart.Charting.ChartDrawingLayer(this);
        this.widgetLay = new iChart.Charting.ChartWidgetLayer(this, settings.widget);
        this.renderer = new iChart.Charting.ChartRenderer(this);

        this.selection = new iChart.Charting.ChartSelection(this.container);
        this.selection.movestart = $.proxy(this._selectionMoveStartCallback, this);
        this.selection.move = $.proxy(this._selectionMoveCallback, this);
        this.selection.moveend = $.proxy(this._selectionMoveEndCallback, this);

        this.setSelectionMode("pan");

        var _this = this;

        $(this.container).on('mousewheel', function(event){
            $.proxy(_this._mousewheelCallback(event), _this);
        });

        this.touches = new iChart.Charting.ChartTouches(this);

        $(this.container).off('contextmenu').on('contextmenu', function(event){
            $.proxy(_this.contextmenuCallback(event), _this);
            _this.env.wrapper.trigger('iguanaChartEvents', ['contextmenuCallback', event]);
        });

        if(!$(this.env.container).height()) {
            var height = this.calculateHeight();
            $(this.env.container).height(height.height);
        }

        this.chartOptions = $.extend(true, this.chartOptions, settings);

        this.crosshair = false;
        this._resized = true;
        this._containerSize = {};

        //this.setDataSettings(this.env.dataSource.dataSettings);
    };

    iChart.Charting.Chart.prototype.clearIndicators = function (area)
    {
        /// <summary>
        /// Removes all TA indicators and areas from the chart.
        /// </summary>
        /// <param name="area">(Optional) Chart area to remove the indicators from.</param>
        for (var i = 0; i < this.areas.length; ++i)
        {
            var a = this.areas[i];
            if (area && a !== area)
            {
                continue;
            }
            var indicatorIndex = [];
            for (var j = 0; j < a.ySeries.length; ++j)
            {
                if (a.ySeries[j].kind === "TechnicalAnalysis" || a.ySeries[j].kind === "TA_LIB")
                {
                    indicatorIndex.push(a.ySeries[j].indicatorIndex);
                    a.ySeries.splice(j, 1);
                    --j;
                }
            }
            if (indicatorIndex.length)
            {
                for (var key in this._dataSettings)
                {
                    for (var j = 0; j < indicatorIndex.length; j++)
                    {
                        if (this._dataSettings.hasOwnProperty(key) && key.match(new RegExp("^i" + indicatorIndex[j], "i")))
                        {
                            delete this._dataSettings[key];
                        }
                    }
                }

                if (a.ySeries.length === 0)
                {
                    if(typeof a.overlay != "undefined") {
                        $(a.overlay.canvas).remove();
                    }
                    var removed = this.areas.splice(i, 1);
                    removed[0].dispose();
                    --i;
                }
            }
        }
        this.onDataSettingsChange.call(this);
        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        this.env.wrapper.trigger('iguanaChartEvents', ['clearIndicators']);
    };

    iChart.Charting.Chart.prototype.findAreaAtPosition = function (x, y)
    {
        /// <summary>
        /// Finds the chart area at the specified pixel position (counted from the top left corner of the chart). Note that area corners are excluded from search.
        /// </summary>
        /// <param name="x" type="Number">X pixel position.</param>
        /// <param name="y" type="Number">Y pixel position.</param>
        /// <returns type="Object" />

        var result = {};
        for (var i = 0; i < this.areas.length; ++i)
        {
            result.area = this.areas[i];
            if (!result.area.enabled)
            {
                continue;
            }

            if (x >= result.area.offset.left && x <= result.area.offset.left + result.area.outerWidth && y >= result.area.offset.top && y <= result.area.offset.top + result.area.outerHeight)
            {
                result.insideX = x >= result.area.innerOffset.left && x <= result.area.innerOffset.left + result.area.innerWidth;
                result.insideY = y >= result.area.innerOffset.top && y <= result.area.innerOffset.top + result.area.innerHeight;
                if (!result.insideX && !result.insideY)
                {
                    return null;
                }

                return result;
            }
        }

        return null;
    };

    iChart.Charting.Chart.prototype.getSeriesCollection = function ()
    {
        /// <summary>
        /// Gets an ordered list of all series contained in the chart.
        /// </summary>

        var results = [];
        for (var i = 0; i < this.areas.length; ++i)
        {
            var areaSeries = this.areas[i].ySeries;
            for (var j = 0; j < areaSeries.length; ++j)
            {
                if(areaSeries[j].kind == "TA_LIB") {
                    continue;
                }

                if (results.indexOf(areaSeries[j]) === -1)
                {
                    results.push(areaSeries[j]);
                }
            }
        }

        return results;
    };

    iChart.Charting.Chart.prototype.loadMissingData = function ()
    {
        /// <summary>
        /// Tries to load data points missing in the current viewport. Does nothing if data request is in progress or if there is no missing data.
        /// </summary>
        var area = this.areas[0];
        if (this._dataStart)
        {
            var before = Math.round(area.xSeries.min - this.viewport.x.min);
            if (before > 0)
            {
                var params = $.extend(true, {}, this._dataSettings);
                params.count = -Math.max(this.dataCountAdapt(before), before);//-this.seriesCountAdapt();
                params.intervalMode = "OpenRay";
                params.start = iChart.formatDateTime(this._dataStart);
                delete params.end;

                /*
                var viewMin = area.xSeries.min;
                var viewMax = Math.floor(this.viewport.x.max);
                var dt = Math.round((area.xSeries[viewMax] - area.xSeries[viewMin]) / 2);
                var startTimeStmp = iChart.parseDateTime(params.start).getTime() - dt * 1000;
                var date_from = new Date(startTimeStmp);
                */

                var date_from = iChart.parseDateTime(params.start);
                var date_to = iChart.parseDateTime(params.start);

                date_from.setHours(0);
                date_from.setMinutes(0);
                date_from.setSeconds(0);

                date_to.setHours(0);
                date_to.setMinutes(0);
                date_to.setSeconds(0);

                if(params.timeframe == 1440) {
                    date_from.setMonth(0);
                    date_from.setDate(0);
                    date_to.setFullYear(date_to.getFullYear()+1,0,0);
                    params.count = -1;
                } else if(params.timeframe == 60) {
                    date_from.setMonth(date_from.getMonth()-1);
                    date_from.setDate(0);
                    date_to.setMonth(date_to.getMonth()+1);
                    date_to.setDate(0);
                    params.count = -1;
                } else if(params.timeframe == 15) {
                    date_from.setMonth(date_from.getMonth()-1);
                    date_from.setDate(0);
                    date_to.setMonth(date_to.getMonth()+1);
                    date_to.setDate(0);
                    params.count = -1;
                } else if(params.timeframe == 5) {
                    date_to.setDate(date_to.getDate() + (7 - (date_to.getDay() == 0 ? 7 : date_to.getDay())));
                    date_from.setDate(date_from.getDate() - (date_from.getDay() == 0 ? 7 : date_from.getDay()));
                    params.count = -1;
                } else if(params.timeframe == 1) {
                    date_to.setDate(date_to.getDate() + 1);
                    date_from.setDate(date_from.getDate() - 1);
                    params.count = -100;
                }

                params.date_from = iChart.formatDateTime(date_from, "dd.MM.yyyy HH:mm");
                params.date_to = iChart.formatDateTime(date_to, "dd.MM.yyyy HH:mm");
                params.start = params.date_to;

                this.requestData(params, false, false);
                return;
            }
        }

        if (this._dataEnd)
        {
            var after = Math.round(this.viewport.x.max - area.xSeries.max);
            if (after > 0)
            {
                var params = $.extend(true, {}, this._dataSettings);
                params.count = Math.max(this.dataCountAdapt(after), after) + this.chartOptions.futureAmount;
                params.intervalMode = "OpenRay";
                params.start = iChart.formatDateTime(this._dataEnd);
                params.date_to = iChart.formatDateTime(this._dataEnd, "dd.MM.yyyy HH:mm");
                delete params.end;
                this.requestData(params, false, false);
            }
        }
    };


    iChart.Charting.Chart.prototype.dataCountAdapt = function (countC)
    {
        var k = 50;
        switch (this._dataSettings.timeframe) {
            case 1:
                k = 500;
                break;
            case 5:
                k = 300;
                break;
            case 15:
                k = 200;
                break;
            case 30:
                k = 150;
                break;
            case 60:
                k = 120;
                break;
            case 1440:
                k = 100;
                break;
        }
        return k+countC;
    }

    iChart.Charting.Chart.prototype.pan = function (direction)
    {
        /// <summary>
        /// Pans the chart in the specified direction for the predefined distance.
        /// </summary>
        /// <param name="direction" type="String">Pan direction (top, left, bottom, or right).</param>

        var area;
        for (var i = 0; i < this.areas.length; ++i)
        {
            area = this.areas[i];
            if (area.name === this.viewport.areaName)
            {
                break;
            }

            area = null;
        }

        if (area === null)
        {
            area = this.areas[0];
        }

        this.viewport.areaName = area.name;

        if (direction === "left" || direction === "right")
        {
            if (this.viewport.x.min === null)
            {
                this.viewport.x.min = area.viewport.x.bounded.min;
            }

            if (this.viewport.x.max === null)
            {
                this.viewport.x.max = area.viewport.x.bounded.max;
            }

            var delta = Math.max(1, this.chartOptions.panStep * (this.viewport.x.max - this.viewport.x.min));
            if (direction === "left")
            {
                delta *= -1;
            }

            this.viewport.x.min += delta;
            this.viewport.x.max += delta;
        }
        else if (direction === "top" || direction === "bottom")
        {
            if (this.viewport.y.min === null)
            {
                this.viewport.y.min = area.viewport.y.min;
            }

            if (this.viewport.y.max === null)
            {
                this.viewport.y.max = area.viewport.x.max;
            }

            var delta = this.chartOptions.panStep * (this.viewport.y.max - this.viewport.y.min);
            if (direction === "bottom")
            {
                delta *= -1;
            }

            this.viewport.y.min += delta;
            this.viewport.y.max += delta;
        }
        else
        {
            return;
        }

        this._fixViewportBounds();
        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
        this.loadMissingData();
    };

    iChart.Charting.Chart.prototype.parseDataSettings = function (settings)
    {
        /// <summary>
        /// Parses chart data settings, converting them to the standard format.
        /// </summary>
        /// <param name="settings" type="Object">Chart data settings.</param>
        /// <returns type="Object" />

        var result = $.extend(true, {}, settings);
        result.start = iChart.parseDateTime(result.start);
        result.end = iChart.parseDateTime(result.end);
        result.timeframe = parseInt(result.timeframe, 10);

        if (isNaN(Date.parse(result.date_from))) {
            result.date_from = new Date();
        }

        if (isNaN(Date.parse(result.date_to))) {
            result.date_to = new Date();
        }


        return result;
    };

    iChart.Charting.Chart.prototype.render = function (params, bySchedule)
    {
        /// <summary>
        /// Renders the chart to the current canvas context. Does nothing if no chart areas were created.
        /// </summary>
        /// <param name="params" type="Object">
        ///     Settings map:
        ///     &#10;   context - a canvas context to which the chart should be rendered (optional, created automatically if not specified);
        ///     &#10;   forceRecalc - a boolean value indicating whether the chart elements positions should be recalculated such as when panning, resizing or zooming;
        ///     &#10;   resetViewport - a boolean value indicating whether the chart viewport should be reset to default bounds;
        ///     &#10;   testForIntervalChange - a boolean value indicating whether the viewport interval change should be tested for.
        /// </param>


        if (!this.areas)
        {
            console.log('No ares to render. Abort');
            return false;
        }

        if (params.context && params.forceRecalc)
        {
            throw new Error("Parameters 'forceRecalc' and 'context' parameters cannot be specified at the same time.");
        }

        if (params.resetViewport)
        {
            this.viewport.x.min = null;
            this.viewport.x.max = null;
            this.viewport.y.min = null;
            this.viewport.y.max = null;
        }

        var area;
        var areaViewport;
        var context = params.context;
        if (params.forceRecalc)
        {
            this._positionAreas();

            if (!this.canvas)
            {
                console.log('No canvas to render. Abort');
                return false;
            }

            context = iChart.getContext(this.canvas);

            areaViewport = {};
            areaViewport.x = {};
            areaViewport.x.min = this.viewport.x.min;
            areaViewport.x.max = this.viewport.x.max;
            areaViewport.y = {};
            for (var i = 0; i < this.areas.length; ++i)
            {
                area = this.areas[i];
                if (area.name === this.viewport.areaName)
                {
                    areaViewport.y.min = this.viewport.y.min;
                    areaViewport.y.max = this.viewport.y.max;
                }
                else
                {
                    areaViewport.y.min = null;
                    areaViewport.y.max = null;
                }

                area.calculateInnerDimensions(areaViewport);
            }
        }

        this.onPreRender.call(this, params, context);
        this.renderer.renderChart(context);
        this.onPostRender.call(this, params, context);

        if (params.forceRecalc)
        {
            if (this.widgetLay)
            {
                this.widgetLay.update();
            }

            if (this.overlay)
            {
                this.overlay.update();
            }
        }

        if (typeof FlashCanvas !== "undefined")
        {
            // Flush and execute commands.
            context.e();
        }


        if (params.testForIntervalChange)
        {
            this._testForIntervalChange(bySchedule);
        }

        return true;
        //GTi: доработка убирающая запрос при рисовании после масштабиромания
        //this._dataSettings.start = iChart.parseDateTime(iChart.formatDateTime(new Date(this.areas[0].xSeries[this.areas[0].viewport.x.bounded.min] * 1000), "dd.MM.yyyy"));
        //this._dataSettings.end = iChart.parseDateTime(iChart.formatDateTime(new Date(this.areas[0].xSeries[this.areas[0].viewport.x.bounded.max] * 1000), "dd.MM.yyyy 23:59"));
    };

    iChart.Charting.Chart.prototype.requestData = function (params, resetData, resetViewport, bySchedule)
    {
        /// <summary>
        /// Requests chart data with the specified parameters.
        /// </summary>
        /// <param name="params" type="Object">Data request parameters.</params>
        /// <param name="resetData" type="Boolean">A value indicating whether the existing data should be overwritten by the requested data.</params>
        /// <param name="resetViewport" type="Boolean">A value indicating whether the current viewport should be reset to its default bounds.</params>
        var indicatorKey = new RegExp("^i[0-9]+$", "i");
        for (var key in params)
        {
            if (indicatorKey.test(key) && params[key]) {
                if(this.env.viewData.indicators[params[key]] && this.env.viewData.indicators[params[key]]['type'] == 'TA_LIB') {
                    params[key] = '';
                }
            }
        }

        if (this._dataLoading)
        {
            return;
        }
        this._dataLoading = true;
        this.touches.disabled = true;
        var self = this;
        var amountUpdated = 0;
        var callback = function (data)
        {
            self.setWarnings(data.warnings);
            if (data.success)
            {
                amountUpdated = self.updateData(data, params, resetData);
                self.render({ "forceRecalc": true, "resetViewport": resetViewport, "testForIntervalChange": true }, bySchedule);
            }

            setTimeout(function() {self.scheduleUpdate();}, 2000);
            self._dataLoading = false;

            if(self && self.areas && amountUpdated) {
                if (self.areas[0].xSeries.min > self.viewport.x.min) {
                    self.loadMissingData();
                }
            }
            self.indicatorsApply();
        };
        //this.dataCallback.call(this, params, callback, bySchedule);
        this.env.dataSource.onRequest(callback, params)
    };

    iChart.Charting.Chart.prototype.indicatorsApply = function () {

        if(typeof this.env.TA != "undefined") {

            var updatedIndicators = {};
            if (this.areas) {

                for (var i = 0; i < this.areas.length; ++i) {
                    var a = this.areas[i];
                    for (var j = 0; j < a.ySeries.length; ++j) {
                        if (a.ySeries[j].kind === "TA_LIB") {
                            var index = a.ySeries[j].indicatorIndex,
                                indicator = a.ySeries[j].name,
                                params = $.extend(true, {}, a.ySeries[j].params);

                            if (this.env.TA[indicator] && !updatedIndicators[indicator + "/" + index]) {
                                this.env.TA[indicator](0, index);
                                this.env.TA[indicator](1, index, params);
                                updatedIndicators[indicator + "/" + index] = true;
                            }
                        }
                    }
                }
            }

            var _this = this;
            var indicators = iChart.parseQueryString(this.env.dataSource.dataSettings.graphicIndicators);
            $.each(indicators, function (n, i) {
                if(i && n.match(/^i[0-9]+$/) && _this.env.viewData.indicators[i] && _this.env.viewData.indicators[i].type == "TA_LIB") {
                    var index = n.match(/^i([0-9]+)$/)[1];
                    if(!updatedIndicators[i + "/" + index]) {
                        var params = {};
                        for (var p = 0; p < _this.env.viewData.indicators[i].parameters.length; p++) {
                            var iParam = _this.env.viewData.indicators[i].parameters[p];
                            var paramCode = _this.env.TA.mapParam(iParam.Code);
                            if ((indicators[n + "_" + paramCode])) {
                                params[iParam.Code] = +(indicators[n + "_" + paramCode]);
                            } else {
                                params[iParam.Code] = +(indicators[n + "_" + iParam.Code]) || iParam.Value;
                            }
                        }
                        _this.env.TA[i](0, index);
                        _this.env.TA[i](1, index, params);
                    }
                }
            });
        }

    };

    iChart.Charting.Chart.prototype.resetZoom = function ()
    {
        /// <summary>
        /// Resets chart zoom to the default values.
        /// </summary>

        this.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": true });
    };

    iChart.Charting.Chart.prototype.resize = function ()
    {
        /// <summary>
        /// Resizes the chart to the container's width.
        /// </summary>

        this._resized = true;
        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
        this.selection.recalculateContainerPosition();
    };

    iChart.Charting.Chart.prototype.scheduleUpdate = function ()
    {
        /// <summary>
        /// Schedules next chart update at the currently selected update interval.
        /// </summary>

        clearTimeout(this.env.timers.scheduleUpdate);
        if (this.chartOptions.updateInterval && this._dataSettings.id == this.env.viewData.chart._dataSettings.id)
        {
            if($(this.env.container).length) {
                this.env.timers.scheduleUpdate = setTimeout($.proxy(this.update, this, true), this.env.viewData.chart._dataSettings.timeframe * 20000); // 1/3 от периода в милисекундах
            }
        }
    };

    iChart.Charting.Chart.prototype.setChartType = function (chartType)
    {
        /// <summary>
        /// Redraws the chart using the specified chart type.
        /// </summary>
        /// <param name="chartType" type="String">New chart type (Candlestick, Line, Stock).</param>

        if (this.chartOptions.chartType === chartType || this.isComparison)
        {
            return;
        }

        this.chartOptions.chartType = chartType;
        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
    };

    iChart.Charting.Chart.prototype.setDataSettings = function (settings, force)
    {
        /// <summary>
        /// Sets specified data settings. Returns a value indicating whether any of the settings changed (chart is updated in that case).
        /// </summary>
        /// <param name="settings" type="Object">New chart data settings.</param>
        /// <returns type="Boolean" />
        var oldSettings = this._dataSettings;
        this._dataSettings = this.parseDataSettings(settings);
        var request = $.extend(true, {}, this._dataSettings);

        if(typeof oldSettings != "undefined") {
            var changes = {};
            if(oldSettings.interval != this._dataSettings.interval) {
                changes.interval = this._dataSettings.interval;
                this.env.wrapper.trigger('iguanaChartEvents', ['intervalChange', this._dataSettings.interval]);
            }
            if(oldSettings.id != this._dataSettings.id) {
                changes.id = this._dataSettings.id;
            }
            if(oldSettings.type != this._dataSettings.type) {
                changes.type = this._dataSettings.type;
            }
            if(Object.keys(changes).length) {
                this.env.wrapper.trigger('iguanaChartEvents', ['settingsChange', changes]);
            }
        }

        var min = new Date(1800, 0, 1);
        var max = this.historyEnd || new Date();
        var start = (request.start || min).getTime();
        var end = (request.end || max).getTime();
        //console.log('setDataSettings:',JSON.parse(JSON.stringify(request)));
        //console.log('setDataSettings:', min, max, start, end, oldSettings && oldSettings.id === request.id && oldSettings.timeframe === request.timeframe && !force);
        if (oldSettings && oldSettings.id === request.id && oldSettings.timeframe === request.timeframe && !force)
        {
            var equal = true;
            var indicatorKey = new RegExp("^i[0-9]+(_.*)?$", "i");
            for (var key in oldSettings)
            {
                if (oldSettings.hasOwnProperty(key) && indicatorKey.test(key))
                {
                    if (!request.hasOwnProperty(key) || oldSettings[key] !== request[key])
                    {
                        equal = false;
                        break;
                    }
                }
            }

            if (equal)
            {
                for (var key in request)
                {
                    if (request.hasOwnProperty(key) && indicatorKey.test(key))
                    {
                        if (!oldSettings.hasOwnProperty(key) || oldSettings[key] !== request[key])
                        {
                            equal = false;
                            break;
                        }
                    }
                }
            }

            if (equal)
            {
                var oldStart = (oldSettings.start || min).getTime();
                var oldEnd = (oldSettings.end || max).getTime();
                if (oldStart == start && oldEnd === end)
                {
                    return false;
                }

                oldStart = (this._dataStart || min).getTime();
                oldEnd = (this._dataEnd || max).getTime();
                if (oldStart <= start && end <= oldEnd)
                {
                    this.env.wrapper.trigger('iguanaChartEvents', ['clearLoader']);
                    this.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": true });
                    return true;
                }

                if (start < oldStart && oldEnd === end)
                {
                    request.intervalMode = "OpenRay";
                    request.count = -Math.max(this.dataCountMin, Math.round((oldStart - start) / (request.timeframe * 60000)) + 50);
                    request.start = new Date(oldStart);
                }
                else if (oldStart == start && oldEnd < end)
                {
                    request.intervalMode = "OpenRay";
                    request.count = Math.max(this.dataCountMin, Math.round((end - oldEnd) / (request.timeframe * 60000)) + 50);
                    request.start = new Date(oldEnd);
                }
            }
        }

        var resetData = !request.intervalMode;
        if (resetData)
        {
            request.intervalMode = "ClosedRay";
            request.count = -Math.max(this.dataCountMin, Math.round((end - start) / (request.timeframe * 60000) / 2));
            request.start = request.end;

            var date_to = iChart.parseDateTime(request.date_to);
            var date_from = iChart.parseDateTime(request.date_from);

            if(request.timeframe == 1440) {
                date_to.setFullYear(date_to.getFullYear() - 5);
                date_from = new Date(Math.max(date_from.getTime(), date_to.getTime()));
                date_from.setMonth(0);
                date_from.setDate(0);
                request.count = -1;
            } else if(request.timeframe == 60) {
                date_to.setMonth(date_to.getMonth() - 3);
                date_from = new Date(Math.max(date_from.getTime(), date_to.getTime()));
                date_from.setMonth(date_from.getMonth() - 1);
                date_from.setDate(0);
                request.count = -10;
            } else if(request.timeframe == 15) {
                date_to.setMonth(date_to.getMonth() - 1);
                date_from = new Date(Math.max(date_from.getTime(), date_to.getTime()));
                date_from.setDate(0);
                request.count = -10;
            } else if(request.timeframe == 5) {
                date_to.setDate(date_to.getDate() - 14);
                date_from = new Date(Math.max(date_from.getTime(), date_to.getTime()));
                date_from.setHours(0);
                date_from.setMinutes(0);
                date_from.setSeconds(0);
                date_from.setDate(date_from.getDate() - date_from.getDay());
                request.count = -100;
            } else if(request.timeframe == 1) {
                date_to.setDate(date_to.getDate() - 5);
                date_from = new Date(Math.max(date_from.getTime(), date_to.getTime()));
                date_from.setHours(0);
                date_from.setMinutes(0);
                date_from.setSeconds(0);
                date_from.setDate(date_from.getDate() - 1);
                request.count = -200;
            }

            date_from.setHours(0);
            date_from.setMinutes(0);
            date_from.setSeconds(0);

            request.date_from = iChart.formatDateTime(date_from, "dd.MM.yyyy HH:mm");
        }

        delete request.end;
        request.start = iChart.formatDateTime(iChart.parseDateTime(request.start), "dd.MM.yyyy HH:mm");
        this.requestData(request, resetData, true);
        return true;
    };

    iChart.Charting.Chart.prototype.setSelectionMode = function (mode)
    {
        /// <summary>
        /// Sets selection mode to the specified value.
        /// </summary>
        /// <param name="mode" type="String">New selection mode (pan or zoom).</param>

        if (!this.container) return;

        switch (mode)
        {
            case "pan":
                this.container.style.cursor = this.overlay.defaultCursor
                        = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.env.lib_path + "/styles/cursors/grab.cur'), move";
                break;
            case "zoom":
                this.container.style.cursor = this.overlay.defaultCursor = "crosshair";
                break;
            case "wait":
                this.container.style.cursor = this.overlay.defaultCursor = "wait";
                break;
            default:
                throw new Error("Selection mode '" + mode + "' is invalid.");
        }

        this.selection.mode = mode;
    };

    iChart.Charting.Chart.prototype.setWarnings = function (warnings)
    {
        /// <summary>
        /// Shows the specified warnings on the chart. Previous warnings are removed.
        /// </summary>
        /// <param name="warnings" type="Array" elementType="String">A list of warnings to display.</param>

        var $warnings = $(".m-chart-warnings", this.container);
        if (!warnings || !warnings.length)
        {
            $warnings.hide();
            return;
        }

        if ($warnings.length === 0)
        {
            $warnings = $("<div/>", { "class": "m-chart-warnings" }).appendTo(this.container);
        }
        else
        {
            $warnings.show();
        }

        $warnings.text(warnings.join("\r\n"));
    };

    iChart.Charting.Chart.prototype.showTime = function ()
    {
        /// <summary>
        /// Gets a value indicating whether the time should be shown based on the current chart timeframe.
        /// </summary>
        /// <returns type="Boolean" />

        return parseInt(this._dataSettings.timeframe, 10) % 1440 !== 0;
    };

    iChart.Charting.Chart.prototype.toBase64 = function (mimeType)
    {
        /// <summary>
        /// Generates chart image with the specified MIME type encoded as a Base64 string.
        /// </summary>
        /// <param name="mimeType" type="String">Image MIME type. Valid values are 'image/jpeg' and 'image/png'.</param>
        /// <returns type="String">Chart image encoded as a Base64 string.</return>

        var canvas = document.createElement("canvas");
        canvas.id = "iChart-chart";
        canvas.style.left = 0;
        canvas.style.position = "absolute";
        canvas.style.top = -this.canvas.height;
        document.body.appendChild(canvas);
        if (typeof canvas.getContext === "undefined")
        {
            if (typeof FlashCanvas === "undefined")
            {
                alert("Ваш браузер не поддерживается.");
                return;
            }

            FlashCanvas.initElement(canvas);
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        var context = iChart.getContext(canvas);
        this.render({ "context": context, "forceRecalc": false, "resetViewport": false, "testForIntervalChange": false });
        this.overlay.render(context);
        this.renderer.renderLegends(context);

        var data = canvas.toDataURL(mimeType);
        $(canvas).remove();
        var marker = ";base64,";
        return data.substring(data.indexOf(marker) + marker.length);
    };

    iChart.Charting.Chart.prototype.update = function (bySchedule)
    {
        /// <summary>
        /// Used for periodic chart updates. Fetches new data if date/time interval is right-open.
        /// </summary>
//        console.log(this._dataEnd);
//        if (this._dataEnd)
//        {
//            return;
//        }

        var params = $.extend(true, {}, this._dataSettings);
        params.intervalMode = "ClosedRay";
        if(bySchedule) {
            params.intervalMode = "OpenRay";
        }
        params.count = this.dataCountMin;

        var series = this.areas[0].xSeries;
        if (series.length !== 0)
        {
            params.date_from = iChart.formatDateTime(new Date(1000 * series[series.length - this.chartOptions.futureAmount - 1]), "dd.MM.yyyy HH:mm");
            params.date_to = params.date_from;
            params.start = params.date_from;
        }

        delete params.end;
        this.requestData(params, false, false, bySchedule);
    };

    iChart.Charting.Chart.prototype.updateData = function (data, params, resetData)
    {
        /// <summary>
        /// Updates chart data set with the specified data.
        /// </summary>
        /// <param name="data" type="Object">Chart data.</param>
        /// <param name="params" type="Object">Data request parameters.</param>
        /// <param name="resetData" type="Boolean">A value indicating whether the existing data should be overwritten by the requested data.</params>

        if (params.intervalMode !== "ClosedRay" && params.intervalMode !== "OpenRay")
        {
            throw new Error("Interval mode '" + params.intervalMode + "' is invalid.");
        }

        if (params.count < 0)
        {
            if (data.xSeries.length < -params.count)
            {
                this._dataStart = null;
            }
            else
            {
                this._dataStart = new Date(1000 * data.xSeries[0]);
            }

            if (resetData)
            {
                this._dataEnd = iChart.parseDateTime(params.start);
            }
        }
        else
        {
            if (resetData)
            {
                this._dataStart = iChart.parseDateTime(params.start);
            }

            if (data.xSeries.length < params.count)
            {
                this._dataEnd = null;
            }
            else
            {
                this._dataEnd = new Date(1000 * data.xSeries[data.xSeries.length - 1]);
            }
        }

        if (data.xSeries.length !== 0)
        {
            var end = new Date(1000 * data.xSeries[data.xSeries.length - 1]);
            if (!this.historyEnd || end.getTime() > this.historyEnd.getTime())
            {
                this.historyEnd = end;
            }
        }

        if (resetData)
        {
            return this._setData(data, params);
        }
        else if (data.xSeries.length !== 0)
        {
            var amount = this._mergeData(data, params);

            if (params.count < 0 && !amount)
            {
                this._dataStart = null;
            } else if (params.count > 0 && !amount) {
                this._dataEnd = null;
            }
            return amount;
        }
    };

    iChart.Charting.Chart.prototype.zoom = function (level)
    {
        /// <summary>
        /// Zooms the chart for the specified amount.
        /// </summary>
        /// <param name="level" type="Number">Zoom level. Positive values are for zooming in, negative values are for zooming out.</param>

        this._zoomInternal(null, level);
    };

    /**
     * Добавление пустышек для расширения оси
     */
    iChart.Charting.Chart.prototype.addFuture = function () {

        var xSeries = this.areas[0].xSeries;
        var params = this._dataSettings;
        if(this.chartOptions.futureAmount) {
            var step = params.timeframe * 60;
            for(var i=0;i<this.chartOptions.futureAmount;i++) {
                xSeries.push(xSeries[xSeries.length-1]+step);
            }
        }

        var ySeriesCollection = $.grep(this.getSeriesCollection(), function (x) { return x.enableMerge; });

        for (var i = 0; i < ySeriesCollection.length; ++i)
        {
            var series = ySeriesCollection[i];

            if(this.chartOptions.futureAmount) {
                if(series.valuesPerPoint==1) {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        series.points.push([null]);
                    }
                } else {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        series.points.push([null,null,null,null]);
                    }
                }
            }
        }

        for (var i = 0; i < this.areas.length; ++i)
        {
            this.areas[i].setMinMax();
        }

        this._setXLabelFormat();
    }

    /**
     * Удаление пустышек
     */
    iChart.Charting.Chart.prototype.removeFuture = function () {
        var xSeries = this.areas[0].xSeries;

        if(this.chartOptions.futureAmount) {
            xSeries.splice(-this.chartOptions.futureAmount,this.chartOptions.futureAmount);
        }

        var ySeriesCollection = $.grep(this.getSeriesCollection(), function (x) { return x.enableMerge; });
        if(this.chartOptions.futureAmount) {
            for (var i = 0; i < ySeriesCollection.length; i++)
            {
                ySeriesCollection[i].points.splice(-this.chartOptions.futureAmount,this.chartOptions.futureAmount);
            }
        }

        for (var i = 0; i < this.areas.length; ++i)
        {
            this.areas[i].setMinMax();
        }

        this._setXLabelFormat();

    }

    iChart.Charting.Chart.prototype._fixViewportBounds = function ()
    {
        /// <summary>
        /// Limits viewport bounds to prevent zooming and panning too far.
        /// </summary>

        var area = null;
        for (var i = 0; i < this.areas.length; ++i)
        {
            if (this.areas[i].name === this.viewport.areaName)
            {
                area = this.areas[i];
            }
        }

        if (area === null)
        {
            return;
        }

        var epsilon;
        var delta;

        if (this.viewport.x.min !== null && this.viewport.x.max !== null)
        {
            epsilon = 0.7 * (this.viewport.x.max - this.viewport.x.min);
            delta = this.viewport.x.max - (area.xSeries.max - area.chart.chartOptions.futureAmount) - epsilon;

            if (delta > 0)
            {
                this.viewport.x.min -= delta;
                this.viewport.x.max -= delta;
            }
            else
            {
                delta = area.xSeries.min - this.viewport.x.min - epsilon;
                if (delta > 0)
                {
                    this.viewport.x.min += delta;
                    this.viewport.x.max += delta;
                }
            }
        }

        if (this.viewport.y.min !== null && this.viewport.y.max !== null)
        {
            epsilon = 0.7 * (this.viewport.y.max - this.viewport.y.min);
            delta = this.viewport.y.max - area.ySeries.bounds.max - epsilon;
            if (delta > 0)
            {
                this.viewport.y.min -= delta;
                this.viewport.y.max -= delta;
            }
            else
            {
                delta = area.ySeries.bounds.min - this.viewport.y.min - epsilon;
                if (delta > 0)
                {
                    this.viewport.y.min += delta;
                    this.viewport.y.max += delta;
                }
            }
        }
    };

    iChart.Charting.Chart.prototype._mergeData = function (data, params)
    {
        /// <summary>
        /// Updates chart data with the specified data set.
        /// </summary>
        /// <param name="data" type="Object">Data to merge into the existing data set.</param>
        /// <param name="params" type="Object">Data request parameters.</param>

        var includesEndpoint = false;
        var xSeries = this.areas[0].xSeries;
        var xSeriesOldCount = xSeries.length;


        if(this.chartOptions.futureAmount) {
            xSeries.splice(-this.chartOptions.futureAmount,this.chartOptions.futureAmount);
        }

        var ySeriesCollection = $.grep(this.getSeriesCollection(), function (x) { return x.enableMerge; });
        if(this.chartOptions.futureAmount) {
            for (var i = 0; i < ySeriesCollection.length; i++)
            {
                ySeriesCollection[i].points.splice(-this.chartOptions.futureAmount,this.chartOptions.futureAmount);
            }
        }

        if (params.count < 0)
        {

            var i = data.xSeries.length - 1;
            var indexTop = i;

            while(data.xSeries[i] > xSeries[0] && i >0) {
                i--;
            }
            var indexTopCut = i;
            data.xSeries.splice(indexTopCut, indexTop-indexTopCut+1);

            for (var j = data.ySeries.length - 1; j >= 0; --j)
            {
                data.ySeries[j].points.splice(indexTopCut, indexTop-indexTopCut+1);
            }

            var shift = data.xSeries.length;
            if (data.xSeries[data.xSeries.length - 1] === xSeries[0])
            {
                xSeries.splice(0, 1);
                --shift;
                includesEndpoint = true;
            }

            if (this.viewport.x.min !== null)
            {
                this.viewport.x.min += shift;
            }

            if (this.viewport.x.max !== null)
            {
                this.viewport.x.max += shift;
            }

            if (this.selection)
            {
                this.selection.shiftAnchor(shift);
            }

            for (var j = data.xSeries.length - 1; j >= 0; --j)
            {
                xSeries.splice(0, 0, data.xSeries[j]);
            }

        }
        else
        {
            var iXLength = xSeries.length;
            var iX = iXLength;
            var count = 0;
            while(xSeries[iX-1] >= data.xSeries[0]) {
                iX--;
            }

            if(xSeries[iX] != data.xSeries[0] && iX != iXLength) {
                count = 1;
            }

            iX = iX-count;

            xSeries.splice(iX, data.xSeries.length);

            for (var j = 0; j < data.xSeries.length; ++j)
            {
                xSeries.splice(iX + j, 0, data.xSeries[j])
            }

            for(var i =0; i < ySeriesCollection.length; i++)
            {
                ySeriesCollection[i].points.splice(iX, data.xSeries.length);
            }

        }

        if(this.chartOptions.futureAmount) {
            var timeframe = params.timeframe || this.env.dataSource.dataSettings.timeframe;
            var step = timeframe * 60;
            for(var i=0;i<this.chartOptions.futureAmount;i++) {
                xSeries.push(xSeries[xSeries.length-1]+step);
            }
        }

        var hlocAreaSeries = [];
        var volumeAreaSeries = [];
        var indicatorAreaSeries = {};
        for (var i = 0; i < data.ySeries.length; ++i)
        {
            var series = data.ySeries[i];
            switch (series.kind)
            {
                case "HLOC":
                    hlocAreaSeries.push(series);
                    break;
                case "TechnicalAnalysis":
                    if (series.overlay)
                    {
                        hlocAreaSeries.push(series);
                    }
                    else
                    {
                        if (typeof indicatorAreaSeries[series.indicatorIndex] === "undefined")
                        {
                            indicatorAreaSeries[series.indicatorIndex] = [series];
                        }
                        else
                        {
                            indicatorAreaSeries[series.indicatorIndex].push(series);
                        }
                    }

                    break;
                case "Volume":
                        volumeAreaSeries.push(series);
                    break;
                default:
                    continue;
            }
        }

        var ySeriesCollectionNew = [];
        for (var i = 0; i < hlocAreaSeries.length; ++i)
        {
            ySeriesCollectionNew.push(hlocAreaSeries[i]);
        }

        if(!this.isComparison) {
            for (var i = 0; i < volumeAreaSeries.length; ++i)
            {
                ySeriesCollectionNew.push(volumeAreaSeries[i]);
            }
        }

        for (var key in indicatorAreaSeries)
        {
            if (indicatorAreaSeries.hasOwnProperty(key))
            {
                for (var i = 0; i < indicatorAreaSeries[key].length; ++i)
                {
                    ySeriesCollectionNew.push(indicatorAreaSeries[key][i]);
                }
            }
        }

        if (ySeriesCollection.length > ySeriesCollectionNew.length)
        {
            throw new Error("Y series count mismatch while merging chart data, expected " + ySeriesCollection.length + ", got " + ySeriesCollectionNew.length + ".");
        }

        for (var i = 0; i < ySeriesCollection.length; ++i)
        {
            var series = ySeriesCollection[i];
            var seriesNew = ySeriesCollectionNew[i];
            if (series.kind !== seriesNew.kind)
            {
                //throw new Error("Y series kind mismatch while merging chart data.");
                continue;
            }

            if (params.count < 0)
            {
                if (includesEndpoint)
                {
                    series.points.splice(0, 1);
                }

                for (var j = seriesNew.points.length - 1; j >= 0; --j)
                {
                    series.points.splice(0, 0, seriesNew.points[j]);
                }
            }
            else
            {
                if (includesEndpoint)
                {
                    series.points.pop();
                }

                for (var j = 0; j < seriesNew.points.length; ++j)
                {
                    series.points.splice(iX + j, 0, seriesNew.points[j]);
                }
            }

            if(this.chartOptions.futureAmount) {
                if(series.valuesPerPoint==1) {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        series.points.push([null]);
                    }
                } else {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        series.points.push([null,null,null,null]);
                    }
                }
            }

        }

        for (var i = 0; i < this.areas.length; ++i)
        {
            this.areas[i].setMinMax();
        }

        this._setXLabelFormat();

        return xSeries.length - xSeriesOldCount;
    };

    iChart.Charting.Chart.prototype._mousewheelCallback = function (event)
    {
        /// <summary>
        /// Called when the mousewheel event occurs.
        /// </summary>
        /// <param name="event">Mousewheel event object.</param>
        /// <param name="delta" type="Number">Normalized mousewheel rotation.</param>

        if (!this.chartOptions.mousewheelZoom) {
            return;
        }

        var offset = $(this.container).offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;
        var position = this.findAreaAtPosition(x, y);
        var delta = event.deltaY;
        var deltaFactor = event.deltaFactor;
        if (position !== null) {
            this._zoomInternal(
                position.area,
                0.2 * delta * deltaFactor / 53,
                //position.insideX && position.insideY ? "xy" : position.insideX ? "x" : "y",
                "x",
                position.area.getXIndex(x - position.area.innerOffset.left),
                position.area.getYValue(y - position.area.innerOffset.top)
            );

            event.preventDefault();
        }
    };

    iChart.Charting.Chart.prototype.calculateHeight = function ()
    {
        var areas = this.areas ? $.grep(this.areas, function (x) { return x.enabled; }) : [];
        var primaryHeight;
        var secondaryHeight;
        var height = 0;
        var width = 0;

        if(this.chartOptions.uiTools.top) {
            var uiTopHeigth = this.env.ui.$topToolBarContainer.height();
        } else {
            var uiTopHeigth = 0;
        }

        if (this.chartOptions.minHeight && this.areas)
        {
            var heightWithoutScroller = this.chartOptions.minHeight - this.chartOptions.scrollerHeight - uiTopHeigth;
            var areaCount = $.grep(areas, function (x) { return !x.isLayer; }).length;
            secondaryHeight = Math.max(this.chartOptions.minAreaHeight, Math.floor(heightWithoutScroller / (areaCount + (this.chartOptions.scrollerHeight === 0 ? 0 : -1) + this.chartOptions.primaryToSecondaryAreaHeightRatio - 1)));
            primaryHeight = Math.floor(this.chartOptions.primaryToSecondaryAreaHeightRatio * secondaryHeight);
        }
        else
        {
            secondaryHeight = Math.round(this.chartOptions.primaryAreaHeight / this.chartOptions.primaryToSecondaryAreaHeightRatio);
            primaryHeight = this.chartOptions.primaryAreaHeight;
        }

        height += uiTopHeigth;

        if(this.areas) {
            for (var i = 0; i < areas.length; ++i)
            {
                var area = areas[i];
                if (area.isLayer)
                {
                    area.offset.left = 0;
                    area.outerWidth = width;
                    area.outerHeight = secondaryHeight;
                    area.offset.top = primaryHeight - area.outerHeight;
                }
                else
                {
                    area.offset.top = height;
                    area.offset.left = 0;
                    area.outerWidth = width;
                    area.outerHeight = area.name === "Scroller" ? this.chartOptions.scrollerHeight : area.name === "ChartArea1" ? primaryHeight : secondaryHeight;
                    area.updateCloseButton();
                    height += area.outerHeight + area.margin.bottom;
                }
            }
        } else {
            height += primaryHeight = primaryHeight + this.chartOptions.scrollerHeight;
        }
        return {height: height, primaryHeight: primaryHeight};
    };

    iChart.Charting.Chart.prototype._positionAreas = function ()
    {
        /// <summary>
        /// Positions chart areas vertically.
        /// </summary>

        if (!this.container) return;

        var $container = $(this.container);
        if($container.length && (this._resized || !this._containerSize.height || !this._containerSize.width)) {
            this._containerSize.height = $container.height();
            this._containerSize.width = $container.width();
            this._containerSize.offset = $container.offset();
            this._resized = false;
        }

        var containerHeight = this._containerSize.height;
        var containerWidth = this._containerSize.width;
        var areas = $.grep(this.areas, function (x) { return x.enabled; });
        var height = 0;
        var width = containerWidth;

        // Set outer dimensions.
        var primaryHeight;
        var secondaryHeight;

        if(this.chartOptions.uiTools.top) {
            var uiTopHeigth = this.env.ui.$topToolBarContainer.height();
        } else {
            var uiTopHeigth = 0;
        }

        if (this.chartOptions.minHeight)
        {
            var heightWithoutScroller = this.chartOptions.minHeight - this.chartOptions.scrollerHeight - uiTopHeigth;
            var areaCount = $.grep(areas, function (x) { return !x.isLayer; }).length;
            secondaryHeight = Math.max(this.chartOptions.minAreaHeight, Math.floor(heightWithoutScroller / (areaCount + (this.chartOptions.scrollerHeight === 0 ? 0 : -1) + this.chartOptions.primaryToSecondaryAreaHeightRatio - 1)));
            primaryHeight = Math.floor(this.chartOptions.primaryToSecondaryAreaHeightRatio * secondaryHeight);
        }
        else
        {
            secondaryHeight = Math.round(this.chartOptions.primaryAreaHeight / this.chartOptions.primaryToSecondaryAreaHeightRatio);
            primaryHeight = this.chartOptions.primaryAreaHeight;
        }

        for (var i = 0; i < areas.length; ++i)
        {
            var area = areas[i];
            if (area.isLayer)
            {
                area.offset.left = 0;
                area.outerWidth = width;
                area.outerHeight = secondaryHeight;
                area.offset.top = primaryHeight - area.outerHeight;
            }
            else
            {
                area.offset.top = height;
                area.offset.left = 0;
                area.outerWidth = width;
                area.outerHeight = area.name === "Scroller" ? this.chartOptions.scrollerHeight : area.name === "ChartArea1" ? primaryHeight : secondaryHeight;
                area.updateCloseButton();
                height += area.outerHeight + area.margin.bottom;
            }
        }

        // Set inner dimensions.
        var primaryArea = this.areas[0];
        primaryArea.axisX.paddingLeft = 10;
        primaryArea.axisX.paddingRight = 10;
        primaryArea.axisY.paddingTop = this.chartOptions.primaryAreaAxisYpaddingTop;
        primaryArea.axisY.paddingBottom = this.chartOptions.primaryAreaAxisYpaddingBottom;

        primaryArea.padding.bottom = this.chartOptions.areaPaddingBottom;
        primaryArea.padding.left = this.chartOptions.areaPaddingLeft;
        primaryArea.padding.right = this.chartOptions.yLabelsOutside ? this.chartOptions.areaPaddingRight : 0;
        primaryArea.padding.top = this.chartOptions.areaPaddingTop;

        for (var i = 1; i < this.areas.length; ++i)
        {
            var area = this.areas[i];
            switch (area.name)
            {
                case "ChartArea1":
                    break;
                case "ChartArea2":
                    area.axisX.paddingLeft = primaryArea.axisX.paddingLeft;
                    area.axisX.paddingRight = primaryArea.axisX.paddingRight;
                    area.axisY.paddingTop = 0;
                    area.axisY.paddingBottom = 0;
                    if (area.isLayer)
                    {
                        area.padding.bottom = primaryArea.padding.bottom;
                        area.padding.top = primaryArea.padding.top;
                    }
                    else
                    {
                        area.padding.bottom = 8;
                        area.padding.top = 18;
                    }

                    area.padding.left = primaryArea.padding.left;
                    area.padding.right = primaryArea.padding.right;
                    break;
                case "Scroller":
                    area.axisX.paddingLeft = primaryArea.axisX.paddingLeft;
                    area.axisX.paddingRight = primaryArea.axisX.paddingRight;
                    area.axisY.paddingTop = 10;
                    area.axisY.paddingBottom = 10;
                    area.padding.bottom = 32;
                    area.padding.left = primaryArea.padding.left;
                    area.padding.right = primaryArea.padding.right;
                    break;
                default:
                    area.axisX.paddingLeft = primaryArea.axisX.paddingLeft;
                    area.axisX.paddingRight = primaryArea.axisX.paddingRight;
                    area.axisY.paddingTop = 10;
                    area.axisY.paddingBottom = 10;
                    if (area.isLayer)
                    {
                        area.padding.bottom = primaryArea.padding.bottom;
                        area.padding.top = primaryArea.padding.top;
                    }
                    else
                    {
                        area.padding.bottom = 32;
                        area.padding.top = 0;
                    }

                    area.padding.left = primaryArea.padding.left;
                    area.padding.right = primaryArea.padding.right;
                    break;
            }
        }

        this.positionVolumeByPriceArea();

        var dimensions = this.onPositionAreas.call(this);
        if (dimensions)
        {
            width = dimensions.width || width;
            height = dimensions.height || height;
        }

        containerHeight = height;
        height += uiTopHeigth;

        this.canvas = iChart.Charting.initCanvas(this.container, this.canvas, containerWidth, containerHeight);

        $container.height(containerHeight);
    };

    iChart.Charting.Chart.prototype._selectionMouseDownCallback = function (selection)
    {
    };

    iChart.Charting.Chart.prototype._selectionMoveStartCallback = function (selection)
    {
        /// <summary>
        /// Called when the mouse selection starts.
        /// </summary>
        /// <param name="selection" type="iChart.Charting.ChartSelection">Selection container.</param>
        selection.moved = false;
        switch (selection.mode)
        {
            case "pan":
                selection.position1 = this.findAreaAtPosition(selection.x1, selection.y1);
                if (selection.position1 === null)
                {
                    break;
                }

                var area = selection.position1.area;
                if (selection.position1.insideX && selection.position1.insideY)
                {
                    selection.resizeScrollerL = area.isScroller && area.$scrollerOverlayCenterL.data("iChart-hover");
                    selection.resizeScrollerR = area.isScroller && !selection.resizeScrollerL && area.$scrollerOverlayCenterR.data("iChart-hover");

                    var areaViewport = area.isScroller ? area.scrollerViewport : area.viewport;
                    if (selection.resizeScrollerR)
                    {
                        selection.setAnchor(
                            this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max,
                            this.viewport.y.min === null || this.viewport.areaName !== area.name ? areaViewport.y.min : this.viewport.y.min);
                    }
                    else
                    {
                        selection.setAnchor(
                            this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min,
                            this.viewport.y.min === null || this.viewport.areaName !== area.name ? areaViewport.y.min : this.viewport.y.min);
                    }
                }
                else
                {
                    if (area.isScroller)
                    {
                        selection.position1 = null;
                        break;
                    }

                    if (selection.position1.insideX)
                    {
                        selection.setAnchor(area.getXIndex(selection.x1 - area.innerOffset.left), null);
                    }
                    else if (selection.position1.insideY)
                    {
                        selection.setAnchor(null, area.getYValue(selection.y1 - area.innerOffset.top));
                    }

                    selection.resizeScrollerL = false;
                    selection.resizeScrollerR = false;
                }

                if (selection.resizeScrollerL || selection.resizeScrollerR)
                {
                    this.container.style.cursor = this.overlay.defaultCursor = "ew-resize";
                }
                else
                {
                    this.container.style.cursor = this.overlay.defaultCursor
                        = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.env.lib_path + "/styles/cursors/grabbing.cur'), move";
                }

                break;
            case "zoom":
                selection.setAnchor(null, null);
                this.container.style.cursor = this.overlay.defaultCursor = "crosshair";
                break;
            case "wait":
                break;
            default:
                throw new Error("Selection mode '" + selection.mode + "' is invalid.");
        }
    };

    iChart.Charting.Chart.prototype._selectionMouseMoveCallback = function (selection)
    {
    };

    iChart.Charting.Chart.prototype._selectionMoveCallback = function (selection)
    {
        /// <summary>
        /// Called when the mouse selection moves.
        /// </summary>
        /// <returns type="Boolean">A value indicating whether the selection should be shown.</returns>

        selection.moved = true;
        switch (selection.mode)
        {
            case "pan":
                if (selection.position1 === null)
                {
                    break;
                }

                selection.position2 = this.findAreaAtPosition(selection.x2, selection.y2);
                if (selection.position2 === null)
                {
                    break;
                }

                if (selection.position2.area !== selection.position1.area || selection.position2.insideX !== selection.position1.insideX || selection.position2.insideY !== selection.position1.insideY)
                {
                    break;
                }

                var area = selection.position1.area;

                if (selection.position1.insideX && selection.position1.insideY)
                {
                    var areaViewport = area.isScroller ? area.scrollerViewport : area.viewport;
                    var deltaX = (area.isScroller ? -1 : 1) * (area.getXIndex(selection.x2 - area.innerOffset.left) - area.getXIndex(selection.x1 - area.innerOffset.left));
                    if (selection.resizeScrollerR)
                    {
                        deltaX += (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - selection.anchorX;
                    }
                    else
                    {
                        deltaX += (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - selection.anchorX;
                    }

                    var deltaY = area.isScroller ? 0 : area.getYValue(selection.y2 - area.innerOffset.top) - area.getYValue(selection.y1 - area.innerOffset.top) + ((this.viewport.y.min === null || this.viewport.areaName !== area.name ? areaViewport.y.min : this.viewport.y.min) - selection.anchorY);

                    if (!selection.resizeScrollerR)
                    {
                        this.viewport.x.max = (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max);
                        if(this.viewport.x.max - ((this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - deltaX) > 1) {
                            this.viewport.x.min = (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - deltaX;
                        }
                    }

                    if (!selection.resizeScrollerL)
                    {
                        this.viewport.x.min = (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min);
                        if(((this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - deltaX) - this.viewport.x.min > 1) {
                            this.viewport.x.max = (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - deltaX;
                        }
                    }

                    if (deltaY !== 0 && this.viewport.y.min !== null && this.viewport.y.max !== null)
                    {
                        // Pan vertically only when zoomed.
                        this.viewport.y.min = (this.viewport.areaName === area.name ? this.viewport.y.min : areaViewport.y.min) - deltaY;
                        this.viewport.y.max = (this.viewport.areaName === area.name ? this.viewport.y.max : areaViewport.y.max) - deltaY;
                    }

                    this.viewport.areaName = area.name;
                }
                else
                {
                    if (selection.position1.insideX)
                    {
                        this._zoomInternal(area, 3 * (selection.x2 - selection.x1) / area.innerWidth, "x", selection.anchorX, null);
                    }
                    else if (selection.position1.insideY)
                    {
                        this._zoomInternal(area, 3 * (selection.y2 - selection.y1) / area.innerHeight, "y", null, selection.anchorY);
                    }

                    selection.x1 = selection.x2;
                    selection.y1 = selection.y2;
                }

                this._fixViewportBounds();
                this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
                this.loadMissingData();
                return false;
            case "zoom":
            case "wait":
                return true;
            default:
                throw new Error("Selection mode '" + selection.mode + "' is invalid.");
        }
    };

    iChart.Charting.Chart.prototype._selectionMouseUpCallback = function (selection)
    {
    };

    iChart.Charting.Chart.prototype._selectionMoveEndCallback = function (selection)
    {
        /// <summary>
        /// Called when the mouse selection is complete.
        /// </summary>

        if (selection.mode === "pan")
        {
            this.container.style.cursor = this.overlay.defaultCursor
                = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.env.lib_path + "/styles/cursors/grab.cur'), move";
        }
        else
        {
            this.container.style.cursor = this.overlay.defaultCursor = "crosshair";
        }

        if(!selection.moved && !selection.position1.insideX && selection.position1.insideY) {
            this.chartOptions.showCurrentLabel = !this.chartOptions.showCurrentLabel;
            this.env.wrapper.trigger('iguanaChartEvents', ['chartOptionsChanged', {showCurrentLabel: this.chartOptions.showCurrentLabel}]);
            this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
            return;
        }

        var threshold = selection.mode === "pan" ? 1 : 20;
        if (Math.abs(selection.x2 - selection.x1) < threshold && Math.abs(selection.y2 - selection.y1) < threshold)
        {
            return;
        }

        if (selection.position1 === null)
        {
            return;
        }

        selection.position2 = this.findAreaAtPosition(selection.x2, selection.y2);
        if (selection.position2 === null)
        {
            return;
        }

        if (selection.position2.area !== selection.position1.area || selection.position2.insideX !== selection.position1.insideX || selection.position2.insideY !== selection.position1.insideY)
        {
            return;
        }

        var area = selection.position1.area;
        switch (selection.mode)
        {
            case "pan":
                if (selection.position1.insideX && selection.position1.insideY)
                {
                    var areaViewport = area.isScroller ? area.scrollerViewport : area.viewport;
                    var deltaX = (area.isScroller ? -1 : 1) * (area.getXIndex(selection.x2 - area.innerOffset.left) - area.getXIndex(selection.x1 - area.innerOffset.left));
                    if (selection.resizeScrollerR)
                    {
                        deltaX += (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - selection.anchorX;
                    }
                    else
                    {
                        deltaX += (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - selection.anchorX;
                    }

                    var deltaY = area.isScroller ? 0 : area.getYValue(selection.y2 - area.innerOffset.top) - area.getYValue(selection.y1 - area.innerOffset.top) + ((this.viewport.y.min === null || this.viewport.areaName !== area.name ? areaViewport.y.min : this.viewport.y.min) - selection.anchorY);
                    if (!selection.resizeScrollerR)
                    {
                        this.viewport.x.max = (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max);
                        if(this.viewport.x.max - ((this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - deltaX) > 1) {
                            this.viewport.x.min = (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min) - deltaX;
                        }
                    }

                    if (!selection.resizeScrollerL)
                    {
                        this.viewport.x.min = (this.viewport.x.min === null || this.viewport.areaName !== area.name ? areaViewport.x.min : this.viewport.x.min);
                        if(((this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - deltaX) - this.viewport.x.min > 1) {
                            this.viewport.x.max = (this.viewport.x.max === null || this.viewport.areaName !== area.name ? areaViewport.x.max : this.viewport.x.max) - deltaX;
                        }
                    }

                    if ((selection.resizeScrollerL || selection.resizeScrollerR) && this.viewport.x.min !== null && this.viewport.x.max !== null && this.viewport.x.min > this.viewport.x.max)
                    {
                        var min = this.viewport.x.min;
                        this.viewport.x.min = this.viewport.x.max;
                        this.viewport.x.max = min;
                    }

                    if (deltaY !== 0 && this.viewport.y.min !== null && this.viewport.y.max !== null)
                    {
                        this.viewport.y.min = (this.viewport.areaName === area.name ? this.viewport.y.min : areaViewport.y.min) - deltaY;
                        this.viewport.y.max = (this.viewport.areaName === area.name ? this.viewport.y.max : areaViewport.y.max) - deltaY;
                    }
                }
                else
                {
                    if (selection.position1.insideX)
                    {
                        this._zoomInternal(area, (selection.x2 - selection.x1) / area.innerWidth, "x", selection.anchorX, null);
                    }
                    else if (selection.position1.insideY)
                    {
                        this._zoomInternal(area, (selection.y2 - selection.y1) / area.innerHeight, "y", null, selection.anchorY);
                    }
                }

                this._fixViewportBounds();
                break;
            case "zoom":
                var xmin = area.getXIndex((selection.x1 < selection.x2 ? selection.x1 : selection.x2) - area.innerOffset.left);
                var xmax = area.getXIndex((selection.x1 < selection.x2 ? selection.x2 : selection.x1) - area.innerOffset.left);
                this.viewport.x.min = Math.max(area.xSeries.min, Math.min(xmin, area.xSeries.max));
                this.viewport.x.max = Math.min(area.xSeries.max, xmax);
                this.viewport.y.min = area.getYValue((selection.y1 > selection.y2 ? selection.y1 : selection.y2) - area.innerOffset.top);
                this.viewport.y.max = area.getYValue((selection.y1 > selection.y2 ? selection.y2 : selection.y1) - area.innerOffset.top);
                break;
            case "wait":
                break;
            default:
                throw new Error("Selection mode '" + selection.mode + "' is invalid.");
        }

        this.viewport.areaName = area.name;
        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
        this.loadMissingData();


        if(selection.mode == 'pan' && !area.isScroller && this.chartOptions.inertialScrolling) {
            var dX = selection.xSpeed * 10 * (selection.xSpeed, this.viewport.x.max - this.viewport.x.min) / 50;
            if(dX >= 1) {
                if (selection.x1 > selection.x2) {
                    selection.animate = this.env.scrollTo(dX);
                } else if (selection.x1 < selection.x2) {
                    selection.animate = this.env.scrollTo(-dX);
                }
            }
        }

    };

    iChart.Charting.Chart.prototype._setData = function (data, params)
    {
        /// <summary>
        /// Creates chart areas and series according to the specified chart data.
        /// </summary>
        /// <param name="data" type="Object">Chart data.</param>
        /// <param name="params" type="Object">Data request parameters.</param>

        if (this.areas)
        {
            for (var i = 0; i < this.areas.length; ++i)
            {
                this.areas[i].dispose();
            }
        }

        this.areas = [];

        var hlocArea = new iChart.Charting.ChartArea({ "chart": this, "name": "ChartArea1", showLabels: this.showLabels});
        var scrollerArea = new iChart.Charting.ChartArea({ "chart": this, "isScroller": true, "name": "Scroller", "showLegend": false });
        var volumeArea = new iChart.Charting.ChartArea({
            "chart": this,
            "name": "ChartArea2",
            "parentName": this.chartOptions.showVolume === "outside" ? undefined : hlocArea.name,
            "showAxes": this.chartOptions.showVolume == "outside",
            "showLabels": this.chartOptions.showVolume == "outside",
            "showLegend": this.chartOptions.showVolume == "outside",
            "showWatermark": this.chartOptions.showVolume == "outside"
        });

        var hlocAreaSeries = [];
        var scrollerAreaSeries = [];
        var volumeAreaSeries = [];
        var indicatorAreaSeries = {};

//-------------------------------------------------------------------------------------------
        if(this.chartOptions.futureAmount) {
            var step = params.timeframe * 60;
            for(var i=0;i<this.chartOptions.futureAmount;i++) {
                data.xSeries.push(data.xSeries[data.xSeries.length-1]+step);
            }

            for(var i=0;i<data.ySeries.length;i++) {
                if(data.ySeries[i].valuesPerPoint==1) {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        data.ySeries[i].points.push([null]);
                    }
                } else {
                    for(var j=0;j<this.chartOptions.futureAmount;j++) {
                        data.ySeries[i].points.push([null,null,null,null]);
                    }
                }
            }
        }
//-------------------------------------------------------------------------------------------
        var seriesIndex = 0;
        var ij = 0;
        for (var i = 0; i < data.ySeries.length; ++i)
        {
            var series = data.ySeries[i];
            series.isStartedFromZero = false;
            switch (series.kind)
            {
                case "HLOC":
                    series.chartArea = hlocArea.name;
                    var colors = $.extend([], this.chartOptions.seriesColors);
                    colors.splice(0,0,this.chartOptions.lineColor);
                    series.color = colors[hlocAreaSeries.length % colors.length];

                    hlocAreaSeries.push(series);
                    scrollerAreaSeries.push(series);
                    break;
                case "TechnicalAnalysis":

                    var iName = series.name.replace(/\s.*$/,'');
                    for(var j = ij; j < 3; j++) {
                        ij++;
                        if(params["i" + j] == iName) {
                            var colorIndex = j;
                            break;
                        }
                    }

                    var indicatorColors = this.chartOptions.indicatorColors[colorIndex];
                    //series.color = indicatorColors[series.indicatorIndex2 % indicatorColors.length];
                    var userIndicatorsColor = this.env.userSettings.chartSettings.indicatorsColor;
                    if(userIndicatorsColor[iName] && typeof userIndicatorsColor[iName][colorIndex] != "undefined") {
                        var iColor = userIndicatorsColor[iName][colorIndex][series.indicatorIndex2 % userIndicatorsColor[iName][colorIndex].length];
                        series.color = iColor || indicatorColors[series.indicatorIndex2 % indicatorColors.length];
                    } else {
                        series.color = indicatorColors[series.indicatorIndex2 % indicatorColors.length];
                    }

                    var userIndicatorsWidth = this.env.userSettings.chartSettings.indicatorsWidth;
                    if(userIndicatorsWidth[iName] && typeof userIndicatorsWidth[iName][colorIndex][series.indicatorIndex2 % userIndicatorsWidth[iName][colorIndex].length] != "undefined") {
                        series.width = userIndicatorsWidth[iName][colorIndex][series.indicatorIndex2 % userIndicatorsWidth[iName][colorIndex].length] || 2;
                    } else {
                        series.width = 2;
                    }

                    if (series.overlay)
                    {
                        series.chartArea = hlocArea.name;
                        hlocAreaSeries.push(series);
                    }
                    else
                    {
                        series.chartArea = "ChartAreaI" + series.indicatorIndex;
                        if (typeof indicatorAreaSeries[series.indicatorIndex] === "undefined")
                        {
                            indicatorAreaSeries[series.indicatorIndex] = [series];
                        }
                        else
                        {
                            indicatorAreaSeries[series.indicatorIndex].push(series);
                        }
                    }

                    break;
                case "Volume":
                    series.chartType = "Column";
                    series.color = this.chartOptions.volumeStyle;
                    series.isStartedFromZero = true;
                    series.chartArea = hlocArea.name;
                    series.chartArea = volumeArea.name;
                    volumeAreaSeries.push(series);

                    break;
                default:
                    continue;
            }

            series.enableMerge = true;
            series.index = seriesIndex++;

            if (series.valuesPerPoint === 4)
            {
                series.closeValueIndex = 3;
                series.lowValueIndex = 1;
            }
            else
            {
                series.closeValueIndex = 0;
                series.lowValueIndex = 0;
            }

            series.highValueIndex = 0;
        }

        this.isComparison = scrollerAreaSeries.length > 1 || this.chartOptions.percentMode;

        for (var i = 0; i < data.ySeries.length; ++i)
        {
            var series = data.ySeries[i];
            var color = series.color ? series.color.replace(/rgba\((.+),[^,]+\)/, "rgb($1)") : '';
            var $label = $("<span/>", { "class": "m-chart-legend-color" }).css({ "background-color": color }).html("&nbsp;");
            $label = $label.add($("<span/>", { "class": "m-chart-legend-name" }).css({ "color": color }).text(series.name));
            var labelText = series.name;
            var labelHtml = $("<div/>").append($label).html();
            if (series.valuesPerPoint === 4)
            {
                series.dotIndex = 3;
                if (this.isComparison)
                {
                    series.labels = [[3, labelHtml]];
                }
                else
                {
                    series.labels = [[2, labelHtml + "O:"], [0, "H:"], [1, "L:"], [3, "C:"]];
                }
            }
            else if (series.valuesPerPoint == 2)
            {
                series.labels = [[1, labelHtml + _t('2589', "Мин:")], [0, _t('2590', "Макс:")]];
            }
            else
            {
                series.labels = [[0, labelHtml, labelText]];
            }
        }

        hlocArea.axisX.showLabels = true;
        hlocArea.enabled = true;
        hlocArea.xSeries = data.xSeries;
        hlocArea.ySeries = hlocAreaSeries;
        this.areas.push(hlocArea);

        scrollerArea.axisX.showLabels = true;
        scrollerArea.enabled = this.chartOptions.scrollerHeight !== 0;
        scrollerArea.xSeries = data.xSeries;
        scrollerArea.ySeries = scrollerAreaSeries;

        if (scrollerArea.enabled) {
            this.areas.push(scrollerArea);
        }

        if (!this.isComparison)
        {
            //volumeArea.enabled = this.showVolume === "inside" || this.showVolume === "outside";
            //данные нам нужны всегда
            volumeArea.enabled = true;
            if (volumeArea.enabled)
            {
                volumeArea.enabled = false;
                for (var i = 0; i < volumeAreaSeries.length; ++i)
                {
                    if (volumeAreaSeries[i].enabled)
                    {
                            volumeArea.enabled = true;
                        break;
                    }
                }
            }

            if (volumeArea.enabled)
            {
                volumeArea.axisX.showLabels = false;
                volumeArea.xSeries = hlocArea.xSeries;
                volumeArea.ySeries = volumeAreaSeries;
                this.areas.push(volumeArea);
            }
            //показ объемов в зависимости от конфигурации
            volumeArea.enabled = this.chartOptions.showVolume === "inside" || this.chartOptions.showVolume === "outside";
        }

        for (var key in indicatorAreaSeries)
        {
            if (!indicatorAreaSeries.hasOwnProperty(key))
            {
                continue;
            }

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this });
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = hlocArea.xSeries;
            indicatorArea.ySeries = indicatorAreaSeries[key];
            indicatorArea.name = indicatorArea.ySeries[0].chartArea;
            var chart = this;
            indicatorArea.onClose = function ()
            {
                chart.clearIndicators(this);
            };

            this.areas.push(indicatorArea);
        }

        this.createValueByPriceArea();
        this.onCreateAreas.call(this, data, params);

        for (var i = 0; i < this.areas.length; ++i)
        {
            this.areas[i].setMinMax();
        }

        this._setXLabelFormat();

        return data.xSeries.length;
    };

    iChart.Charting.Chart.prototype.createValueByPriceArea = function () {
        // Create layer for the volume by price data.
        var _this = this;
        var area = new iChart.Charting.ChartArea({
            "chart": this,
            "ignoreViewport": true,
            "name": "VolumeByPriceArea",
            "onCalculateViewport": function (viewport)
            {
                // Align X axis with HLOC area Y axis.
                var getIndex = function (series, value)
                {
                    return series.min + (series.max - series.min) * (series[series.min] - value) / (series[series.min] - series[series.max]);
                };
                var baseViewport = _this.areas[0].viewport;
                viewport.x.min = getIndex(this.xSeries, baseViewport.y.max);
                viewport.x.max = getIndex(this.xSeries, baseViewport.y.min);
                viewport.x.bounded.min = Math.max(this.xSeries.min, Math.floor(viewport.x.min));
                viewport.x.bounded.max = Math.min(this.xSeries.max, Math.ceil(viewport.x.max));
                return viewport;
            },
            "parentName": "ChartArea1",
            "showAxes": false,
            "showLabels": false,
            "showLegend": false,
            "showWatermark": false
        });

        area.axisX.showLabels = true;
        area.enabled = this.chartOptions.showVolumeByPrice;
        //area.enabled = true;
        area.rotate = true;
        area.ySeries = [{
            "chartType": "Column",
            "closeValueIndex": 0,
            "color": this.chartOptions.volumeStyle,
            "enabled": true,
            "enableMerge": false,
            "formatProvider": { "decimalPlaces": "2", "decimalPrecision": null },
            "highValueIndex": 0,
            "isStartedFromZero": true,
            "kind": "Other",
            "lowValueIndex": 0,
            "name": "V(Price)",
            "valuesPerPoint": 1
        }];

        area.xSeries = [];
        area.ySeries[0].points = [];

        if(this.chartOptions.showVolumeByPrice) {
            this.updateVolumeByPrice();
        }

        var valueArea = $.grep(this.areas, function (x) { return x.name === "VolumeByPriceArea"; })[0];
        if (valueArea && area.enabled)
        {
            valueArea.enabled = false;
        }

        this.areas.push(area);

    };

    iChart.Charting.Chart.prototype.updateVolumeByPrice = function ()
    {
        if(!this.chartOptions.showVolumeByPrice) {
            return;
        }

        var maxY = 0;
        var minY = this.areas[0].viewport.y.max;

        for(var i=Math.floor(this.areas[0].viewport.x.min); i<=Math.ceil(this.areas[0].viewport.x.max); i++) {
            if(this.areas[0] && this.areas[0].ySeries[0] && this.areas[0].ySeries[0].points[i]) {
                if(maxY < this.areas[0].ySeries[0].points[i][0]) {
                    maxY = this.areas[0].ySeries[0].points[i][0];
                }
                if(minY > this.areas[0].ySeries[0].points[i][1]) {
                    minY = this.areas[0].ySeries[0].points[i][1];
                }
            }
        }

        var step = (maxY-minY) / 50;

        var candleStepVl = {};

        for(var i=Math.floor(this.areas[0].viewport.x.min); i<=Math.ceil(this.areas[0].viewport.x.max); i++) {
            candleStepVl[i] = 0;

            if(typeof this.areas[2].ySeries != "undefined") {
                if (this.areas[2].ySeries[0].points[i] && this.areas[0].ySeries[0].points[i]
                    && (this.areas[0].ySeries[0].points[i][0] - this.areas[0].ySeries[0].points[i][1]) != 0) {
                    candleStepVl[i] = (this.areas[2].ySeries[0].points[i][0])
                        / (this.areas[0].ySeries[0].points[i][0] - this.areas[0].ySeries[0].points[i][1])
                        * step;

                } else if (this.areas[2].ySeries[0].points[i] && this.areas[0].ySeries[0].points[i]
                    && (this.areas[0].ySeries[0].points[i][0] - this.areas[0].ySeries[0].points[i][1]) == 0) {
                    candleStepVl[i] = this.areas[2].ySeries[0].points[i][0];
                }
            }
        }

        var xSeries = [];
        var ySeries = [];

        for(var level=maxY; level>minY; level-=step) {
            xSeries.push(level);

            var levelSum = 0;
            for(var i=Math.floor(this.areas[0].viewport.x.min); i<=Math.ceil(this.areas[0].viewport.x.max); i++) {
                if(this.areas[0].ySeries[0].points[i]) {
                    var max = this.areas[0].ySeries[0].points[i][0];
                    var min = this.areas[0].ySeries[0].points[i][1];

                    if( (level > max && level-step < max) || (level > min && level-step < min) || (level < max && level-step > min)) {
                        levelSum += candleStepVl[i];
                    }
                }
            }

            ySeries.push([levelSum]);
        }

        var area = $.grep(this.areas, function (x) { return x.name === "VolumeByPriceArea"; })[0];

        if(area) {
            area.enabled = true;

            // Array of prices.
            area.xSeries = xSeries;

            // Array of arrays of volumes.
            area.ySeries[0].points = ySeries;

            area.setMinMax();

            // Redraw the chart.
            this.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        }
    };

    iChart.Charting.Chart.prototype.positionVolumeByPriceArea = function ()
    {
        /// <summary>
        /// Called after the chart area inner/outer dimensions and offsets are calculated.
        /// </summary>

        var area = $.grep(this.areas, function (x) { return x.name === "VolumeByPriceArea"; })[0];
        if (area)
        {
            // Align with the HLOC area.
            var parentArea = this.areas[0];
            area.axisX.paddingLeft = parentArea.axisY.paddingTop;
            area.axisX.paddingRight = parentArea.axisY.paddingBottom;
            area.axisX.pointPadding = 0;
            area.axisY.paddingTop = 0;
            area.axisY.paddingBottom = 0;
            area.enabled = this.chartOptions.showVolumeByPrice;
            area.outerHeight = parentArea.outerHeight;
            area.outerWidth = Math.round(parentArea.outerWidth / 5);
            area.offset.top = parentArea.offset.top;
        }
    };

    iChart.Charting.Chart.prototype._setXLabelFormat = function ()
    {
        /// <summary>
        /// Sets default abscissa label format based on the selected timeframe and interval.
        /// </summary>

        var area = this.areas[0];
        if (area.xSeries.min > area.xSeries.max)
        {
            return;
        }

        var now = new Date();
        var start = new Date(1000 * area.xSeries[area.xSeries.min]);
        if (this.showTime())
        {
                this.dateFormat = "HH:mm\r\nd MMM";
        }
        else
        {
                this.dateFormat = "d MMM\r\nyyyy";
        }
    };

    iChart.Charting.Chart.prototype._testForIntervalChange = function (bySchedule)
    {
        /// <summary>
        /// Fires the interval change event if necessary.
        /// </summary>

        if (!this._dataSettings)
        {
            return;
        }

        var area = this.areas[0];
        var previousStart = this._dataSettings.start;
        var previousEnd = this._dataSettings.end;
        var start = area.xSeries[area.viewport.x.bounded.min];
        var end = area.xSeries[area.viewport.x.bounded.max];
        this._dataSettings.start = start && (area.viewport.x.bounded.min !== area.xSeries.min || this._dataStart) ? new Date(start * 1000) : null;
        this._dataSettings.end = end && (area.viewport.x.bounded.max !== area.xSeries.max || this._dataEnd) ? new Date(end * 1000) : null;

        if (typeof previousStart === "undefined")
        {
            return;
        }

        if (!this._dataSettings.start === !previousStart
            && !this._dataSettings.end === !previousEnd
            && (!this._dataSettings.start || this._dataSettings.start.getTime() === previousStart.getTime())
            && (!this._dataSettings.end || this._dataSettings.end.getTime() === previousEnd.getTime()))
        {
            return;
        }

        this.onDataSettingsChange.call(this, bySchedule);
        this.onIntervalChange.call(this, this._dataSettings.start, this._dataSettings.end);
    };

    iChart.Charting.Chart.prototype._zoomInternal = function (area, level, axis, x, y)
    {
        /// <summary>
        /// Zooms the chart for the specified amount.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area that should be scaled. Leave empty to scale the default area.</param>
        /// <param name="level" type="Number">Zoom level.</param>
        /// <param name="axis" type="String">Axes that should be scaled, valid values are &quot;x&quot;, &quot;y&quot; and &quot;xy&quot;. Leave empty to scale both axes.</param>
        /// <param name="x" type="Number">X coordinate of the point to which the area should be zoomed. Leave empty to zoom to the center.</param>
        /// <param name="y" type="Number">Y coordinate of the point to which the area should be zoomed. Leave empty to zoom to the middle.</param>

        if (!area)
        {
            for (var i = 0; i < this.areas.length; ++i)
            {
                if (this.areas[i].name === this.viewport.areaName)
                {
                    area = this.areas[i];
                }
            }

            if (!area)
            {
                area = this.areas[0];
            }
        }

        if(area.name !== "Scroller") {

        // If viewport area changed keep X scale but reset Y scale.
            if (this.viewport.areaName !== area.name)
            {
                this.viewport.y.min = null;
                this.viewport.y.max = null;
            }

            this.viewport.areaName = area.name;

            if (axis !== "y")
            {
                if (this.viewport.x.min === null)
                {
                    this.viewport.x.min = area.viewport.x.bounded.min;
                }

                if (this.viewport.x.max === null)
                {
                    this.viewport.x.max = area.viewport.x.bounded.max;
                }

                if (!$.isNumeric(x))
                {
                    x = (this.viewport.x.min + this.viewport.x.max) / 2;
                }

                if (area.xSeries.min < area.xSeries.max && this.viewport.x.min < this.viewport.x.max)
                {
                    if (level < 0)
                    {
                        level = Math.max(level, 1 - ((area.xSeries.max - area.xSeries.min) / (0.3 * (this.viewport.x.max - this.viewport.x.min))));
                    }
                    else if (level > 0)
                    {
                        level = Math.min(level, 1 - ((area.xSeries.max - area.xSeries.min) / (1e3 * (this.viewport.x.max - this.viewport.x.min))));
                    }
                }
            }

            if (axis !== "x")
            {
                if (this.viewport.y.min === null)
                {
                    this.viewport.y.min = area.viewport.y.min;
                }

                if (this.viewport.y.max === null)
                {
                    this.viewport.y.max = area.viewport.y.max;
                }

                if (!$.isNumeric(y))
                {
                    y = (this.viewport.y.min + this.viewport.y.max) / 2;
                }

                if (area.ySeries.bounds.min < area.ySeries.bounds.max)
                {
                    if (level < 0)
                    {
                        level = Math.max(level, 1 - ((area.ySeries.bounds.max - area.ySeries.bounds.min) / (0.3 * (this.viewport.y.max - this.viewport.y.min))));
                    }
                    else if (level > 0)
                    {
                        level = Math.min(level, 1 - ((area.ySeries.bounds.max - area.ySeries.bounds.min) / (1e3 * (this.viewport.y.max - this.viewport.y.min))));
                    }
                }
            }

            if (axis !== "y")
            {
                var limit = (this.viewport.x.max - (level * (this.viewport.x.max - x)))-(this.viewport.x.min + (level * (x - this.viewport.x.min)));

                if((this.chartOptions.maxZoom > 0 && limit >= this.chartOptions.maxZoom) || level < 0 || this.chartOptions.maxZoom == 0) {
                    this.viewport.x.min += level * (x - this.viewport.x.min);
                    //this.viewport.x.max -= level * (this.viewport.x.max - x);
                }
            }

            if (axis !== "x")
            {
                this.viewport.y.min += level * (y - this.viewport.y.min);
                this.viewport.y.max -= level * (this.viewport.y.max - y);
            }

        } else {

            if (this.viewport.areaName !== area.name)
            {
                this.viewport.y.min = null;
                this.viewport.y.max = null;
            }

            this.viewport.areaName = area.name;

            if (this.viewport.x.min === null)
            {
                this.viewport.x.min = area.scrollerViewport.x.bounded.min
            }

            if (this.viewport.x.max === null)
            {
                this.viewport.x.max = area.scrollerViewport.x.bounded.max
            }

            var deltaX = (this.viewport.x.max - this.viewport.x.min) / 10;
            var direction = (level > 0) ? 1 : -1;

            var limitRight = area.viewport.x.bounded.max-area.chart.chartOptions.futureAmount+(this.viewport.x.max-this.viewport.x.min)*5/10;
            var limittLeft = area.viewport.x.bounded.min-(this.viewport.x.max-this.viewport.x.min)*5/10;


            if((this.viewport.x.max < limitRight || direction == -1) && (this.viewport.x.min > limittLeft || direction == 1)) {
                this.viewport.x.min += direction * deltaX;
                this.viewport.x.max += direction * deltaX;
            }
        }

        this.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
        this.loadMissingData();
    };
})();
