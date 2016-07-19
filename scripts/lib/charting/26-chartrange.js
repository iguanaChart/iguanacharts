/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartRange = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Range";
        this.drawType = 'auto';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartRange, iChart.Charting.ChartElement);

    iChart.Charting.ChartRange.prototype.drawInternal = function (ctx, coords)
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

        ctx.beginPath();
        ctx.moveTo(coords[0].x, 0);
        ctx.lineTo(coords[0].x, ctx.canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(coords[1].x, 0);
        ctx.lineTo(coords[1].x, ctx.canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(coords[0].x, 0);
        ctx.lineTo(coords[0].x, ctx.canvas.height);
        ctx.lineTo(coords[1].x, ctx.canvas.height);
        ctx.lineTo(coords[1].x, 0);
        ctx.fill();

        ctx.restore();
    };

    iChart.Charting.ChartRange.prototype.setTestSegments = function ()
    {
        var ctx = this.layer.context,
            minX = this.testContext.points[0].x,
            maxX = this.testContext.points[1].x,
            hoverStepPx = 16;

        this.testContext.segments = [];
        for (var i = minX; i <= maxX; i = i + hoverStepPx) {
            this.testContext.segments.push([
                {x: i, y: 0},
                {x: i, y: 10e+10}
            ]);
        }
        this.testContext.segments.push([{ "x": maxX, "y": 0}, { "x": maxX, "y": 10e+10}]);

        //this.testContext.segments = [
        //    [{ "x": this.testContext.points[0].x, "y": 0}, { "x": this.testContext.points[0].x, "y": 10e+10}],
        //    [{ "x": this.testContext.points[1].x, "y": 0}, { "x": this.testContext.points[1].x, "y": 10e+10}]
        //];
    };
})();