

/*
TA.INDICATOR_TEMPLATE = function() {
    this.name = '';
    this.type = '';
    this.DefaultSettings = {};
    this.Settings = {};
};

TA.INDICATOR_TEMPLATE.prototype.SetSettings = function (settings) {
    var name;

    if (!!settings) {
        if (settings != this.DefaultSettings) {
            this.SetSettings(this.DefaultSettings);
        }

        for (name in settings) {
            this.Settings[name] = settings[name];
        }
    }
};
*/

(function (){

    "use strict";

    var series = {
        "chartType": "Line",
        "enabled": true,
        "formatProvider": {
            "decimalPlaces": "2",
            "decimalPrecision": null
        },
        "indicatorIndex": 0,
        "indicatorIndex2": 0,
        "kind": "TA_LIB",
        "name": "",
        "overlay": true,
        "points": [],
        "valuesPerPoint": 1,
        "isStartedFromZero": false,
        "color": "",
        "width": 2,
        "chartArea": "ChartArea1",
        "enableMerge": true,
        "index": 2,
        "closeValueIndex": 0,
        "lowValueIndex": 0,
        "highValueIndex": 0,
        "labels": []
    };


    iChart.Charting.TA = function (settings) {
        this.chart = settings.chart;
    };

    /**
     * Добавляет пользовательскую серию на график
     * @param {!bool}   enable  признак - надо добавить серию или удалить.
     * @param {!number} index   порядковый номер индикатора в хеше графика
     * @param {!{?title: string, data: array, ?color: string, ?width: number}} params  параметры выводимого индикатора
     */
    iChart.Charting.TA.prototype.addCustomIndicatorSerie = function (enable, index, params) {
        if (arguments.length < 3) {
            throw _t('14949', 'Неверные параметры для вывода пользовательской серии.');
        }

        if(enable) {

            this.removeIndicator(index);

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this.chart }),
                indicatorName   = 'ChartAreaI' + index,
                indicatorTitle  = (params.title || indocatorName),
                taData          = params.data,
                taDataLength    = taData.length;

            indicatorArea.axisX.showLabels  = false;
            indicatorArea.enabled           = true;
            indicatorArea.xSeries           = this.chart.areas[0].xSeries;
            indicatorArea.ySeries           = [];
            indicatorArea.name              = indicatorName;

            indicatorArea.title = indicatorTitle;

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = [];

            Series[0] = $.extend(true, {}, series);
            Series[0].indicatorIndex = index || 0;

            Series[0].color = params.color || this.chart.chartOptions.indicatorColors[index][0];
            Series[0].width = params.width || 2;

            Series[0].name      = indicatorTitle;
            Series[0].labels    = this.getLabels(Series[0], []);

            var chartSeries = this.getData();

            for(var j=0; j < taDataLength; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            //console.log(indicatorArea);
            this.chart.areas.push(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: indicatorArea.title, params: null, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.getDefaultParams = function (indicator) {
        var result = {};
        $.each(iChart.indicators[indicator].parameters, function(i, param){
            result[param.Code] = param.Value;
        });

        return result;
    };

    iChart.Charting.TA.prototype.getSeries = function (indicator, params) {

        indicator = indicator || "Volume";
        params = params || "";

        var areas = this.chart.areas;
        for(var i=0; i<areas.length; i++) {
            var found = -1;
            for(var j=0; j<areas[i].ySeries.length; j++) {
                if(areas[i].ySeries[j].kind === "TechnicalAnalysis") {
                    var sNameMatch = areas[i].ySeries[j].name.match(/(.+)\s\((.*)\)/);
                    if(sNameMatch && sNameMatch[1] === indicator && sNameMatch[2] == params) {
                        found = j;
                        break;
                    }
                } else if (areas[i].ySeries[j].kind === indicator) {
                    found = j;
                    break;
                }
            }
            if(found >= 0) {
                break;
            }
        }

        if(found >= 0) {
            //console.log(i,j);
            return {
                xSeries:  this.chart.areas[i].xSeries.slice(0,this.chart.areas[i].xSeries.length - this.chart.chartOptions.futureAmount),
                ySeries:  this.chart.areas[i].ySeries[j].points.slice(0,this.chart.areas[i].xSeries.length - this.chart.chartOptions.futureAmount)
            };
        }

        return false;
    };

    iChart.Charting.TA.prototype.getData = function () {

        var xSeries = this.chart.areas[0].xSeries;
        var ySeries = this.chart.areas[0].ySeries[0];
        var valueSeries = this.getSeries('Volume');

        if(!valueSeries) {
            valueSeries = {};
            valueSeries.ySeries = [];
        }

        var dataShape = [];

        for(var i=0; i<xSeries.length - this.chart.chartOptions.futureAmount; i++) {
            var dateTime = new Date(xSeries[i] * 1000);
            iChart.formatDateTime(dateTime);
            var data = [
                "",
                this.chart._dataSettings.timeframe,
                iChart.formatDateTime(dateTime, 'yyyyMMdd'),
                iChart.formatDateTime(dateTime, 'HHmmss'),
                ySeries['points'][i] != null ? ySeries['points'][i][2] : dataShape[i-1][4],
                ySeries['points'][i] != null ? ySeries['points'][i][0] : dataShape[i-1][5],
                ySeries['points'][i] != null ? ySeries['points'][i][1] : dataShape[i-1][6],
                ySeries['points'][i] != null ? ySeries['points'][i][3] : dataShape[i-1][7],
                valueSeries.ySeries[i] != null ? valueSeries.ySeries[i][0] : 0,
                iChart.formatDateTime(dateTime, 'yyyy-MM-ddTHH:mm:ss'),
                dateTime.getTime(),
                iChart.formatDateTime(dateTime, 'yyyy-MM-ddTHH:mm:ss')
            ];
            dataShape[i] = data;
        }
        //["MTLR","15","20150105","101500",24.5,24.51,23.43,23.91,91345,"2015-01-05T07:15:00.000Z",1420442100000,"2015-01-05T10:15:00"]

        return dataShape;
    };

    iChart.Charting.TA.prototype.mapParam = function (param) {
        var map = {
            "TimePeriod":       'Period',
            "PeriodROC":        'PeriodROC',
            "shift":            'Shift',
            "DeviationsUp":     'StdDevUp',
            "DeviationsDown":   'StdDevDown'
        };
        var result = map[param] || '';

        return result;
    };

    iChart.Charting.TA.prototype.test = function () {
        var TimePeriod = parseInt(this.chart._dataSettings.i0_Period);
        var data = this.getData();
        var result = EMA.calculate(null, null, data, {TimePeriod: TimePeriod});
        var empty = Array(TimePeriod-1);

        result = empty.concat(result);

        var values = this.getSeries('EMA', TimePeriod).ySeries;
        for(var i=0; i<values.length; i++) {
            console.log(i, values[i], result[i], "cl=" + data[i][CLOSE], 'dt=' + (100-values[i]/result[i]*100));
        }

        //console.log(result);
        //return result;
    };

    /**
     * Удалить области индикаторов с графика
     * @param index индеск индикатора.
     * undefined - Удалить все
     */
    iChart.Charting.TA.prototype.removeIndicator = function (index) {
        if(typeof this.chart != "undefined" && !$.isEmptyObject(this.chart.areas)) {
            for (var i = 0; i < this.chart.areas.length; ++i) {
                var a = this.chart.areas[i];

                var indicatorIndex = [];
                for (var j = 0; j < a.ySeries.length; ++j) {
                    if (a.ySeries[j].kind === "TA_LIB" && (a.ySeries[j].indicatorIndex == index || typeof index == 'undefined')) {
                        indicatorIndex.push(a.ySeries[j].indicatorIndex);
                        a.ySeries.splice(j, 1);
                        --j;
                    }
                }
                if (indicatorIndex.length) {
                    if (a.ySeries.length === 0) {
                        if(typeof a.overlay != "undefined") {
                            $(a.overlay.canvas).remove();
                        }
                        var removed = this.chart.areas.splice(i, 1);
                        removed[0].dispose();
                        --i;
                    } else {
                        if(a.title) {
                            a.title = '';
                            $.each(a.ySeries, function (i, series) {
                                if (series.kind === "TA_LIB") {
                                    var legendParams = Object.keys(series.params).map(function (key) {
                                        return series.params[key]
                                    });
                                    a.title += (a.title ? ', ' : '') + (series.name + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));
                                }
                            });
                        }
                    }
                }
            }
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        }
    };

    iChart.Charting.TA.prototype.findArea = function (name) {
        if(typeof this.chart != "undefined" && !$.isEmptyObject(this.chart.areas)) {
            for (var i = 0; i < this.chart.areas.length; ++i) {
                var area = this.chart.areas[i];

                if(area.name == name) {
                    return area;
                }
            }
        }
        return false;
    };

    iChart.Charting.TA.prototype.TRPLN = function (enable, index) {
        if(enable) {
            var amount = 80;
            var c = $('<canvas>').get(0);
            var ctx = iChart.getContext(c);
            var grd = ctx.createLinearGradient(0, 0, amount, 0);
            grd.addColorStop(1, "#016D06");
            grd.addColorStop(0.5, "#FF9B08");
            grd.addColorStop(0, "#FF1608");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, amount, 1);
            var imgData=ctx.getImageData(0,0,amount,1);
            var colors = [];
            for (var i=0;i<imgData.data.length;i+=4)
            {
                var color = "rgb(" + imgData.data[i] + "," + imgData.data[i+1] + "," + imgData.data[i+2] + ")";
                colors.push(color);
            }

            var chartSeries = this.getData();
            var step = 2;
            var taData = Array(amount);
            for(var i=0; i<amount; i++) {
                taData[i] = TA.SMA.justifyCalculate(0, chartSeries.length-1, chartSeries, {TimePeriod: step}, 1);
                var iSeries = $.extend(true, {}, series);
                iSeries.name = "TRPLN" + (i < amount-1 ? '_' + i : ''); //Последняя линия даст команду на пересчет индикатора при обновлении данных
                iSeries.indicatorIndex = index;
                iSeries.color = colors[i];
                iSeries.width = 1;

                for(var j=0; j<taData[i].length; j++) {
                    iSeries.points.push([taData[i][j] === 0 ? null : taData[i][j]]);
                }

                this.chart.areas[0].ySeries.push(iSeries);

                step = step + (step < 100 ? 2 : 3);
            }
            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: "TRPLN", params: null, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.createSeries = function (indicator, index) {
        var iSeries = [];
        index = index || 0;
        for (var i=0; i<this.chart.env.viewData.indicators[indicator].output; i++) {
            iSeries[i] = $.extend(true, {}, series);
            iSeries[i].indicatorIndex = index;

            var colorIndex = index%(this.chart.chartOptions.indicatorColors.length-1);
            var color = this.chart.chartOptions.indicatorColors[colorIndex][i];

            if (this.chart.env.userSettings.chartSettings.indicatorsColor[indicator] &&
                this.chart.env.userSettings.chartSettings.indicatorsColor[indicator][index] &&
                this.chart.env.userSettings.chartSettings.indicatorsColor[indicator][index][i]
            ){
                color = this.chart.env.userSettings.chartSettings.indicatorsColor[indicator][index][i];
            }

            var width = 2;
            if (this.chart.env.userSettings.chartSettings.indicatorsWidth[indicator] &&
                this.chart.env.userSettings.chartSettings.indicatorsWidth[indicator][index] &&
                this.chart.env.userSettings.chartSettings.indicatorsWidth[indicator][index][i]
            ){
                width = this.chart.env.userSettings.chartSettings.indicatorsWidth[indicator][index][i];
            }

            iSeries[i].color = color;
            iSeries[i].width = width;
            iSeries[i].name = indicator;

        }
        return iSeries;
    };

    iChart.Charting.TA.prototype.getLabels = function (Series, params, sufix) {
        var legendParams = [];
        sufix = sufix || '';
        for(var k in params) {
            legendParams.push(params[k])
        }
        legendParams = legendParams.length ? "(" + legendParams.join(",") + ")" : '';

        var color = Series.color.replace(/rgba\((.+),[^,]+\)/, "rgb($1)");
        var $label = $("<span/>", { "class": "m-chart-legend-color" }).css({ "background-color": color }).html("&nbsp;");
        $label = $label.add($("<span/>", { "class": "m-chart-legend-name" }).css({ "color": color }).text(Series.name + legendParams + sufix));
        var labelHtml = $("<div/>").append($label).html();
        return [[0, labelHtml, Series.name + legendParams + sufix]];

    };

    iChart.Charting.TA.prototype.BBANDS = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'BBANDS',
            params = params || this.getDefaultParams(INDICATOR);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);
            //------------------------------------------------------------------------------------------------------------------------
            Series[0].labels = this.getLabels(Series[0], params, ' Upper');
            Series[0].params = params;
            //Series[0].chartType = "Point";

            for (var j = 0; j < taData['UpperBand'].length; j++) {
                Series[0].points.push([taData['UpperBand'][j] === 0 ? null : taData['UpperBand'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].labels = this.getLabels(Series[1], params, ' Middle');
            Series[1].params = params;

            for (var j = 0; j < taData['MiddleBand'].length; j++) {
                Series[1].points.push([taData['MiddleBand'][j] === 0 ? null : taData['MiddleBand'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[1]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[2].labels = this.getLabels(Series[2], params, ' Lower');
            Series[2].params = params;

            for (var j = 0; j < taData['LowerBand'].length; j++) {
                Series[2].points.push([taData['LowerBand'][j] === 0 ? null : taData['LowerBand'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[2]);
            //------------------------------------------------------------------------------------------------------------------------

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.AD = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'AD',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this.chart });
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = INDICATOR;

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            this.chart.areas.push(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ADOSC = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ADOSC',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ADX = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ADX',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ADXDI = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ADXDI',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);

            Series[0].params = params;
            Series[0].chartArea = indicatorArea.name;
            Series[0].labels = this.getLabels(Series[0], params);

            var taData = {};
            var chartSeries = this.getData();
            taData['ADX'] = TA.ADX.justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData['ADX'].length; j++) {
                Series[0].points.push([taData['ADX'][j] === 0 ? null : taData['ADX'][j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            Series[1].name = "ADXDI";
            Series[1].params = params;
            Series[1].chartArea = indicatorArea.name;
            Series[1].labels = this.getLabels(Series[1], params, ' +DI');

            var chartSeries = this.getData();
            taData['PLUS_DI'] = TA.PLUS_DI.justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData['PLUS_DI'].length; j++) {
                Series[1].points.push([taData['PLUS_DI'][j] === 0 ? null : taData['PLUS_DI'][j]]);
            }

            indicatorArea.ySeries.push(Series[1]);

            Series[2].name = "ADXDI";
            Series[2].params = params;
            Series[2].chartArea = indicatorArea.name;
            Series[2].labels = this.getLabels(Series[2], params, ' -DI');

            var chartSeries = this.getData();
            taData['MINUS_DI'] = TA.MINUS_DI.justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData['MINUS_DI'].length; j++) {
                Series[2].points.push([taData['MINUS_DI'][j] === 0 ? null : taData['MINUS_DI'][j]]);
            }

            indicatorArea.ySeries.push(Series[2]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.AROON = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'AROON',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);

            Series[0].chartArea = indicatorArea.name;
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params, ' Down');

            for (var j = 0; j < taData['AroonDown'].length; j++) {
                Series[0].points.push([taData['AroonDown'][j] === 0 ? null : taData['AroonDown'][j]]);
            }
            indicatorArea.ySeries.push(Series[0]);

            //----------------------------------------------------------------------------------
            Series[1].chartArea = indicatorArea.name;
            Series[1].params = params;
            Series[1].labels = this.getLabels(Series[1], params, ' Up');

            for (var j = 0; j < taData['AroonUp'].length; j++) {
                Series[1].points.push([taData['AroonUp'][j] === 0 ? null : taData['AroonUp'][j]]);
            }

            indicatorArea.ySeries.push(Series[1]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ATR = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ATR',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.CCI = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'CCI',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.CHV = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'CHV',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.DPO = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'DPO',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.EMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'EMA';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {

                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ENV = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ENV';
            params = params || this.getDefaultParams(INDICATOR);
            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params, 1);

            var Series = this.createSeries(INDICATOR, index);
            //------------------------------------------------------------------------------------------------------------------------

            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[1], params, ' Upper');

            for (var j = 0; j < taData['Upper'].length; j++) {
                Series[0].points.push([taData['Upper'][j] === 0 ? null : taData['Upper'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------

            Series[1].labels = this.getLabels(Series[0], params, ' Lower');

            for (var j = 0; j < taData['Lower'].length; j++) {
                Series[1].points.push([taData['Lower'][j] === 0 ? null : taData['Lower'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[1]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.MACD = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'MACD',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this.chart });
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = '';

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);

            //------------------------------------------------------------------------------------------------------------------------
            Series[0].params = params;
            Series[0].indicatorIndex = index;
            Series[0].labels = this.getLabels(Series[0], params);

            for (var j = 0; j < taData['MACD'].length; j++) {
                Series[0].points.push([taData['MACD'][j] === 0 ? null : taData['MACD'][j]]);
            }
            indicatorArea.ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].params = params;
            Series[1].indicatorIndex = index;
            Series[1].labels = this.getLabels(Series[1], params);

            for (var j = 0; j < taData['MACDSignal'].length; j++) {
                Series[1].points.push([taData['MACDSignal'][j] === 0 ? null : taData['MACDSignal'][j]]);
            }
            indicatorArea.ySeries.push(Series[1]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[2].params = params;
            Series[2].indicatorIndex = index;
            Series[2].chartType = "Column";
            Series[2].labels = this.getLabels(Series[2], params);

            for (var j = 0; j < taData['MACDHist'].length; j++) {
                Series[2].points.push([taData['MACDHist'][j] === 0 ? null : taData['MACDHist'][j]]);
            }
            indicatorArea.ySeries.push(Series[2]);
            //------------------------------------------------------------------------------------------------------------------------

            this.chart.areas.push(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.MEDPRICE = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'MEDPRICE';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.MFI = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'MFI',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.OBV = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'OBV',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = '';
            this.chart.areas.push(indicatorArea);

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.PSAR = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'PSAR';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].chartType = "Point";

            var chartSeries = this.getData();
            var taData = TA.SAR.justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {

                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ROC = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ROC',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].chartArea = indicatorArea.name;

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.RSI = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'RSI',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                indicatorArea.overlay = new iChart.Charting.ChartAreaLayer(this.chart);

                var element = indicatorArea.overlay.createElement("HorizontalLine");
                element.points = [{'x':$.now(), 'y':30}];
                element.hasSettings = true;
                element.setSettings({drawLabel: false, strokeStyle: "#ff5555", lineWidth: 1});
                indicatorArea.overlay.history.push(element);

                var element = indicatorArea.overlay.createElement("HorizontalLine");
                element.points = [{'x':$.now(), 'y':70}];
                element.hasSettings = true;
                element.setSettings({drawLabel: false, strokeStyle: "#ff5555", lineWidth: 1});
                indicatorArea.overlay.history.push(element);

                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params);

            for(var j=0; j<taData.length; j++) {

                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            //console.log(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: "RSI", params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.SMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'SMA';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params, 1);
            for (var j = 0; j < taData.length; j++) {

                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.STDDEV = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'STDDEV',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].chartArea = indicatorArea.name;

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.TEMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'TEMA';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.TRIMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'TRIMA';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.TYPPRICE = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'TYPPRICE';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.VPT = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'VPT',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = '';
            this.chart.areas.push(indicatorArea);

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].indicatorIndex = index;

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.WCLPRICE = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'WCLPRICE';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);
            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.WILLR = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'WILLR',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            indicatorArea = this.findArea(areaName);

            if(!indicatorArea) {
                var indicatorArea = new iChart.Charting.ChartArea({"chart": this.chart});
                indicatorArea.axisX.showLabels = false;
                indicatorArea.enabled = true;
                indicatorArea.xSeries = this.chart.areas[0].xSeries;
                indicatorArea.ySeries = [];
                indicatorArea.name = areaName;
                indicatorArea.title = '';
                this.chart.areas.push(indicatorArea);
            }

            var legendParams = Object.keys(params).map(function (key) {return params[key]});
            indicatorArea.title += (indicatorArea.title ? ', ' : '') +  (INDICATOR + (legendParams.length ? "(" + legendParams.join(",") + ")" : ''));

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].indicatorIndex = index;

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
            for(var j=0; j<taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            indicatorArea.ySeries.push(Series[0]);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.WMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'WMA';
            params = params || this.getDefaultParams(INDICATOR);

            var Series = this.createSeries(INDICATOR, index);
            Series[0].params = params;
            Series[0].labels = this.getLabels(Series[0], params);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params, 1);

            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }

            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.STOCH = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'STOCH',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this.chart });
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = INDICATOR;
            indicatorArea.overlay = new iChart.Charting.ChartAreaLayer(this.chart);

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);

            Series[0].params = params;
            Series[0].indicatorIndex = index;
            Series[0].labels = this.getLabels(Series[0], params, 'K');

            for (var j = 0; j < taData['slowK'].length; j++) {
                Series[0].points.push([taData['slowK'][j] === 0 ? null : taData['slowK'][j]]);
            }
            indicatorArea.ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].params = params;
            Series[1].indicatorIndex = index;
            Series[1].labels = this.getLabels(Series[1], params, "D");

            for (var j = 0; j < taData['slowD'].length; j++) {
                Series[1].points.push([taData['slowD'][j] === 0 ? null : taData['slowD'][j]]);
            }
            indicatorArea.ySeries.push(Series[1]);

            var element = indicatorArea.overlay.createElement("HorizontalLine");
            element.points = [{'x':$.now(), 'y':20}];
            element.hasSettings = true;
            element.setSettings({drawLabel: false, strokeStyle: "#ff5555", lineWidth: 1});
            indicatorArea.overlay.history.push(element);

            var element = indicatorArea.overlay.createElement("HorizontalLine");
            element.points = [{'x':$.now(), 'y':80}];
            element.hasSettings = true;
            element.setSettings({drawLabel: false, strokeStyle: "#ff5555", lineWidth: 1});
            indicatorArea.overlay.history.push(element);

            this.chart.areas.push(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ELDR = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ELDR',
                areaName = 'ChartAreaI_' + index + '_' + INDICATOR;
            params = params || this.getDefaultParams(INDICATOR);

            var indicatorArea = new iChart.Charting.ChartArea({ "chart": this.chart });
            indicatorArea.axisX.showLabels = false;
            indicatorArea.enabled = true;
            indicatorArea.xSeries = this.chart.areas[0].xSeries;
            indicatorArea.ySeries = [];
            indicatorArea.name = areaName;
            indicatorArea.title = INDICATOR;

            indicatorArea.onClose = function ()
            {
                this.chart.clearIndicators(this);
            };

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);


            Series[0].params = params;
            Series[0].indicatorIndex = index;
            Series[0].chartType = "Column";
            Series[0].labels = this.getLabels(Series[0], params);

            for (var j = 0; j < taData['ELDR'].length; j++) {
                Series[0].points.push([taData['ELDR'][j] === 0 ? null : taData['ELDR'][j]]);
            }
            indicatorArea.ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].params = params;
            Series[1].indicatorIndex = index;
            Series[1].name = 'Signal';
            Series[1].labels = this.getLabels(Series[1], params);

            for (var j = 0; j < taData['Signal'].length; j++) {
                Series[1].points.push([taData['Signal'][j] === 0 ? null : taData['Signal'][j]]);
            }
            indicatorArea.ySeries.push(Series[1]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[2].params = params;
            Series[2].indicatorIndex = index;
            Series[2].name = 'Smooth';
            Series[2].labels = this.getLabels(Series[2], {p:2});

            for (var j = 0; j < taData['Smooth'].length; j++) {
                Series[2].points.push([taData['Smooth'][j] === 0 ? null : taData['Smooth'][j]]);
            }
            indicatorArea.ySeries.push(Series[2]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[3].params = params;
            Series[3].indicatorIndex = index;
            Series[3].name = 'EMA';
            Series[3].labels = this.getLabels(Series[3], params);

            for (var j = 0; j < taData['EMA'].length; j++) {
                Series[3].points.push([taData['EMA'][j] === 0 ? null : taData['EMA'][j]]);
            }

            this.chart.areas[0].ySeries.push(Series[3]);

            this.chart.areas.push(indicatorArea);

            for (var i = 0; i < this.chart.areas.length; ++i)
            {
                this.chart.areas[i].setMinMax();
            }

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });

        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.ZLEMA = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ZLEMA';
            params = params || this.getDefaultParams(INDICATOR);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);
            //------------------------------------------------------------------------------------------------------------------------
            Series[0].labels = this.getLabels(Series[0], params);
            Series[0].params = params;

            for (var j = 0; j < taData.length; j++) {
                Series[0].points.push([taData[j] === 0 ? null : taData[j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

    iChart.Charting.TA.prototype.PCH = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'PCH';
            params = params || this.getDefaultParams(INDICATOR);

            var chartSeries = this.getData();
            var taData = TA[INDICATOR].justifyCalculate(0, chartSeries.length - 1, chartSeries, params);

            var Series = this.createSeries(INDICATOR, index);
            //------------------------------------------------------------------------------------------------------------------------
            Series[0].labels = this.getLabels(Series[0], params, ' Lower');
            Series[0].params = params;
            //Series[0].chartType = "Point";

            for (var j = 0; j < taData['low'].length; j++) {
                Series[0].points.push([taData['low'][j] === 0 ? null : taData['low'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].labels = this.getLabels(Series[1], params, ' Upper');
            Series[1].params = params;

            for (var j = 0; j < taData['high'].length; j++) {
                Series[1].points.push([taData['high'][j] === 0 ? null : taData['high'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[1]);

            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };

})();

