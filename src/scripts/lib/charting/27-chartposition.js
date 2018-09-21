/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartPosition = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Position";
        this.drawType = 'auto';
        this.hoverCursor = "default";
        this.moveCursor = "default";
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = false;
        this.storageEnable = false;
        this.settings = {};
        this.positionAbsolute = true;
    };

    inheritPrototype(iChart.Charting.ChartPosition, iChart.Charting.ChartElement);

    iChart.Charting.ChartPosition.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        this.settings.fillStyle = this.settings.fillStyle || "#3AAE3E";

        var point = this.layer.chart.areas[0].xSeries[this.layer.chart.areas[0].xSeries.length-this.layer.chart.chartOptions.futureAmount-1];
        this.points[0].x = point * 1000;
        coords[0].x = this.layer.area.getXPositionByValue(point);



        var color = this.settings.fillStyle;

        var coordinates = this.getCoordinates(ctx, [{x: this.settings.time, y: 0}]);
        var start = 0;
        if(coordinates.length) {
            start = coordinates[0].x;
        }

        if(this.selected || ctx.inHover) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.moveTo(start, coords[0].y);
            ctx.lineTo(ctx.canvas.width, coords[0].y);
            ctx.stroke();
            ctx.restore();

            this.drawLable(ctx, color, this.settings.textColor, coords[0].x, coords[0].y, this.settings);

        } else {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            //for (var x = coords[0].x; x <= ctx.canvas.width; x += 20)
            for (var x = 0; x <= ctx.canvas.width; x += 20)
            {
                ctx.moveTo(x, coords[0].y);
                ctx.lineTo(x + 12, coords[0].y);
            }
            ctx.stroke();
            ctx.restore();
        }
        //this.drawTestSegments(ctx);

    }




    iChart.Charting.ChartPosition.prototype.drawExtended = function (ctx) {
        if (this.selected) {
            var pointCoords = this.getCoordinates(ctx, this.points);

            if (pointCoords.length < 1) {
                return;
            }

            var label = iChart.formatNumber(this.points[0].y, {
                "decimalPrecision": this.layer.chart.labelPrecision,
                "scale": 0
            });

            this.layer.chart.renderer.drawLable(ctx, this.settings.fillStyle, 0, this.layer.area.innerWidth, pointCoords[0].y, label);

            if (typeof this.markers !== "undefined") {
                var pointCoords = this.getCoordinates(ctx, this.markers);

                var label = iChart.formatNumber(this.markers[0].y, {
                    "decimalPrecision": this.layer.chart.labelPrecision,
                    "scale": 0
                });
                var color = !ctx.inHover ? this.settings.fillStyle : ( typeof this.settings.fillStyleHover != "undefined" ? this.settings.fillStyleHover : iChart.Charting.ChartPosition.lightColor(this.settings.fillStyle));
                this.layer.chart.renderer.drawLable(ctx, color, 0, this.layer.area.innerWidth, pointCoords[0].y, label);
            }
        }
    };


    //Отрисовка сделок
    iChart.Charting.ChartPosition.prototype.drawTrades = function (ctx, x, settings) {

        var _this = this;
        var points = [];

        //Время и цена сделки
        $.each(settings.trades, function(i, trade){
            points.push({
                x: trade.x,
                y: trade.y
            });
        });

        //Кординаты точек на графике
        var coordinates = _this.getCoordinates(ctx, points);

        coordinates.forEach(function(tradeCoordinates){

            if (tradeCoordinates.x > x) return;

            ctx.save();
            ctx.beginPath();

            ctx.arc(tradeCoordinates.x, tradeCoordinates.y, 5, 0, 2 * Math.PI, true);
            ctx.fillStyle = '#607d8b';
            ctx.fill();

            ctx.arc(tradeCoordinates.x, tradeCoordinates.y, 2, 0, 2 * Math.PI, true);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.closePath();

            ctx.restore();
        })
    };


    iChart.Charting.ChartPosition.prototype.drawLable = function (ctx, fillColor, textColor, x, y, settings)
    {
        fillColor = fillColor ? fillColor : "#333333";
        textColor = textColor ? textColor : "#FFFFFF";

        ctx.save();

        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillStyle = fillColor;

        ctx.lineWidth="1";


        var width = ctx.measureText(settings.positionText + settings.profitText).width;
        x = ctx.canvas.width - 120;
        var _x = ctx.canvas.width - 120 - width;

        ctx.beginPath();
        ctx.moveTo(x-width-5, y+5);
        ctx.lineTo(x-width-5, y-5);
        ctx.quadraticCurveTo(x-width-5, y-10, x-width, y-10);
        ctx.lineTo(x, y-10);
        ctx.quadraticCurveTo(x+5, y-10, x+5, y-5);
        ctx.lineTo(x+5, y+5);
        ctx.quadraticCurveTo(x+5, y+10, x, y+10);
        ctx.lineTo(x-width, y+10);
        ctx.quadraticCurveTo(x-width-5, y+10, x-width-5, y+5);
        ctx.closePath();
        ctx.fill();

        if (settings.profitText) {

            ctx.fillStyle = textColor;
            ctx.fillText(settings.positionText, x-width, y);

            width = ctx.measureText(settings.profitText).width;
            ctx.fillStyle = settings.profitColor;
            ctx.beginPath();
            ctx.moveTo(x-width, y+5);
            ctx.lineTo(x-width, y-5);
            ctx.lineTo(x-width, y-10);
            ctx.lineTo(x, y-10);
            ctx.quadraticCurveTo(x+5, y-10, x+5, y-5);
            ctx.lineTo(x+5, y+5);
            ctx.quadraticCurveTo(x+5, y+10, x, y+10);
            ctx.lineTo(x-width, y+10);
            ctx.lineTo(x-width, y+10);
            ctx.closePath();
            ctx.fill();

            this.drawCancelButton(ctx, x, y-10);

            ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = textColor;
            ctx.fillText(settings.profitText, x-width, y);
        }



        ctx.restore();

        this.drawTrades(ctx, _x, this.settings);


    }

    iChart.Charting.ChartPosition.prototype.drawCancelButton = function (ctx, x, y) {

        ctx.beginPath();
        ctx.moveTo(x, y);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.lineTo(x, y+20);
        ctx.stroke();

        ctx.lineTo(x+15, y+20);
        ctx.quadraticCurveTo(x+20, y+20, x+20, y+15);
        ctx.lineTo(x+20, y+5);
        ctx.quadraticCurveTo(x+20, y, x+15, y);
        ctx.closePath();

        ctx.fillStyle = '#e53935';
        ctx.fill();

        //Рисуем крестик
        ctx.beginPath();
        ctx.moveTo(x+5, y+5);
        ctx.lineTo(x+15, y+15);
        ctx.moveTo(x+5, y+15);
        ctx.lineTo(x+15, y+5);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();


    }

    iChart.Charting.ChartPosition.prototype.drawPoints = function (ctx, pointCoords) {}

    iChart.Charting.ChartPosition.prototype.drawTestSegments = function (ctx) {
        if(typeof this.testContext != 'undefined') {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            for(var i in this.testContext.segments) {
                var c = this.testContext.segments[i];
                ctx.moveTo(c[0].x, c[0].y);
                ctx.lineTo(c[1].x, c[1].y);
                ctx.stroke();
            }
            ctx.closePath();
            ctx.restore();
        }
    }


    iChart.Charting.ChartPosition.prototype.setTestSegments = function ()
    {
        if (this.selected) {
             var ctx = this.layer.context;
             ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
             ctx.textAlign = "left";
             ctx.textBaseline = "middle";
             var width = ctx.measureText(this.settings.text).width;
             var x = ctx.canvas.width - 120;
             this.testContext.segments = [
             [{ "x": x-width, "y": this.testContext.points[0].y-4}, { "x": x, "y": this.testContext.points[0].y-4}],
             [{ "x": x, "y": this.testContext.points[0].y-4}, { "x": x, "y": this.testContext.points[0].y+4}],
             [{ "x": x, "y": this.testContext.points[0].y+4}, { "x": x-width, "y": this.testContext.points[0].y+4}],
             [{ "x": x-width, "y": this.testContext.points[0].y+4}, { "x": x-width, "y": this.testContext.points[0].y-4}],
             [{ "x": x-width, "y": this.testContext.points[0].y}, { "x": x, "y": this.testContext.points[0].y}],
             [{"x": this.layer.area.innerOffset.left, "y": this.testContext.points[0].y},{"x": this.layer.area.innerOffset.left + this.layer.area.innerWidth,"y": this.testContext.points[0].y}]
             ];
        } else {
            if(this.testContext) {
                this.testContext.segments = [
                    [{
                        "x": this.layer.area.innerOffset.left,
                        "y": this.testContext.points[0].y
                    }, {
                        "x": this.layer.area.innerOffset.left + this.layer.area.innerWidth,
                        "y": this.testContext.points[0].y
                    }]
                ];
            }
        }
    };

    iChart.Charting.ChartPosition.prototype.onDrag  = function (points)
    {
        if(typeof this.settings.restriction == 'function') {
            this.settings.restriction.call(this, points);
        }
    };

    iChart.Charting.ChartPosition.prototype.onSelect = function (ctx) {
        iChart.Charting.ChartElement.prototype.onSelect.call(this, ctx);
        this.setTestSegments();
    };

    iChart.Charting.ChartPosition.prototype.onBlur = function () {
        this.setTestSegments();
    };

    iChart.Charting.ChartPosition.prototype.onDrop = function () {
        if(typeof this.settings.onDrop == 'function') {
            this.settings.onDrop.call(this);
        }
    };

    iChart.Charting.ChartPosition.prototype.onHover = function () {
        clearTimeout(this.layer.chart.env.timers.positionClose);
        this.cancelControl(1);
    };

    iChart.Charting.ChartPosition.prototype.onOut = function () {
        clearTimeout(this.layer.chart.env.timers.positionClose);
        var self = this;
        this.layer.chart.env.timers.orderClose = setTimeout(function(){self.cancelControl(0);}, 300);
    };

    iChart.Charting.ChartPosition.prototype.cancelControl = function (state) {

        if(typeof this.settings.onCancel == 'function') {
            if(state) {
                $('#ichartPositionCancelCtrl').hide();
                var ctx = this.layer.context;
                var x = ctx.canvas.width - 120;
                var pointCoords = this.getCoordinates(ctx, this.points);
                if(!$('#ichartPositionCancelCtrl').length) {
                    $("<span/>", { id:'ichartPositionCancelCtrl', "style": "color:transparent", "class": "m-chart-instrument-delete", "text": "✕", "title": _t('15807', 'Закрыть позицию по рынку') }).hide().appendTo(this.layer.chart.container);
                }

                var self = this;
                $('#ichartPositionCancelCtrl').unbind('click').bind('click', function(e) {
                    if(typeof self.settings.onCancel == 'function') {
                        self.settings.onCancel.call(self);
                    }
                    $('#ichartOrderCancelCtrl').hide();
                }).bind('mouseover', function () {
                    clearTimeout(self.layer.chart.env.timers.positionClose);
                }).bind('mouseleave', function () {
                    clearTimeout(self.layer.chart.env.timers.positionClose);
                    self.layer.chart.env.timers.positionClose = setTimeout(function(){self.cancelControl(0);}, 1000);
                });

                var top = pointCoords[0].y-8;
                var left = x+2;

                $('#ichartPositionCancelCtrl').css({top: top, left: left}).show();
            } else {
                $('#ichartPositionCancelCtrl').hide();
            }
        }
    };

    iChart.Charting.ChartPosition.lightColor = function (rgb)
    {
        rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        for (var i = 0; i < 3; i++) {
            rgb[i] = parseInt(rgb[i]) + 40;
        }
        return 'rgba(' + rgb.join(", ") + ')';
    };


})();

