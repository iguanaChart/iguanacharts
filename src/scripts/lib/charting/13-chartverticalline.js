/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartVerticalLine = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "VerticalLine";
        this.drawType = 'manually';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartVerticalLine, iChart.Charting.ChartElement);

    iChart.Charting.ChartVerticalLine.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        ctx.save();
        ctx.beginPath();
        this.initDrawSettings(ctx, this.settings);
        ctx.moveTo(coords[0].x, 0);
        ctx.lineTo(coords[0].x, ctx.canvas.height);
        ctx.stroke();
        ctx.restore();
    };

    iChart.Charting.ChartVerticalLine.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [
                { "x": this.testContext.points[0].x, "y": this.layer.area.innerOffset.top },
                { "x": this.testContext.points[0].x, "y": this.layer.area.innerOffset.top + this.layer.area.innerHeight }
            ]
        ];
    };
})();
