/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartRenderer = function (chart)
    {
        /// <summary>
        /// Initializes a new instance of the ChartRenderer class with the specified chart.
        /// </summary>
        /// <param name="chart">Chart object to render.</param>

        this.chart = chart;
    };

    iChart.Charting.ChartRenderer.prototype.formatDateTime = function (value)
    {
        /// <summary>
        /// Formats the specified date/time value.
        /// </summary>
        /// <param name="value" type="Number">Ordinate value.</param>

        var date = new Date(1000 * value);
        return iChart.formatDateTime(date, this.chart.dateFormat);
    };

    iChart.Charting.ChartRenderer.prototype.formatNumber = function (value, formatProvider)
    {
        /// <summary>
        /// Formats the specified numeric value using the specified format provider.
        /// </summary>
        /// <param name="value" type="Number">Ordinate value.</param>
        /// <param name="formatProvider" type="Object">Numeric format provider.</param>

        var result = iChart.formatNumber(value, formatProvider);
        if (this.chart.isComparison)
        {
            if (value > 0)
            {
                result = "+" + result;
            }

            result += "%";
        }

        return result;
    };

    iChart.Charting.ChartRenderer.prototype.renderArea = function (area, context)
    {
        /// <summary>
        /// Renders the specified chart area to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area to be rendered.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        if (!area.enabled)
        {
            return;
        }

        context.save();
        context.translate(area.innerOffset.left, area.innerOffset.top);
        if (area.rotate)
        {
            context.transform(0, 1, -1, 0, area.innerWidth, 0);
        }

        if (area.showAxes && this.chart.chartOptions.showAxes)
        {
            this.renderAxes(area, context);
        }

        if (area.name =="ChartArea1")
        {
            context.fillStyle = this.chart.chartOptions.watermarkColor;
            context.font = this.chart.chartOptions.watermarkFont;
            context.textAlign = "left";
            context.textBaseline = "bottom";

            if(this.chart.chartOptions.watermarkShow) {
                var textW = (area.innerWidth - context.measureText(this.chart.chartOptions.watermarkText).width) / 2;
                context.fillText(this.chart.chartOptions.watermarkText, textW, area.innerHeight / 2 - 5);

                context.font = this.chart.chartOptions.watermarkSubFont;
                textW = (area.innerWidth - context.measureText(this.chart.chartOptions.watermarkSubText).width) / 2;
                context.fillText(this.chart.chartOptions.watermarkSubText, textW, area.innerHeight / 2 + 45);
            }
        }

        if (area.title)
        {
            context.fillStyle = this.chart.chartOptions.watermarkColor;
            context.font = this.chart.chartOptions.watermarkFont;
            context.textAlign = "left";
            context.textBaseline = "bottom";

            if(this.chart.chartOptions.watermarkShow) {
                var textW = (area.innerWidth - context.measureText(area.title).width) / 2;
                context.fillText(area.title, textW, area.innerHeight / 2 - 5);
            }
        }

        if (area.xSeries.length !== 0 && area.ySeries.length !== 0)
        {
            if (area.showLabels)
            {
                this.renderXLabels(area, context);
                this.renderYLabels(area, context);
            }

            this.renderSeriesCollection(area, context);
            if(area.name == "ChartArea1" && area.chart.chartOptions.showCurrentLabel) {
                this.renderCurrentLabel(area, context);
            }
        }

        context.restore();
    };

    /**
     * Отображение последней цены на оси Y
     * @param area
     * @param context
     */
    iChart.Charting.ChartRenderer.prototype.renderCurrentLabel = function (area, context)
    {
        var x = area.innerWidth,
            value,
            point,
            bidY = false,
            offerY = false;

        if (this.chart.isComparison)
        {
            var index = iChart.Charting.getNearestNotNullIndex(area.ySeries[0].points, area.viewport.x.bounded.min);
            var index2 = iChart.Charting.getNearestNotNullIndex(area.ySeries[0].points, area.ySeries[0].points.length-area.chart.chartOptions.futureAmount-1);
            value = (area.ySeries[0].points[index2] && area.ySeries[0].points[index]) ? (((area.ySeries[0].points[index2][3] / area.ySeries[0].points[index][3]) - 1) * 100) : 0;
        } else {
            point = area.ySeries[0].points[area.ySeries[0].points.length-area.chart.chartOptions.futureAmount-1];
            value = (point && point[3]) ? point[3] : 0;

            if(point && point[4] && point[5]) {
                offerY = Math.round(area.getYPosition(point[4], false));
                bidY = Math.round(area.getYPosition(point[5], false));
            }
        }
        var y = Math.round(area.getYPosition(value, false));

        var label = this.formatNumber(value, { "decimalPrecision": this.chart.labelPrecision, "scale": 0 });

        var labelValue = parseFloat(label.replace(/ /g,''));

        if ( this.labelValue != null && labelValue < this.labelValue ) {
            var color = "#f44336";
            this.labelColor = "#f44336";
        } else if ( this.labelValue != null && labelValue > this.labelValue )  {
            var color = "#7cb342";
            this.labelColor = "#7cb342";
        } else if(this.labelColor) {
            var color = this.labelColor;
        } else {
            var color = "#333";
        }

        this.labelValue = labelValue;

        if(bidY && offerY) {
            this.drawLable(context, color, "#FFFFFF", x, y, label, {bidY: bidY, offerY: offerY});
        } else {
            this.drawLable(context, color, "#FFFFFF", x, y, label);
        }
    }

    iChart.Charting.ChartRenderer.prototype.drawLable = function (context, fillColor, textColor, x, y, text, addons)
    {
        fillColor = fillColor ? fillColor : "#333333";
        textColor = textColor ? textColor : "#FFFFFF";

        context.save();

        context.font = 'normal 11px Arial,Helvetica,sans-serif';
        context.textAlign = "left";
        context.textBaseline = "middle";

        context.fillStyle = fillColor;
        context.strokeStyle = fillColor;
        context.fillRect(x+8, y-8, context.measureText(text).width+10, 15);

        context.beginPath();
        context.moveTo(x+8, y-8);
        context.lineTo(x+8, y+7);
        context.lineTo(x, y);
        context.lineTo(x+8, y-8);
        context.lineTo(x+8, y+7);
        context.closePath();

        context.fill();

        context.fillStyle = textColor;
        context.fillText(text, x+8, y);

        context.translate(0.5, 0.5);
        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(0, y);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();

        if(addons) {
            context.beginPath();
            context.fillStyle = '#f44336';
            context.moveTo(x-4, addons.bidY-4);
            context.lineTo(x-4, addons.bidY+3);
            context.lineTo(x, addons.bidY);
            context.lineTo(x-4, addons.bidY-4);
            context.lineTo(x-4, addons.bidY+3);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = '#7cb342';
            context.moveTo(x-4, addons.offerY-4);
            context.lineTo(x-4, addons.offerY+3);
            context.lineTo(x, addons.offerY);
            context.lineTo(x-4, addons.offerY-4);
            context.lineTo(x-4, addons.offerY+3);
            context.fill();
            context.closePath();

        }

        context.restore();

    };

    iChart.Charting.ChartRenderer.prototype.renderAxes = function (area, context)
    {
        /// <summary>
        /// Renders chart area axes to the specified canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area to render axes for.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        context.save();
        context.translate(0.5, 0.5);

        context.strokeStyle = this.chart.chartOptions.axisColor;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(area.axisX.length, 0);
        context.lineTo(area.axisX.length, area.axisY.length);
        context.lineTo(0, area.axisY.length);
        context.closePath();
        context.stroke();

        context.restore();
    };

    iChart.Charting.ChartRenderer.prototype.renderChart = function (context)
    {
        /// <summary>
        /// Renders the specified chart to the specified canvas context.
        /// </summary>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = this.chart.chartOptions.backgroundColor;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        for (var i = 0; i < this.chart.areas.length; ++i)
        {
            //Дополним если есть юзерские настройки
            var area = this.chart.areas[i];
            //area = $.extend (true, this.chart.areas[i], userSettings[area.name]);
            //area = $.extend (true, this.chart.areas[i], this.chart.env.userSettings.chartSettings.areaSettings);
            this.renderArea(this.chart.areas[i], context);
            if(typeof this.chart.areas[i].overlay != "undefined") {
                this.chart.areas[i].overlay.update(this.chart.areas[i]);
            }
        }
    };

    iChart.Charting.ChartRenderer.prototype.renderLegends = function (context)
    {
        /// <summary>
        /// Renders chart legends to the specified canvas context. This method is only used for creating a chart image.
        /// Standard legends are HTML elements created using the Crosshair component.
        /// </summary>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        for (var i = 0; i < this.chart.areas.length; ++i)
        {
            var area = this.chart.areas[i];
            if (!area.showLegend || area.rotate)
            {
                continue;
            }

            if (area.viewport.x.bounded.min > area.viewport.x.bounded.max)
            {
                continue;
            }

            context.save();
            context.translate(area.innerOffset.left, area.innerOffset.top - 3);

            context.fillStyle = "#000000";
            context.font = "11px Tahoma";
            context.textAlign = "left";
            context.textBaseline = "bottom";

            var dateTime = new Date(1000 * area.xSeries[area.viewport.x.bounded.max]);
            var dateTimeText = iChart.formatDateTime(dateTime, this.chart.showTime() ? "dd.MM.yyyy HH:mm" : "dd.MM.yyyy");
            context.fillText(dateTimeText, 0, 0);

            var spacing = 7;
            var textMetrics = context.measureText(dateTimeText);
            context.translate(textMetrics.width + spacing, 0);

            var seriesCollection = area.ySeries.slice(0);
            for (var j = 0; j < this.chart.areas.length; ++j)
            {
                if (this.chart.areas[j].parentName === area.name && !this.chart.areas[j].rotate)
                {
                    seriesCollection = seriesCollection.concat(this.chart.areas[j].ySeries);
                }
            }

            for (var j = 0; j < seriesCollection.length; ++j)
            {
                var series = seriesCollection[j];
                context.fillStyle = series.color.replace(/rgba\((.+),[^,]+\)/, "rgb($1)");
                context.beginPath();
                context.arc(6, -6, 6, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();

                context.translate(12 + spacing, 0);

                context.font = "bold 11px Tahoma";
                context.fillText(series.name, 0, 0);

                textMetrics = context.measureText(series.name);
                context.translate(textMetrics.width + spacing, 0);

                var labels;
                if (series.valuesPerPoint === 4)
                {
                    labels = [[2, "O: "], [0, "H: "], [1, "L: "], [3, "C: "]];
                }
                else if (series.valuesPerPoint == 2)
                {
                    labels = [[1, "Мин: "], [0, "Макс: "]];
                }
                else
                {
                    labels = [[0, ""]];
                }

                context.fillStyle = "#000000";
                context.font = "11px Tahoma";
                for (var k = 0; k < labels.length; ++k)
                {
                    var labelIndex = labels[k][0];
                    var labelText = labels[k][1];
                    var values = series.points[area.viewport.x.bounded.max];
                    if (!values)
                    {
                        continue;
                    }

                    labelText += iChart.formatNumber(values[labelIndex], series.formatProvider);
                    context.fillText(labelText, 0, 0);

                    textMetrics = context.measureText(labelText);
                    context.translate(textMetrics.width + spacing, 0);
                }
            }

            context.restore();
        }
    };

    iChart.Charting.ChartRenderer.prototype.renderPoint = function (area, series, index, context, state)
    {
        /// <summary>
        /// Renders the specified series point to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area in which the point is located.</param>
        /// <param name="series" type="Object">Time series the point belongs to.</param>
        /// <param name="index" type="Number">Index of the point in the series.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>
        /// <param name="state" type="Object">Point rendering state. It is used to pass information about previously rendered points.</param>

        var values = series.points[index];
        if (!values)
        {
            return;
        }

        switch (series.chartType)
        {
            case "Candlestick":
            case "Stock":
                if(!values[0] && !values[1] && !values[2] && !values[3]) {
                    return;
                }

                var x = Math.round(area.getXPositionByIndex(index));
                var high = Math.round(area.getYPosition(values[0], series.inline));
                var low = Math.round(area.getYPosition(values[1], series.inline));
                if (area.axisX.pointWidth === 0)
                {
                    context.moveTo(x, low);
                    context.lineTo(x, high);
                    break;
                }

                var open = Math.round(area.getYPosition(values[2], series.inline));
                var close = Math.round(area.getYPosition(values[3], series.inline));

                if (series.chartType === "Candlestick")
                {
                    context.save();
                    var candleBottom;
                    var candleTop;
                    if (values[2] < values[3])
                    {
                        candleBottom = open;
                        candleTop = close;

                        if (area.chart.chartOptions.candleUp)
                        {
                            context.fillStyle = area.chart.chartOptions.candleUp;
                        }

                        if(!area.chart.chartOptions.candleBorder) {
                            context.strokeStyle = context.fillStyle;
                        } else {
                            context.strokeStyle = area.chart.chartOptions.candleBorderUp;
                        }

                        context.fillRect(x - area.axisX.pointWidth, candleTop, 2 * area.axisX.pointWidth, candleBottom - candleTop);
                    }
                    else
                    {
                        candleBottom = close;
                        candleTop = open;

                        if (area.chart.chartOptions.candleDown)
                        {
                            context.fillStyle = area.chart.chartOptions.candleDown;
                            //context.fillRect(x - area.axisX.pointWidth, candleTop, 2 * area.axisX.pointWidth, candleBottom - candleTop);
                        }

                        context.fillRect(x - area.axisX.pointWidth, candleTop, 2 * area.axisX.pointWidth, candleBottom - candleTop);

                        if(!area.chart.chartOptions.candleBorder) {
                            context.strokeStyle = context.fillStyle;
                        } else {
                            context.strokeStyle = area.chart.chartOptions.candleBorderDown;
                        }
                    }

                    context.strokeRect(x - area.axisX.pointWidth, candleTop, 2 * area.axisX.pointWidth, candleBottom - candleTop);

                    context.restore();

                    if(area.chart.chartOptions.candleWick) {
                        context.strokeStyle = area.chart.chartOptions.candleWickStyle;
                        context.moveTo(x, high);
                        context.lineTo(x, candleTop);

                        context.moveTo(x, candleBottom);
                        context.lineTo(x, low);
                    }
                } else {

                    if (values[2] < values[3])
                    {
                        if (area.chart.chartOptions.stockUp) {
                            context.strokeStyle = area.chart.chartOptions.stockUp;
                        } else if (series.upStyle) {
                            context.strokeStyle = series.color;
                        }
                    } else {
                        if (area.chart.chartOptions.stockDown) {
                            context.strokeStyle = area.chart.chartOptions.stockDown;
                        } else if (series.upStyle) {
                            context.strokeStyle = series.color;
                        }
                    }

                    if (area.chart.chartOptions.stockWidth) {
                        context.lineWidth = area.chart.chartOptions.stockWidth;
                    }

                    context.beginPath();
                    context.moveTo(x, low);
                    context.lineTo(x, high);

                    context.moveTo(x, open);
                    context.lineTo(x - area.axisX.pointWidth, open);

                    context.moveTo(x, close);
                    context.lineTo(x + area.axisX.pointWidth, close);
                    context.stroke();

                }

                break;
            case "Column":
                if(values[series.closeValueIndex]) {
                    var x = Math.round(area.getXPositionByIndex(index));
                    var close = Math.round(area.getYPosition(values[series.closeValueIndex], series.inline));
                    if (area.axisX.pointWidth === 0) {
                        context.moveTo(x, area.axisY.zeroPosition);
                        context.lineTo(x, close);
                        break;
                    }

                    context.fillRect(x - area.axisX.pointWidth, Math.min(area.axisY.zeroPosition, close), 2 * area.axisX.pointWidth, Math.abs(close - area.axisY.zeroPosition));
                    context.strokeRect(x - area.axisX.pointWidth, Math.min(area.axisY.zeroPosition, close), 2 * area.axisX.pointWidth, Math.abs(close - area.axisY.zeroPosition));
                }
                break;
            case "Area":
                // The position is not rounded to smooth the line.
                var x = area.getXPositionByIndex(index);
                var value = values[series.closeValueIndex];

                if (area.chart.chartOptions.areaLineColor) {
                    context.strokeStyle = area.chart.chartOptions.areaLineColor;
                }
                if(value !== null) {
                    if (this.chart.isComparison && series.kind != "TA_LIB")
                    {
                        if (state.multiplier)
                        {
                            value = (value * state.multiplier) - 100;
                        }
                        else
                        {
                            state.multiplier = 100 / value;
                            value = 0;
                        }
                    }

                    var close = area.getYPosition(value, series.inline);
                    if (state.lineStarted)
                    {
                        context.lineTo(x, close);
                    }
                    else
                    {
                        state.lineStarted = true;
                        context.moveTo(x, close);
                    }
                }
                break;
            case "Line":
                // The position is not rounded to smooth the line.
                var x = area.getXPositionByIndex(index);
                var value = values[series.closeValueIndex];

                //if (area.chart.chartOptions.lineColor && series.kind == "HLOC") {
                //    context.strokeStyle = area.chart.chartOptions.lineColor;
                //}
                if(value !== null) {
                    if (this.chart.isComparison && series.kind != "TA_LIB")
                    {
                        if (state.multiplier)
                        {
                            value = (value * state.multiplier) - 100;
                        }
                        else
                        {
                            state.multiplier = 100 / value;
                            value = 0;
                        }
                    }

                    var close = area.getYPosition(value, series.inline);
                    if (state.lineStarted)
                    {
                        context.lineTo(x, close);
                    }
                    else
                    {
                        state.lineStarted = true;
                        context.moveTo(x, close);
                    }
                }
                break;
            case "Point":
                var x = Math.round(area.getXPositionByIndex(index));
                var close = Math.round(area.getYPosition(values[series.closeValueIndex], series.inline));
                context.beginPath();
                context.arc(x, close, 2.5, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
                break;
            default:
                throw new Error("Chart type '" + series.chartType + "' is invalid.");
        }
    };

    iChart.Charting.ChartRenderer.prototype.renderSeries = function (area, series, context, index)
    {
        /// <summary>
        /// Renders the specified series in the specified area to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area containing the series.</param>
        /// <param name="series" type="Object">Series data.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        if (area.viewport.x.bounded.min > area.viewport.x.bounded.max)
        {
            return;
        }

        if (series.kind === "HLOC")
        {
            if (this.chart.isComparison)
            {
                series.chartType = "Line";
            }
            else if (area.isScroller)
            {
                series.chartType = "Area";
            }
            else
            {
                series.chartType = this.chart.chartOptions.chartType;
            }
        }

        context.fillStyle = series.color;
        context.strokeStyle = series.color;

        if (series.kind === "HLOC") {
            if (series.chartType === "Line") {
                context.lineWidth = this.chart.chartOptions.lineWidth;

                var colors = $.extend([], this.chart.chartOptions.seriesColors);
                colors.splice(0,0,this.chart.chartOptions.lineColor);
                context.fillStyle = context.strokeStyle = colors[index % colors.length];
            } else if(series.width) {
                context.lineWidth = series.width;
            } else {
                context.lineWidth = 1;
            }

            if (series.chartType === "Column") {
                context.fillStyle = area.chart.chartOptions.volumeStyle;
                context.strokeStyle = area.chart.chartOptions.volumeStyle;
            }

        } else if (series.kind === "Volume") {
            if (series.chartType === "Column") {
                context.fillStyle = area.chart.chartOptions.volumeStyle;
                context.strokeStyle = area.chart.chartOptions.volumeStyle;
            }
        } else {
            if(series.width && series.chartType !== "Column") {
                context.lineWidth = series.width;
            } else if (series.chartType === "Area" || series.chartType === "Line") {
                context.lineWidth = 2;
            } else {
                context.lineWidth = 1;
            }
        }


        var useSinglePath = series.chartType === "Area" || series.chartType === "Candlestick" || (series.chartType === "Column" && area.axisX.pointWidth === 0) || series.chartType === "Line" || series.chartType === "Stock"
        if (useSinglePath)
        {
            context.beginPath();
        }

        var state = {};
        for (var i = area.viewport.x.bounded.min; i <= area.viewport.x.bounded.max; ++i)
        {
            this.renderPoint(area, series, i, context, state);
        }

        if (useSinglePath)
        {
            context.stroke();
        }

        if (series.chartType === "Area")
        {
            var x = area.getXPositionByIndex(Math.min(series.points.length - this.chart.chartOptions.futureAmount -1, area.viewport.x.bounded.max));
            context.fillStyle = this.chart.chartOptions.areaColor;
            context.lineTo(x, Math.round(area.getYPosition(area.axisY.min)));
            context.lineTo(area.getXPositionByIndex(area.viewport.x.bounded.min), Math.round(area.getYPosition(area.axisY.min)));
            context.closePath();
            context.fill();
        }
    };

    iChart.Charting.ChartRenderer.prototype.renderSeriesCollection = function (area, context)
    {
        /// <summary>
        /// Renders all series in the specified area to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area containing the series collection.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        context.save();

        context.translate(0.5, 0.5);
        context.beginPath();
        context.moveTo(1, 1);
        context.lineTo(1, area.axisY.length - 1);
        context.lineTo(area.axisX.length - 1, area.axisY.length - 1);
        context.lineTo(area.axisX.length - 1, 1);
        context.closePath();
        context.clip();

        for (var j = 0; j < area.ySeries.length; ++j)
        {
            this.renderSeries(area, area.ySeries[j], context, j);
        }

        context.restore();
    };

    iChart.Charting.ChartRenderer.prototype.renderXLabels = function (area, context)
    {
        /// <summary>
        /// Renders abscissa labels, tick marks and grid lines in the specified area to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area to render labels for.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        context.save();
        context.translate(0.5, area.axisY.length);

        context.fillStyle = this.chart.chartOptions.labelColor;
        context.font = this.chart.chartOptions.labelFont;
        context.textAlign = "center";
        context.textBaseline = "bottom";

        var interval = Math.max(1, Math.floor((area.axisX.max - area.axisX.min + 1) / (area.axisX.length / 75)));
        var labelPrev;
        for (var i = area.xSeries.min + Math.ceil((area.axisX.min - area.xSeries.min) / interval) * interval; i <= Math.floor(area.axisX.max); i += interval)
        {
            var value = area.xSeries[i];
            if (typeof value === "undefined")
            {
                continue;
            }

            var xLabel = this.formatDateTime(value);
            var x = Math.round(area.getXPositionByIndex(i));
            if (/*area.axisX.showLabels*/ this.chart.chartOptions.showLabels)
            {
                if(this.chart.chartOptions.showAxes) {
                    context.strokeStyle = this.chart.chartOptions.axisColor;
                    context.beginPath();
                    context.moveTo(x, 0);
                    context.lineTo(x, 5);
                    context.stroke();
                }

                var xLabelLines = xLabel.split("\r\n");
                if (xLabelLines.length === 2)
                {
                    // Remove duplicate date parts.
                    if (xLabelLines[1] === labelPrev)
                    {
                        xLabelLines.length = 1;
                    }
                    else
                    {
                        labelPrev = xLabelLines[1];
                    }
                }

                for (var lineIndex = 0; lineIndex < xLabelLines.length; ++lineIndex)
                {
                    context.fillText(xLabelLines[lineIndex], x, 15 + (lineIndex * 11));
                }
            }

            context.strokeStyle = this.chart.chartOptions.gridColor;
            context.beginPath();
            if (this.chart.chartOptions.gridStyle === "dashed")
            {
                for (var y = -4; y >= -area.axisY.length; y -= 4)
                {
                    context.moveTo(x, y);
                    context.lineTo(x, y + 3);
                }
            }
            else if (this.chart.chartOptions.gridStyle === "solid")
            {
                context.moveTo(x, 0);
                context.lineTo(x, -area.axisY.length);
            }

            context.stroke();
        }

        context.restore();
    };

    iChart.Charting.ChartRenderer.prototype.renderYLabel = function (area, value, scale, context)
    {
        /// <summary>
        /// Renders the label for the specified ordinate value.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area containing the label.</param>
        /// <param name="value" type="Number">Ordinate value to render the label for.</param>
        /// <param name="scale" type="Number">Ordinate value scale.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        var label = this.formatNumber(value, { "decimalPrecision": this.chart.labelPrecision, "scale": scale });
        var y = Math.round(area.getYPosition(value, false));

        if(this.chart.chartOptions.showAxes) {
            context.strokeStyle = this.chart.chartOptions.axisColor;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(5, y);
            context.stroke();
        }

        if(this.chart.chartOptions.showLabels) {
            context.fillStyle = this.chart.chartOptions.labelColor;
            if(this.chart.chartOptions.yLabelsOutside) {
                context.fillText(label, 8, y);
            } else {
                context.fillText(label, -Math.ceil(context.measureText(label).width / 10) * 10, y-5);
            }
        }

        context.beginPath();
        if (value === 0)
        {
            context.strokeStyle = this.chart.chartOptions.axisColor;
            context.moveTo(0, y);
            context.lineTo(-area.axisX.length, y);
        }
        else
        {
            context.strokeStyle = this.chart.chartOptions.gridColor;
            if (this.chart.chartOptions.gridStyle === "dashed")
            {
                for (var x = -4; x >= -area.axisX.length; x -= 4)
                {
                    context.moveTo(x, y);
                    context.lineTo(x + 3, y);
                }
            }
            else if (this.chart.chartOptions.gridStyle === "solid")
            {
                context.moveTo(0, y);
                context.lineTo(-area.axisX.length, y);
            }
        }

        context.stroke();
    };

    iChart.Charting.ChartRenderer.prototype.renderYLabels = function (area, context)
    {
        /// <summary>
        /// Renders ordinate labels, tick marks and grid lines in the specified area to the current canvas context.
        /// </summary>
        /// <param name="area" type="iChart.Charting.ChartArea">Chart area to render the labels for.</param>
        /// <param name="context" type="CanvasRenderingContext2D">Canvas context to render to.</param>

        context.save();
        context.translate(area.axisX.length, 0.5);

        context.font = this.chart.chartOptions.labelFont;
        context.textAlign = "left";
        context.textBaseline = "middle";

        if(this.chart.chartOptions.yLabelsOutside) {
            var interval = (area.axisY.max - area.axisY.min) / (area.axisY.length / 20);
        } else {
            var interval = (area.axisY.max - area.axisY.min) / (area.axisY.length / (area.axisY.length/4));
        }
        if (interval > 0)
        {
            var scale = 0;
            while (interval < 1)
            {
                --scale;
                interval *= 10;
            }

            while (interval >= 10)
            {
                ++scale;
                interval /= 10;
            }

            var scales = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5];
            var j = 0;
            while (interval > scales[j] && j < scales.length)
            {
                ++j;
            }

            interval = (j === scales.length ? 10 : scales[j]) * Math.pow(10, scale);
        }

        var abbrScale = 0;
        var absMaximum = Math.max(Math.abs(area.axisY.min), Math.abs(area.axisY.max));
        if (absMaximum >= 10000000)
        {
            abbrScale = Math.floor(Math.log(absMaximum) / Math.log(1000));
        }

        var precision = interval / absMaximum;
        if (!$.isNumeric(precision) || precision < 1e-4)
        {
            interval = parseFloat((absMaximum / Math.pow(10, this.chart.labelPrecision - 1)).toPrecision(1));
        }

        var hasLabels = false;
        var value = Math.floor(area.axisY.max / interval) * interval;
        if ($.isNumeric(value))
        {
            while (value >= area.axisY.min)
            {
                this.renderYLabel(area, value, abbrScale, context);
                value -= interval;
                hasLabels = true;
            }
        }

        if (!hasLabels)
        {
            this.renderYLabel(area, (area.axisY.max + area.axisY.min) / 2, abbrScale, context);
        }

        context.restore();
    };
})();