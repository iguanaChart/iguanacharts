/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ($)
{
    "use strict";

    iChart.Charting.Crosshair = function (settings)
    {
        /// <summary>
        /// Initializes a new instance of the iChart.Charting.Crosshair class attached to the specified chart.
        /// </summary>
        /// <param name="settings" type="Object">Object containing crosshair settings.</param>
        /// <field name="$chart" type="jQuery">Chart container jQuery object.</field>
        /// <field name="areas">A list of chart areas.</field>
        /// <field name="dots">A collection of dots used for highlighting data points.</field>
        /// <field name="hidden" type="Boolean">A value indicating whether the crosshair is currently hidden.</field>
        /// <field name="pageX">Latest known X cursor coordinate.</field>
        /// <field name="pageY">Latest known Y cursor coordinate.</field>
        /// <field name="pointMap">Data point map used for finding the point clossest to the current cursor position.</field>
        /// <field name="yLabel">Latest displayed Y label.</field>

        this.$chart = settings.$chart;
        this.container = null;
        this.areas = null;
        this.dots = null;
        this.hidden = true;
        this.pageX = null;
        this.pageY = null;
        this.pointMap = undefined;
        this.yLabel = null;
    };

    iChart.Charting.Crosshair.prototype.hide = function ()
    {
        /// <summary>
        /// Hides all crosshair elements.
        /// </summary>

        if (this.hidden)
        {
            return;
        }

        for (var i = 0; i < this.dots.length; ++i)
        {
            this.dots[i].style.display = "none";
        }

        if (this.yLabel !== null)
        {
            this.yLabel.style.display = "none";
        }

        for (var i = 0; i < this.areas.length; ++i)
        {
            var area = this.areas[i];
            if (area.enabled === false || area.isLayer || area.isScroller)
            {
                continue;
            }

            area.horizontal.style.display = "none";
            area.vertical.style.display = "none";
            area.tooltip.innerHTML = area.tooltipInnerHtml || "";
        }

        this.hidden = true;
    };

    iChart.Charting.Crosshair.prototype.render = function (pageX, pageY, force) {

        force = typeof force !== undefined ? force : false;
        if (pageX === this.pageX && pageY === this.pageY && !force)
        {
            return;
        }

        this.pageX = pageX;
        this.pageY = pageY;

        var chartOffset = this.$chart.offset();
        var chartOffset = this.areas[0].chart._containerSize.offset;

        var offset = {};
        offset.left = Math.round(this.pageX - chartOffset.left);
        offset.top = Math.round(this.pageY - chartOffset.top);

        var inside = {};
        inside.x = false;
        inside.y = false;
        for (var i = 0; i < this.areas.length; ++i)
        {
            var area = this.areas[i];
            if (area.enabled === false || area.isLayer || area.isScroller)
            {
                continue;
            }

            if(area.chart.chartOptions.tooltipPosition == 'top') {
                var top = area.innerOffset.top - 20;
            } else if(area.chart.chartOptions.tooltipPosition == 'bottom') {
                var top = area.innerOffset.top - 38 + area.innerHeight;
            }
            $(area.tooltip).css({ "left": area.innerOffset.left + "px", "top": top + "px"});

            inside[i] = {};
            inside.x = (inside[i].x = offset.left >= area.innerOffset.left && offset.left <= area.innerOffset.left + area.innerWidth) || inside.x;
            inside.y = (inside[i].y = offset.top >= area.innerOffset.top && offset.top <= area.innerOffset.top + area.innerHeight) || inside.y;
        }

        if (!inside.x || !inside.y)
        {
            this.hide();
            return;
        }

        var point;
        if (typeof this.pointMap === "undefined")
        {
            var area = this.areas[0];
            if (area.xSeries.length === 0)
            {
                this.hide();
                return;
            }

            var xIndex = area.getXIndex(offset.left - area.innerOffset.left);
            if (xIndex < area.viewport.x.bounded.min || xIndex > area.viewport.x.bounded.max)
            {
                this.hide();
                return;
            }

            xIndex = Math.max(area.viewport.x.bounded.min, Math.min(area.viewport.x.bounded.max, Math.round(xIndex)));
            offset.left = area.innerOffset.left + Math.round(area.getXPositionByIndex(xIndex));
            for (var i = 0; i < this.dots.length; ++i)
            {
                var dot = this.dots[i];
                var area = this.areas[dot.areaIndex];
                var series = area.ySeries[dot.seriesIndex2];
                var values = series.points[xIndex];
                if (values)
                {
                    var value = values[dot.yValueIndex];
                    if (series.multiplier)
                    {
                        value = (series.multiplier * value) - 100;
                    }

                    var position = area.getYPosition(value);
                    if (position >= 0 && position <= area.innerHeight)
                    {
                        dot.style.display = "";
                        dot.style.left = (offset.left - 4) + "px";
                        dot.style.top = (area.innerOffset.top + position - 4) + "px";
                    }
                    else
                    {
                        dot.style.display = "none";
                    }
                }
                else
                {
                    dot.style.display = "none";
                }
            }

            for (var i = 0; i < this.areas.length; ++i)
            {
                var area = this.areas[i];
                if (area.enabled === false || area.isScroller)
                {
                    continue;
                }

                var tooltips = [];
                if (!area.isLayer)
                {
                    var dateTime = new Date(1000 * area.xSeries[xIndex]);
                    tooltips.push(iChart.formatDateTime(dateTime, "dd.MM.yyyy" + (this.showTime ? " HH:mm" : "")));
                }

                for (var j = 0; j < area.ySeries.length; ++j)
                {
                    var series = area.ySeries[j];
                    for (var k = 0; k < series.labels.length; ++k)
                    {
                        var labelIndex = series.labels[k][0];
                        var labelText = series.labels[k][1];
                        var values = series.points[xIndex];
                        if (values)
                        {
                            var value = values[labelIndex];
                            if (series.multiplier)
                            {
                                value = (series.multiplier * value) - 100;
                                value = (value > 0 ? "+" : "") + iChart.formatNumber(value, series.formatProvider) + "%";
                            }
                            else
                            {
                                //value = iChart.formatNumber(value, series.formatProvider);
                                if(value < 100) {
                                    value = iChart.formatNumber( value, { decimalPlaces: null, decimalPrecision: 6, "scale": 0 });
                                } else {
                                    value = iChart.formatNumber( value, { decimalPlaces: 2, decimalPrecision: null, "scale": 0 });
                                }
                            }

                            tooltips.push(labelText + " <span class='m-chart-legend-value'>" + value + "</span>");
                        }
                    }
                }

                if (area.isLayer)
                {
                    $.grep(this.areas, function (x) { return x.name === area.parentName })[0].tooltip.innerHTML += " &ensp; " + tooltips.join(" &ensp; ");
                }
                else
                {
                    area.tooltip.innerHTML = tooltips.join(" &ensp; ");
                }
            }
        }
        else
        {
            point = this.pointMap[offset.left];
            if (typeof point === "undefined")
            {
                this.hide();
                return;
            }

            offset.left = point.offset;

            for (var i = 0; i < this.dots.length; ++i)
            {
                var dot = this.dots[i];
                var values = point.y[dot.seriesIndex];
                if (values)
                {
                    var position = values[dot.yValueIndex].p;
                    var area = this.areas[dot.areaIndex];
                    if (area.enabled === false || area.isScroller)
                    {
                        continue;
                    }

                    if (position >= area.innerOffset.top && position <= area.innerOffset.top + area.innerHeight)
                    {
                        dot.style.display = "";
                        dot.style.left = (offset.left - 4) + "px";
                        dot.style.top = (position - 4) + "px";
                    }
                    else
                    {
                        dot.style.display = "none";
                    }
                }
                else
                {
                    dot.style.display = "none";
                }
            }

            for (var i = 0; i < this.areas.length; ++i)
            {
                var area = this.areas[i];
                if (area.enabled === false || area.isScroller)
                {
                    continue;
                }

                area.tooltip.innerHTML = point.tooltips[i];
            }
        }

        for (var i = 0; i < this.areas.length; ++i)
        {
            var area = this.areas[i];
            if (area.enabled === false || area.isLayer || area.isScroller)
            {
                continue;
            }

            area.tooltip.style.display = "";
            if (inside[i].x)
            {
                area.vertical.style.display = "";
                area.vertical.style.left = offset.left + "px";
                if (inside[i].y)
                {
                    area.horizontal.style.display = "";
                    area.horizontal.style.top = offset.top-0 + "px";
                    if (this.yLabel !== null && !area.chart.overlay.drag)
                    {
                        this.yLabel.innerHTML = iChart.formatNumber(this._getYValue(area, offset.top - area.innerOffset.top), { "decimalPrecision": 5 });
                        this.yLabel.style.display = "";
                        this.yLabel.style.top = (offset.top - 8) + "px";
                    } else {
                        this.yLabel.style.display = "none";
                    }
                }
                /*
                 var ctx = this.$chart[0].getContext("2d");
                 iChart.viewData.chart.render({"context": ctx, "forceRecalc": false, "resetViewport": false, "testForIntervalChange": false });
                 ctx.save();
                 ctx.beginPath();
                 ctx.arc(offset.left, offset.top, 20, 0, 2 * Math.PI, true);
                 ctx.fillStyle = '#fff';
                 ctx.globalAlpha = 1;
                 ctx.lineWidth = 2;
                 ctx.stokeStyle = '#eee';
                 ctx.fill();
                 ctx.stroke();
                 ctx.restore();
                 */
//console.log(this.$chart[0]);

                else
                {
                    area.horizontal.style.display = "none";
                }
            }
            else
            {
                area.horizontal.style.display = "none";
                area.vertical.style.display = "none";
            }
        }

        this.hidden = false;
    }

    iChart.Charting.Crosshair.prototype.mouseMoveHandler = function (e)
    {
        /// <summary>
        /// Handles MouseMove event.
        /// </summary>


        if (typeof e === "undefined")
        {
            e = window.event;
        }

        var pageX;
        var pageY;

        if (typeof e.pageX !== "undefined")
        {
            pageX = e.pageX;
            pageY = e.pageY;
        }
        else
        {
            pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pageX = Math.round(pageX);
        pageY = Math.round(pageY);

        this.render(pageX, pageY);

    };

    iChart.Charting.Crosshair.prototype.update = function (data, container)
    {
        /// <summary>
        /// Updates crosshair data.
        /// </summary>
        /// <param name="data" type="Object">New chart data to use in crosshair.</param>

        this.container = container;
        this._clear();

        if (!data || !data.areas)
        {
            throw "No data available.";
        }

        this.areas = data.areas;
        this.chartWidth = this.areas[0].chart._containerSize.width;
        this.showTime = data.showTime;

        this._initDots();
        this._initYLabel();
        this._initPointMap(data);
        //iChart.Charting.Crosshair.addMouseMoveHandler(this, container);
        this.addMouseMoveHandler(this);
    };

    iChart.Charting.Crosshair.prototype._clear = function ()
    {
        /// <summary>
        /// Removes associated DOM elements and event listeners and clears all stored data.
        /// </summary>
        //iChart.Charting.Crosshair.removeMouseMoveHandler(container);
        this.removeMouseMoveHandler();

        $(".m-chart-d, .m-chart-h, .m-chart-t, .m-chart-v, .m-chart-y", this.$chart.parent()).remove();

        this.areas = [];
        this.dots = [];
        this.yLabel = null;
    };

    iChart.Charting.Crosshair.prototype._getYValue = function (area, position)
    {
        /// <summary>
        /// Gets Y value at the specified Y pixel position.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area containing the point.</param>
        /// <param name="position" type="Number">Y coordinate of the point.</param>
        /// <returns type="Number" />

        if (area.axisY.scale === 0)
        {
            return area.axisY.max;
        }

        return area.axisY.max - (position / area.axisY.scale);
    };

    iChart.Charting.Crosshair.prototype._initDots = function ()
    {
        /// <summary>
        /// Initializes crosshair dot DIVs used for highlighting series data points.
        /// </summary>

        this.dots = [];
        for (var i = 0; i < this.areas.length; ++i)
        {
            var area = this.areas[i];
            if (area.enabled === false || area.isLayer || area.isScroller)
            {
                continue;
            }

            for (var j = 0; j < area.ySeries.length; ++j)
            {
                var series = area.ySeries[j];
                var dotColor = series.dotColor || series.color || "";
                if (dotColor === "")
                {
                    continue;
                }

                var dot = $("<div/>", { "class": "m-chart-d" }).css({ "background-color": dotColor, "display": "none" }).insertAfter(this.$chart).get(0);
                dot.areaIndex = i;
                dot.seriesIndex = series.index;
                dot.seriesIndex2 = j;
                dot.yValueIndex = series.dotIndex || 0;
                this.dots.push(dot);
            }
        }
    };

    iChart.Charting.Crosshair.prototype._initPointMap = function (data)
    {
        /// <summary>
        /// Initializes point map.
        /// </summary>
        /// <param name="data" type="Object">Chart data for the crosshair.</param>

        for (var i = 0; i < this.areas.length; ++i)
        {
            var area = this.areas[i];

            if (area.enabled === false || area.isScroller)
            {
                continue;
            }

            if (!area.isLayer)
            {
                area.horizontal = $("<div/>", { "class": "m-chart-h" }).css({ "display": "none", "left": area.innerOffset.left + "px", "width": area.innerWidth + "px" }).insertAfter(this.$chart).get(0);
                area.vertical = $("<div/>", { "class": "m-chart-v" }).css({ "display": "none", "top": area.innerOffset.top + "px", "height": area.innerHeight + "px" }).insertAfter(this.$chart).get(0);
            }

            if (typeof data.pointMap === "undefined")
            {
                if (area.viewport.x.bounded.min <= area.viewport.x.bounded.max)
                {
                    var tooltips = [];
                    var boundedMax = Math.min(area.viewport.x.bounded.max, area.xSeries.length - 1 - area.chart.chartOptions.futureAmount);
                    if (!area.isLayer)
                    {
                        var dateTime = new Date(1000 * area.xSeries[boundedMax]);
                        tooltips.push(iChart.formatDateTime(dateTime, "dd.MM.yyyy" + (this.showTime ? " HH:mm" : "")));
                    }

                    for (var j = 0; j < area.ySeries.length; ++j)
                    {
                        var series = area.ySeries[j];
                        for (var k = 0; k < series.labels.length; ++k)
                        {
                            var labelIndex = series.labels[k][0];
                            var labelText = series.labels[k][1];
                            var values = series.points[boundedMax];
                            if (values)
                            {
                                var value = values[labelIndex];
                                if (series.multiplier)
                                {
                                    value = (series.multiplier * value) - 100;
                                    value = (value > 0 ? "+" : "") + iChart.formatNumber(value, series.formatProvider) + "%";
                                }
                                else
                                {
                                    //value = iChart.formatNumber(value, series.formatProvider);
                                    if(value < 100) {
                                        value = iChart.formatNumber( value, { decimalPlaces: null, decimalPrecision: 6, "scale": 0 });
                                    } else {
                                        value = iChart.formatNumber( value, { decimalPlaces: 2, decimalPrecision: null, "scale": 0 });
                                    }
                                }

                                tooltips.push(labelText + " <span class='m-chart-legend-value'>" + value + "</span>");
                            }
                        }
                    }

                    if (area.isLayer)
                    {
                        $.grep(this.areas, function (x) { return x.name === area.parentName })[0].tooltipInnerHtml += " &ensp; " + tooltips.join(" &ensp; ");
                    }
                    else
                    {
                        area.tooltipInnerHtml = tooltips.join(" &ensp; ");
                    }
                }
            }
            else
            {
                for (var pointKey in data.pointMap)
                {
                    if (!data.pointMap.hasOwnProperty(pointKey))
                    {
                        continue;
                    }

                    var point = data.pointMap[pointKey];
                    if (typeof point.tooltips === "undefined")
                    {
                        point.tooltips = new Array(this.areas.length);
                    }

                    var tooltips = [];
                    tooltips.push(point.x);
                    for (var j = 0; j < area.ySeries.length; ++j)
                    {
                        var ySeries = area.ySeries[j];
                        for (var k = 0; k < ySeries.labels.length; ++k)
                        {
                            var labelIndex = ySeries.labels[k][0];
                            var labelText = ySeries.labels[k][1];
                            var temp = point.y[ySeries.index];
                            if (temp)
                            {
                                tooltips.push(labelText + " <span class='m-chart-legend-value'>" + temp[labelIndex].v + "</span>");
                            }
                        }
                    }

                    area.tooltipInnerHtml = tooltips.join(" &nbsp; ");
                    point.offset = pointKey;
                    point.tooltips[i] = area.tooltipInnerHtml;
                }
            }

            if (area.isLayer)
            {
                var parentArea = $.grep(this.areas, function (x) { return x.name === area.parentName })[0];
                $(parentArea.tooltip).html(parentArea.tooltipInnerHtml || "");
            }
            else
            {
                if(area.chart.chartOptions.tooltipPosition == 'top') {
                    var top = area.innerOffset.top - 20;
                } else if(area.chart.chartOptions.tooltipPosition == 'bottom') {
                    var top = area.innerOffset.top - 38 + area.innerHeight;
                }
                area.tooltip = $("<div/>", { "class": "m-chart-t" })
                    .css({ "left": area.innerOffset.left + "px", "top": top + "px", background: area.chart.chartOptions.backgroundColor })
                    .html(area.tooltipInnerHtml || "")
                    .insertAfter(this.$chart)
                    .get(0);
            }
        }

        if (typeof data.pointMap !== "undefined")
        {
            this.pointMap = new Array(this.chartWidth);
            for (var i = 0; i < this.chartWidth; ++i)
            {
                var j = 0;
                var point = data.pointMap[i];
                while (this._isEmptyPoint(point) && ((i - j) > 0 || (i + j) < this.chartWidth))
                {
                    ++j;
                    point = data.pointMap[i - j];
                    if (this._isEmptyPoint(point))
                    {
                        point = data.pointMap[i + j];
                    }
                }

                if (!this._isEmptyPoint(point))
                {
                    this.pointMap[i] = point;
                }
            }
        }
    };

    iChart.Charting.Crosshair.prototype._initYLabel = function ()
    {
        /// <summary>
        /// Initializes Y label DIV used for displaying ordinate value to the left of the chart.
        /// </summary>

        var area = this.areas[0];
        if (!area || area.enabled === false || area.isScroller)
        {
            return;
        }

        this.yLabel = $("<div/>", { "class": "m-chart-y" })
            .css({
                "background": area.chart.chartOptions.backgroundColor,
                "display": "none",
                "left": (area.innerOffset.left + area.innerWidth - (area.chart.chartOptions.yLabelsOutside ? 0 : 50)) + "px",
                "position": "absolute",
                "margin": "0 0 0 5px"
            })
            .insertAfter(this.$chart)
            .get(0);
    };

    iChart.Charting.Crosshair.prototype._isEmptyPoint = function (point)
    {
        /// <summary>
        /// Gets a value indicating whether the specified data point is considered empty.
        /// </summary>
        /// <param name="point">Data point to check.</param>
        /// <returns type="Boolean" />

        if (typeof point === "undefined")
        {
            return true;
        }

        for (var i = 0; i < point.y.length; ++i)
        {
            if (point.y[i] !== null)
            {
                return false;
            }
        }

        return true;
    };

    iChart.Charting.Crosshair.prototype.addMouseMoveHandler = function (crosshair)
    {
        /// <summary>
        /// Adds crosshair mousemove event listener.
        /// </summary>
        /// <param name="crosshair" type="iChart.Charting.Crosshair">Crosshair to add the event handler to.</param>
        //console.log('iChart.Charting.Crosshair.prototype.addMouseMoveHandler');
        if (this.mouseMoveHandler) {
            this.removeMouseMoveHandler();
        }
        this.mouseMoveHandler = crosshair.mouseMoveHandler.bind(this); //$.proxy(crosshair.mouseMoveHandler, crosshair);
        //$(document.body).on('mousemove move', function(e) {

        $(this.container).on('mousemove', this.mouseMoveHandler); //$.proxy(this.mouseMoveHandler, this));

        //$('#chartContainerWrapper').on('mousemove', iChart.Charting.Crosshair.mouseMoveHandler);

//        iChart.Charting.Crosshair.mouseMoveHandler = $.proxy(crosshair.mouseMoveHandler, crosshair);
//        if (typeof document.addEventListener !== "undefined")
//        {
//            document.addEventListener("mousemove", iChart.Charting.Crosshair.mouseMoveHandler, false);
//        }
//        else if (typeof document.attachEvent !== "undefined")
//        {
//            document.attachEvent("onmousemove", iChart.Charting.Crosshair.mouseMoveHandler);
//        }
//        else
//        {
//            throw "Browser does not support document.addEventListener/attachEvent.";
//        }
    };

    iChart.Charting.Crosshair.prototype.removeMouseMoveHandler = function ()
    {
        /// <summary>
        /// Removes crosshair mousemove event listener if present.
        /// </summary>

        //console.log(1, container);

        //var $chart = crosshair.areas[0].chart.container;
        //if (typeof iChart.Charting.Crosshair.mouseMoveHandler !== "undefined") {
        //console.log('iChart.Charting.Crosshair.prototype.removeMouseMoveHandler');
        if (typeof this.mouseMoveHandler !== "undefined") {
            //$(document.body).off('mousemove move', iChart.Charting.Crosshair.mouseMoveHandler);
            $(this.container).off('mousemove ', this.mouseMoveHandler);
        }

//        if (typeof iChart.Charting.Crosshair.mouseMoveHandler !== "undefined")
//        {
//            if (typeof document.addEventListener !== "undefined")
//            {
//                document.removeEventListener("mousemove", iChart.Charting.Crosshair.mouseMoveHandler, false);
//            }
//            else
//            {
//                document.detachEvent("onmousemove", iChart.Charting.Crosshair.mouseMoveHandler);
//            }
//        }
    };

    $.fn.crosshair = function (data, container)
    {
        /// <summary>
        /// Updates a chart crosshair overlay.
        /// </summary>
        /// <param name="data" type="Object">Chart data for the crosshair.</param>
        /// <returns type="jQuery" />

        if (!this.length)
        {
            return this;
        }

        var crosshair = this.data("crosshair");
        if (typeof crosshair === "undefined")
        {
            crosshair = new iChart.Charting.Crosshair({ "$chart": this });
            this.data("crosshair", crosshair);
        }

        crosshair.update(data, container);
        return this;
    };
})(jQuery);