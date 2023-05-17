/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartArea = function (settings)
    {
        /// <summary>
        /// Initializes a new instance of the iChart.Charting.ChartArea class.
        /// </summary>
        /// <param name="settings" type="Object">Chart area parameters.</param>
        /// <field name="axisX">X axis settings and properties.</field>
        /// <field name="axisY">Y axis settings and properties.</field>
        /// <field name="chart" type="iChart.Charting.Chart">Chart containing the area.</field>
        /// <field name="ignoreViewport" type="Boolean">A value indicating whether the global viewport should be ignored when calculating the area viewport. If true, all data points will always be visible.</field>
        /// <field name="innerHeight" type="Number">Inner pixel height.</field>
        /// <field name="innerOffset">Pixel offset of the inner area.</field>
        /// <field name="innerWidth" type="Number">Inner pixel width.</field>
        /// <field name="isLayer" type="Boolean">A value indicating whether this area is a layer (overlay/underlay). Layers are positioned relative to the parent area.</field>
        /// <field name="isScroller" type="Boolean">A value indicating whether this area is a scroller.</field>
        /// <field name="margin">Pixel margin.</field>
        /// <field name="name" type="String">Area name.</field>
        /// <field name="offset">Pixel offset of the outer area.</field>
        /// <field name="outerHeight" type="Number">Outer pixel height.</field>
        /// <field name="outerWidth" type="Number">Outer pixel width.</field>
        /// <field name="padding">Pixel padding.</field>
        /// <field name="padding">Pixel padding.</field>
        /// <field name="parentName" type="String">Parent area name.</field>
        /// <field name="rotate" type="Boolean">A value indicating whether the area should be rotated 90 degrees clockwise (default is false).</field>
        /// <field name="showAxes" type="Boolean">A value indicating whether the axes should be visible.</field>
        /// <field name="showLabels" type="Boolean">A value indicating whether the axis labels and grid lines should be visible.</field>
        /// <field name="showLegend" type="Boolean">A value indicating whether the legend above the area (with the series names and current values) should be visible.</field>
        /// <field name="showWatermark" type="Boolean">A value indicating whether the watermark text should be visible.</field>
        /// <field name="viewport">Current viewport.</field>
        /// <field name="xSeries">X series (date/time/index).</field>
        /// <field name="ySeries">Y series collection.</field>

        this.axisX = {};
        this.axisX.paddingLeft = 0;
        this.axisX.paddingRight = 0;
        this.axisX.pointPadding = 0.5;
        this.axisY = {};
        this.axisY.PaddingTop = 0;
        this.axisY.PaddingBottom = 0;

        this.chart = settings.chart;
        this.ignoreViewport = !!settings.ignoreViewport;

        this.innerHeight = 0;
        this.innerWidth = 0;

        this.innerOffset = {};
        this.innerOffset.left = 0;
        this.innerOffset.top = 0;

        this.isLayer = !!settings.parentName;
        this.isScroller = !!settings.isScroller;

        this.margin = {};
        this.margin.bottom = 0;

        this.name = settings.name;

        this.offset = {};
        this.offset.left = 0;
        this.offset.top = 0;

        this.onCalculateViewport = settings.onCalculateViewport || $.noop;

        this.outerHeight = 0;
        this.outerWidth = 0;

        this.padding = {};
        this.padding.top = 0;
        this.padding.right = 0;
        this.padding.bottom = 0;
        this.padding.left = 0;

        this.parentName = settings.parentName;
        this.rotate = !!settings.rotate;

        this.scrollerViewport = null;

        this.showAxes = typeof settings.showAxes === "undefined" ? true : !!settings.showAxes;
        this.showLabels = typeof settings.showLabels === "undefined" ? true : !!settings.showLabels;
        this.showLegend = typeof settings.showLegend === "undefined" ? true : !!settings.showLegend;
        this.showWatermark = typeof settings.showWatermark === "undefined" ? true : !!settings.showWatermark;

        this.viewport = {};
        this.viewport.x = {};
        this.viewport.x.bounded = {};
        this.viewport.y = {};

        this.xSeries = null;
        this.ySeries = [];

        if (this.isScroller)
        {
            $(this.chart.container).find('div.m-chart-scrollerOverlay').remove();
            this.$scrollerOverlay = $("<div class='m-chart-scrollerOverlay'/>").css({"position": "absolute", "z-index": 1 }).appendTo(this.chart.container);
            this.$scrollerOverlayRight = $("<div class='js-scrollerOverlay m-chart-scrollerOverlayRight'/>").hide().css({}).appendTo(this.$scrollerOverlay);
            this.$scrollerOverlayCenter = $("<div/>").hide().css({ "position": "absolute", "z-index": 1 }).appendTo(this.$scrollerOverlay);
            this.$scrollerOverlayCenterR = $("<div/>", { "text": "|", class: 'js-scrollerHandler m-chart-scrollerOverlayHandle' }).hide().css({}).appendTo(this.$scrollerOverlay);
            this.$scrollerOverlayCenterR.hover(function () { $(this).data("iChart-hover", true); }, function () { $(this).removeData("iChart-hover"); }).attr("unselectable", "on").css("user-select", "none").on("selectstart", false);
            this.$scrollerOverlayCenterL = $("<div />", { "text": "|", class: 'js-scrollerHandler m-chart-scrollerOverlayHandle' }).hide().css({}).appendTo(this.$scrollerOverlay);
            this.$scrollerOverlayCenterL.hover(function () { $(this).data("iChart-hover", true); }, function () { $(this).removeData("iChart-hover"); }).attr("unselectable", "on").css("user-select", "none").on("selectstart", false);
            this.$scrollerOverlayLeft = $("<div class='js-scrollerOverlay m-chart-scrollerOverlayLeft'/>").hide().css({}).appendTo(this.$scrollerOverlay);
            $(this.chart.container).find('div.m-chart-scrollforward').remove();
            var $thisArea = this;
            this.$scrollForward = $("<div class='m-chart-scrollforward m-chart-btn' style='min-width: 40px; width:40px; background: #777777; transition: all 0ms'; ><span class='uk-icon-step-forward'></span></div>").hide().appendTo(this.$scrollerOverlay).click(function(){
                $thisArea.chart.env.scrollForward();
            });
        }
    };

    iChart.Charting.ChartArea.prototype.calculateInnerDimensions = function (viewport)
    {
        /// <summary>
        /// Calculates chart area and axis pixel dimensions.
        /// </summary>
        /// <param name="viewport">Inner area viewport (without padding).</param>

        if (this.isScroller)
        {
            this.scrollerViewport = this._calculateViewport(viewport);
            this.viewport = this._calculateViewport();
        }
        else
        {
            this.viewport = this._calculateViewport(viewport);
        }

        if (!this.viewport)
        {
            return;
        }

        this.innerOffset.left = this.offset.left + this.padding.left;
        this.innerOffset.top = this.offset.top + this.padding.top;

        this.innerWidth = this.outerWidth - this.padding.left - this.padding.right;
        this.innerHeight = this.outerHeight - this.padding.top - this.padding.bottom;

        if (this.rotate)
        {
            this.axisX.length = this.innerHeight;
            this.axisY.length = this.innerWidth;
            }
        else
        {
            this.axisX.length = this.innerWidth;
            this.axisY.length = this.innerHeight;
        }

        var paddingXLeft = this.axisX.paddingLeft * (this.viewport.x.max - this.viewport.x.min + (2 * this.axisX.pointPadding)) / (this.axisX.length - (2 * this.axisX.paddingLeft));
        var paddingXRight = this.axisX.paddingRight * (this.viewport.x.max - this.viewport.x.min + (2 * this.axisX.pointPadding)) / (this.axisX.length - (2 * this.axisX.paddingRight));
        this.axisX.min = this.viewport.x.min - this.axisX.pointPadding - paddingXLeft;
        this.axisX.max = this.viewport.x.max + this.axisX.pointPadding + paddingXRight;
        this.axisX.pointWidth = Math.min(Math.max(0, Math.floor((0.4 * this.axisX.length) / (this.viewport.x.max - this.viewport.x.min + 1))), 50);

        var paddingYTop = this.axisY.paddingTop * (this.viewport.y.max - this.viewport.y.min) / (this.axisY.length - (2 * this.axisY.paddingTop));
        var paddingYBottom = this.axisY.paddingBottom * (this.viewport.y.max - this.viewport.y.min) / (this.axisY.length - (2 * this.axisY.paddingBottom));

        this.axisY.min = this.viewport.y.min - paddingYBottom;
        this.axisY.max = this.viewport.y.max + paddingYTop;

        this.axisX.scale = this.axisX.length / (this.axisX.max - this.axisX.min);
        this.axisY.scale = this.axisY.min === this.axisY.max ? 0 : this.axisY.length / (this.axisY.max - this.axisY.min);
        this.axisY.zeroPosition = Math.round(this.getYPosition(0, false));

        if (this.isScroller)
        {
            var left = Math.round(this.getXPositionByIndex(this.scrollerViewport.x.bounded.min));
            var right = Math.round(this.getXPositionByIndex(this.scrollerViewport.x.bounded.max));
            this.$scrollerOverlayLeft.show().width(left).height(this.innerHeight).css({ "left": this.innerOffset.left + "px", "top": this.innerOffset.top + "px" });
            this.$scrollerOverlayCenter.show().width(right - left).height(this.innerHeight).css({ "left": (this.innerOffset.left + left) + "px", "top": this.innerOffset.top + "px" });
            this.$scrollerOverlayCenterL.show().css({ "left": (this.innerOffset.left + left - 5) + "px", "top": (this.innerOffset.top + this.innerHeight/2-11) + "px" });
            this.$scrollerOverlayCenterR.show().css({ "left": (this.innerOffset.left + right - 5) + "px", "top": (this.innerOffset.top + this.innerHeight/2-11) + "px" });
            this.$scrollerOverlayRight.show().width(this.innerWidth - right).height(this.innerHeight).css({ "left": (this.innerOffset.left + right) + "px", "top": this.innerOffset.top + "px" });

            if(this.scrollerViewport.x.bounded.max < this.xSeries.length - 1 - this.chart.chartOptions.futureAmount) {
                this.$scrollForward.width(this.innerHeight);
                this.$scrollForward.fadeIn().css({
                    "width": 40 + "px",
                    "min-width": 40 + "px",
                    "left": (this.innerWidth + this.innerOffset.left - this.$scrollForward.width() - 10) + "px",
                    "top": (this.innerOffset.top) + "px"
                });
            } else {
                this.$scrollForward.fadeOut();
            }

        }
    };

    iChart.Charting.ChartArea.prototype.dispose = function ()
    {
        if (this.isScroller)
        {
            this.$scrollerOverlayLeft.remove();
            delete this.$scrollerOverlayLeft;
            this.$scrollerOverlayCenter.remove();
            delete this.$scrollerOverlayCenter;
            this.$scrollerOverlayCenterL.remove();
            delete this.$scrollerOverlayCenterL;
            this.$scrollerOverlayCenterR.remove();
            delete this.$scrollerOverlayCenterR;
            this.$scrollerOverlayRight.remove();
            delete this.$scrollerOverlayRight;
        }

        if (this.$closeButton)
        {
            this.$closeButton.remove();
            delete this.$closeButton;
        }
    };

    iChart.Charting.ChartArea.prototype.getXIndex = function (xPosition)
    {
        /// <summary>
        /// Gets floating-point index of the point at the specified X pixel position.
        /// </summary>
        /// <param name="xPosition">X position of the point.</param>
        /// <returns type="Number" />

        return this.axisX.min + (xPosition / this.axisX.scale);
    };

    iChart.Charting.ChartArea.prototype.getXPositionByIndex = function (xIndex)
    {
        /// <summary>
        /// Gets floating-point X pixel position of the point with the specified floating-point index.
        /// </summary>
        /// <param name="xIndex" type="Number">Index of the point.</param>
        /// <returns type="Number" />

        return this.axisX.scale * (xIndex - this.axisX.min);
    };

    iChart.Charting.ChartArea.prototype.getXIndexByValue = function (xValue)
    {
        /// <summary>
        /// Gets index of the point with the specified value.
        /// </summary>
        /// <param name="xValue" type="Number">Value of the point.</param>
        /// <returns type="Number" />

        if (!$.isNumeric(xValue))
        {
            return NaN;
        }

        if (this.xSeries.min > this.xSeries.max)
        {
            return NaN;
        }

        if (xValue < this.xSeries[this.xSeries.min] || xValue > this.xSeries[this.xSeries.max])
        {
            if(xValue > this.xSeries[this.xSeries.max]) {
                return this.xSeries.max + (xValue - this.xSeries[this.xSeries.max]) / (this.xSeries[this.xSeries.max] - this.xSeries[this.xSeries.max -1]);
            } else {
                return NaN;
            }
        }

        var xIndex = iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo(this.xSeries, xValue);
        if (xIndex === -1)
        {
            return NaN;
        }

        if (xIndex !== this.xSeries.min)
        {
            xIndex -= (this.xSeries[xIndex] - xValue) / (this.xSeries[xIndex] - this.xSeries[xIndex - 1]);
        }

        return xIndex;
    };

    iChart.Charting.ChartArea.prototype.getXIndexByValue2 = function (xValue)
    {
        /// <summary>
        /// Gets index of the point with the specified value.
        /// </summary>
        /// <param name="xValue" type="Number">Value of the point.</param>
        /// <returns type="Number" />

        if (!$.isNumeric(xValue))
        {
            return NaN;
        }

        if (this.xSeries.min > this.xSeries.max)
        {
            return NaN;
        }

        if (xValue < this.xSeries[this.xSeries.min]) {
            return this.xSeries.min;
        } else if (xValue > this.xSeries[this.xSeries.max]) {
            return this.xSeries.max;
        }

        var xIndex = iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo(this.xSeries, xValue);
        if (xIndex === -1)
        {
            return NaN;
        }

        if (xIndex !== this.xSeries.min)
        {
            xIndex -= (this.xSeries[xIndex] - xValue) / (this.xSeries[xIndex] - this.xSeries[xIndex - 1]);
        }

        return xIndex;
    };


    iChart.Charting.ChartArea.prototype.getXPositionByValue = function (xValue)
    {
        /// <summary>
        /// Gets floating-point X pixel position of the point with the specified value.
        /// </summary>
        /// <param name="xValue" type="Number">Value of the point.</param>
        /// <returns type="Number" />

        var xIndex = this.getXIndexByValue(xValue);
        if (isNaN(xIndex))
        {
            return NaN;
        }

        return this.getXPositionByIndex(xIndex);
    };

    iChart.Charting.ChartArea.prototype.getXValue = function (xPosition)
    {
        /// <summary>
        /// Gets value of the point at the specified X pixel position.
        /// </summary>
        /// <returns type="Number" />

        var xIndex = this.getXIndex(xPosition);
        var xIndexLeft = Math.floor(xIndex);
        var xIndexRight = Math.ceil(xIndex);
        if (xIndexRight < this.xSeries.min)
        {
            return;
        }

        if (xIndexLeft < this.xSeries.min)
        {
            return this.xSeries[xIndexRight];
        }

        if (xIndexRight > this.xSeries.max)
        {
            return this.xSeries[this.xSeries.max] + (xIndex - this.xSeries.max) * (this.xSeries[this.xSeries.max] - this.xSeries[this.xSeries.max - 1]);
        }

        if (xIndexLeft === xIndexRight)
        {
            return this.xSeries[xIndexLeft];
        }

        return this.xSeries[xIndexLeft] + ((xIndex - xIndexLeft) * (this.xSeries[xIndexRight] - this.xSeries[xIndexLeft]));
    };

    iChart.Charting.ChartArea.prototype.getYMinMax = function (start, end)
    {
        /// <summary>
        /// Gets minimum and maximum Y values in the specified X index range.
        /// </summary>
        /// <param name="start" type="Number">Start index.</param>
        /// <param name="end" type="Number">End index.</param>
        /// <returns type="Object" />

        var result = {};
        result.isStartedFromZero = false;
        result.min = null;
        result.max = null;
        for (var i = 0; i < this.ySeries.length; ++i)
        {
            //if(this.ySeries[i].kind == "TA_LIB") { continue; }
            var series = this.ySeries[i];
            var points = series.points;
            result.isStartedFromZero = result.isStartedFromZero || series.isStartedFromZero;
            if (this.chart.isComparison && series.kind != "TA_LIB")
            {
                series.multiplier = 0;
                for (var j = start; j <= end; ++j)
                {
                    var point = points[j];
                    if (typeof point == "undefined" || point === null)
                    {
                        continue;
                    }
                    var value = point[series.closeValueIndex];
                    if (value === null)
                    {
                        continue;
                    }
                    if (series.multiplier)
                    {
                        value = (series.multiplier * value) - 100;
                    }
                    else
                    {
                        series.multiplier = 100 / value;
                        value = 0;
                    }

                    if (result.min === null)
                    {
                        result.min = value;
                    }
                    else
                    {
                        result.min = Math.min(result.min, value);
                    }

                    if (result.max === null)
                    {
                        result.max = value;
                    }
                    else
                    {
                        result.max = Math.max(result.max, value);
                    }
                }
            }
            else
            {
                for (var j = start; j <= end; ++j)
                {
                    var point = points[j];
                    if (point === null || typeof point == "undefined")
                    {
                        continue;
                    }

                    if (result.min === null)
                    {
                        result.min = point[series.lowValueIndex];
                    }
                    else if(point[series.lowValueIndex] !== null)
                    {
                        result.min = Math.min(result.min, point[series.lowValueIndex]);
                    }

                    if (result.max === null)
                    {
                        result.max = point[series.highValueIndex];
                    }
                    else
                    {
                        result.max = Math.max(result.max, point[series.highValueIndex]);
                    }
                }
            }
        }

        if(this.name == 'ChartArea1') {
            // учет построенных инструментов анализа, что бы тоже попадали в область видимости
            var exclude = [
                'HorizontalLine'
            ];
            var history = this.chart.overlay.history;
            for(var i=0;i<history.length;i++) {

                var element = history[i];

                if($.inArray(element.elementType, exclude) >= 0) {
                    continue;
                }

                var useElement = false;
                //Если инструмент попадает хотябы частично в область видимости, то учитываем его при масшабировании.
                for(var j=0;j<element.points.length;j++) {
                    if(element.points[j].x >= this.xSeries[start]*1000 && element.points[j].x <= this.xSeries[end]*1000 || element.positionAbsolute) {
                        useElement = true;
                    } else if (element.points[j].x < this.xSeries[0] || element.points[j].x > this.xSeries[this.xSeries.length - 1]) {
                        // если точка вне области графика, то не учитываем
                        useElement = false;
                        break;
                    }

                }
                if(useElement) {
                    for(var j=0;j<element.points.length;j++) {
                        if(element.points[j].y) {

                            if(this.chart.isComparison && series.kind != "TA_LIB" && this.ySeries[0].points.length) {
                                var y = ((element.points[j].y  /  this.ySeries[0].points[start][3]) - 1) * 100;
                            } else {
                                var y = element.points[j].y;
                            }
                            result.max = Math.max(result.max, y);
                            result.min = Math.min(result.min, y);
                        }
                    }
                }
            }
        }

        var checkZero = function (x)
        {
            if (x.isStartedFromZero)
            {
                if (x.min !== null && x.min > 0)
                {
                    x.min = 0;
                }
                else if (x.max !== null && x.max < 0)
                {
                    x.max = 0;
                }
            }
        };

        checkZero(result);
        return result;
    };

    iChart.Charting.ChartArea.prototype.getYPosition = function (value)
    {
        /// <summary>
        /// Gets floating-point Y pixel position of the point with the specified Y value.
        /// </summary>
        /// <param name="value" type="Number">Y value of the point.</param>
        /// <returns type="Number" />

        if (this.axisY.scale === 0)
        {
            return (0.5 * this.axisY.length);
        }

        return this.axisY.scale * (this.axisY.max - value);
    };

    iChart.Charting.ChartArea.prototype.getYValue = function (position)
    {
        /// <summary>
        /// Gets Y value at the specified Y pixel position.
        /// </summary>
        /// <param name="position" type="Number">Y pixel position.</param>
        /// <returns type="Number" />

        if (this.axisY.scale === 0)
        {
            return this.axisY.max;
        }

        return this.axisY.max - (position / this.axisY.scale);
    };

    iChart.Charting.ChartArea.prototype.setMinMax = function ()
    {
        /// <summary>
        /// Sets min/max x/y values for the area.
        /// </summary>

        this.xSeries.min = 0;
        this.xSeries.max = this.xSeries.length - 1;
        this.ySeries.bounds = this.getYMinMax(this.xSeries.min, this.xSeries.max);
    };

    iChart.Charting.ChartArea.prototype.updateCloseButton = function ()
    {
        /// <summary>
        /// Updates area close button position.
        /// </summary>

        if (!this.onClose)
        {
            return;
        }

        if (!this.$closeButton)
        {
            this.$closeButton = $("<button/>", { "class": "m-chart-area-close", "text": "×", "title": "Скрыть" }).appendTo(this.chart.container);
            this.$closeButton.on("click", $.proxy(this.onClose, this));
        }

        this.$closeButton.css({ "top": this.offset.top + "px" });
    };

    iChart.Charting.ChartArea.prototype._calculateViewport = function (viewport)
    {
        /// <summary>
        /// Calculates minimum and maximum values for this chart area X and Y axes.
        /// </summary>
        /// <param name="viewport">Inner area viewport (without padding). If not specified, main viewport is returned.</param>
        /// <returns type="Object" />

        if (this.xSeries.length === 0)
        {
            return null;
        }

        var areaViewport = {};
        areaViewport.x = {};
        areaViewport.x.bounded = {};
        areaViewport.y = {};

        if (this.ignoreViewport || !viewport)
        {
            areaViewport.x.min = this.xSeries.min;
            areaViewport.x.bounded.min = this.xSeries.min;
        }
        else if (viewport.x.min === null)
        {
            var start = this.chart._dataSettings.start;
            var startIndex = (start) ? iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo(this.xSeries, Math.round(start.getTime() / 1000)) : 0;
            if (startIndex === -1)
            {
                console.warn("Start date/time '" + start.toString() + "' is outside the bounds of the data.");
                startIndex = 0;
            }

            areaViewport.x.min = startIndex;
            areaViewport.x.bounded.min = startIndex;
        }
        else
        {
            areaViewport.x.min = viewport.x.min;
            areaViewport.x.bounded.min = Math.max(this.xSeries.min, Math.floor(viewport.x.min));
        }

        if (this.ignoreViewport || !viewport)
        {
            areaViewport.x.max = this.xSeries.max;
            areaViewport.x.bounded.max = this.xSeries.max;
        }
        else if (viewport.x.max === null)
        {
            if (this.chart._dataSettings.end)
            {
                var end = this.chart._dataSettings.end;
                var endIndex = iChart.Charting.indexOfLastElementLessThanOrEqualTo(this.xSeries, Math.round(end.getTime() / 1000));
                if (endIndex === -1)
                {
                    console.error("End date/time '" + end.toString() + "' is outside the bounds of the data.");
                    endIndex = this.xSeries.length -1;
                }

                areaViewport.x.max = endIndex;
                areaViewport.x.bounded.max = endIndex;
            }
            else
            {
                areaViewport.x.max = this.xSeries.max;
                areaViewport.x.bounded.max = this.xSeries.max;
            }
        }
        else
        {
            areaViewport.x.max = viewport.x.max;
            areaViewport.x.bounded.max = Math.min(this.xSeries.max, Math.ceil(viewport.x.max));
        }

        if (this.ignoreViewport || !viewport)
        {
            areaViewport.y.min = this.ySeries.bounds.min;
            areaViewport.y.max = this.ySeries.bounds.max;
        }
        else
        {
            areaViewport.y.min = viewport.y.min;
            areaViewport.y.max = viewport.y.max;

            if (areaViewport.y.min === null || areaViewport.y.max === null)
            {
                if (areaViewport.x.bounded.min === this.xSeries.min && areaViewport.x.bounded.max === this.xSeries.max)
                {
                    if (viewport.y.min === null)
                    {
                        areaViewport.y.min = this.ySeries.bounds.min;
                    }

                    if (viewport.y.max === null)
                    {
                        areaViewport.y.max = this.ySeries.bounds.max;
                    }
                }
                else
                {
                    var bounds = this.getYMinMax(areaViewport.x.bounded.min, areaViewport.x.bounded.max);
                    if (viewport.y.min === null)
                    {
                        areaViewport.y.min = bounds.min;
                    }

                    if (viewport.y.max === null)
                    {
                        areaViewport.y.max = bounds.max;
                    }
                }
            }
        }

        if (this.ySeries.bounds.isStartedFromZero)
        {
            if (areaViewport.y.min !== null && areaViewport.y.min > 0)
            {
                if (viewport.y.min === null)
                {
                    areaViewport.y.min = 0;
                }
            }
            else if (areaViewport.y.max !== null && areaViewport.y.max < 0)
            {
                if (viewport.y.max === null)
                {
                    areaViewport.y.max = 0;
                }
            }
        }

        areaViewport = this.onCalculateViewport.call(this, areaViewport) || areaViewport;
        return areaViewport;
    };
})();