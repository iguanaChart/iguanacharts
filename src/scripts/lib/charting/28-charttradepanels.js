/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartTradePanel = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "TradePanel";
        this.drawType = 'auto';
        this.hoverCursor = (this.selected) ? "row-resize" : 'pointer';
        this.moveCursor = (this.selected) ? "row-resize" : 'pointer';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = false;
        this.storageEnable = false;
        this.settings = {};
        this.positionAbsolute = true;
    };

    inheritPrototype(iChart.Charting.ChartTradePanel, iChart.Charting.ChartElement);

    iChart.Charting.ChartTradePanel.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        this.hoverCursor = (this.selected) ? "row-resize" : 'pointer';
        this.moveCursor = (this.selected) ? "row-resize" : 'pointer';

        if (this.settings.autoInit) {

            this.selected = true;
            this.layer.selected = this;

            this.settings.autoInit = false;
        }

        //Отсортируем все панели так, чтобы заселекченная была выше всех
        this.layer.history.sort(function(a, b){
            if (a && a.elementType == 'TradePanel' && a.selected) return 1;
            return -1;
        });

        //Не могу вылечить иначе баг с двумя селектами сразу
        if (this.selected && !this.layer.selected || this.selected && this.id != this.layer.selected.id) {

            this.selected = false;
        }



        coords[0].x = this.layer.area.getXPositionByValue(point);


        //Цена
        var price = (this.markers) ? this.markers[0].y : this.points[0].y;


        //Цвет
        if (this.settings.type == 'limit') {

            this.settings.fillStyle = (jNTChartTrading.order.operation_type < 3) ? '#7cb342' : '#e53935';

        } else if (this.settings.type == 'sl') {

            this.settings.fillStyle = '#e53935';

        } else if (this.settings.type == 'tp') {

            this.settings.fillStyle = '#7cb342';
        }

        this.settings.fillStyle = (this.selected) ? this.settings.fillStyle : 'rgba(238, 238, 238, 0.3)';
        this.settings.fillStyle = (!this.selected && ctx.inHover) ? 'rgba(238, 238, 238, 1)' : this.settings.fillStyle;

        this.settings.textColor = (this.selected) ? "#FFFFFF" : this.layer.chart.chartOptions.labelColor;


        //Преобразуем текст
        this.settings.text = (jNTChartTrading.order.operation_type < 3) ? this.settings.buyText : this.settings.sellText;
        this.settings.price = _s(price, _d(this.settings.min_step));
        this.settings.quantity = _s(this.settings.quantity);

        var percent = (this.settings.price/this.settings.ltp - 1)*100;
        percent = ((percent>0)?'+':'') + _s(percent, 2) + '%';

        this.settings.text = this.settings.text.replace('%quantity%', this.settings.quantity.trim());
        this.settings.text = this.settings.text.replace('%price%', this.settings.price.trim());
        this.settings.text = this.settings.text.replace('%percent%', percent);

        //Есои приказ в стадии отправки, то будет немного иначе выгодяеть
        if (this.settings.sendingOrder) {

            this.settings.text = _t('15808', 'Выставляем новый приказ ...');
            this.settings.fillStyle = "rgba(119,119,119,1)" /*темно серый*/;
            this.settings.textColor = '#ffffff'; /*белый*/
        }


        //Определения координат
        var point = this.layer.chart.areas[0].xSeries[this.layer.chart.areas[0].xSeries.length-this.layer.chart.chartOptions.futureAmount-1];
        this.points[0].x = point * 1000;
        coords[0].x = this.layer.area.getXPositionByValue(point) + 50;

        var color = this.settings.fillStyle;

        if(this.selected || ctx.inHover) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(0, coords[0].y);
            ctx.lineTo(ctx.canvas.width, coords[0].y);
            ctx.stroke();
            ctx.restore();

        }

        this.drawLable(ctx, color, this.settings.textColor, coords[0].x, coords[0].y, this.settings.text);

        //this.drawTestSegments(ctx);

    };

    iChart.Charting.ChartTradePanel.prototype.drawExtended = function (ctx) {
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
                var color = !ctx.inHover ? this.settings.fillStyle : ( typeof this.settings.fillStyleHover != "undefined" ? this.settings.fillStyleHover : iChart.Charting.ChartTradePanel.lightColor(this.settings.fillStyle));
                this.layer.chart.renderer.drawLable(ctx, color, 0, this.layer.area.innerWidth, pointCoords[0].y, label);
            }
        }
    };


    iChart.Charting.ChartTradePanel.prototype.drawLable = function (ctx, fillColor, textColor, x, y, text)
    {

        ctx.save();

        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        //ctx.fillStyle = fillColor;
        ctx.fillStyle = this.settings.fillStyle;
        ctx.strokeStyle = '#eeeeee';

        ctx.lineWidth="1";

        var width = ctx.measureText(text).width;
        x = x + width;
        ctx.beginPath();
        ctx.moveTo(x-width-5, y+5);
        ctx.lineTo(x-width-5, y-5);
        ctx.quadraticCurveTo(x-width-5, y-10, x-width, y-10);
        ctx.lineTo(x, y-10);
        ctx.lineTo(x+8, y);
        ctx.lineTo(x, y+10);
        ctx.lineTo(x-width, y+10);
        ctx.quadraticCurveTo(x-width-5, y+10, x-width-5, y+5);

        ctx.closePath();
        ctx.save();
        var shadowColor = this.layer.chart.chartOptions.shadowColor;
        if (this.selected) {

            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            ctx.fill();

            //Наконечник
            ctx.lineWidth="3";
            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.moveTo(x+10, y-10);
            ctx.lineTo(x+18, y);
            ctx.lineTo(x+10, y+10);
            ctx.moveTo(x+10, y-10);
            ctx.closePath();
            ctx.stroke();



        } else if (ctx.inHover) {

            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fill();

        } else {


            ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = this.settings.textColor;
        ctx.fillText(text, x-width, y);


        ctx.restore();



    };

    iChart.Charting.ChartTradePanel.prototype.drawPoints = function (ctx, pointCoords) {}

    iChart.Charting.ChartTradePanel.prototype.drawTestSegments = function (ctx) {
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
    };

    iChart.Charting.ChartTradePanel.prototype.setTestSegments = function ()
    {
        if (!this.testContext) return;

        var ctx = this.layer.context;
        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var width = ctx.measureText(this.settings.text).width;


        var x = this.layer.area.getXPositionByValue(this.points[0].x / 1000) + width + 50;

        this.testContext.segments = [
            [{ "x": x-width, "y": this.testContext.points[0].y-4}, { "x": x, "y": this.testContext.points[0].y-4}],
            [{ "x": x, "y": this.testContext.points[0].y+4}, { "x": x-width, "y": this.testContext.points[0].y+4}],

        ];
    };

    iChart.Charting.ChartTradePanel.prototype.onDrag  = function (points)
    {
        if(typeof this.settings.restriction == 'function') {
            this.settings.restriction.call(this, points);
        }

        if(typeof this.settings.onDrag == 'function') {
            this.settings.onDrag.call(this, points);
        }
    };

    iChart.Charting.ChartTradePanel.prototype.onSelect = function (ctx) {
        iChart.Charting.ChartElement.prototype.onSelect.call(this, ctx);
        //this.setTestSegments();
    };

    iChart.Charting.ChartTradePanel.prototype.onBlur = function () {
        //this.setTestSegments();
    };

    iChart.Charting.ChartTradePanel.prototype.onDrop = function () {
        if(typeof this.settings.onDrop == 'function') {
            this.settings.onDrop.call(this);
        }
    };


    iChart.Charting.ChartTradePanel.lightColor = function (rgb)
    {
        rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        for (var i = 0; i < 3; i++) {
            rgb[i] = parseInt(rgb[i]) + 40;
        }
        return 'rgba(' + rgb.join(", ") + ')';
    };

    iChart.Charting.ChartTradePanel.prototype.onMouseDown = function (e) {
        if (typeof this.settings.onSelect == 'function') {
            this.settings.onSelect.call(this, e);
        }
    };


})();

