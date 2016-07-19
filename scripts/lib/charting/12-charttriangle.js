/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartTriangle = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Triangle";
        this.drawType = 'manually';
        this.maxPointCount = 3;
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartTriangle, iChart.Charting.ChartElement);

    iChart.Charting.ChartTriangle.prototype.drawInternal = function (ctx, coords)
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

        if (coords.length < 3)
        {
            return;
        }

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.lineTo(coords[2].x, coords[2].y);
        ctx.lineTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.fill();
        ctx.stroke();
    };

    iChart.Charting.ChartTriangle.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], this.testContext.points[1]],
            [this.testContext.points[1], this.testContext.points[2]],
            [this.testContext.points[2], this.testContext.points[0]]
        ];
    };
})();