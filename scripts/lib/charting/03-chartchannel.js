/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartChannel = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Channel";
        this.drawType = 'manually';
        this.maxPointCount = 3;
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartChannel, iChart.Charting.ChartElement);

    iChart.Charting.ChartChannel.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        this.initDrawSettings(ctx, this.settings);

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.stroke();

        if (coords.length < 3)
        {
            return;
        }

        ctx.beginPath();
        ctx.moveTo(coords[2].x, coords[2].y);
        ctx.lineTo(coords[1].x + (coords[2].x - coords[0].x), coords[1].y + (coords[2].y - coords[0].y));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.lineTo(coords[1].x + (coords[2].x - coords[0].x), coords[1].y + (coords[2].y - coords[0].y) );
        ctx.lineTo(coords[2].x, coords[2].y );
        ctx.fill();
    };

    iChart.Charting.ChartChannel.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            this.testContext.points,
            [this.testContext.points[2], { "x": this.testContext.points[1].x + (this.testContext.points[2].x - this.testContext.points[0].x), "y": this.testContext.points[1].y + (this.testContext.points[2].y - this.testContext.points[0].y)}]
        ];
    };
})();