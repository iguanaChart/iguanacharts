/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartFibonacciArc = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "FibonacciArc";
        this.drawType = 'manually';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartFibonacciArc, iChart.Charting.ChartElement);

    iChart.Charting.ChartFibonacciArc.prototype.drawInternal = function (ctx, coords)
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

        var d = Math.sqrt(iChart.Charting.pointToPointDistanceSquared(coords[0], coords[1]));
        if (d <= 4)
        {
            return;
        }

        var percentages = [0.382, 0.5, 0.618];
        for (var i = 0; i < percentages.length; ++i)
        {
            ctx.beginPath();
            ctx.arc(coords[0].x, coords[0].y, d * percentages[i], 0, Math.PI, coords[0].y > coords[1].y);
            ctx.stroke();
        }
    };
})();