/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartElement = function (layer)
    {
        /// <summary>
        /// Initializes a new instance of the iChart.Charting.ChartElement class representing a chart element on the specified chart canvas.
        /// </summary>
        /// <param name="layer" type="iChart.Charting.ChartDrawingLayer">A chart drawing layer to which this element is rendered.</param>
        /// <field name="layer" type="iChart.Charting.ChartDrawingLayer">A chart drawing layer to which this element is rendered.</field>
        /// <field name="maxPointCount" type="Number">A maximum number of points the element can contain.</field>
        /// <field name="points" type="Array" elementType="Object">A list of points belonging to this element.</field>
        /// <field name="testContext" type="Object">Internal representation of the element used to detect mouse over.</field>

        this.layer = layer;
        this.selected = false;
        this.maxPointCount = 2;
        this.points = [{}];
        this.testContext = undefined;
        this.id = layer.history.length + '_' + new Date().getTime();
        this.controlEnable = true;
        this.storageEnable = true;
        this.hasSettings = false;
        this.settings = {};
        this.hasPopupSettings = false;
        this.drawSingle = false;//Рисовать без копии фигуры при перетаскивании
        this.positionAbsolute = false;
        this.inHover = false;

        layer.setSelected(null)
    };

    iChart.Charting.ChartElement.prototype.draw = function (ctx)
    {
        /// <summary>
        /// Draws this chart element using the specified 2D canvas context.
        /// </summary>
        /// <param name="ctx" type="CanvasRenderingContext2D">A 2D canvas context to use when drawing the chart element.</param>

        if (this === this.layer.hover)
        {
            ctx.fillStyle = "rgba(255,255,153,.2)";
            ctx.strokeStyle = "#52afc9";
            ctx.inHover = true;
        }
        else
        {
            ctx.inHover = false;
            if (ctx.hasSettings) {
                    var settings = ctx.settings;
                    ctx.fillStyle   = settings.fillStyle;
                    ctx.strokeStyle = settings.strokeStyle;
                    ctx.lineWidth = settings.lineWidth;
            } else {
                ctx.fillStyle = "rgba(0,0,0,.0)";
                ctx.strokeStyle = "#000";
            }

        }

        //Рисовать без копии фигуры при перетаскивании
        if(this.drawSingle) {
            if (typeof this.markers !== "undefined")
            {
                // Draws the copy of the element if it is being dragged.
                ctx.fillStyle = "rgba(82,175,201,.2)";
                ctx.strokeStyle = "#52afc9";

                pointCoords = this.getCoordinates(ctx, this.markers);
                this.drawInternal(ctx, pointCoords);
                this.drawPoints(ctx, pointCoords);
            } else {
                var pointCoords = this.getCoordinates(ctx, this.points);
                this.drawInternal(ctx, pointCoords);
                this.drawPoints(ctx, pointCoords);
            }
        } else {
            var pointCoords = this.getCoordinates(ctx, this.points);
            this.drawInternal(ctx, pointCoords);
            this.drawPoints(ctx, pointCoords);

            if (typeof this.markers !== "undefined")
            {
                // Draws the copy of the element if it is being dragged.
                ctx.fillStyle = "rgba(82,175,201,.2)";
                ctx.strokeStyle = "#52afc9";

                pointCoords = this.getCoordinates(ctx, this.markers);
                this.drawInternal(ctx, pointCoords);
                this.drawPoints(ctx, pointCoords);
            }
        }
    };

    iChart.Charting.ChartElement.prototype.drawInternal = function (ctx, coords)
    {
        /// <summary>
        /// Draws the element at the specified pixel coordinates using the specified 2D canvas context.
        /// </summary>
        /// <param name="ctx" type="CanvasRenderingContext2D">A 2D canvas context to use when drawing the chart element.</param>
        /// <param name="coords">Chart element marker points converted to actual pixel coordinates.</param>
    };

    iChart.Charting.ChartElement.prototype.drawExtended = function (ctx) {};

    iChart.Charting.ChartElement.prototype.onHover = function (ctx) {};

    iChart.Charting.ChartElement.prototype.onOut = function (ctx) {};

    iChart.Charting.ChartElement.prototype.onSelect = function (ctx) {
        this.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['selectInstrument', this]);
    };

    iChart.Charting.ChartElement.prototype.onBlur = function (ctx) {};

    iChart.Charting.ChartElement.prototype.onRemove = function () {};

    iChart.Charting.ChartElement.prototype.onDrop = function () {};

    iChart.Charting.ChartElement.prototype.onDrag  = function (points) {};

    iChart.Charting.ChartElement.prototype.drawPopupSettings = function (ctx, coords) {};

    iChart.Charting.ChartElement.prototype.setSettings = function (settings) {
        this.settings = $.extend(this.settings, settings);
        if(typeof this.layer != "undefined" && this.layer.context) {
            this.layer.render();
            this.layer.syncHash();
        }
    };

    /**
     *
     * @param ctx
     * @param settings
     */
    iChart.Charting.ChartElement.prototype.initDrawSettings = function (ctx, settings) {
        if(settings != undefined) {
            var settings = settings;

            if(typeof settings.lineDash != "undefined") {
                if (typeof ctx.setLineDash !== "undefined") ctx.setLineDash(settings.lineDash);
                if ( ctx.mozDash !== undefined )       ctx.mozDash = settings.lineDash;
            }

            if (ctx.inHover) {
                //console.log(settings);
                ctx.fillStyle = iChart.invertColor(settings.fillStyle);
                ctx.strokeStyle = iChart.invertColor(settings.strokeStyle);
                ctx.lineWidth = settings.lineWidth;
            } else {
                ctx.fillStyle   = settings.fillStyle;
                ctx.strokeStyle = settings.strokeStyle;
                ctx.lineWidth = settings.lineWidth;
            }
        }
    };

    iChart.Charting.ChartElement.prototype.onInsert = function () {
        this.selected = true;
    };

    iChart.Charting.ChartElement.prototype.getCoordinates = function (ctx, points)
    {
        /// <summary>
        /// Converts the specified element points to actual pixel coordinates using the specified 2D canvas context.
        /// </summary>
        /// <param name="ctx" type="CanvasRenderingContext2D">A 2D canvas context to use when drawing the points.</param>
        /// <param name="points">Points to draw.</param>

        var coords = [];
        for (var i = 0; i < points.length; ++i)
        {
            var coord = {};
            coord.x = Math.round(this.layer.area.getXPositionByValue(points[i].x / 1000));
            if (isNaN(coord.x))
            {
                break;
            }

            if(this.layer.chart.isComparison) {
                var y = ((points[i].y  /  this.layer.area.ySeries[0].points[this.layer.area.viewport.x.bounded.min][3]) - 1) * 100;
                coord.y = Math.round(this.layer.area.getYPosition(y));

            } else {
                coord.y = Math.round(this.layer.area.getYPosition(points[i].y));
            }

            if (isNaN(coord.y))
            {
                break;
            }

            if (this === this.layer.selected && this.controlEnable && this.storageEnable)
            {
                // Place the delete button at the first marker point.
                if (i === 0)
                {
                    var self = this;
                    var deleteButton_onClick = function ()
                    {
//                        if (confirm("Удалить инструмент?"))
//                        {
                            //
//                        }

                        if($(this).hasClass('on')) {
                            self.remove();
                        } else {
                            $(this).addClass('on');
                        }
                        return false;
                    };

                    this.layer.$deleteButton.unbind("mousedown").mousedown(deleteButton_onClick).show().css({ "left": this.layer.area.innerOffset.left + coord.x + 2, "top": this.layer.area.innerOffset.top + coord.y + 2 });
                    if(this.hasSettings && this.hasPopupSettings) {
                        var settingsButton_onClick = function ()
                        {
                            self.drawPopupSettings(ctx, coord);
                            return false;
                        };
                        this.layer.$settingsButton.unbind("mousedown").mousedown(settingsButton_onClick).show().css({ "left": this.layer.area.innerOffset.left + coord.x - 10 , "top": this.layer.area.innerOffset.top + coord.y + 2 });
                    }

                }
            }

            coords.push(coord);
        }
        return coords;
    };

    iChart.Charting.ChartElement.prototype.drawPoints = function (ctx, pointCoords)
    {
        if (this === this.layer.selected && this.controlEnable)
        {
            for (var i = 0; i < pointCoords.length; ++i) {
                var point = pointCoords[i];
                ctx.save();
                ctx.beginPath();
                ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI, true);
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 1;
                ctx.lineWidth = 2;
                ctx.stokeStyle = '#eee';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    iChart.Charting.ChartElement.prototype.getTestContext = function (force)
    {
        /// <summary>
        /// Gets context used for detecting cursor position relative to the element.
        /// </summary>

        force = !!force;

        if (typeof this.testContext === "undefined" || force)
        {
            this.testContext = {};

            var self = this;
            this.testContext.points = $.map(this.points, function (value, index)
            {
                return {
                    "x": Math.round(self.layer.area.getXPositionByValue(value.x / 1000)),
                    "y": Math.round(self.layer.area.getYPosition(value.y))
                };
            });

            this.setTestSegments();
        }

        return this.testContext;
    };

    iChart.Charting.ChartElement.prototype.isComplete = function ()
    {
        /// <summary>
        /// Gets a value indicating whether this chart element is complete.
        /// </summary>
        /// <returns type="Boolean" />

        return this.points.length === this.maxPointCount;
    };

    iChart.Charting.ChartElement.prototype.isMouseOver = function (x, y)
    {
        /// <summary>
        /// Gets a value indicating whether the mouse cursor at the specified coordinates is over this chart element.
        /// Returns the index of the marker point plus 1 if the cursor is close to a marker point.
        /// Returns a zero if the cursor is close to one of the element lines but not to a marker.
        /// Returns a -1 if the cursor is not close to any of the marker points/lines of the element.
        /// </summary>
        /// <param name="x" type="Number">X coordinate of the mouse.</param>
        /// <param name="y" type="Number">Y coordinate of the mouse.</param>
        /// <returns type="Boolean" />

        if (!this.isComplete())
        {
            return -1;
        }

        var testContext = this.getTestContext();

        if(typeof testContext.maps != 'undefined') {
            for (var i in testContext.maps)
            {
                var c = testContext.maps[i];
                if(x >= c[0].x && x <= c[1].x && y >= c[0].y && y <= c[1].y) {
                    return 'm_' + i;
                }
            }
        }

        // Check whether the coordinates are close to any of the marker points.
        for (var i = 0; i < testContext.points.length; ++i)
        {
            var p = testContext.points[i];
            var d = iChart.Charting.pointToPointDistanceSquared(p, { "x": x, "y": y });
            if (d <= 64)
            {
                return i + 1;
            }
        }

        // Check whether the coordinates are close to any of the lines constituting the element.
        for (var i = 0; i < testContext.segments.length; ++i)
        {
            var s = testContext.segments[i];
            var d = iChart.Charting.pointToSegmentDistanceSquared(s, { "x": x, "y": y }, true);
            if (d <= 64)
            {
                return 0;
            }
        }

        if(this.selected) {
            if(typeof testContext.controls != 'undefined') {
                for (var i in testContext.controls)
                {
                    var c = testContext.controls[i];
                    if(x >= c[0].x && x <= c[1].x && y >= c[0].y && y <= c[1].y) {
                        return 'c_' + i;
                    }
                }
            }
        }

        if(typeof testContext.elementArea != 'undefined') {
            var a = testContext.elementArea;
            if(x >= a[0].x && x <= a[1].x && y >= a[0].y && y <= a[1].y) {
                return 'a_' + 0;
            }
        }

        return -1;
    };

    iChart.Charting.ChartElement.prototype.remove = function ()
    {
        /// <summary>
        /// Removes this chart element from the canvas, effectively destroying it for good.
        /// </summary>

        this.onRemove();
        this.layer.remove(this);
        delete this.layer;
        delete this.testContext;
    };

    iChart.Charting.ChartElement.prototype.setTestSegments = function ()
    {
        /// <summary>
        /// Sets test segments based on the element marker points.
        /// </summary>

        this.testContext.segments = [
            this.testContext.points
        ];

        this.testContext.controls = [];
    };
})();