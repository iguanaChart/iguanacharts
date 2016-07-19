/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartHorizontalLine = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "HorizontalLine";
        this.drawType = 'manually';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.settings = $.extend({drawLabel: true}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartHorizontalLine, iChart.Charting.ChartElement);

    iChart.Charting.ChartHorizontalLine.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        var point = this.layer.area.getXValue(ctx.canvas.width - 200);
        this.points[0].x = point * 1000;
        coords[0].x = ctx.canvas.width - 200;

        ctx.save();
        ctx.beginPath();
        this.initDrawSettings(ctx, this.settings);
        ctx.moveTo(0, coords[0].y);
        ctx.lineTo(ctx.canvas.width, coords[0].y);
        ctx.stroke();
        ctx.restore();

    };

    iChart.Charting.ChartHorizontalLine.prototype.drawExtended = function (ctx)
    {
        if(this.settings.drawLabel) {
            var pointCoords = this.getCoordinates(ctx, this.points);

            if (pointCoords.length < 1) {
                return;
            }
            var settings = this.settings;
            var label = this.layer.chart.renderer.formatNumber(this.layer.area.getYValue(pointCoords[0].y), {
                "decimalPrecision": this.layer.chart.labelPrecision,
                "scale": 0
            });
            this.layer.chart.renderer.drawLable(ctx, settings.strokeStyle, 0, this.layer.area.innerWidth, pointCoords[0].y, label);
        }
    };

    iChart.Charting.ChartHorizontalLine.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [
                { "x": this.layer.area.innerOffset.left, "y": this.testContext.points[0].y },
                { "x": this.layer.area.innerOffset.left + this.layer.area.innerWidth, "y": this.testContext.points[0].y }
            ]
        ];
    };
})();