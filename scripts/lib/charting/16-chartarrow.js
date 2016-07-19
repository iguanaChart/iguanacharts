/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartArrow = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Arrow";
        this.drawType = 'manually';
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings);
    };

    inheritPrototype(iChart.Charting.ChartArrow, iChart.Charting.ChartElement);

    iChart.Charting.ChartArrow.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        ctx.save();

        this.initDrawSettings(ctx, this.settings);

        var fromx =  coords[0].x;
        var fromy =  coords[0].y;
        var toy =  coords[1].y;
        var tox =  coords[1].x;

        var headlen = (5+ctx.lineWidth)*2;
        var width = ctx.lineWidth;
        //Угол наклона стрелки
        var angle = Math.atan2(toy-fromy,tox-fromx);

        //Нарисуем конец стрелки
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.stroke();
        //Нарисуем тело стрелки
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo((tox-headlen*Math.cos(angle-Math.PI/6) + tox-headlen*Math.cos(angle+Math.PI/6)) / 2,
                   (toy-headlen*Math.sin(angle-Math.PI/6) + toy-headlen*Math.sin(angle+Math.PI/6)) / 2);

        ctx.stroke();

        ctx.restore();
    };
})();