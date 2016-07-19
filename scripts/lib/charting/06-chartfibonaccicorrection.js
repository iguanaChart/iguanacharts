/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartFibonacciCorrection = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "FibonacciCorrection";
        this.drawType = 'manually';
        //this.percentages = [0, 0.382, 0.5, 0.618, 1, 1.618, 2.618, 4.236];
        this.percentages = [0, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618];
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartFibonacciCorrection, iChart.Charting.ChartElement);

    iChart.Charting.ChartFibonacciCorrection.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        ctx.save();
        ctx.beginPath();
        this.initDrawSettings(ctx, this.settings);
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.stroke();

        var h = coords[1].y - coords[0].y;
        if (Math.abs(h) <= 4)
        {
            ctx.restore();
            return;
        }

        for (var i = 0; i < this.percentages.length; ++i)
        {
            var y = Math.round(coords[0].y + (h * this.percentages[i]));

            ctx.beginPath();
            ctx.moveTo(coords[0].x, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();

            if (this.percentages[i] != 0) {
                //Напишем значение
                ctx.font="12px Arial";
                var offset = ctx.measureText(this.percentages[i]);
                ctx.fillText(this.percentages[i],coords[0].x-offset.width-5,y+5);
            }
        }
        ctx.restore();
    };
})();