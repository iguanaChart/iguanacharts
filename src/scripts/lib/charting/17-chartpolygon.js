/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartPolygon = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Polygon";
        this.drawType = 'manually';
        this.maxPointCount = 4;
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartPolygon, iChart.Charting.ChartElement);

    iChart.Charting.ChartPolygon.prototype.drawInternal = function (ctx, coords)
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

        if (coords.length < 4)
        {
            ctx.fill();
            return;
        }

        var settings = this.settings;

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = settings.strokeStyle2;
        ctx.lineTo(coords[2].x, coords[2].y);
        ctx.lineTo(coords[3].x, coords[3].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[1].x, coords[1].y);
        ctx.lineTo(coords[2].x, coords[2].y);
        ctx.lineTo(coords[3].x, coords[3].y);
        ctx.fill();
    };

    iChart.Charting.ChartPolygon.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], this.testContext.points[1]],
            [this.testContext.points[2], this.testContext.points[3]]
        ];
    };
})();