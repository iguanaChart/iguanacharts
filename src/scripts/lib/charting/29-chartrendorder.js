/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartTrendorder = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Trendorder";
        this.drawType = 'auto';
        this.hoverCursor = "row-resize";
        this.moveCursor = "row-resize";
        this.hoverPointCursor = "move";
        this.movePointCursor = "move";
        this.maxPointCount = 2;
        this.hasSettings = true;
        this.controlEnable = true;
        this.storageEnable = false;
        this.drawSingle = true;
        /**
         * Непроизводить корректировку точек, т.к. элемент находиться под обрабатой внешним методом
         * @type {boolean}
         */
        this.freezed = true;
        this.settings = {
            text: '',
            textHeight: 13,
            fillStyle: '#f44336',
            textColor: '#FFFFFF',
            mode: "line", //trend
        };
        this.positionAbsolute = true;
    };

    inheritPrototype(iChart.Charting.ChartTrendorder, iChart.Charting.ChartElement);

    iChart.Charting.ChartTrendorder.prototype.setSettings = function (settings) {
        this.settings = $.extend(this.settings, settings);

        //points = [{'x':new Date(), 'y':data.price}];
        if(typeof settings.price2 == "undefined") {
            this.points[0] = {x: settings.date, y: settings.price};
            this.points[1] = {x: settings.date, y: settings.price};
        } else {
            this.points[0] = {x: settings.date, y: settings.price};
            this.points[1] = {x: settings.date2, y: settings.price2};

            var coords = this.getFloatCoords();

            this.trendLineSettings = {
                points: this.getBorderPoints(coords)
            };
        }
    };

    /**
     * Расчет удобного положение управляющих точек
     * @param x
     * @param length
     */
    iChart.Charting.ChartTrendorder.prototype.calcPointsPosition = function (x, length) {
        length = length ? length : 150;
        var coords = this.getCoordinates(this.layer.context, this.points);
        var borderPoints = this.getBorderPoints(coords);

        var xCenter = (borderPoints[0].x + borderPoints[1].x) / 2;

        if( x < xCenter) {
            this.points[0].x = this.layer.area.getXValue(x) * 1000;
            var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], x);
            this.points[0].y = this.layer.area.getYValue(foundPoint.y);

            var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], xCenter);
            this.points[1].x = this.layer.area.getXValue(xCenter) * 1000;
            this.points[1].y = this.layer.area.getYValue(foundPoint.y);

            var coords = this.getCoordinates(this.layer.context, this.points);

            //Перенос центральной точки, если управляющая слишком близко к ней
            if(Math.sqrt(Math.pow(coords[0].x - coords[1].x, 2) + Math.pow(coords[0].y - coords[1].y, 2)) < length) {

                var alpha = Math.atan((coords[0].y - coords[1].y) / (coords[0].x - coords[1].x));
                var newPx = coords[0].x + (length+5) * Math.cos(alpha);
                var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], newPx);

                this.points[1].x = this.layer.area.getXValue(newPx) * 1000;
                this.points[1].y = this.layer.area.getYValue(foundPoint.y);
            }

        } else {

            this.points[1].x = this.layer.area.getXValue(x) * 1000;
            var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], x);
            this.points[1].y = this.layer.area.getYValue(foundPoint.y);

            var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], xCenter);
            this.points[0].x = this.layer.area.getXValue(xCenter) * 1000;
            this.points[0].y = this.layer.area.getYValue(foundPoint.y);

            var coords = this.getCoordinates(this.layer.context, this.points);

            if(Math.sqrt(Math.pow(coords[0].x - coords[1].x, 2) + Math.pow(coords[0].y - coords[1].y, 2)) < length) {

                var alpha = Math.atan((coords[0].y - coords[1].y) / (coords[0].x - coords[1].x));
                var newPx = coords[1].x - (length+5) * Math.cos(alpha);
                var foundPoint = iChart.getLineEquation(this.trendLineSettings.points[0], this.trendLineSettings.points[1], newPx);

                this.points[0].x = this.layer.area.getXValue(newPx) * 1000;
                this.points[0].y = this.layer.area.getYValue(foundPoint.y);
            }
        }

    };

    /**
     *
     * @param points
     * @returns {*[]}
     */
    iChart.Charting.ChartTrendorder.prototype.getFloatCoords = function (points) {
        points = (typeof points != "undefined") ? points : this.points;
        var coords = [{x:0, y:0},{x:0,y:0}];
        coords[0].x = this.layer.area.getXPositionByValue(points[0].x / 1000);
        coords[0].y = this.layer.area.getYPosition(points[0].y);
        coords[1].x = this.layer.area.getXPositionByValue(points[1].x / 1000);
        coords[1].y = this.layer.area.getYPosition(points[1].y);
        return coords;
    };

    iChart.Charting.ChartTrendorder.prototype.normalizeCoords = function (ctx, coords)
    {
        this.moveForward();
        return this.getCoordinates(ctx, this.points);
    };

    iChart.Charting.ChartTrendorder.prototype.lineNormalizeCoords = function (ctx, coords) {
        coords[1].x = ctx.canvas.width - 80;
        this.points[1].x = this.layer.area.getXValue(coords[1].x) * 1000;

        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        var textWidth = ctx.measureText(this.settings.text).width;

        coords[0].x = ctx.canvas.width - 80 - textWidth - 80;
        this.points[0].x = this.layer.area.getXValue(coords[0].x) * 1000;

    };

    iChart.Charting.ChartTrendorder.prototype.drawLineMode = function (ctx, coords) {

        this.settings.fillStyle = this.settings.fillStyle || "#3AAE3E";

        //var point = this.layer.chart.areas[0].xSeries[this.layer.chart.areas[0].xSeries.length-this.layer.chart.futureAmount-1];
        //this.points[0].x = point * 1000;
        //coords[0].x = this.layer.area.getXPositionByValue(point);

        var color = this.settings.fillStyle;

        if(this.selected || ctx.inHover) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(0, coords[0].y);
            ctx.lineTo(ctx.canvas.width, coords[0].y);
            ctx.stroke();
            ctx.restore();

            this.drawLable(ctx, color, this.settings.textColor, coords[0].x, coords[0].y, this.settings.text);

            if(this.selected) {
                this.drawPoint(ctx, coords[0].x, coords[0].y, color, 4);
                this.drawPoint(ctx, coords[1].x, coords[1].y, color, 4);
            }
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
    };

    /**
     * Время и координата первой точки условия приказа
     * @returns {{time: *, x}}
     */
    iChart.Charting.ChartTrendorder.prototype.getOpenOrderData = function () {
        var openTime = this.layer.chart.areas[0].xSeries[this.layer.chart.areas[0].xSeries.length - this.layer.chart.chartOptions.futureAmount - 1];
        var openX = this.layer.area.getXPositionByValue(openTime);

        return {time: openTime, x: openX};
    };

    /**
     * Время и координата второй точки условия приказа
     * @returns {{time: Date, x}}
     */
    iChart.Charting.ChartTrendorder.prototype.getExpireOrderData = function () {
        var openOrder = this.getOpenOrderData();
        var expireTime = new Date((openOrder.time + this.layer.chart.env.dataSource.dataSettings.timeframe * 60) *  1000);

        var expireX = this.layer.area.getXPositionByValue(expireTime / 1000);

        return {time: expireTime, x: expireX};
    };


    /**
     *
     * @param coords {[{x:,y:},{x,y}]}
     * @returns {{x, y, k, b}}
     */
    iChart.Charting.ChartTrendorder.prototype.getOpenCoords = function (coords) {
        var openOrder = this.getOpenOrderData();
        return iChart.getLineEquation(coords[0], coords[1], openOrder.x);
    };

    /**
     *
     * @param coords
     * @returns {{x, y, k, b}}
     */
    iChart.Charting.ChartTrendorder.prototype.getExpireCoords = function (coords) {
        var expireOrder = this.getExpireOrderData();
        return iChart.getLineEquation(coords[0], coords[1], expireOrder.x);
    };

    /**
     * Получение параметров для приказа
     * @param ctx
     * @param coords
     */
    iChart.Charting.ChartTrendorder.prototype.getOrderParams = function (coords) {

        var foundOpenCoords = this.getOpenCoords(coords);
        var foundExpireCoords = this.getExpireCoords(coords);

        var newOrderParams = {
            points: [
                {x: this.layer.area.getXValue(foundOpenCoords.x) * 1000, y: this.layer.area.getYValue(foundOpenCoords.y)},
                {x: this.layer.area.getXValue(foundExpireCoords.x) * 1000, y: this.layer.area.getYValue(foundExpireCoords.y)}
            ]
        };

        return newOrderParams;
    };

    /**
     * Получить координаты точке пересечение прямой с границами экрана
     * @param coords
     * @returns {*[]}
     */
    iChart.Charting.ChartTrendorder.prototype.getBorderPoints = function (coords) {

        if(coords[0].y < 0 || coords[0].y > this.layer.canvas.height || coords[0].x < 0 || coords[0].x > this.layer.canvas.width) {

            var foundPoint1 = iChart.getLineEquation(coords[0], coords[1], 0);
            var foundPoint2 = iChart.getLineEquation(coords[0], coords[1], this.layer.canvas.width);

        } else {

            var foundPoint1 = iChart.getLineEquation(coords[0], coords[1], 0);
            if (foundPoint1.y < 0) {
                foundPoint1.y = 0;
                foundPoint1.x = (foundPoint1.y - foundPoint1.b) / foundPoint1.k;
            } else if (foundPoint1.y > this.layer.canvas.height) {
                foundPoint1.y = this.layer.canvas.height;
                foundPoint1.x = (foundPoint1.y - foundPoint1.b) / foundPoint1.k;
            }

            var foundPoint2 = iChart.getLineEquation(coords[0], coords[1], this.layer.canvas.width);
            if(foundPoint2.y < 0 ) {
                foundPoint2.y = 0;
                foundPoint2.x = (foundPoint2.y - foundPoint2.b) / foundPoint2.k;
            } else if(foundPoint2.y > this.layer.canvas.height ) {
                foundPoint2.y = this.layer.canvas.height;
                foundPoint2.x = (foundPoint2.y - foundPoint2.b) / foundPoint2.k;
            }
        }

        return [foundPoint1, foundPoint2];
    };

    /**
     * Рендер в режиме наклонной прямой
     * @param ctx
     * @param coords
     */
    iChart.Charting.ChartTrendorder.prototype.drawTrendMode = function (ctx, coords) {

        if (typeof this.markers !== "undefined")
        {
            var points = this.markers;

        } else {
            if(!this.selected && !this.freezed) {
                console.trace();
                this.moveForward();
            }
            var points = this.points;
        }

        this.trendLineSettings = {
            points: this.getBorderPoints(this.getFloatCoords(points))
        };

        var foundOpenCoords = this.getOpenCoords(coords);

        ctx.save();
        ctx.beginPath();

        ctx.setLineDash([8, 3]);
        var color = this.settings.fillStyle;
        ctx.strokeStyle = color;

        ctx.moveTo(foundOpenCoords.x, foundOpenCoords.y);
        ctx.lineTo(this.trendLineSettings.points[0].x, this.trendLineSettings.points[0].y);

        ctx.stroke();

        ctx.restore();


        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.settings.fillStyle;
        ctx.beginPath();
        ctx.moveTo(foundOpenCoords.x, foundOpenCoords.y);
        ctx.lineTo(this.trendLineSettings.points[1].x, this.trendLineSettings.points[1].y);
        ctx.stroke();
        ctx.restore();

        this.settings.newOrderParams = this.getOrderParams(coords);

        if(this.selected) {
            this.drawPoint(ctx, coords[0].x, coords[0].y, color, 4);
            this.drawPoint(ctx, coords[1].x, coords[1].y, color, 4);
            this.drawLableTrend(ctx, coords);
        } else if (ctx.inHover) {
            this.drawLableTrend(ctx, coords);
        }

        /*
        var point = this.layer.chart.areas[0].xSeries[this.layer.chart.areas[0].xSeries.length - this.layer.chart.chartOptions.futureAmount - 1];
        var lastX = this.layer.area.getXPositionByValue(point);
        var foundCoords = iChart.getLineEquation(coords[0], coords[1], lastX);

         var linePoints = [points[0]];
         linePoints[1] = {x: this.layer.area.getXValue(foundCoords.x) * 1000, y:this.layer.area.getYValue(foundCoords.y)};

         ctx.save();
         ctx.beginPath();
         ctx.strokeStyle = '#66FF66';
         ctx.setLineDash([8, 3]);
         var step = Math.round(Math.abs(linePoints[1].x - linePoints[0].x) / 150);
         var foundBaseCoords = this.getCoordinates(ctx, linePoints);
         foundPoint = iChart.getLineEquation(linePoints[1], points[1], linePoints[0].x);
         foundCoords = this.getCoordinates(ctx, [foundPoint]);
         ctx.moveTo(foundCoords[0].x, foundCoords[0].y);
         for(var i=Math.min(linePoints[0].x, linePoints[1].x); i <= Math.max(linePoints[0].x, linePoints[1].x); i+=step) {
             var foundPoint = iChart.getLineEquation(linePoints[1], points[1], i);
             foundCoords = this.getCoordinates(ctx, [foundPoint]);
             ctx.lineTo(foundCoords[0].x, foundCoords[0].y);
             this.drawPoint(ctx, foundCoords[0].x, foundCoords[0].y, '#FF6666');
         }

         //ctx.lineTo(foundBaseCoords[1].x, foundBaseCoords[1].y);
         ctx.stroke();
         ctx.restore();
        */

        //this.pointsForward(ctx);
        //this.pointsBack(ctx);

    };

    /**
     * Расчет значения y на прямой с учем пропуска интервалов
     * @param {float} x - timestamp ms
     * @returns {float}
     */
    iChart.Charting.ChartTrendorder.prototype.findYForward = function (x) {
        var startIndex = iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo(this.layer.chart.areas[0].xSeries, this.settings.date / 1000);
        var endIndex = this.layer.area.getXIndexByValue(x / 1000);

        var timeframe = this.layer.chart.env.dataSource.dataSettings.timeframe * 60;
        var basePoint1 = {x:this.settings.date, y: this.settings.price},
            basePoint2 = {x: this.settings.date2, y: this.settings.price2};


        var correction = 0;
        for(var i = startIndex+1; i <= endIndex; i++) {
            var dt = this.layer.chart.areas[0].xSeries[i] - this.layer.chart.areas[0].xSeries[i - 1];
            if(dt / timeframe > 1) {
                var foundPoint1 = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i-1] * 1000);
                var foundPoint2 = iChart.getLineEquation(basePoint1, basePoint2, (this.layer.chart.areas[0].xSeries[i-1] + dt - timeframe) * 1000);
                correction += foundPoint1.y - foundPoint2.y;
            }
        }

        var foundPoint = iChart.getLineEquation(basePoint1, basePoint2, x);
        var y = foundPoint.y + correction;

        return y;
    };

    /**
     * Скорректировать прямую с учетом пропусков свечей
     */
    iChart.Charting.ChartTrendorder.prototype.moveForward = function () {
        if(this.points[1].x < $.now()) {
            this.points[1].x = $.now();
            this.points[1].y = this.findYForward(this.points[1].x);
        }
    };

    iChart.Charting.ChartTrendorder.prototype.pointsForward = function (ctx) {
        var startIndex = iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo(this.layer.chart.areas[0].xSeries, this.settings.date / 1000);
        var endIndex = this.layer.chart.areas[0].xSeries.length - 1;

        var timeframe = this.layer.chart.env.dataSource.dataSettings.timeframe * 60;
        var basePoint1 = {x:this.settings.date, y: this.settings.price},
            basePoint2 = {x: this.settings.date2, y: this.settings.price2};

        for(var i = startIndex; i <= endIndex; i++) {
            var foundPoint = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i] * 1000);
            var x = this.layer.area.getXPositionByValue(foundPoint.x / 1000);
            var y = this.layer.area.getYPosition(foundPoint.y);
            this.drawPoint(ctx, x, y, 'rgba(255,100,100, 0.3)',4);
        }

        var correction = 0;
        for(var i = startIndex+1; i <= endIndex; i++) {
            var dt = this.layer.chart.areas[0].xSeries[i] - this.layer.chart.areas[0].xSeries[i - 1];
            if(dt / timeframe > 1) {
                var foundPoint1 = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i-1] * 1000);
                var foundPoint2 = iChart.getLineEquation(basePoint1, basePoint2, (this.layer.chart.areas[0].xSeries[i-1] + dt - timeframe) * 1000);
                correction += foundPoint1.y - foundPoint2.y;
            }

            var foundPoint = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i] * 1000);
            var x = this.layer.area.getXPositionByValue(foundPoint.x / 1000);
            var y = this.layer.area.getYPosition(foundPoint.y + correction);

            this.drawPoint(ctx, x, y, '#66FF66', 3);
        }
    };


    iChart.Charting.ChartTrendorder.prototype.pointsBack = function (ctx) {
        //var startIndex = iChart.Charting.indexOfLastElementLessThanOrEqualTo(this.layer.chart.areas[0].xSeries, this.settings.date / 1000);
        var startIndex = this.layer.chart.areas[0].xSeries.length - 2;
        var endIndex = this.layer.chart.areas[0].viewport.x.min;

        var timeframe = this.layer.chart.env.dataSource.dataSettings.timeframe * 60;
        var basePoint1 = {x:this.settings.date, y: this.settings.price},
            basePoint2 = {x: this.settings.date2, y: this.settings.price2};

        /*
        for(var i = startIndex; i > endIndex; i--) {
            var foundPoint = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i] * 1000);
            var x = this.layer.area.getXPositionByValue(foundPoint.x / 1000);
            var y = this.layer.area.getYPosition(foundPoint.y);
            this.drawPoint(ctx, x, y, '#FF6666', 4);
        }*/

        var correction = 0;
        for(var i = startIndex; i > endIndex; i--) {

            var dt = this.layer.chart.areas[0].xSeries[i+1] - this.layer.chart.areas[0].xSeries[i];
            if(dt / timeframe > 1) {

                 //выставлялось на дневном смотрим на
                if(1) {
                    if(dt / 86400 > 1) {
                        dt = dt - dt % 86400;
                        //dt = dt % 86400;
                    }
                }


                var foundPoint1 = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i-1] * 1000);
                var foundPoint2 = iChart.getLineEquation(basePoint1, basePoint2, (this.layer.chart.areas[0].xSeries[i-1] + dt - timeframe) * 1000);
                correction += foundPoint2.y - foundPoint1.y;
            }

            var foundPoint = iChart.getLineEquation(basePoint1, basePoint2, this.layer.chart.areas[0].xSeries[i] * 1000);
            var x = this.layer.area.getXPositionByValue(foundPoint.x / 1000);
            var y = this.layer.area.getYPosition(foundPoint.y + correction);
            this.drawPoint(ctx, x, y, '#66FF66');
        }
    };

    iChart.Charting.ChartTrendorder.prototype.drawInternal = function (ctx, coords)
    {
        //this.normalizeCoords(coords);
        if (coords.length < 2)
        {
            return;
        }


        if(this.settings.mode == 'line') {

            this.lineNormalizeCoords(ctx, coords);
            this.drawLineMode(ctx, coords);

        } else {
            var toCalc = false;
            if(!this.settings.newOrderParams) {
                coords = this.normalizeCoords(ctx, coords);
                toCalc = true;
            }
            this.drawTrendMode(ctx, coords);

            if(toCalc) {
                this.calcPointsPosition(coords[1].x, 150);
            }
        }

    };

    iChart.Charting.ChartTrendorder.prototype.drawPoint = function (ctx, x, y, color, r) {
        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        r = r || 2;
        ctx.arc(x, y, r, 0, 2 * Math.PI, true);
        ctx.closePath();

        ctx.fill();
        ctx.restore();

    };

    iChart.Charting.ChartTrendorder.prototype.drawExtended = function (ctx) {
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
                var color = !ctx.inHover ? this.settings.fillStyle : ( typeof this.settings.fillStyleHover != "undefined" ? this.settings.fillStyleHover : iChart.Charting.ChartTrendorder.lightColor(this.settings.fillStyle));
                this.layer.chart.renderer.drawLable(ctx, color, 0, this.layer.area.innerWidth, pointCoords[0].y, label);
            }
        }
    };

    iChart.Charting.ChartTrendorder.prototype.drawLable = function (ctx, fillColor, textColor, x, y, text)
    {
        fillColor = fillColor ? fillColor : "#333333";
        textColor = textColor ? textColor : "#FFFFFF";

        ctx.save();

        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillStyle = fillColor;

        ctx.lineWidth="2";

        var textWidth = ctx.measureText(text).width;

        var width = textWidth + 5;
        var x = ctx.canvas.width - 120;
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


        ctx.save();
        var shadowColor = this.layer.chart.chartOptions.shadowColor;
        if (this.selected) {

            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 15;
            ctx.shadowOffsetY = 15;

        } else if (ctx.inHover) {

            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

        }
        ctx.restore();
        ctx.fill();


        this.drawCancelButton(ctx, x, y-10);

        ctx.fillStyle = textColor;
        ctx.fillText(text, x-width, y);


        ctx.restore();

    };

    iChart.Charting.ChartTrendorder.prototype.drawLableTrend = function (ctx, coords) {

        var text = this.settings.text,
            textColor = this.settings.textColor,
            textHeight = this.settings.textHeight,
            h = textHeight * 1.2,
            center = {
                x: (coords[0].x + coords[1].x) / 2,
                y: (coords[0].y + coords[1].y) / 2
            },
            labelCoords = {
                center: {x: '', y: ''},
                left: {x: '', y: ''},
                right: {x: '', y: ''}
            },
            alpha = Math.atan((coords[0].y - coords[1].y) / (coords[0].x - coords[1].x));

        ctx.save();
        ctx.font = 'normal ' + textHeight + 'px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = "1";
        var textWidth = ctx.measureText(text).width;
        ctx.restore();

        labelCoords.center.x = center.x - h * Math.cos(Math.PI / 2 + alpha);
        labelCoords.center.y = center.y - h * Math.sin(Math.PI / 2 + alpha);
        labelCoords.left.x = labelCoords.center.x - textWidth / 2 * Math.cos(alpha);
        labelCoords.left.y = labelCoords.center.y - textWidth / 2 * Math.sin(alpha);
        labelCoords.right.x = labelCoords.center.x + (textWidth / 2 + 20) * Math.cos(alpha);
        labelCoords.right.y = labelCoords.center.y + (textWidth / 2 + 20) * Math.sin(alpha);

        this.trendLabelSettings = {
            alpha: alpha,
            labelCoords: labelCoords
        };

        ctx.save();

        ctx.font = 'normal ' + textHeight + 'px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = "1";

        ctx.strokeStyle = this.settings.fillStyle;
        ctx.fillStyle = this.settings.fillStyle;

        var textHeight2 = Math.round(textHeight / 2);
        var x = 0, y = 0, padding = 3;

        ctx.translate( labelCoords.left.x, labelCoords.left.y);
        ctx.rotate(alpha);

        ctx.beginPath();
        ctx.moveTo(x - padding, y + textHeight2);
        ctx.lineTo(x - padding, y - textHeight2);
        ctx.quadraticCurveTo(x - padding, y - textHeight2 - padding, x, y - textHeight2 - padding);
        ctx.lineTo(x + textWidth, y - textHeight2 - padding);
        ctx.quadraticCurveTo(x + textWidth + padding, y - textHeight2 - padding, x + textWidth + padding, y - textHeight2);
        ctx.lineTo(x + textWidth + padding, y + textHeight2);
        ctx.quadraticCurveTo(x + textWidth + padding, y + textHeight2 + padding, x + textWidth, y + textHeight2 + padding);
        ctx.lineTo(x, y + textHeight2 + padding);
        ctx.quadraticCurveTo(x - padding, y + textHeight2 + padding, x - padding, y + textHeight2);
        ctx.closePath();
        ctx.fill();
        //ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.fillText(text, x, y);

        this.drawCancelButton(ctx, x + textWidth + 3, y - textHeight2 - padding);

        ctx.restore();

/*
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#0000FF';
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(labelCoords.center.x, labelCoords.center.y, 5, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(labelCoords.left.x, labelCoords.left.y, 5, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(labelCoords.right.x, labelCoords.right.y, 5, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
*/

    };

    iChart.Charting.ChartTrendorder.prototype.drawCancelButton = function (ctx, x, y) {

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
    };


    iChart.Charting.ChartTrendorder.prototype.drawPoints = function (ctx, pointCoords) {
        //console.log(pointCoords);

        if(!this.selected) {
            return 0;
        }

        function drawArrows (ctx, x, y, radius, alpha, right) {
            var x = x + (right ? -1 : 1) * radius * Math.cos(alpha),
                y = y + (right ? -1 : 1) * radius * Math.sin(alpha),
                h = 10,
                beta;

            ctx.lineWidth = 1;

            var angleStart = right ? (-0.2 * Math.PI + alpha) : (0.8 * Math.PI + alpha),
                angleEnd = right ? (0.2 * Math.PI + alpha) : (1.2 * Math.PI + alpha),
                angleBase = right ? (0 * Math.PI + alpha) : (1 * Math.PI + alpha),
                x1 = x + (right ? -1 : 1) * h * Math.cos(Math.PI / 2 + alpha),
                y1 = y + (right ? -1 : 1) * h * Math.sin(Math.PI / 2 + alpha),
                x2 = x + (right ? 1 : -1) * h * Math.cos(Math.PI / 2 + alpha),
                y2 = y + (right ? 1 : -1) * h * Math.sin(Math.PI / 2 + alpha);

            ctx.beginPath();
            ctx.arc(x1, y1, radius, angleStart, angleBase);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x2, y2, radius, angleBase, angleEnd);
            ctx.stroke();

            var ax = x1 + radius * Math.cos(angleStart),
                ay = y1 + radius * Math.sin(angleStart),
                beta = (angleStart) + Math.PI / 16,
                ax1 = x1 + radius * 0.9 * Math.cos(beta),
                ay1 = y1 + radius * 0.9 * Math.sin(beta),
                ax2 = x1 + radius * 1.1 * Math.cos(beta),
                ay2 = y1 + radius * 1.1 * Math.sin(beta);

            ctx.beginPath();
            ctx.moveTo(ax1, ay1);
            ctx.lineTo(ax, ay);
            ctx.lineTo(ax2, ay2);

            var ax = x2 + radius * Math.cos(angleEnd),
                ay = y2 + radius * Math.sin(angleEnd),
                beta = angleEnd - Math.PI / 16,
                ax1 = x2 + radius * 0.9 * Math.cos(beta),
                ay1 = y2 + radius * 0.9 * Math.sin(beta),
                ax2 = x2 + radius * 1.1 * Math.cos(beta),
                ay2 = y2 + radius * 1.1 * Math.sin(beta);

            ctx.moveTo(ax1, ay1);
            ctx.lineTo(ax, ay);
            ctx.lineTo(ax2, ay2);

            ctx.stroke();
        }

        var alpha = Math.atan((pointCoords[0].y - pointCoords[1].y) / (pointCoords[0].x - pointCoords[1].x)),
            radius = 30;

        ctx.save();

        ctx.strokeStyle = this.settings.fillStyle;
        ctx.fillStyle = this.settings.fillStyle;

        drawArrows(ctx, pointCoords[0].x, pointCoords[0].y, radius, alpha, false);
        drawArrows(ctx, pointCoords[1].x, pointCoords[1].y, radius, alpha, true);

        ctx.restore();
    };


    iChart.Charting.ChartTrendorder.prototype.setTestSegments = function ()
    {
        if(this.settings.mode == 'line') {
            if (this.selected) {
                var ctx = this.layer.context;
                ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                var width = ctx.measureText(this.settings.text).width;
                var x = ctx.canvas.width - 120;
                this.testContext.segments = [
                    [{ "x": x-width, "y": this.testContext.points[0].y-4}, { "x": x, "y": this.testContext.points[0].y-4}],
                    [{ "x": x-width, "y": this.testContext.points[0].y+4}, { "x": x, "y": this.testContext.points[0].y+4}],
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
        } else {
            this.testContext.segments = [];

                this.testContext.segments = [
                    [{ "x": this.trendLineSettings.points[0].x, "y": this.trendLineSettings.points[0].y}, { "x": this.trendLineSettings.points[1].x, "y": this.trendLineSettings.points[1].y}]
                ];

            if(this.trendLabelSettings) {
                this.testContext.segments.push([{ "x": this.trendLabelSettings.labelCoords.left.x, "y": this.trendLabelSettings.labelCoords.left.y}, { "x": this.trendLabelSettings.labelCoords.right.x, "y": this.trendLabelSettings.labelCoords.right.y}]);
            }

        }
    };


    iChart.Charting.ChartTrendorder.prototype.onDrag  = function (points)
    {

        if(!points[0] || !points[1]) {
            return false;
        }

        if(this.settings.mode == 'line') {
            if (points[0].y != this.points[0].y && this.points[1].y == points[1].y || points[0].y == this.points[0].y && this.points[1].y != points[1].y) {
                this.settings.mode = 'trend';
                this.settings.date2 = new Date(points[1].x);
                this.settings.price2 = this.points[1].y;
                var coords = this.getCoordinates(this.layer.context, points);
                this.settings.newOrderParams = this.getOrderParams(coords);
            }
        } else {

        }

        var minDiff = (this.layer.area.getXValue(1) - this.layer.area.getXValue(0)) * 1000;

        if (this.points[0].x != points[0].x && points[0].x >= points[1].x - minDiff) {
            points[0].x = points[1].x - minDiff;
        } else if (this.points[1].x != points[1].x && points[1].x <= points[0].x + minDiff) {
            points[1].x = points[0].x + minDiff;
        }

        if(typeof this.settings.restriction == 'function') {
            this.settings.restriction.call(this, points);
        }

    };
    iChart.Charting.ChartTrendorder.prototype.onSelect = function (ctx) {
        //console.log('onSelect', this);
        iChart.Charting.ChartElement.prototype.onSelect.call(this, ctx);
        this.getTestContext(true);
    };

    iChart.Charting.ChartTrendorder.prototype.onBlur = function () {
        //console.log('onBlur', this);
        if(this.settings.mode == 'trend') {
            //this.normalizeCoords(this.getCoordinates(this.layer.context, this.points));
        }
        this.getTestContext(true);
    };

    iChart.Charting.ChartTrendorder.prototype.onDrop = function () {
        //console.log('onDrop', this);
        if(this.settings.mode == 'trend') {
            console.log('newOrderParams', this.settings.newOrderParams);
        }

        if(typeof this.settings.onDrop == 'function') {
            this.settings.onDrop.call(this);
        }
    };

    iChart.Charting.ChartTrendorder.prototype.onHover = function (x, y) {
        //console.log('onHover', this);
        clearTimeout(this.layer.chart.env.timers.orderClose);
        this.cancelControl(1);
    };

    iChart.Charting.ChartTrendorder.prototype.onOut = function () {
        //console.log('onOut', this);
        clearTimeout(this.layer.chart.env.timers.orderClose);
        var self = this;
        this.layer.chart.env.timers.orderClose = setTimeout(function(){self.cancelControl(0);}, 300);
    };

    iChart.Charting.ChartTrendorder.prototype.cancelControl = function (state) {
        if(typeof this.settings.onCancel == 'function') {
            if(state) {
                $('#ichartOrderCancelCtrl').hide();
                var ctx = this.layer.context;
                var x = ctx.canvas.width - 120;
                var pointCoords = this.getCoordinates(ctx, this.points);
                if(!$('#ichartOrderCancelCtrl').length) {
                    $("<span/>", { id:'ichartOrderCancelCtrl', "style": "color:transparent", "class": "m-chart-instrument-delete", "text": "✕", "title": _t('2958', 'Снять') }).hide().appendTo(this.layer.chart.container);
                }

                var self = this;
                $('#ichartOrderCancelCtrl').unbind('click').bind('click', function(e) {
                    if(typeof self.settings.onCancel == 'function') {

                        self.settings.onCancel.call(self);

                    }
                    $('#ichartOrderCancelCtrl').hide();
                }).bind('mouseover', function () {
                    clearTimeout(self.layer.chart.env.timers.orderClose);
                }).bind('mouseleave', function () {
                    clearTimeout(self.layer.chart.env.timers.orderClose);
                    self.layer.chart.env.timers.orderClose = setTimeout(function(){self.cancelControl(0);}, 1000);
                });

                if(this.settings.mode == 'line') {
                    var top = pointCoords[0].y - 8;
                    var left = x + 2;
                } else {
                    if(this.trendLabelSettings) {
                        var top = this.trendLabelSettings.labelCoords.right.y - 10 - 10 * Math.sin(this.trendLabelSettings.alpha);
                        var left = this.trendLabelSettings.labelCoords.right.x - 10  - 10 * Math.cos(this.trendLabelSettings.alpha);
                    }
                }

                $('#ichartOrderCancelCtrl').css({top: top, left: left}).show();
            } else {
                $('#ichartOrderCancelCtrl').hide();
            }
        }
    };

    iChart.Charting.ChartTrendorder.prototype.onMouseDown = function (e, x ,y) {
        //console.log('onMouseDown', arguments, this);
        if(this.settings.mode == 'trend' && !this.selected) {

            this.calcPointsPosition(x, 150);
        }

        if (typeof this.settings.onSelect == 'function') {
            this.settings.onSelect.call(this, e);
        }
    };


    iChart.Charting.ChartTrendorder.lightColor = function (rgb)
    {
        //rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        //for (var i = 0; i < 3; i++) {
        //    rgb[i] = parseInt(rgb[i]) + 40;
        //}
        //return 'rgba(' + rgb.join(", ") + ')';

    };


})();