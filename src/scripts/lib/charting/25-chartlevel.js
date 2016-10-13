/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartLevel = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Level";
        this.drawType = 'auto';
        this.hoverCursor = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.layer.chart.env.lib_path + "/styles/cursors/red_vertical_cursor.cur'), move";
        this.moveCursor = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.layer.chart.env.lib_path + "/styles/cursors/red_vertical_cursor.cur'), move";
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = true;
        this.storageEnable = false;
        this.settings = {
            text: '',
            color: '#ED1ACE',
            textColor: 'red',
            inactiveHoverColor: '#4684c6',
            inactiveColor: '#AAAAAA',
            offset: 40,//вправо от последий свечи
            width: 150,
            height: 30
        };
        this.drawSingle = true;

    };

    inheritPrototype(iChart.Charting.ChartLevel, iChart.Charting.ChartElement);

    iChart.Charting.ChartLevel.prototype.setSettings = function (settings) {

        this.points[0].fActive = 1;
        this.points[0].fHover = 0;

        this.settings.onDrop =  function(mode){
            if(!isNaN(parseInt(mode))) {
                var i = parseInt(mode) - 1;
                var data = {
                    event: 'drop',
                    element: this,
                    value: this.points[0].y
                };
                this.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['instrument', data]);
            }
        };

        this.controls = {
            0: {
                active: true,
                enabled: false,
                element: this,
                click: function () {
                    var data = {
                        event: 'close',
                        element: this,
                        value: this.points[0].y
                    };

                    this.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['instrument', data]);
                    this.element.setTestSegments();
                    this.element.layer.render();
                },
                type: 'close',
                value: 'element'
            }
        };

        this.maps = {
            0: {
                element: this,
                click: function () {
                    this.element.points[0].fActive = 1;
                    this.element.setTestSegments();
                    var data = {
                        event: 'click',
                        element: this.element,
                        value: this.element.points[0].y
                    };

                    this.element.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['instrument', data]);

                },
                hoverIn: function () {
                    this.element.points[0].fHover = 1;
                    this.element.layer.render();
                    var data = {
                        event: 'hoverIn',
                        element: this.element,
                        value: this.element.points[0].y
                    };

                    this.element.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['instrument', data]);
                },
                hoverOut: function () {
                    this.element.points[0].fHover = 0;
                    this.element.layer.render();
                    var data = {
                        event: 'hoverOut',
                        element: this.element,
                        value: this.element.points[0].y
                    };

                    this.element.layer.chart.env.wrapper.trigger('iguanaChartEvents', ['instrument', data]);
                },
                type: 'element',
                value: 'element'
            }
        }

        this.settings = $.extend(this.settings, settings);

    };

    /**
     *
     * @param ctx
     * @param coords
     */
    iChart.Charting.ChartLevel.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1) { return; }

        var lastPoint = this.layer.chart.env.viewData.chart.areas[0].getXPositionByIndex(this.layer.chart.env.viewData.chart.areas[0].xSeries.length-1-this.layer.chart.env.viewData.chart.chartOptions.futureAmount) + this.settings.offset;
        lastPoint = Math.min(lastPoint, this.layer.chart.env.viewData.chart.areas[0].getXPositionByIndex(this.layer.chart.env.viewData.chart.areas[0].xSeries.length-1));
        var point = this.layer.chart.env.viewData.chart.areas[0].getXValue(lastPoint);

        this.points[0].x = point * 1000;

        coords[0].x = this.layer.area.getXPositionByValue(point);


        //if(this.selected) {
        for(var i in this.controls) {
            var control = this.controls[i];

            if (!control.enabled) { continue; }
            this.drawControl(ctx, coords, control)
        }

        //}


        ctx.fillStyle = 'rgba(255,255,255,1)';

        for (var i = coords.length-1; i >= 0; i--) {
            if(i>=3) { continue; }
            this.drawPriceBox(ctx, coords, i);
            this.drawLabel(ctx, coords, i);
        }

    };

    iChart.Charting.ChartLevel.prototype.drawPoints = function (ctx, pointCoords) {};

    iChart.Charting.ChartLevel.prototype.drawExtended = function (ctx)
    {
        if (typeof this.markers !== "undefined") {
            var pointCoords = this.getCoordinates(ctx, this.markers);
            var points = this.markers;
        } else {
            var pointCoords = this.getCoordinates(ctx, this.points);
            var points = this.points;
        }

        if (pointCoords.length < 1) { return; }

        for(var i = 0; i < pointCoords.length && i<3; i++) {
            if(points[i].fActive) {
                var label = iChart.roundToPrecision(points[i].y, this.layer.chart.env.userSettings.currentSecurity.min_step);
                this.layer.chart.renderer.drawLable(ctx, this.settings.color, this.settings.textColor, this.layer.area.innerWidth, pointCoords[i].y, label);
            }
        }
    };

    iChart.Charting.ChartLevel.prototype.drawControl = function (ctx, coords, control)
    {
        ctx.save();

        if(control.type == 'close') {

            var point = coords[0];

            if(point) {
                ctx.fillStyle = '#ff9999';
                //ctx.fillRect(point.x + this.settings.width + 2, point.y - 23, 16, 16);
                ctx.strokeStyle = '#777777';
                ctx.beginPath();
                //ctx.arc(point.x + this.settings.width + 10, point.y - 15, 8, 0, 2*Math.PI);
                ctx.lineWidth = 2;
                ctx.moveTo(point.x + this.settings.width + 10-4, point.y - 15-4);
                ctx.lineTo(point.x + this.settings.width + 10+4, point.y - 15+4);

                ctx.moveTo(point.x + this.settings.width + 10+4, point.y - 15-4);
                ctx.lineTo(point.x + this.settings.width + 10-4, point.y - 15+4);

                ctx.closePath();

                ctx.stroke();
            }

        }
        ctx.restore();
    };


    iChart.Charting.ChartLevel.prototype.drawPriceBox = function (ctx, coords, type)
    {
        var fillStyle = this.settings.color;

        if(this.points[type].fActive) {
            ctx.save();
            ctx.fillStyle = fillStyle;
            //Прямоугольник
            ctx.beginPath();
            ctx.moveTo(coords[type].x-10, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.settings.width, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.settings.width + 8, coords[type].y);
            ctx.lineTo(coords[type].x+this.settings.width, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y-10);
            ctx.moveTo(coords[type].x+10, coords[type].y-10);
            ctx.lineTo(coords[type].x+10, coords[type].y+10);
            ctx.closePath();
            //ctx.stroke();
            ctx.fill();
            ctx.restore();

            //Штрихи слева
            ctx.save();
            ctx.strokeStyle = this.settings.textColor;
            ctx.beginPath();
            ctx.moveTo(coords[type].x-5, coords[type].y-3);
            ctx.lineTo(coords[type].x+5, coords[type].y-3);
            ctx.moveTo(coords[type].x-5, coords[type].y);
            ctx.lineTo(coords[type].x+5, coords[type].y);
            ctx.moveTo(coords[type].x-5, coords[type].y+3);
            ctx.lineTo(coords[type].x+5, coords[type].y+3);
            ctx.closePath();
            ctx.stroke();

            //Направляющие
            ctx.strokeStyle = fillStyle;
            ctx.beginPath();
            ctx.moveTo(coords[type].x + this.settings.width + 8, coords[type].y);
            ctx.lineTo(ctx.canvas.width, coords[type].y);
            ctx.moveTo(0, coords[type].y);
            ctx.lineTo(coords[type].x - 10, coords[type].y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.save();
            //ctx.strokeStyle = 'rgba(170,170,170)';
            if(this.points[type].fHover) {
                ctx.strokeStyle = this.settings.inactiveHoverColor;
            } else {
                ctx.strokeStyle = this.settings.inactiveColor;
            }
            //Прямоугольник
            ctx.beginPath();
            ctx.moveTo(coords[type].x-10, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.settings.width, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.settings.width + 8, coords[type].y);
            ctx.lineTo(coords[type].x+this.settings.width, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y-10);
            //ctx.moveTo(coords[type].x+10, coords[type].y-10);
            //ctx.lineTo(coords[type].x+10, coords[type].y+10);
            ctx.closePath();
            ctx.stroke();
            //ctx.fill();
            ctx.restore();

        }
    };

    iChart.Charting.ChartLevel.prototype.drawLabel = function (ctx, coords, type)
    {

        var label = '',
            fillStyle = 'rgba(0,0,0,1)';

        var price = this.points[0].y;
        if (typeof this.markers !== "undefined") {
            price = this.markers[0].y;
        }
        label = this.settings.text;

        ctx.save();
        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.settings.textColor;

        if(this.points[type].fActive) {

        } else {
            if(this.points[type].fHover) {
                ctx.fillStyle = this.settings.inactiveHoverColor;
            } else {
                ctx.fillStyle = this.settings.inactiveColor;
            }
        }

        ctx.fillText(label, coords[type].x + 15, coords[type].y);
        ctx.restore();
    };


    iChart.Charting.ChartLevel.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            //[{ "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}, { "x": this.testContext.points[0].x + this.settings.width, "y": this.testContext.points[0].y}]
        ];

        this.testContext.controls = {};
        for(var i in this.controls) {
            var point = this.testContext.points[i];
            if(point) {
                this.testContext.controls[i] = [{
                    x: point.x + this.settings.width + 2,
                    y: point.y - 23
                }, {
                    x: point.x + this.settings.width + 2 + 16,
                    y: point.y - 23 + 16
                }];
            }

        }

        this.testContext.maps = {};
        //if(!this.points[0].fActive || 1) {
            this.testContext.maps[0] = [{x: this.testContext.points[0].x + 10, y: this.testContext.points[0].y - 10},
                {x: this.testContext.points[0].x + this.settings.width + 10, y: this.testContext.points[0].y + 10}];
        //}
    };

    iChart.Charting.ChartLevel.prototype.onDrag  = function (points)
    {
        if(typeof this.settings.restriction == 'function') {
            this.settings.restriction.call(this, points);
        }
    };

    iChart.Charting.ChartLevel.prototype.onDrop = function (mode) {
        if(typeof this.settings.onDrop == 'function') {
            this.settings.onDrop.call(this, mode);
        }
    };

    iChart.Charting.ChartLevel.prototype.setValue = function (value)
    {
        this.points[0].y = value;
        this.layer.render();
    };

    iChart.Charting.ChartLevel.lightColor = function (rgb)
    {
        rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        for (var i = 0; i < 3; i++) {
            rgb[i] = parseInt(rgb[i]) + 40;
        }
        return 'rgba(' + rgb.join(", ") + ')';
    };
})();

