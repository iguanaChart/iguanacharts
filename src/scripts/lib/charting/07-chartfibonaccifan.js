/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartFibonacciFan = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "FibonacciFan";
        this.drawType = 'manually';
        this.percentages = [0.382, 0.5, 0.618];
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartFibonacciFan, iChart.Charting.ChartElement);

    iChart.Charting.ChartFibonacciFan.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        ctx.beginPath();
        this.initDrawSettings(ctx, this.settings);
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.stroke();

        var h = coords[1].y - coords[0].y;
        if (Math.abs(h) <= 4)
        {
            return;
        }

        h /= coords[1].x - coords[0].x;
        for (var i = 0; i < this.percentages.length; ++i)
        {
            ctx.beginPath();
            ctx.moveTo(coords[0].x, coords[0].y);
            ctx.lineTo(ctx.canvas.width, coords[0].y + (this.percentages[i] * h * (ctx.canvas.width - coords[0].x)));
            ctx.stroke();
        }
    };
})();