/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartDrawingLayer = function (chart)
    {
        /// <summary>
        /// Initializes a new instance of the iChart.Charting.ChartDrawingLayer class that provides methods for drawing some common figures on market data charts.
        /// </summary>
        /// <param name="chart" type="iChart.Charting.Chart">Chart this layer belongs to.</param>
        /// <field name="canvas" type="HTMLCanvasElement">Canvas used for drawing elements of this layer.</field>
        /// <field name="chart" type="iChart.Charting.Chart">Chart this layer belongs to.</field>

        this.$deleteButton = $("<span/>", { "class": "m-chart-instrument-delete", "text": "✕", "title": "Удалить инструмент" }).hide().appendTo(chart.container);
        this.$settingsButton = $("<span class ='m-chart-instrument-settings' href = '#' text = '' title = 'Свойства'><span class='elementSettingsHolder' style='position: relative'></span></span>").hide().appendTo(chart.container);
        this.canvas = null;
        this.chart = chart;
        this.defaultCursor = "default";
        this.drag = null;
        this.history = [];
        this.hover = null;
        this.controlsHover = null;
        this.prevX = null;
        this.prevY = null;
        this.selected = null;
        this.unfinished = null;

        $(chart.container).off('mousedown.overlay').unbind('mouseup.overlay').unbind('mousemove.overlay');
        $(chart.container).on('mousedown.overlay', $.proxy(this.onMouseDown, this)).
            on('mouseup.overlay', $.proxy(this.onMouseUp, this)).
            on('mousemove.overlay', $.proxy(this.onMouseMove, this));

        if (this.chart.env.dataSource.dataSettings.useHash == false) {
            var hash = this.chart.env.dataSource.dataSettings.hash;
        } else {
            var hash = document.location.hash;
        }
        this.deserialize(iChart.parseQueryString((hash || "#").substr(1)));
    };

    iChart.Charting.ChartDrawingLayer.prototype.clear = function (all)
    {
        /// <summary>
        /// Clears the canvas, leaving only the chart image.
        /// </summary>

        all = !!all;
        if (this.history.length)
        {
            if(all) {
                this.$deleteButton.hide().removeClass('on');
                this.$settingsButton.hide();
                this.history = [];
                this.render();
                this.syncHash();
            } else {
                var overlayHistory = this.history;
                for(var i=0; i < overlayHistory.length; i++) {
                    var element = overlayHistory[i];
                    if(element.drawType == "manually") {
                        overlayHistory.splice(i, 1);
                        i--;
                    }
                }
                this.render();
                this.syncHash();
            }
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.createElement = function (elementType)
    {
        /// <summary>
        /// Initializes a new instance of the chart element with the specified type.
        /// </summary>
        /// <param name="elementType" type="String">Type of the chart element that should be initialized.</param>

        switch (elementType)
        {
            case "Channel":
                return new iChart.Charting.ChartChannel(this);
            case "Ellipse":
                return new iChart.Charting.ChartEllipse(this);
            case "FibonacciArc":
                return new iChart.Charting.ChartFibonacciArc(this);
            case "FibonacciCorrection":
                return new iChart.Charting.ChartFibonacciCorrection(this);
            case "FibonacciFan":
                return new iChart.Charting.ChartFibonacciFan(this);
            case "HorizontalLine":
                return new iChart.Charting.ChartHorizontalLine(this);
            case "Line":
                return new iChart.Charting.ChartLine(this);
            case "Rectangle":
                return new iChart.Charting.ChartRectangle(this);
            case "Trend":
                return new iChart.Charting.ChartTrend(this);
            case "Triangle":
                return new iChart.Charting.ChartTriangle(this);
            case "VerticalLine":
                return new iChart.Charting.ChartVerticalLine(this);
            case "Mark":
                return new iChart.Charting.ChartMark(this);
            case "Label":
                return new iChart.Charting.ChartLabel(this);
            case "Arrow":
                return new iChart.Charting.ChartArrow(this);
            case "Polygon":
                return new iChart.Charting.ChartPolygon(this);
            case "Trade":
                return new iChart.Charting.ChartTrade(this);
            case "Bubble":
                return new iChart.Charting.ChartBubble(this);
            case "Text":
                return new iChart.Charting.ChartText(this);
            case "Order":
                return new iChart.Charting.ChartOrder(this);
            case "Trendorder":
                return new iChart.Charting.ChartTrendorder(this);
            case "Position":
                return new iChart.Charting.ChartPosition(this);
            case "Visualtrade":
                return new iChart.Charting.ChartVisualtrade(this);
            case "TradePanel":
                return new iChart.Charting.ChartTradePanel(this);
            case "Button":
                return new iChart.Charting.ChartButton(this);
            case "Event":
                return new iChart.Charting.ChartEvent(this);
            case "Level":
                return new iChart.Charting.ChartLevel(this);
            case "Range":
                return new iChart.Charting.ChartRange(this);
            case "HorizontalRange":
                return new iChart.Charting.ChartHorizontalRange(this);
            default:
                return undefined;
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.deserialize = function (valueProvider)
    {
        /// <summary>
        /// Deserializes canvas content from the specified associative array.
        /// </summary>
        /// <param name="valueProvider" type="Object">A dictionary containing values.</param>
        this.$deleteButton.unbind("mousedown").hide().removeClass('on');
        this.$settingsButton.unbind("mousedown").hide();

        this.history = [];

        var elementCount = parseInt(valueProvider["L"], 10);

        if (isNaN(elementCount))
        {
            return;
        }

        theloop:
        for (var i = 0; i < elementCount; ++i)
        {
            var elementType = valueProvider["L" + i + "_T"];
            var element = this.createElement(elementType);
            if (typeof element === "undefined")
            {
                continue;
            }

            element.points = [];
            for (var j = 0; j < element.maxPointCount; ++j)
            {
                var point = {
                    "x": parseFloat(valueProvider["L" + i + "_X" + j]),
                    "y": parseFloat(valueProvider["L" + i + "_Y" + j])
                };

                if (isNaN(point.x) || isNaN(point.y))
                {
                    continue theloop;
                }

                element.points.push(point);
            }

            if(valueProvider["L" + i + "_S"]) {
                //element.settings = encodeURIComponent(valueProvider["L" + i + "_S"]);
                //element.settings = decodeURIComponent(valueProvider["L" + i + "_S"])
                //var str = .replace(/=/, '@');
                element.settings = JSON.parse(decodeURIComponent(window.atob(valueProvider["L" + i + "_S"].replace(/@/g, '='))));
                //element.settings = valueProvider["L" + i + "_S"];
            }

            this.history.push(element);
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.elementAt = function (x, y)
    {
        /// <summary>
        /// Returns chart element at the specified coordinates, or undefined if it is not present.
        /// </summary>
        /// <param name="x" type="Number">X pixel coordinate.</param>
        /// <param name="y" type="Number">Y pixel coordinate.</param>

        this.history.sort(function(a, b){
            if (a && a.selected) return -1;
            if (a && a.elementType == 'TradePanel') return -1;
            return 1;
        });

        for (var i = 0; i < this.history.length; ++i)
        {
            var element = this.history[i];
            var mode = element.isMouseOver.call(element, x, y);
            if (mode !== -1)
            {
                return { "mode": mode, "value": element };
            }
        }

        return undefined;
    };

    iChart.Charting.ChartDrawingLayer.prototype.finalizePoint = function (x, y)
    {
        /// <suummary>
        /// Adds the specified point to the figure that is being drawn at the moment and redraws the canvas.
        /// </summary>
        /// <param name="x" type="Number">X pixel coordinate.</param>
        /// <param name="y" type="Number">Y pixel coordinate.</param>

        this.unfinished.points[this.unfinished.points.length - 1].x = x;
        this.unfinished.points[this.unfinished.points.length - 1].y = y;
        if (this.unfinished.isComplete())
        {
            this.chart.env.wrapper.trigger('iguanaChartEvents', ['drawComplete', this.unfinished]);
            this.unfinished = null;
            this.syncHash();
            this.chart.container.style.cursor = this.defaultCursor;
        }
        else
        {
            this.unfinished.points.push({});
            this.chart.container.style.cursor = "crosshair";
        }

        this.render();
    };

    iChart.Charting.ChartDrawingLayer.prototype.getMarkers = function (dx, dy)
    {
        /// <summary>
        /// Gets shifted marker points of the chart element that is being dragged.
        /// </summary>
        /// <param name="dx" type="Number">X coordinate shift in pixels</param>
        /// <param name="dy" type="Number">Y coordinate shift in pixels</param>

        var markers = [];
        var outside = false;
        for (var i = 0; i < this.drag.element.points.length; ++i)
        {
            var point = this.drag.element.points[i];
            var marker = {};
            if (this.drag.mode === 0 || this.drag.mode === i + 1)
            {
                marker = $.extend({}, point);
                marker.x = 1000 * this.area.getXValue(this.area.getXPositionByValue(point.x / 1000) + dx);
                marker.y = this.area.getYValue(this.area.getYPosition(point.y) + dy);
                if (isNaN(marker.x) || isNaN(marker.y))
                {
                    outside = true;
                    break;
                }
            }
            else
            {
                marker = $.extend({}, point);
            }

            markers.push(marker);
        }

        return {
            "markers": markers,
            "outside": outside
        };
    };

    iChart.Charting.ChartDrawingLayer.prototype.getPixelPosition = function (axis, value)
    {
        /// <summary>
        /// Gets a pixel position that is equivalent to the specified value on the specified axis, or undefined if it is not present.
        /// </summary>
        /// <param name="axis" type="Object">Axis data.</param>
        /// <param name="value" type="Number">A value that should be searched on the axis.</param>

        var l = axis.length;
        if (l < 2 || axis[0][0] >= value)
        {
            return undefined;
        }

        for (var i = 1; i < l; ++i)
        {
            var pair = axis[i];
            if (pair[0] >= value)
            {
                return pair[1];
            }
        }

        return undefined;
    };

    iChart.Charting.ChartDrawingLayer.prototype.onMouseDown = function (e)
    {
        /// <summary>
        /// Handler for the document mousedown jQuery event. Used for drawing, dragging and selecting chart elements.
        /// </summary>

        if (typeof this.offset === "undefined")
        {
            return;
        }

        var x = Math.round(e.pageX - this.offset.left - this.area.innerOffset.left);
        var y = Math.round(e.pageY - this.offset.top - this.area.innerOffset.top);
        var valueX = 1000 * this.area.getXValue(x);
        var valueY = this.area.getYValue(y);

        $(window).data('mouseValueX', valueX);
        $(window).data('mouseValueY', valueY);

        if(this.chart.isComparison && !isNaN(valueY)) {
            var indexBase = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, this.chart.areas[0].viewport.x.bounded.min);
            var base = this.chart.areas[0].ySeries[0].points[indexBase][3];
            valueY = base + base / 100 * valueY;
        }

        if (isNaN(valueX) || isNaN(valueY))
        {
            return;
        }

        if (this.unfinished !== null)
        {
            this.finalizePoint(valueX, valueY);
            this.selected.onInsert();
            return;
        }

        if (this.history.length === 0 || this.drag !== null)
        {
            return;
        }

        var element = this.elementAt(x, y);

        //Вызываем функцию
        if (element && element.value && typeof element.value.onMouseDown =='function' ) {
            element.value.onMouseDown(e, x, y);
        }


        if (typeof element === "undefined")
        {
            this.setSelected(null);
            return;
        } else if(!element.value.controlEnable) {
            return;
        } else if(element.mode.toString().match(new RegExp("^m_", "i"))) {
            var m = element.mode.toString().match(new RegExp(/^m_(\d)/i));
            element.value.maps[m[1]].click();
        } else if(element.mode.toString().match(new RegExp("^c_", "i"))) {
            //Перенес в onMouseUp
            var c = element.mode.toString().match(new RegExp(/^c_(\d)/i));
            element.value.controls[c[1]].click();
            return;
        } else if(element.mode.toString().match(new RegExp("^a_", "i"))) {
        }

        this.setSelected(element.value);
        if (element.hasSettings) {

        }

        this.drag = {};
        this.drag.element = this.selected;
        this.drag.mode = element.mode;
        this.drag.x = x;
        this.drag.y = y;

        // Disable selection so that it doesn't interfere with drag.
        if (this.chart.selection)
        {
            this.chart.selection.disable();
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.onMouseMove = function (e)
    {
        /// <summary>
        /// Handler for the document mousemove jQuery event. Used for dragging and selecting chart elements.
        /// </summary>

        if (typeof this.offset === "undefined")
        {
            return;
        }

        var x = Math.round(e.pageX - this.offset.left - this.area.innerOffset.left);
        var y = Math.round(e.pageY - this.offset.top - this.area.innerOffset.top);
        if (x === this.prevX && y === this.prevY)
        {
            // Minor performance optimization: do not handle the same coordinates twice in a row.
            return;
        }

        this.prevX = x;
        this.prevY = y;

        var valueX = 1000 * this.area.getXValue(x);
        var valueY = this.area.getYValue(y);

        this.prevValueX = valueX;
        this.prevValueY = valueY;

        if(this.chart.isComparison && !isNaN(valueY)) {
            var indexBase = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, this.chart.areas[0].viewport.x.bounded.min);
            var base = this.chart.areas[0].ySeries[0].points[indexBase][3];
            valueY = base + base / 100 * valueY;
        }

        if (isNaN(valueX) || isNaN(valueY))
        {
            this.setHover(null);
            this.chart.container.style.cursor = this.defaultCursor;
            return;
        }

        if (this.unfinished !== null)
        {
            this.hover = null;
            this.unfinished.points[this.unfinished.points.length - 1].x = valueX;
            this.unfinished.points[this.unfinished.points.length - 1].y = valueY;
            this.render();
            this.chart.container.style.cursor = "crosshair";
            return;
        }

        if (this.drag !== null)
        {
            if(!isNaN(parseInt(this.drag.mode))) {
                if (typeof this.drag.element.moveCursor != "undefined") {
                    this.chart.container.style.cursor = this.drag.element.moveCursor;
                } else {
                    this.chart.container.style.cursor = "move";
                }
            }

            var dx = x - this.drag.x;
            var dy = y - this.drag.y;
            if (dx === 0 && dy === 0)
            {
                return;
            }

            var result = this.getMarkers(dx, dy);
            this.drag.element.onDrag(result.markers);

            if (result.outside)
            {
                if (typeof this.drag.element.markers !== "undefined")
                {
                    delete this.drag.element.markers;
                    this.render();
                }
            }
            else
            {
                this.drag.element.markers = result.markers;
                this.render();
            }

            return;
        }

        var element = this.elementAt(x, y);
        if (typeof element === "undefined")
        {
            this.setHover(null);
            this.setControlsHover(null);
            this.chart.container.style.cursor = this.defaultCursor;
        }
        else
        {
            if(element.mode.toString().match(new RegExp("^c_", "i"))) {
                this.chart.container.style.cursor = "pointer";
                this.setControlsHover(element);
            } else if (element.mode.toString().match(new RegExp("^a_", "i"))) {
                this.setHover(null);
                this.setControlsHover(element);
                this.chart.container.style.cursor = this.defaultCursor;
            } else if (element.mode.toString().match(new RegExp("^m_", "i"))) {
                var m = element.mode.toString().match(new RegExp(/^m_(\d)/i));
                //console.log(element.mode);
                this.setControlsHover(element);
                this.chart.container.style.cursor = "pointer";
            } else {
                this.setHover(element.value, x, y);
                this.setControlsHover(element);

                if(typeof element.value.hoverCursor != "undefined" || typeof element.value.hoverPointCursor != "undefined") {
                    if(element.mode > 0 && typeof element.value.hoverPointCursor != "undefined") {
                        this.chart.container.style.cursor = element.value.hoverPointCursor;
                    } else if(element.mode == 0 && typeof element.value.hoverCursor != "undefined") {
                        this.chart.container.style.cursor = element.value.hoverCursor;
                    } else {
                        this.chart.container.style.cursor = "pointer";
                    }
                } else {
                    this.chart.container.style.cursor = "pointer";
                }
            }
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.onMouseUp = function (e)
    {
        /// <summary>
        /// Handler for the document mouseup jQuery event. Used for dragging chart elements.
        /// </summary>

        var x = Math.round(e.pageX - this.offset.left - this.area.innerOffset.left);
        var y = Math.round(e.pageY - this.offset.top - this.area.innerOffset.top);

        var element = this.elementAt(x, y);
        if (typeof element === "undefined")
        {
        } else if(!element.value.controlEnable) {
            return;
        } else if(element.mode.toString().match(new RegExp("^c_", "i"))) {
            //var c = element.mode.toString().match(new RegExp(/^c_(\d)/i));
            //element.value.controls[c[1]].click();
            //return;
        } else if(element.mode.toString().match(new RegExp("^a_", "i"))) {
        }

        if (typeof this.offset === "undefined")
        {
            return;
        }

        if (this.drag === null)
        {
            return;
        }

        var x = Math.round(e.pageX - this.offset.left - this.area.innerOffset.left);
        var y = Math.round(e.pageY - this.offset.top - this.area.innerOffset.top);
        var valueX = 1000 * this.area.getXValue(x);
        var valueY = this.area.getYValue(y);
        if(this.chart.isComparison && !isNaN(valueY)) {
            var base = this.chart.areas[0].ySeries[0].points[this.chart.areas[0].viewport.x.bounded.min][3];
            valueY = base + base / 100 * valueY;
        }

        if (isNaN(valueX) || isNaN(valueY))
        {
            return;
        }

        var dx = x - this.drag.x;
        var dy = y - this.drag.y;
        if (dx !== 0 || dy !== 0)
        {
            var result = this.getMarkers(dx, dy);
            this.drag.element.onDrag(result.markers);

            if (!result.outside)
            {
                this.drag.element.points = result.markers;
                delete this.drag.element.testContext;
                this.syncHash();
                this.drag.element.onDrop(this.drag.mode);
            }
        }
        delete this.drag.element.markers;
        this.drag = null;
        this.render();
        if (this.chart.selection)
        {
            this.chart.selection.enable();
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.remove = function (element)
    {
        /// <summary>
        /// Removes the specified chart element from the canvas.
        /// </summary>

        var i = this.history.indexOf(element);
        if (i === -1)
        {
            return;
        }

        this.$deleteButton.unbind("mousedown").hide().removeClass('on');
        this.$settingsButton.unbind("mousedown").hide();

        this.history.splice(i, 1);
        this.render();
        this.syncHash();
    };

    iChart.Charting.ChartDrawingLayer.prototype.removeSelected = function (element)
    {
        /// <summary>
        /// Removes the currently selected chart element from the canvas.
        /// </summary>

        if (this.selected !== null && !element)
        {
            this.remove(this.selected);
        } else {
            this.remove(element);
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.render = function (context)
    {
        /// <summary>
        /// Redraws the layer.
        /// </summary>

        if (!context)
        {
            if(!this.context) {
                console.log("ERROR: No context for render");
                return 0;
            }
            context = this.context;
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }

        context.save();
        context.translate(this.area.innerOffset.left, this.area.innerOffset.top);

        context.beginPath();
        context.moveTo(0, this.area.innerHeight);
        context.lineTo(this.area.outerWidth, this.area.innerHeight);
        context.lineTo(this.area.outerWidth, 0);
        context.lineTo(0, 0);
        context.closePath();
        context.clip();

        for (var i = 0; i < this.history.length; ++i)
        {
            this.history[i].drawExtended(context, -1);
        }
        context.restore();

        context.save();
        context.translate(this.area.innerOffset.left + 0.5, this.area.innerOffset.top + 0.5);
        //context.translate(this.area.innerOffset.left, this.area.innerOffset.top);

        context.beginPath();
        context.moveTo(0, this.area.innerHeight);
        context.lineTo(this.area.innerWidth, this.area.innerHeight);
        context.lineTo(this.area.innerWidth, 0);
        context.lineTo(0, 0);
        context.closePath();
        context.clip();
        if(typeof context.busyPoints != "undefined") {
            context.busyPoints = {};
        }

        this.history.sort(function(a,b){
            if (a.selected) return 1;
            if (a.inHover && b.selected) return -1;
            if (a.inHover && (!b.inHover && !b.selected)) return 1;
        });

        for (var i = 0; i < this.history.length; ++i)
        {
            this.history[i].draw(context, -1);
        }
        context.restore();


        if (typeof FlashCanvas !== "undefined")
        {
            // Flush and execute commands.
            context.e();
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.serialize = function ()
    {
        /// <summary>
        /// Serializes current chart canvas parameters to an associative array.
        /// </summary>

        var parameters = {};

        var ir = 0;

        parameters["L"] = 0;

        for (var i = 0; i < this.history.length; ++i)
        {
            var element = this.history[i];

            if (element.isComplete() && element.controlEnable && element.storageEnable)
            {
                parameters["L" + ir + "_T"] = element.elementType;
                for (var j = 0; j < element.points.length; ++j)
                {
                    parameters["L" + ir + "_X" + j] = element.points[j].x;
                    parameters["L" + ir + "_Y" + j] = element.points[j].y;
                }
                if(element.hasSettings) {
                    //parameters["L" + i + "_S"] = element.settings;
                    //parameters["L" + i + "_S"] = encodeURIComponent(element.settings);
                    parameters["L" + ir + "_S"] = window.btoa(encodeURIComponent(JSON.stringify(element.settings))).replace(/=/g, '@');
                }
                ir++;
                parameters["L"] = parameters["L"] + 1;
            }
        }
        return parameters;
    };

    /**
     * Отслеживание смены переходов областей
     * @param element
     */
    iChart.Charting.ChartDrawingLayer.prototype.setControlsHover = function (element) {
        if(this.controlsHover) {
            if(element) {
                if (this.controlsHover.value.id != element.value.id || this.controlsHover.mode != element.mode) {
                    if (this.controlsHover.toString().match(new RegExp("^c_", "i"))) {
                        //var c = this.controlsHover.mode.toString().match(new RegExp(/^c_(\d)/i));
                    } else if (this.controlsHover.mode.toString().match(new RegExp("^a_", "i"))) {
                        //var a = this.controlsHover.mode.toString().match(new RegExp(/^a_(\d)/i));
                    } else if (this.controlsHover.mode.toString().match(new RegExp("^m_", "i"))) {
                        var m = this.controlsHover.mode.toString().match(new RegExp(/^m_(\d)/i));
                        if(typeof this.controlsHover.value.maps != 'undefined' && typeof this.controlsHover.value.maps[m[1]].hoverOut == 'function') {
                            this.controlsHover.value.maps[m[1]].hoverOut();
                            this.controlsHover = null;
                        }
                    }

                    if (element.mode.toString().match(new RegExp("^c_", "i"))) {
                        //var c = element.mode.toString().match(new RegExp(/^c_(\d)/i));
                    } else if (element.mode.toString().match(new RegExp("^a_", "i"))) {
                        //var a = element.mode.toString().match(new RegExp(/^a_(\d)/i));
                    } else if (element.mode.toString().match(new RegExp("^m_", "i"))) {
                        var m = element.mode.toString().match(new RegExp(/^m_(\d)/i));
                        if(typeof element.value.maps != 'undefined' && typeof element.value.maps[m[1]].hoverIn == 'function') {
                            this.controlsHover = element;
                            element.value.maps[m[1]].hoverIn();
                        }
                    }

                }
            } else {
                if (this.controlsHover.toString().match(new RegExp("^c_", "i"))) {
                    //var c = this.controlsHover.mode.toString().match(new RegExp(/^c_(\d)/i));
                } else if (this.controlsHover.mode.toString().match(new RegExp("^a_", "i"))) {
                    //var a = this.controlsHover.mode.toString().match(new RegExp(/^a_(\d)/i));
                } else if (this.controlsHover.mode.toString().match(new RegExp("^m_", "i"))) {
                    var m = this.controlsHover.mode.toString().match(new RegExp(/^m_(\d)/i));
                    if(typeof this.controlsHover.value.maps != 'undefined' && typeof this.controlsHover.value.maps[m[1]].hoverOut == 'function') {
                        this.controlsHover.value.maps[m[1]].hoverOut();
                        this.controlsHover = null;
                    }
                }
            }
        } else {
            if(element) {
                if (element.mode.toString().match(new RegExp("^c_", "i"))) {
                    //var c = element.mode.toString().match(new RegExp(/^c_(\d)/i));
                } else if (element.mode.toString().match(new RegExp("^a_", "i"))) {
                    //var a = element.mode.toString().match(new RegExp(/^a_(\d)/i));
                } else if (element.mode.toString().match(new RegExp("^m_", "i"))) {
                    var m = element.mode.toString().match(new RegExp(/^m_(\d)/i));
                    if(typeof element.value.maps != 'undefined' && typeof element.value.maps[m[1]].hoverIn == 'function') {
                        this.controlsHover = element;
                        element.value.maps[m[1]].hoverIn();
                    }
                }
            }
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.setHover = function (element, x, y)
    {
        /// <summary>
        /// Sets hover to the specified chart element and redraws the canvas to highlight it.
        /// </summary>
        /// <param name="element">Chart element the mouse is over at the moment.</param>

        if(this.hover !== null && (element == null || this.hover !== element)) {


            this.hover.inHover = false;

            this.hover.onOut();
        }

        if (element !== null)
        {
            element.inHover = true;
        }

        if (this.hover !== element)
        {
            this.hover = element;

            if(element !== null && typeof element.onHover === 'function') {
                element.onHover(x, y);
            }

            this.render();
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.setSelected = function (element)
    {
        /// <summary>
        /// Sets selection to the specified chart element and redraws the canvas to change selection.
        /// </summary>
        /// <param name="element">Chart element that is being selected, or a null to deselect the element that was selected before.</param>

        $('#elementSettings').remove();
        if (this.selected !== element)
        {
            if(this.selected != null) {
                this.selected.onOut();
                this.selected.selected = false;
                this.selected.onBlur(this.context);
            }

            this.selected = element;

            if (element === null)
            {
                this.$deleteButton.hide().removeClass('on');
                this.$settingsButton.hide();
            } else {
                this.$deleteButton.removeClass('on');
                this.selected.selected = true;
                this.selected.onSelect.call(this.selected, this.context);
            }
            this.render();
        }
    };

    iChart.Charting.ChartDrawingLayer.prototype.start = function (elementType)
    {
        /// <summary>
        /// Finishes the drawing of the previous chart element, adds it to history, and starts a new one with the specified type.
        /// </summary>
        /// <param name="elementType">Type of the chart element that should be started.</param>

        this.unfinished = this.createElement(elementType);
        this.selected = this.unfinished;

        if (typeof this.unfinished !== "undefined")
        {
            this.history.push(this.unfinished);
        }

        return this.unfinished;
    };

    iChart.Charting.ChartDrawingLayer.prototype.syncHash = function ()
    {
        /// <summary>
        /// Synchronizes the document location hash with the current chart canvas parameters.
        /// </summary>
        this.chart.env.setHashValues(this.serialize());
    };

    iChart.Charting.ChartDrawingLayer.prototype.update = function ()
    {
        /// <summary>
        /// Updates drawing layer.
        /// </summary>

        if (!this.chart.areas)
        {
            return;
        }

        this.area = this.chart.areas[0];

        for (var i = 0; i < this.history.length; ++i)
        {
            delete this.history[i].testContext;
        }
        var $container = $(this.chart.container);
        this._initCanvas($container.width(), $container.height());
        this.render();
    };

    iChart.Charting.ChartDrawingLayer.prototype._initCanvas = function (width, height)
    {
        /// <summary>
        /// Initializes the canvas.
        /// </summary>
        /// <param name="width" type="Number">Canvas width in pixels.</param>
        /// <param name="height" type="Number">Canvas height in pixels.</param>

        this.canvas = iChart.Charting.initCanvas(this.chart.container, this.canvas, width, height);
        if (this.canvas)
        {
            this.context = iChart.getContext(this.canvas);
            this.offset = this.chart._containerSize.offset;
        }
    };
})();
