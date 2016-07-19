/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartButton = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Button";
        this.drawType = 'auto';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = true;
        this.storageEnable = false;
        this.settings = {
            controls: []
        };
    };

    inheritPrototype(iChart.Charting.ChartButton, iChart.Charting.ChartElement);

    iChart.Charting.ChartButton.prototype.setSettings = function (settings) {

        this.settings = $.extend(this.settings, settings);

        this.points[0].fActive = 1;

        this.controls = {
            1: {
                enabled: true,
                element: this,
                x: 0, y: 0, w: 100, h: 17,
                click: function () {
                    console.log(this);
                },
                label: _t('6346','Новый приказ'),
                fillColor: 'rgba(220,220,220,1)',
                strokeStyle: '#999999'
            }
        };
        for(var c=0; c < this.settings.controls.length; c++) {
            for(var i in this.controls) {
                if(this.settings.controls[c].type == this.controls[i].type && this.settings.controls[c].value == this.controls[i].value) {
                    this.controls[i].active = true;
                }
            }
        }

        this.maps = {
            0: {
                element: this,
                click: function () {
                    this.element.settings.click.call(this);
                },
                hoverIn: function () {
                    this.element.points[0].fHover = 1;
                    this.element.layer.render();
                },
                hoverOut: function () {
                    this.element.points[0].fHover = 0;
                    this.element.layer.render();
                }
            }
        }
    };

    iChart.Charting.ChartButton.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        this.settings.fillStyle = this.settings.fillStyle || "#3AAE3E";

        var lastPoint = this.layer.chart.areas[0].getXPositionByIndex(this.layer.chart.areas[0].xSeries.length-1-this.layer.chart.chartOptions.futureAmount) + 40;
        lastPoint = Math.min(lastPoint, this.layer.chart.areas[0].getXPositionByIndex(this.layer.chart.areas[0].xSeries.length-1));
        var pointX = this.layer.chart.areas[0].getXValue(lastPoint);

        var pointY = this.layer.chart.areas[0].ySeries[0].points[this.layer.chart.areas[0].ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1];

        this.points[0].x = pointX * 1000;
        this.points[0].y = pointY[2];

        coords[0].x = this.layer.area.getXPositionByValue(pointX);

        for(var i in this.controls) {
            var control = this.controls[i];

            if (!control.enabled) { continue; }
            this.drawControl(ctx, coords, control)
        }
    }

    iChart.Charting.ChartButton.prototype.drawControl = function (ctx, coords, control)
    {
        ctx.save();

        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillStyle = !this.points[0].fHover ? control.fillColor : 'rgba(58,174,62,1)';

        ctx.lineWidth="1";

        var textWidth = ctx.measureText(control.label).width;

        var point = coords[0];

        ctx.strokeStyle = control.strokeStyle;
        var width = textWidth;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y + Math.round(control.h/2));
        ctx.lineTo(point.x, point.y-Math.round(control.h/2));
        ctx.quadraticCurveTo(point.x, point.y-Math.round(control.h/2)-5, point.x+5, point.y-Math.round(control.h/2)-5);
        ctx.lineTo(point.x+width+5, point.y-Math.round(control.h/2)-5);
        ctx.quadraticCurveTo(point.x+width+10, point.y-Math.round(control.h/2)-5, point.x+width+10, point.y-Math.round(control.h/2));
        ctx.lineTo(point.x+width+10, point.y+Math.round(control.h/2));
        ctx.quadraticCurveTo(point.x+width+10, point.y+Math.round(control.h/2)+5, point.x+width+5, point.y+Math.round(control.h/2)+5);
        ctx.lineTo(point.x+5, point.y+Math.round(control.h/2)+5);
        ctx.quadraticCurveTo(point.x, point.y+Math.round(control.h/2)+5, point.x, point.y+Math.round(control.h/2));
        ctx.closePath();
        ctx.fill();

        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(control.label, point.x+5, point.y);

        ctx.restore();
    }

    iChart.Charting.ChartButton.prototype.drawPoints = function (ctx, pointCoords) {}

    iChart.Charting.ChartButton.prototype.setTestSegments = function ()
    {
        var ctx = this.layer.context;
        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var width = ctx.measureText(this.controls['1'].label).width;
        this.testContext.segments = [];

        this.testContext.maps = {};
        this.testContext.maps[0] = [{x: this.testContext.points[0].x, y: this.testContext.points[0].y - Math.round(this.controls['1'].h/2) - 5},
                                    {x: this.testContext.points[0].x + width + 10, y: this.testContext.points[0].y + Math.round(this.controls['1'].h/2) + 5}];
    };

    iChart.Charting.ChartButton.prototype.lightColor = function (rgb)
    {
        rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        for (var i = 0; i < 3; i++) {
            rgb[i] = parseInt(rgb[i]) + 40;
        }
        return 'rgba(' + rgb.join(", ") + ')';
    };


})();

