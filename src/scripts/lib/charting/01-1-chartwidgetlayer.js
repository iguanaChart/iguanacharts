/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartWidgetLayer = function (chart, settings)
    {

        this.canvas = null;
        this.chart = chart;
        this.widget = {
            widgetCurPrice: {
                enable: false,
                width: 200,
                height: 44,
                valign: 'top',
                halign: 'left',
                vspace: 0,
                hspace: 50
            }
        };
        this.prevX = null;
        this.prevY = null;
        this.prevValueX = null;
        this.prevValueY = null;
        this.xIndex = null;
        this.xPoint = null;
        this.yPoint = null;

        if(typeof settings != "undefined") {
            for (var widget in settings) {
                this.widget[widget] = $.extend(this.widget[widget], settings[widget]);
            }
        }

        $(chart.container).off('mousedown.WidgetLayer').off('mouseup.WidgetLayer').off('mousemove.WidgetLayer').off('mouseout.WidgetLayer');
        $(chart.container).on('mousedown.WidgetLayer', $.proxy(this.onMouseDown, this)).
        on('mouseup.WidgetLayer', $.proxy(this.onMouseUp, this)).
        on('mousemove.WidgetLayer', $.proxy(this.onMouseMove, this)).
        on('mouseout.WidgetLayer', $.proxy(this.onMmouseOut, this));

    };

    iChart.Charting.ChartWidgetLayer.prototype.clear = function ()
    {
        if(!this.context) {
            console.log("ERROR: No context for render");
            return 0;
        }

        var context = this.context;
        this.context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        this.drawWidgets(context);

    };

    iChart.Charting.ChartWidgetLayer.prototype.render = function (context)
    {
        /// <summary>
        /// Redraws the layer.
        /// </summary>

        if (!context)
        {
            if(!this.context) {
                console.log("ERROR: No context for render");
                return 0;
            }
            context = this.context;
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }

        context.save();
        this.drawWidgets(context);
        this.drawCrosshair(context, {});
        context.restore();

        if (typeof FlashCanvas !== "undefined")
        {
            // Flush and execute commands.
            context.e();
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.update = function ()
    {
        /// <summary>
        /// Updates drawing layer.
        /// </summary>

        if (!this.chart.areas)
        {
            return;
        }

        this.area = this.chart.areas[0];
        var $container = $(this.chart.container);
        this._initCanvas($container.width(), $container.height());
        this.render();
    };

    iChart.Charting.ChartWidgetLayer.prototype._initCanvas = function (width, height)
    {
        /// <summary>
        /// Initializes the canvas.
        /// </summary>
        /// <param name="width" type="Number">Canvas width in pixels.</param>
        /// <param name="height" type="Number">Canvas height in pixels.</param>

        this.canvas = iChart.Charting.initCanvas(this.chart.container, this.canvas, width, height);
        if (this.canvas)
        {
            this.context = iChart.getContext(this.canvas);
            this.offset = this.chart._containerSize.offset;
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.drawWidgets = function (ctx)
    {
        //ctx.save();
        //ctx.strokeStyle="#FF0000";
        //ctx.strokeRect(0, 0, ctx.canvas.width-1, ctx.canvas.height-1);
        //ctx.restore();

        for (var widget in this.widget) {
            if(this.widget[widget].enable) {
                this[widget](ctx, this.widget[widget]);
            }
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.onMouseDown = function (e) {

    };
    iChart.Charting.ChartWidgetLayer.prototype.onMouseUp = function (e) {

    };
    iChart.Charting.ChartWidgetLayer.prototype.onMmouseOut = function (e) {
        this.clear();
    };
    iChart.Charting.ChartWidgetLayer.prototype.onMouseMove = function (e) {

        if (typeof this.offset === "undefined")
        {
            return;
        }

        var pageX = e.pageX;
        var pageY = e.pageY;

        if (pageX === this.pageX && pageY === this.pageY)
        {
            return;
        }

        this.pageX = pageX;
        this.pageY = pageY;


        var x = Math.round(e.pageX - this.offset.left - this.area.innerOffset.left);
        var y = Math.round(e.pageY - this.offset.top - this.area.innerOffset.top);

        if (x === this.prevX && y === this.prevY)
        {
            // Minor performance optimization: do not handle the same coordinates twice in a row.
            return;
        }

        this.prevX = x;
        this.prevY = y;

        var valueX = 1000 * this.area.getXValue(x);
        var valueY = this.area.getYValue(y);

        this.prevValueX = valueX;
        this.prevValueY = valueY;



        this.render();
    };


    iChart.Charting.ChartWidgetLayer.prototype.widgetCurPrice = function (ctx, options)
    {
        var width = options.width,
            height = options.height;


        if(options.valign == 'top') {
            var yT = this.area.innerOffset.top+options.vspace;
        } else {
            var yT = this.area.innerHeight+this.area.innerOffset.top-height-options.vspace;
        }

        if(options.halign == 'left') {
            var xT = this.area.innerOffset.left+options.hspace;
        } else {
            var xT = this.area.innerWidth+this.area.innerOffset.left-width-options.hspace;
        }

        ctx.save();
        ctx.translate(xT, yT);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = "rgba(214,218,225,0.75)";
        ctx.strokeStyle = "rgba(171,177,192,1)";
        ctx.fillRect(0,0,width,height);
        ctx.rect(0,0,width,height);
        ctx.stroke();


        var q = this.chart.env.userSettings.currentSecurity.q;
        ctx.fillStyle = '#20232a';
        ctx.font = 'normal 26px Arial,Helvetica,sans-serif';
        ctx.textBaseline = "middle";

        if(!this.chart.areas[0].ySeries[0]) { return;}
        var lastIndex = this.chart.areas[0].ySeries[0].points.length-this.chart.chartOptions.futureAmount-1;
        var pointX = this.chart.areas[0].xSeries[lastIndex];
        var pointY = this.chart.areas[0].ySeries[0].points[lastIndex];

        var price = pointY[3];
        var deg = (1/this.chart.env.userSettings.currentSecurity.min_step > 1) ? (Math.round(1/this.chart.env.userSettings.currentSecurity.min_step)).toString().length-1 : 0;
        price = price.toFormat(deg,'.',' ');
        ctx.fillText(price, 10, 30);

        ctx.textBaseline = "top";
        var dataLabel = iChart.formatDateTime(new Date(pointX * 1000), "dd MMMM HH:mm");

        ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
        ctx.fillText(dataLabel, 10, 5);

        /*
        if(q.chg >= 0) {
            ctx.fillStyle = '#228B22';
        } else {
            ctx.fillStyle = '#b7333b';
        }
        var chg = parseFloat(q.chg);
        var sign = (chg > 0) ? "▲+":"▼";
        var diff = q.chg=='0'?'0.00': sign + chg.toFormat(Math.max(chg.getDegree(),2),'.',' ');
        ctx.fillText(diff, 140, 13);

        if(q.pcp) {
            if(q.pcp >= 0) {
                ctx.fillStyle = '#228B22';
            } else {
                ctx.fillStyle = '#b7333b';
            }
            var sign = (parseFloat(q.pcp) > 0) ? "▲+" : "▼";
            var diffpc = sign + q.pcp + '%';
            ctx.fillText(diffpc, 140, 28);
        }
        */

        ctx.restore();

    };

    iChart.Charting.ChartWidgetLayer.prototype.widgetCurPrice2 = function (ctx, options)
    {
        var width = options.width,
            height = options.height;

        if(typeof this.chart.env.userSettings.currentSecurity.q != "undefined") {

            if(options.valign == 'top') {
                var yT = this.area.innerOffset.top+options.vspace;
            } else {
                var yT = this.area.innerHeight+this.area.innerOffset.top-height-options.vspace;
            }

            if(options.halign == 'left') {
                var xT = this.area.innerOffset.left+options.hspace;
            } else {
                var xT = this.area.innerWidth+this.area.innerOffset.left-width-options.hspace;
            }

            ctx.save();
            ctx.translate(xT, yT);
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = "rgba(214,218,225,0.75)";
            ctx.strokeStyle = "rgba(171,177,192,1)";
            ctx.fillRect(0,0,width,height);
            ctx.rect(0,0,width,height);
            ctx.stroke();


            var q = this.chart.env.userSettings.currentSecurity.q;
            ctx.fillStyle = '#20232a';
            ctx.font = 'normal 26px Arial,Helvetica,sans-serif';
            ctx.textBaseline = "middle";
            var price = parseFloat(q.ltp);
            var deg = (1/this.chart.env.userSettings.currentSecurity.min_step > 1) ? (Math.round(1/this.chart.env.userSettings.currentSecurity.min_step)).toString().length-1 : 0;
            price = price.toFormat(deg,'.',' ');
            ctx.fillText(price, 10, 30);

            ctx.textBaseline = "top";
            if(new Date(q.ltt).toString() != "Invalid Date") {
                var ltt = q.ltt;
                ltt = ltt.replace(/^[\d-]{10}T?/, '');
                var dataLabel = iChart.formatDateTime(new Date(q.ltt), "dd MMMM") + " " + ltt;

                ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
                ctx.fillText(dataLabel, 10, 5);
            }

            if(q.chg >= 0) {
                ctx.fillStyle = '#228B22';
            } else {
                ctx.fillStyle = '#b7333b';
            }
            var chg = parseFloat(q.chg);
            var sign = (chg > 0) ? "▲+":"▼";
            var diff = q.chg=='0'?'0.00': sign + chg.toFormat(Math.max(chg.getDegree(),2),'.',' ');
            ctx.fillText(diff, 140, 13);

            if(q.pcp) {
                if(q.pcp >= 0) {
                    ctx.fillStyle = '#228B22';
                } else {
                    ctx.fillStyle = '#b7333b';
                }
                var sign = (parseFloat(q.pcp) > 0) ? "▲+" : "▼";
                var diffpc = sign + q.pcp + '%';
                ctx.fillText(diffpc, 140, 28);
            }

        }

        ctx.restore();

    };

    iChart.Charting.ChartWidgetLayer.prototype.drawCrosshair = function (ctx, options) {

        var offset = {};
        offset.left = Math.round(this.pageX - this.offset.left);
        offset.top = Math.round(this.pageY - this.offset.top);

        var inside = {};
        inside.x = false;
        inside.y = false;

        for (var i = 0; i < this.chart.areas.length; ++i)
        {
            var area = this.chart.areas[i];
            if (area.enabled === false || area.isLayer || area.isScroller)
            {
                continue;
            }

            if(area.chart.chartOptions.tooltipPosition == 'top') {
                var top = area.innerOffset.top - 20;
            } else if(area.chart.chartOptions.tooltipPosition == 'bottom') {
                var top = area.innerOffset.top - 38 + area.innerHeight;
            }

            inside[i] = {};
            inside.x = (inside[i].x = offset.left >= area.innerOffset.left && offset.left <= area.innerOffset.left + area.innerWidth) || inside.x;
            inside.y = (inside[i].y = offset.top >= area.innerOffset.top && offset.top <= area.innerOffset.top + area.innerHeight) || inside.y;
        }

        if (!inside.x || !inside.y)
        {
            return;
        }


        var area = this.chart.areas[0];
        if (area.xSeries.length === 0)
        {
            return;
        }

        var xIndex = area.getXIndex(offset.left - area.innerOffset.left);
        if (xIndex < area.viewport.x.bounded.min || xIndex > area.viewport.x.bounded.max)
        {
            return;
        }

        this.xIndex = Math.max(area.viewport.x.bounded.min, Math.min(area.viewport.x.bounded.max, Math.round(xIndex)));

        this.xPoint = Math.round(this.area.getXPositionByIndex(this.xIndex));
        this.yPoint = this.prevY;

        ctx.save();
        ctx.translate(0.5, 0.5);
        this.drawCrossLines(ctx);
        ctx.restore();

    };

    iChart.Charting.ChartWidgetLayer.prototype.drawCrossLines = function (ctx, xPoint, yPoint) {

        var areas = this.chart.areas;

        for (var area_i = 0; area_i < areas.length; ++area_i)
        {
            var area = areas[area_i];

            if (area.enabled === false || area.isScroller || area.name == "VolumeByPriceArea")
            {
                continue;
            }

            if(area.isLayer) {
                var parentArea = $.grep(areas, function (x) { return x.name === area.parentName })[0];
                area.textOffset = parentArea.textOffset;
            } else {
                area.textOffset = 0;
            };

            if(!area.isLayer) {
                ctx.save();

                if (ctx.setLineDash) {
                    ctx.setLineDash([4, 3]);
                }

                ctx.strokeStyle = "#999999";
                ctx.beginPath();
                ctx.moveTo(this.xPoint, area.offset.top);
                ctx.lineTo(this.xPoint, area.offset.top + area.innerHeight);

                if (this.yPoint >= area.innerOffset.top && this.yPoint <= area.innerOffset.top + area.innerHeight) {
                    if (ctx.setLineDash) {
                        ctx.setLineDash([4, 3]);
                    }

                    ctx.moveTo(area.offset.left, this.yPoint);
                    ctx.lineTo(area.offset.left + area.innerWidth, this.yPoint);
                }
                ctx.stroke();
                ctx.closePath();
                ctx.restore();


                if (this.yPoint >= area.innerOffset.top && this.yPoint <= area.innerOffset.top + area.innerHeight) {
                    var yValue = area.getYValue(this.yPoint - area.offset.top);

                    if(yValue < 100) {
                        yValue = iChart.formatNumber( yValue, { decimalPlaces: null, decimalPrecision: 6, "scale": 0 });
                    } else {
                        yValue = iChart.formatNumber( yValue, { decimalPlaces: 2, decimalPrecision: null, "scale": 0 });
                    }

                    var x = area.offset.left + area.innerWidth;
                    var y = this.yPoint;

                    ctx.fillStyle = this.chart.chartOptions.labelColor;
                    ctx.fillRect(x + 8, y - 8, ctx.measureText(yValue).width + 10, 15);
                    ctx.beginPath();
                    ctx.moveTo(x + 9, y - 9);
                    ctx.lineTo(x + 9, y + 8);
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + 9, y - 9);
                    ctx.lineTo(x + 9, y + 8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.font = 'normal ' + 10 + 'px ' + 'Verdana,Tahoma,Geneva,Arial,Sans-serif';
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.fillStyle = this.chart.chartOptions.backgroundColor;
                    ctx.fillText(yValue, x + 8, y - 6);
                }
            }

            ctx.save();

            var dateTime = new Date(1000 * area.xSeries[this.xIndex]);

            if(area_i == 0 && !area.isLayer) {
                var dateLabel = iChart.formatDateTime(dateTime, this.chart.dateFormat);
                var dateLabelArr = dateLabel.split("\n");

                var width = ctx.measureText(dateLabelArr[0] + " " + dateLabelArr[1]).width;
                ctx.fillStyle = this.chart.chartOptions.labelColor;
                ctx.fillRect(this.xPoint - Math.round(width / 2) - 4, area.offset.top + area.innerHeight + 2, width + 4, 12);
                ctx.fillStyle = this.chart.chartOptions.backgroundColor;
                ctx.font = 'normal ' + 8 + 'px ' + 'Verdana,Tahoma,Geneva,Arial,Sans-serif';
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText(dateLabelArr[0] + " " + dateLabelArr[1], this.xPoint - Math.round(width / 2), area.offset.top + area.innerHeight + 3);
            }

            if(!area.isLayer) {
                ctx.fillStyle = this.chart.chartOptions.backgroundColor;
                ctx.fillRect(area.offset.left, area.offset.top + area.innerHeight - 15, 100, 15);
                ctx.font = 'normal ' + 10 + 'px ' + 'Verdana,Tahoma,Geneva,Arial,Sans-serif';
                ctx.textAlign = "left";
                ctx.textBaseline = "top";

                var tooltips = iChart.formatDateTime(dateTime, "dd.MM.yyyy" + (this.chart.showTime() ? " HH:mm" : ""));
                area.textOffset += ctx.measureText(tooltips).width + 20;
                ctx.fillStyle = this.chart.chartOptions.labelColor;
                ctx.fillText(tooltips, area.offset.left, area.offset.top + area.innerHeight - 12);
            }

            for(var j = 0; j < area.ySeries.length; j++) {
                var ySeries = area.ySeries[j];

                if(!ySeries.points[this.xIndex] || ySeries.points[this.xIndex].length == 4 && ySeries.points[this.xIndex][0] == null) {
                    continue;
                }

                if(ySeries.valuesPerPoint > 1) {
                    var yValue = ySeries.points[this.xIndex] ? ySeries.points[this.xIndex][ySeries.dotIndex] : null;
                } else {
                    var yValue = ySeries.points[this.xIndex] ? ySeries.points[this.xIndex][0] : null;
                }

                if(yValue) {

                    ctx.beginPath();
                    ctx.fillStyle = ySeries.color;
                    ctx.arc(this.xPoint, area.offset.top + Math.round(area.getYPosition(yValue)), 4, 0, 2 * Math.PI, true);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.fillStyle = this.chart.chartOptions.backgroundColor;
                ctx.fillRect(area.offset.left + area.textOffset, area.offset.top + area.innerHeight - 15, 15, 15);

                ctx.beginPath();
                ctx.fillStyle = ySeries.color;
                ctx.strokeStyle = ySeries.color;
                ctx.arc(area.offset.left + area.textOffset, area.offset.top + area.innerHeight - 6, 7, 0, 2 * Math.PI, true);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
                area.textOffset += 15;

                tooltips = (ySeries.labels[0] && ySeries.labels[0][2] ? ySeries.labels[0][2] : ySeries.name)  + " ";

                if(ySeries.points[this.xIndex]) {

                    if (ySeries.valuesPerPoint === 4) {
                        if (this.chart.isComparison) {
                            tooltips += ySeries.points[this.xIndex][3];
                        } else {
                            tooltips += " H: " + ySeries.points[this.xIndex][0]
                                + " L: " + ySeries.points[this.xIndex][1]
                                + " O: " + ySeries.points[this.xIndex][2]
                                + " C: " + ySeries.points[this.xIndex][3];
                        }
                    } else if (ySeries.valuesPerPoint == 2) {
                        tooltips += " " + _t('2589', "Мин:") + " " + ySeries.points[this.xIndex][0]
                                 + " " + _t('2590', "Макс:") + " " + ySeries.points[this.xIndex][0];
                    } else {
                        var pointYValue = ySeries.points[this.xIndex][0];
                        if(pointYValue < 100) {
                            pointYValue = iChart.formatNumber( pointYValue, { decimalPlaces: null, decimalPrecision: 6, "scale": 0 });
                        } else {
                            pointYValue = iChart.formatNumber( pointYValue, { decimalPlaces: 2, decimalPrecision: null, "scale": 0 });
                        }
                        tooltips += pointYValue;
                    }

                    ctx.fillStyle = this.chart.chartOptions.backgroundColor;
                    ctx.fillRect(area.offset.left + area.textOffset, area.offset.top + area.innerHeight - 15, ctx.measureText(tooltips).width + 20, 15);

                    ctx.fillStyle = this.chart.chartOptions.labelColor;
                    ctx.font = 'normal ' + 10 + 'px ' + 'Verdana,Tahoma,Geneva,Arial,Sans-serif';
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.fillText(tooltips, area.offset.left + area.textOffset, area.offset.top + area.innerHeight - 12);


                    area.textOffset += ctx.measureText(tooltips).width + 20;
                }

            }

            ctx.restore();

        }

        if(this.chart.chartOptions.floatingLegend) {
            this.drawTooltip(ctx);
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.drawPoints = function (ctx) {

    };

    iChart.Charting.ChartWidgetLayer.prototype.drawTooltip = function (ctx) {
        ctx.save();

        var areas = this.chart.areas;

        for (var area_i = 0; area_i < areas.length; ++area_i) {
            var area = areas[area_i];

            if (area.enabled === false || area.isScroller || area.name == "VolumeByPriceArea" || area.isLayer) {
                continue;
            }

            if (this.yPoint >= area.innerOffset.top && this.yPoint <= area.innerOffset.top + area.innerHeight) {

                var ySeries = area.ySeries[0];

                var hPositionRight = true;

                var floatingLegendFontSize = this.chart.chartOptions.floatingLegendFontSize;
                var floatingLegendPadding = floatingLegendFontSize / 2;

                ctx.font = 'normal ' + floatingLegendFontSize + 'px ' + 'Verdana,Tahoma,Geneva,Arial,Sans-serif';
                ctx.textAlign = "left";
                ctx.textBaseline = "top";

                var points = area.ySeries[0].points[this.xIndex];

                if( ySeries.kind == 'HLOC' ) {

                    var text1L = ctx.measureText(_t('21962', 'open:') + points[2]).width;
                    var text2L = ctx.measureText(_t('21963', 'close:') + points[3]).width;
                    var text3L = ctx.measureText(_t('21964', 'low:') + points[1]).width;
                    var text4L = ctx.measureText(_t('21965', 'high:') + points[0]).width;

                    var textWidth = Math.max(text1L,text2L,text3L,text4L) + 10;
                    var textHeight = (floatingLegendFontSize + 2) * 4 + floatingLegendPadding;
                } else {

                    var textWidth = ctx.measureText(ySeries.name + ': ' + iChart.formatNumber(points[ySeries.closeValueIndex], ySeries.formatProvider)).width + 10;
                    var textHeight = (floatingLegendFontSize + 2) + floatingLegendPadding;
                }

                var cursorY = area.getYPosition(points[ySeries.closeValueIndex]) + area.innerOffset.top;
                var yPointPosition = cursorY - 20;

                if(this.xPoint  > (area.offset.left + area.innerWidth) / 2) {
                    hPositionRight = false;
                }

                var cursorXDir = 9 * (hPositionRight ? 1: -1);

                if(hPositionRight) {
                    var xPointPosition = this.xPoint + cursorXDir;
                } else {
                    xPointPosition = this.xPoint - textWidth + cursorXDir;
                }

                var yOffset = 0;

                if(yPointPosition + textHeight > area.innerOffset.top + area.innerHeight) {
                    yOffset = (yPointPosition + textHeight) - (area.innerOffset.top + area.innerHeight);
                }

                ctx.fillStyle = this.chart.chartOptions.floatingLegendBorderColor;
                ctx.beginPath();
                ctx.moveTo(this.xPoint + cursorXDir, cursorY - 9);
                ctx.lineTo(this.xPoint + cursorXDir, cursorY + 8);
                ctx.lineTo(this.xPoint, cursorY);
                ctx.lineTo(this.xPoint + cursorXDir, cursorY - 9);
                ctx.lineTo(this.xPoint + cursorXDir, cursorY + 8);
                ctx.closePath();
                ctx.fill();

                ctx.lineWidth = 1;
                ctx.strokeStyle = this.chart.chartOptions.floatingLegendBorderColor;

                var radius = 5;
                ctx.beginPath();
                ctx.moveTo(xPointPosition + radius, yPointPosition - yOffset);
                ctx.lineTo(xPointPosition + textWidth - radius, yPointPosition - yOffset);
                ctx.quadraticCurveTo(xPointPosition + textWidth, yPointPosition - yOffset, xPointPosition + textWidth, yPointPosition - yOffset + radius);
                ctx.lineTo(xPointPosition + textWidth, yPointPosition - yOffset + textHeight - radius);
                ctx.quadraticCurveTo(xPointPosition + textWidth, yPointPosition - yOffset + textHeight, xPointPosition + textWidth - radius, yPointPosition - yOffset + textHeight);
                ctx.lineTo(xPointPosition + radius, yPointPosition - yOffset + textHeight);
                ctx.quadraticCurveTo(xPointPosition, yPointPosition - yOffset + textHeight, xPointPosition, yPointPosition - yOffset + textHeight - radius);
                ctx.lineTo(xPointPosition, yPointPosition - yOffset + radius);
                ctx.quadraticCurveTo(xPointPosition, yPointPosition - yOffset, xPointPosition + radius, yPointPosition - yOffset);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = this.chart.chartOptions.floatingLegendBackground;
                ctx.fill();

                ctx.fillStyle = this.chart.chartOptions.floatingLegendTextColor;
                if( ySeries.kind == 'HLOC' ) {
                    var yTextPosition = yPointPosition - yOffset + floatingLegendPadding;

                    ctx.fillText(_t('21962', 'open:') + points[2], xPointPosition, yTextPosition);
                    ctx.fillText(_t('21963', 'close:') + points[3], xPointPosition, yTextPosition + floatingLegendFontSize + 2);
                    ctx.fillText(_t('21964', 'low:') + points[1], xPointPosition, yTextPosition + floatingLegendFontSize*2 + 2);
                    ctx.fillText(_t('21965', 'high:') + points[0], xPointPosition, yTextPosition + floatingLegendFontSize*3 + 2);
                } else {
                    var yTextPosition = yPointPosition - yOffset + floatingLegendPadding;
                    ctx.fillText(ySeries.name + ': ' + iChart.formatNumber(points[ySeries.closeValueIndex], ySeries.formatProvider), xPointPosition, yTextPosition);

                }
            }
        }

        ctx.restore();

    }

})();
