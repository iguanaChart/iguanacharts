/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartRectangle = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Rectangle";
        this.drawType = 'manually';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartRectangle, iChart.Charting.ChartElement);

    iChart.Charting.ChartRectangle.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        ctx.save();
        ctx.beginPath();

        this.initDrawSettings(ctx, this.settings);


        var width = coords[1].x - coords[0].x;
        var height = coords[1].y - coords[0].y;


        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[0].x, coords[1].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.lineTo(coords[1].x, coords[0].y);
        ctx.lineTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[0].x, coords[1].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.stroke();
        ctx.fillRect(coords[0].x, coords[0].y, width, height);

        ctx.restore();

    };

    iChart.Charting.ChartRectangle.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[1].y}],
            [{ "x": this.testContext.points[0].x, "y": this.testContext.points[1].y }, this.testContext.points[1]],
            [this.testContext.points[1], { "x": this.testContext.points[1].x, "y": this.testContext.points[0].y}],
            [{ "x": this.testContext.points[1].x, "y": this.testContext.points[0].y }, this.testContext.points[0]]
        ];
    };
})();