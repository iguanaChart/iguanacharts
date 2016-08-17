/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartEllipse = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Ellipse";
        this.drawType = 'manually';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartEllipse, iChart.Charting.ChartElement);

    iChart.Charting.ChartEllipse.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        var height = Math.abs(coords[1].y - coords[0].y);
        var width = Math.abs(coords[1].x - coords[0].x);
        if (height <= 4 || width <= 4)
        {
            return;
        }

        var centerX = (coords[0].x + coords[1].x) / 2;
        var centerY = (coords[0].y + coords[1].y) / 2;

        var controlRectHalfWidth = width * 2 / 3;

        this.initDrawSettings(ctx, this.settings);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - height / 2);
        ctx.bezierCurveTo(centerX - controlRectHalfWidth, centerY - (height / 2), centerX - controlRectHalfWidth, centerY + (height / 2), centerX, centerY + (height / 2));
        ctx.bezierCurveTo(centerX + controlRectHalfWidth, centerY + (height / 2), centerX + controlRectHalfWidth, centerY - (height / 2), centerX, centerY - (height / 2));
        ctx.fill();
        ctx.stroke();
    };

    iChart.Charting.ChartEllipse.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[1].y}],
            [{ "x": this.testContext.points[0].x, "y": this.testContext.points[1].y }, this.testContext.points[1]],
            [this.testContext.points[1], { "x": this.testContext.points[1].x, "y": this.testContext.points[0].y}],
            [{ "x": this.testContext.points[1].x, "y": this.testContext.points[0].y }, this.testContext.points[0]]
        ];
    };
})();