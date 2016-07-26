/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartTrend = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Trend";
        this.drawType = 'manually';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartTrend, iChart.Charting.ChartElement);

    iChart.Charting.ChartTrend.prototype.drawInternal = function (ctx, coords)
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

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        ctx.lineTo(coords[0].x + d, coords[0].y);
        ctx.stroke();

        var angle = Math.acos((coords[1].x - coords[0].x) / d);
        var counterclockwise = coords[0].y >= coords[1].y;
        if (this === this.layer.selected)
        {
            ctx.beginPath();
            ctx.arc(coords[0].x, coords[0].y, d / 4, 0, counterclockwise ? 2 * Math.PI - angle : angle, counterclockwise);
            ctx.stroke();
        }

        if (typeof ctx.strokeText === "function")
        {
            ctx.font = "normal 15px Tahoma";
            ctx.fillStyle   = ctx.strokeStyle;

            ctx.translate(-0.5, -0.5);
            if (counterclockwise)
            {
                ctx.textBaseline = "top";
                ctx.fillText(Math.round(180 * angle / Math.PI) + "°", coords[0].x + 18, coords[0].y + 3);
            }
            else
            {
                ctx.textBaseline = "bottom";
                ctx.fillText("-" + Math.round(180 * angle / Math.PI) + "°", coords[0].x + 18, coords[0].y - 3);
            }

            ctx.translate(0.5, 0.5);
        }
    };

    iChart.Charting.ChartTrend.prototype.setTestSegments = function ()
    {
        var d = Math.sqrt(iChart.Charting.pointToPointDistanceSquared(this.testContext.points[0], this.testContext.points[1]));
        this.testContext.segments = [
            this.testContext.points,
            [this.testContext.points[0], { "x": this.testContext.points[0].x + d, "y": this.testContext.points[0].y}]
        ];
    };
})();