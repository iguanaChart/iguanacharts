/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartTrade = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Trade";
        this.drawType = 'manually';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = false;
        this.id = 0;
    };

    inheritPrototype(iChart.Charting.ChartTrade, iChart.Charting.ChartElement);

    iChart.Charting.ChartTrade.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        ctx.save();
        ctx.beginPath();

        ctx.arc(coords[0].x, coords[0].y, 5, 0, 2 * Math.PI, true);
        if(this.settings.type_id == 1) {
            ctx.fillStyle = '#00ff00';
        } else {
            ctx.fillStyle = '#ff0000';
        }
        if(ctx.inHover) {
            ctx.fillStyle = '#0000ff';
            ctx.stokeStyle = '#000';
        }
        ctx.fill();
        ctx.closePath();

        if(this.settings.qb !== '') {
            ctx.beginPath();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.moveTo(coords[0].x+5, coords[0].y);
            ctx.lineTo(ctx.canvas.width, coords[0].y);
            ctx.closePath();
            ctx.stroke();
        }

        if(this.settings.mode == 2) {
            this.drawTradeLable(ctx, coords[0].x, coords[0].y, this.settings);
        }

        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        ctx.stokeStyle = '#eee';
        ctx.restore();

    };

    iChart.Charting.ChartTrade.prototype.drawTradeLable = function (context, x, y, trade)
    {
        var price = parseFloat(trade.price);
        if(price < 100) {
            price = iChart.formatNumber( price, { decimalPlaces: null, decimalPrecision: 6, "scale": 0 });
        } else {
            price = iChart.formatNumber( price, { decimalPlaces: 2, decimalPrecision: null, "scale": 0 });
        }

        var text = ((trade.type_id==1)?'B':'S') + ': ' +  parseInt(trade.volume) +'@'+price;
        context.save();

        context.font = 'normal 11px Arial,Helvetica,sans-serif';
        context.textAlign = "left";
        context.textBaseline = "middle";

        context.busyPoints = (!context.busyPoints)?{}:context.busyPoints;

        //context.fillStyle = (trade.type_id==1)?'rgba(5, 255, 55, 0.7)':'rgba(255, 5, 5, 0.7)';
        /*context.fillRect(x+64, 10, context.measureText(text).width+10, 15);*/

        if (context.setLineDash) {
            context.setLineDash([5])
        }

        var newX =x+20,
            newY = 70,
            newWidth = context.measureText(text).width+10,
            newX2 = newX + newWidth,
            freeSpace = 0;

        for(newY = 70; newY <= this.layer.area.innerHeight; newY+=30) {
            freeSpace = 1;
            var checkArr = $.map(context.busyPoints, function(v,i){return (v.y == newY ? v : null)});
            for(var i = 0; i<checkArr.length && freeSpace; i++) {
                if ((x <= checkArr[i].maxX && x >= checkArr[i].minX) || (newX2 <= checkArr[i].maxX && newX2 >= checkArr[i].minX) || (x <= checkArr[i].minX && newX2 >= checkArr[i].maxX)) {
                    freeSpace = 0;
                }
            }
            if(freeSpace) {
                break;
            }
        }

        context.beginPath();
        context.strokeStyle = '#C5C5C5';
        context.fillStyle = 'rgba(238,238,238,0.5)';
        context.rect(newX, newY-10, newWidth, 20);
        context.fill();

        context.moveTo(x, y+(newY>y ? 5 : -5 ));
        context.lineTo(x, newY);
        context.lineTo(newX, newY);
        context.moveTo(x, y+(newY>y ? 5 : -5 ));
        context.stroke();

        context.fillStyle = '#000';
        context.fillText(text, x+24, newY);

        context.busyPoints[trade.id] = {minX:x, maxX:newX + newWidth, y: newY};
        context.restore();

    }


    iChart.Charting.ChartTrade.prototype.onHover = function (ctx) {
        var coords = this.getCoordinates(ctx, this.points);
        var top = coords[0].y;
        var left = coords[0].x;

        this.drawTooltip(this.settings, top, left);
    }

   /* iChart.Charting.ChartTrade.prototype.drawExtended = function (ctx)
    {
        var pointCoords = this.getCoordinates(ctx, this.points);

        if (pointCoords.length < 1)
        {
            return;
        }
        var settings = this.settings;
        var label = this.layer.chart.renderer.formatNumber(this.layer.area.getYValue(pointCoords[0].y), { "decimalPrecision": this.layer.chart.labelPrecision, "scale": 0 });

        if(this.settings.type_id == 1) {
            var color = "rgba(5, 255, 55, 0.3)"
        } else {
            color = "rgba(255, 5, 5, 0.3)"
        }

        var maxIndex = this.layer.area.viewport.x.max,
            minIndex = this.layer.area.viewport.x.min,
            xIndex = this.layer.area.getXIndex(pointCoords[0].x);

        if (xIndex <= maxIndex && xIndex > minIndex ) {

            this.layer.chart.renderer.drawLable(ctx, color, "#000", ctx.canvas.width, pointCoords[0].y, label);
        }

    }*/

    iChart.Charting.ChartTrade.prototype.onOut = function (ctx) {
        $('[chart-element-tooltip]').hide();
    }

    iChart.Charting.ChartTrade.prototype.drawTooltip = function (data, top, left) {

        if(this.layer.chart.env.wrapper.find('[chart-element-tooltip]').length == 0) {
            $(this.layer.chart.container).append('' +
            '<div chart-element-tooltip class="qtip qtip-default qtip-tipsy qtip-pos-rc" tracking="false" role="alert" aria-live="polite" aria-atomic="false" style="z-index: 15002;">' +
                '<div class="qtip-tip" style="background-color: transparent ! important; border: 0px none ! important; height: 6px; width: 6px; line-height: 6px; top: 50%; margin-top: -3px; right: -6px;"><canvas style="background-color: transparent ! important; border: 0px none ! important;" height="6" width="6"></canvas></div>' +
                '<div class="qtip-content" id="qtip-34-content" aria-atomic="true">' +
                '</div>' +
                '</div>' +
            '</div>');
        }

        var dataView = $('' +
            '<div>' +
                (data.type_id == 1 ? 'Покупка' : 'Продажа') + '<br/>' +
                'Дата: ' + (this.layer.chart._dataSettings.timeframe >= 1440 ? data.date_time.substr(0, 10) : data.date_time) + '<br/>' +
                'Сделок: ' + data.count + '<br/>' +
                'Количество: ' + iChart.formatNumber( parseFloat(data.volume), { decimalPlaces: 0, decimalPrecision: null, "scale": 0 }) + '<br/>' +
                'Сумма: ' + (data.summ < 100 ? iChart.formatNumber( parseFloat(data.summ), { decimalPlaces: null, decimalPrecision: 6, "scale": 0 }) : iChart.formatNumber( parseFloat(data.summ), { decimalPlaces: 2, decimalPrecision: null, "scale": 0 }))  + '<br/>' +
                'Цена: ' + (data.price < 100 ? iChart.formatNumber( parseFloat(data.price), { decimalPlaces: null, decimalPrecision: 6, "scale": 0 }) : iChart.formatNumber( parseFloat(data.price), { decimalPlaces: 2, decimalPrecision: null, "scale": 0 })) + '<br/>' +
                (parseFloat(data.profit)==0 ? '' : (parseFloat(data.profit)>0 ? 'Прибыль: ' : 'Убыток: ')) + (parseFloat(data.profit)!=0 ? (iChart.formatNumber( parseFloat(data.profit), { decimalPlaces: 2, decimalPrecision: 2, "scale": 0 }) + '<br/>') : '') +
            '</div>');

        $('[chart-element-tooltip] .qtip-content').html(dataView);
        $('[chart-element-tooltip]').css({top: Math.max(top - $('[chart-element-tooltip]').height() - 12 , 0) +'px', left: left + 12 + 'px'}).show();

    }


    iChart.Charting.ChartTrade.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}]
        ];
    };

})();