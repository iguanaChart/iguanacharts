

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
            var ctx = c.getContext("2d");
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
        return [[0, labelHtml]];

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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
            taData['ADX'] = TA[INDICATOR].justifyCalculate(0, chartSeries.length-1, chartSeries, params, 1);
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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

    iChart.Charting.TA.prototype.ROC = function (enable, index, params) {
        if(enable) {
            var INDICATOR = 'ROC',
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
            var INDICATOR = 'RSI';
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
                areaName = 'ChartAreaI_' + INDICATOR;
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
            //Series[0].chartType = "Point";

            for (var j = 0; j < taData['out1'].length; j++) {
                Series[0].points.push([taData['out1'][j] === 0 ? null : taData['out1'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            /*Series[1].labels = this.getLabels(Series[1], params);
            Series[1].params = params;

            for (var j = 0; j < taData['out2'].length; j++) {
                Series[1].points.push([taData['out2'][j] === 0 ? null : taData['out2'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[1]);*/

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
            Series[0].labels = this.getLabels(Series[0], params, ' Upper');
            Series[0].params = params;
            //Series[0].chartType = "Point";

            for (var j = 0; j < taData['high'].length; j++) {
                Series[0].points.push([taData['high'][j] === 0 ? null : taData['high'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[0]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[1].labels = this.getLabels(Series[1], params, ' Lower');
            Series[1].params = params;

            for (var j = 0; j < taData['low'].length; j++) {
                Series[1].points.push([taData['low'][j] === 0 ? null : taData['low'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[1]);

            //------------------------------------------------------------------------------------------------------------------------
            Series[2].labels = this.getLabels(Series[2], params, ' Middle');
            Series[2].params = params;

            for (var j = 0; j < taData['middle'].length; j++) {
                Series[2].points.push([taData['middle'][j] === 0 ? null : taData['middle'][j]]);
            }
            this.chart.areas[0].ySeries.push(Series[2]);


            $(this.chart.env.container).trigger('iguanaChartEvents', ['indicatorDataReady', {name: INDICATOR, params: params, data:taData}]);
            this.chart.render({"forceRecalc": true, "resetViewport": false, "testForIntervalChange": false});
        } else {
            this.removeIndicator(index);
        }
    };


    iChart.Charting.TA.prototype.analyseResistSupport = function (TimePeriod) {

        TimePeriod = TimePeriod || 8;

        var data = this.getData();
        var dataRsi = TA.RSI.justifyCalculate(0, data.length-1, data, {TimePeriod: TimePeriod});
        var low = [], high = [];

        $.each(data, function(i,n) {
            low.push(n[TA.LOW]);
            high.push(n[TA.HIGH]);
        });

        var Distans = 13.0;     // Смещение уровня RSI
        var Period_Trade = 1;//this.chart..userSettings.dataSettings.timeframe;
        var Low_RSI = 35.0;  // Нижний уровень RSI для нахождения экстремумов
        var High_RSI= 65.0;  // Верхний уровень RSI для нахождения экстремумов

        var First_Ext;

        var Candles_Ext = {
            p_1: false,
            p_2: false,
            p_3: false,
            p_4: false
        };

        function Ext_1( low, high, candles, dataRsi, distans)
        {
            var m_rsi = [], m_high = [], m_low = []; //инициализация массивов

            for(var i=candles.length-1; i>=0; i--) {
                m_low.push(candles[i][TA.LOW]);
                m_high.push(candles[i][TA.HIGH]);
                m_rsi.push(dataRsi[i]);
            };

            //console.log(m_low, m_high, m_rsi);

            var index = -1;     //инициализация переменной, которая будет содержать индекс искомого бара
            var flag=false;        //эта переменная нужна, чтобы не анализировать свечи на текущем незавершенном тренде
            var ext_max = true;    //переменные типа bool используются для того, чтобы в нужный момент прекратить анализ баров
            var ext_min = true;
            var min=100000000.0;  //переменные для выявления максимальных и минимальных цен
            var max= 0.0;

            for(var i=0;i<candles.length;i++) //цикл по барам
            {
                var rsi = m_rsi[i];                                   //получаем значения индикатора RSI
                var price_max = m_high[i]; //NormalizeDouble(m_high[i], digits);   //цены High
                var price_min = m_low[i]; //NormalizeDouble(m_low[i], digits);    //цены Low выбранного бара

                if(flag==false) //условие для того, чтобы не начать искать экстремум на незавершившемся тренде
                {
                    if(rsi<=low||rsi>=high) //если первые бары в зонах перекупл. или перепрод.,
                        continue;            //то переходим к следующему бару
                    else flag = true;       //если нет, то продолжаем анализ
                }
                if(rsi<low) //если найдено пересечение RSI c уровнем low
                {
                    if(ext_min==true) //если RSI еще не пересекал уровень high
                    {
                        if(ext_max==true) //если еще не выставлен запрет на поиск максимального экстремума,
                        {
                            ext_max=false; //то запрещаем искать максимальный экстремум
                            if(distans>=0) high=high-distans; //изменяем уровень high, по которому потом
                        }                                  //будет производиться поиск второго бара
                        if(price_min<min) //ищем и замоминаем индекс первого бара
                        {               //сравнивая цены Low свечей
                            min=price_min;
                            index=i;
                        }
                    }
                    else break; //Выходим из цикла, поскольку раз искать минимальный экстремум уже запрещено,значит найден уже максимальный
                }
                if(rsi>high) //далее алгоритм тот же, только по поиску максимального экстремума
                {
                    if(ext_max==true)
                    {
                        if(ext_min==true)
                        {
                            ext_min=false; //если нужно, запрещаем искать минимальный экстремум
                            if(distans>=0) low=low+distans;
                        }
                        if(price_max>max) //ищем и запоминаем экстремум
                        {
                            max=price_max;
                            index=i;
                        }
                    }
                    else break; //Выходим из цикла, поскольку раз искать максимальный экстремум уже запрещено, значит найден уже минимальный
                }
            }
            //console.log(index, m_rsi[index]);
            return(index);
        }

        function Ext_2( low, high, candles, dataRsi, candles_ext, n_bar, distans, first_ext)
        {
            var m_rsi = [], m_high = [], m_low = []; //инициализация массивов

            var rev_candles = [];
            for(var i=candles.length-1; i>=0; i--) {
                rev_candles.push(candles[i]);
            }
            candles = rev_candles;

            for(var i=0; i<candles.length; i++) {
                m_low.push(candles[i][TA.LOW]);
                m_high.push(candles[i][TA.HIGH]);
                m_rsi.push(dataRsi[dataRsi.length-1 - i]);
            };

            //console.log(m_low, m_high, m_rsi);

            var index=-1;
            var p_1=-1;    //индекс искомого бара, индекс предыдущего бара
            var high_level=false; //переменные для определения типа искомого бара
            var low_level = false;
            var _start=false;    //переменные типа bool используются для того, чтобы в нужный момент прекратить анализ баров
            var rsi,min,max,price_max,price_min;
            min=100000000.0; max=0.0;

            //--- в данном блоке определяем, на какой линии (сопротивления или поддержки) должен лежать искомый экстремум
            if(n_bar!=3)
            {
                if(first_ext==true)//если первая точка была максимальной
                {
                    low_level=true;//то эта должна быть минимальной
                    if(distans>=0) low=low+distans;
                }
                else //если минимальной
                {
                    high_level = true;
                    if(distans>=0) high = high-distans;
                }
            }
            else
            {
                if(first_ext==false)//если первая точка была минимальной
                {
                    low_level=true;//то  и эта должна быть минимальной
                    if(distans>=0) high=high-distans;
                }
                else //если максимальной
                {
                    high_level = true;
                    if(distans>=0) low = low+distans;
                }
            }

            switch(n_bar) //находим индекс предыдущего бара
            {
                case 2: p_1 = candles_ext.p_1; break;
                case 3: p_1 = candles_ext.p_2; break;
                case 4: p_1 = candles_ext.p_3; break;
            }

            for(var i=p_1;i<candles.length;i++) //анализируем оставшиеся бары
            {
                rsi=m_rsi[i];
                price_max = m_high[i];
                price_min = m_low[i];
                if(_start==true && ((low_level==true && rsi>=high) || (high_level==true && rsi<=low)))
                {
                    break; //выходим из цикла, если второй экстремум уже найден, а RSI уже пересек противоположный уровень
                }
                if(low_level==true) //если ищем минимальный экстремум
                {
                    if(rsi<=low)
                    {
                        if(_start==false) _start=true;
                        if(price_min<min)
                        {
                            min=price_min;
                            index=i;
                        }
                    }
                }
                else //если ищем максимальный экстремум
                {
                    if(rsi>=high)
                    {
                        if(_start==false) _start=true;
                        if(price_max>=max)
                        {
                            max=price_max;
                            index=i;
                        }
                    }
                }
            }

            return(index);
        }

        function One_ext(candles_ext, //переменная типа структуры для получения индекса первого бара
            dataRsi,         //хэндл индикатора
            low)        //заданный уровень перепроданности RSI (можно использовать и high уровень)
        {
            var m_rsi = [];               //инициализация массива данных индикатора

            for(var i=dataRsi.length-1; i>=0; i--) {
                if(typeof dataRsi[i] != "undefined") {
                    m_rsi.push(dataRsi[i]);
                }
            }


            var rsi=m_rsi[candles_ext.p_1]; //определяем значение RSI на баре с первым экстремумом

            if(rsi<=low)                      //если значение меньше нижнего уровня,
                return(false);                 //то первый экстремум был минимальным
            else                              //если нет,
                return(true);                     //то максимальным
        }


        function calculate()
        {
            Candles_Ext.p_1=Ext_1(Low_RSI,High_RSI,data,dataRsi,Distans,Period_Trade); //находим индекс бара первого экстремума
            if(Candles_Ext.p_1<0)
            {
                console.log("analyseResistSupport: В истории недостаточно баров для анализа 1");
                return 0;
            }
            if(Candles_Ext.p_1>0) First_Ext=One_ext(Candles_Ext, dataRsi,Low_RSI,Period_Trade);
            Candles_Ext.p_2=Ext_2(Low_RSI,High_RSI,data,dataRsi,Candles_Ext,2,Distans,First_Ext,Period_Trade); //находим индекс бара второго экстремума
            if(Candles_Ext.p_2<0)
            {
                console.log("analyseResistSupport: В истории недостаточно баров для анализа 2");
                return 0;
            }
            Candles_Ext.p_3=Ext_2(Low_RSI,High_RSI,data,dataRsi,Candles_Ext,3,Distans,First_Ext,Period_Trade); //находим индекс бара третьего экстремума
            if(Candles_Ext.p_3<0)
            {
                console.log("analyseResistSupport: В истории недостаточно баров для анализа 3");
                return 0;
            }
            Candles_Ext.p_4=Ext_2(Low_RSI,High_RSI,data,dataRsi,Candles_Ext,4,Distans,First_Ext,Period_Trade); //находим индекс бара последнего экстремума
            if(Candles_Ext.p_4<0)
            {
                console.log("analyseResistSupport: В истории недостаточно баров для анализа 4");
                return 0;
            }
            return 1;
        }

        //Candles_Ext.p_1=Ext_1(Low_RSI,High_RSI,data,dataRsi,Distans,Period_Trade); //находим индекс бара первого экстремума
        //
        //if(Candles_Ext.p_1>0) {
        //    First_Ext=One_ext(Candles_Ext, dataRsi,Low_RSI,Period_Trade);
        //}
        //
        //Candles_Ext.p_2=Ext_2(Low_RSI,High_RSI,data,dataRsi,Candles_Ext,2,Distans,First_Ext,Period_Trade); //находим индекс бара второго экстремума
        //console.log(Candles_Ext, First_Ext);

        //var idx = Ext_1(Low_RSI, High_RSI, data, dataRsi, Distans, Period_Trade);

        function findChannel (data, section) {
            var channelHeight = 0;
            for(var i=section[0].x; i<= Math.min(section[1].x,data.length-1); i++) {
                var linePt = iChart.getThirdPoint({'x':section[0].x, 'y':section[0].y}, {'x':section[1].x, 'y':section[1].y}, i);
                channelHeight = Math.max(channelHeight, Math.abs(linePt.y - (data[i][TA.OPEN] + data[i][TA.CLOSE])/2));
            }
            return channelHeight;
        }

        function findExts (data, section, sectionType, param, accuracy) {

            param = param || "d";
            var dParam = "d" + param;

            var prevPoint = {},
                currPoint = {},
                extPionts = [],
                needTurn = false;

            var channelHeight = findChannel(data, section);

            for(var i=data.length-1; i>=section[0].x; i--) {
                currPoint = {
                    index: i,
                    time: data[i][TA.FULLTIME],
                    h: data[i][TA.HIGH],
                    l: data[i][TA.LOW],
                    o: data[i][TA.OPEN],
                    c: data[i][TA.CLOSE],
                    av1: (data[i][TA.OPEN] + data[i][TA.CLOSE]) / 2,
                    av2: (data[i][TA.HIGH] + data[i][TA.LOW]) / 2
                };

                var linePt = iChart.getThirdPoint({'x':section[0].x, 'y':section[0].y}, {'x':section[1].x, 'y':section[1].y}, i);
                currPoint['dh'] =  Math.abs(linePt.y - currPoint.h);
                currPoint['dl'] =  Math.abs(linePt.y - currPoint.l);
                currPoint['do'] =  Math.abs(linePt.y - currPoint.o);
                currPoint['dc'] =  Math.abs(linePt.y - currPoint.c);
                currPoint['dav1'] =  Math.abs(linePt.y - currPoint.av1);
                currPoint['dav2'] =  Math.abs(linePt.y - currPoint.av2);


                if(i == section[2].x || i == section[3].x) {
                    extPionts.push(currPoint);
                    prevPoint = $.extend({}, currPoint);
                    needTurn = true;
                    i--;
                } else {

                    if ($.isEmptyObject(prevPoint)) {
                        prevPoint = $.extend({}, currPoint);
                        if (currPoint[dParam] / channelHeight < accuracy) {
                            extPionts.push(currPoint);
                            needTurn = true;
                        }
                        continue;
                    } else {

                        if (currPoint[dParam] > prevPoint[dParam] && !needTurn) {
                            if (prevPoint[dParam] / channelHeight < accuracy) {
                                extPionts.push(prevPoint);
                                needTurn = true;
                            }
                        }

                        if(sectionType == "support") {
                            if (currPoint[dParam] < prevPoint[dParam] && needTurn) {
                                if (Math.abs(extPionts[extPionts.length - 1][param] - prevPoint[param]) / channelHeight > 0.15) {
                                    needTurn = false;
                                }
                            }
                        } else if(sectionType == "resist") {
                            if (currPoint[dParam] > prevPoint[dParam] && needTurn) {
                                if (Math.abs(extPionts[extPionts.length - 1][param] - prevPoint[param]) / channelHeight > 0.15) {
                                    needTurn = false;
                                }
                            }
                        }

                        prevPoint = $.extend({}, currPoint);
                    }
                }

            }

            if(sectionType == "support") {
                //удаление точек у которых разница с соседними очень мала
                for (var i = 0; i < extPionts.length; i++) {
                    if ((typeof data[extPionts[i].index - 1] != "undefined" && Math.abs(data[extPionts[i].index - 1][TA.HIGH] - extPionts[i].l) / channelHeight < 0.005) ||
                        (typeof data[extPionts[i].index + 1] != "undefined" && Math.abs(data[extPionts[i].index + 1][TA.HIGH] - extPionts[i].l) / channelHeight < 0.005)
                    ) {
                        extPionts.splice(i, 1);
                        --i;
                    }
                }
            } else if(sectionType == "resist") {
                //удаление точек у которых разница с соседними очень мала
                for (var i = 0; i < extPionts.length; i++) {
                    if ((typeof data[extPionts[i].index - 1] != "undefined" && Math.abs(data[extPionts[i].index - 1][TA.HIGH] - extPionts[i].l) / channelHeight < 0.005) ||
                        (typeof data[extPionts[i].index + 1] != "undefined" && Math.abs(data[extPionts[i].index + 1][TA.HIGH] - extPionts[i].l) / channelHeight < 0.005)
                    ) {
                        extPionts.splice(i, 1);
                        --i;
                    }
                }

            }

            return extPionts;
        }

        if(calculate()) {
            //console.log(Candles_Ext);
            var points = [];

            if(First_Ext) {
                points[0] = [data[data.length - 1 - Candles_Ext.p_1][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_1][TA.HIGH], data.length - 1 - Candles_Ext.p_1];
                points[1] = [data[data.length - 1 - Candles_Ext.p_2][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_2][TA.LOW], data.length - 1 - Candles_Ext.p_2];
                points[2] = [data[data.length - 1 - Candles_Ext.p_3][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_3][TA.HIGH], data.length - 1 - Candles_Ext.p_3];
                points[3] = [data[data.length - 1 - Candles_Ext.p_4][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_4][TA.LOW], data.length - 1 - Candles_Ext.p_4];
            } else {
                points[0] = [data[data.length - 1 - Candles_Ext.p_1][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_1][TA.LOW], data.length - 1 - Candles_Ext.p_1];
                points[1] = [data[data.length - 1 - Candles_Ext.p_2][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_2][TA.HIGH], data.length - 1 - Candles_Ext.p_2];
                points[2] = [data[data.length - 1 - Candles_Ext.p_3][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_3][TA.LOW], data.length - 1 - Candles_Ext.p_3];
                points[3] = [data[data.length - 1 - Candles_Ext.p_4][TA.FULLTIME], data[data.length - 1 - Candles_Ext.p_4][TA.HIGH], data.length - 1 - Candles_Ext.p_4];
            }

            var itPnts = iChart.getIntersection(
                {'x':points[0][2], 'y':points[0][1]},
                {'x':points[2][2], 'y':points[2][1]},
                {'x':points[1][2], 'y':points[1][1]},
                {'x':points[3][2], 'y':points[3][1]}
            );

            //console.log('points', points);
            //console.log('Intersection', itPnts);

            var fromAll = points[3][2] - (points[0][2]-points[3][2]);
            fromAll = Math.max(fromAll, 0);
            var to = points[0][2] + (points[0][2]-points[3][2]);
            to = Math.min(to, this.chart.areas[0].xSeries.length-1);

            var restrict1 = 0,
                restrict2 = this.chart.areas[0].xSeries.length-1;

            //пересечение слева
            if(itPnts.x < points[3][2]) {
                restrict1 = itPnts.x;
            }

            //пересечение справа
            if(itPnts.x > points[0][2]) {
                restrict2 = itPnts.x;
            }

            fromAll = Math.floor(Math.max(fromAll, restrict1));
            to = Math.ceil(Math.min(to, restrict2, this.chart.areas[0].xSeries.length-1, (restrict1 ? (data.length + 15) : data.length + 30)));

            //console.log(fromAll, to);

            var supportFound = false,
                supportPoints = [],
                resistFound = false,
                resistPoints = [];

            if(First_Ext) {
                for(var i=points[3][2]; i>=fromAll; i--) {
                    var supportTest = iChart.getThirdPoint({'x':points[1][2], 'y':points[1][1]}, {'x':points[3][2], 'y':points[3][1]}, i);
                    if(Math.max(data[i][TA.OPEN], data[i][TA.CLOSE]) < supportTest.y) {
                        supportFound = true;
                    }
                    if(!supportFound) {
                        supportTest['time'] = data[i][TA.FULLTIME];
                        supportPoints[0] = supportTest;
                    }

                    var resistTest = iChart.getThirdPoint({'x':points[0][2], 'y':points[0][1]}, {'x':points[2][2], 'y':points[2][1]}, i);
                    if(!resistFound) {
                        resistTest['time'] = data[i][TA.FULLTIME];
                        resistPoints[0] = resistTest;
                    }
                    if(Math.min(data[i][TA.OPEN], data[i][TA.CLOSE]) > resistTest.y) {
                        resistFound = true;
                    }

                }

                supportPoints[1] = iChart.getThirdPoint({'x':points[1][2], 'y':points[1][1]}, {'x':points[3][2], 'y':points[3][1]}, to);
                supportPoints[1]['time'] = this.chart.areas[0].xSeries[to]*1000;
                supportPoints[2] = {'x':points[1][2], 'y':points[1][1], time: points[1][0]};
                supportPoints[3] = {'x':points[3][2], 'y':points[3][1], time: points[3][0]};
                resistPoints[1] = iChart.getThirdPoint({'x':points[0][2], 'y':points[0][1]}, {'x':points[2][2], 'y':points[2][1]}, to);
                resistPoints[1]['time'] = this.chart.areas[0].xSeries[to]*1000;
                resistPoints[2] = {'x':points[0][2], 'y':points[0][1], time: points[0][0]};
                resistPoints[3] = {'x':points[2][2], 'y':points[2][1], time: points[2][0]};

            } else {
                for(var i=points[3][2]; i>=fromAll; i--) {
                    var supportTest = iChart.getThirdPoint({'x':points[0][2], 'y':points[0][1]}, {'x':points[2][2], 'y':points[2][1]}, i);
                    if(!supportFound) {
                        supportTest['time'] = data[i][TA.FULLTIME];
                        supportPoints[0] = supportTest;
                    }

                    if(Math.max(data[i][TA.OPEN], data[i][TA.CLOSE]) < supportTest.y || supportTest.y < 0) {
                        supportFound = true;
                    }

                    var resistTest = iChart.getThirdPoint({'x':points[1][2], 'y':points[1][1]}, {'x':points[3][2], 'y':points[3][1]}, i);
                    if(Math.min(data[i][TA.OPEN], data[i][TA.CLOSE]) > resistTest.y) {
                        resistFound = true;
                    }
                    if(!resistFound) {
                        resistTest['time'] = data[i][TA.FULLTIME];
                        resistPoints[0] = resistTest;
                    }
                }

                supportPoints[1] = iChart.getThirdPoint({'x':points[0][2], 'y':points[0][1]}, {'x':points[2][2], 'y':points[2][1]}, to);
                supportPoints[1]['time'] = this.chart.areas[0].xSeries[to]*1000;
                supportPoints[2] = {'x':points[0][2], 'y':points[0][1], time: points[0][0]};
                supportPoints[3] = {'x':points[2][2], 'y':points[2][1], time: points[2][0]};
                resistPoints[1] = iChart.getThirdPoint({'x':points[1][2], 'y':points[1][1]}, {'x':points[3][2], 'y':points[3][1]}, to);
                resistPoints[1]['time'] = this.chart.areas[0].xSeries[to]*1000;
                resistPoints[2] = {'x':points[1][2], 'y':points[1][1], time: points[1][0]};
                resistPoints[3] = {'x':points[3][2], 'y':points[3][1], time: points[3][0]};

            }

            var channelHeightSup = findChannel(data, supportPoints);
            var channelHeightRes = findChannel(data, resistPoints);

            //console.log(supportPoints, resistPoints);
            //console.log(channelHeightSup, channelHeightRes);

            var extTypeSup = "l",
                extTypeRes = "h",
                accuracy = 0.05,
                extSupportPionts = findExts(data, supportPoints, 'support', extTypeSup, accuracy),
                extResistPionts = findExts(data, resistPoints, 'resist', extTypeRes, accuracy);


            /*
             //SupportChannel
             var element = this.chart.overlay.createElement("Line");
             element.settings = {fillStyle: '#FF0000',
             strokeStyle: '#FF0000',
             lineWidth: 2};
             element.points = [{'x':supportPoints[0].time, 'y':supportPoints[0].y+channelHeightSup},{'x':supportPoints[1].time,'y':supportPoints[1].y+channelHeightSup}];

             this.chart.overlay.history.push(element);

             //ResistChannel
             var element = this.chart.overlay.createElement("Line");
             element.settings = {fillStyle: '#FF0000',
             strokeStyle: '#FF0000',
             lineWidth: 2};
             element.points = [{'x':resistPoints[0].time, 'y':resistPoints[0].y-channelHeightRes},{'x':resistPoints[1].time,'y':resistPoints[1].y-channelHeightRes}];

             this.chart.overlay.history.push(element);
            */

            //console.log(idx, dataRsi[idx]);
            return {
                extremeSupports: extSupportPionts,
                extremeResist: extResistPionts,
                supportPoints: supportPoints,
                resistPoints: resistPoints,
                points: points
            };
        } else {
            return false;
        }
    };

    iChart.Charting.TA.prototype.autoResistSupport = function (debug) {
        debug = !!debug;
        var dataRS = this.analyseResistSupport();
        if(dataRS) {
            this.clearResistSupport();
            var extTypeSup = "l",
                extTypeRes = "h";

            if(dataRS.extremeSupports.length > 2 || debug) {
                var element = this.chart.overlay.createElement("Line");
                element.points = [{'x': dataRS.supportPoints[0].time, 'y': dataRS.supportPoints[0].y}, {
                    'x': dataRS.supportPoints[1].time,
                    'y': dataRS.supportPoints[1].y
                }];
                element.drawType = 'auto';
                element.storageEnable = false;
                element.controlEnable = false;
                element.id = 'SR_analyzer';
                this.chart.overlay.history.push(element);
            }

            if(dataRS.extremeResist.length > 2 || debug) {
                var element = this.chart.overlay.createElement("Line");
                element.points = [{'x': dataRS.resistPoints[0].time, 'y': dataRS.resistPoints[0].y}, {
                    'x': dataRS.resistPoints[1].time,
                    'y': dataRS.resistPoints[1].y
                }];
                element.drawType = 'auto';
                element.storageEnable = false;
                element.controlEnable = false;
                element.id = 'SR_analyzer';
                this.chart.overlay.history.push(element);
            }

            if (debug) {

                var element = this.chart.overlay.createElement("Polygon");
                element.points = [
                    {'x': dataRS.points[2][0], 'y': dataRS.points[2][1]},
                    {'x': dataRS.points[0][0], 'y': dataRS.points[0][1]},
                    {'x': dataRS.points[1][0], 'y': dataRS.points[1][1]},
                    {'x': dataRS.points[3][0], 'y': dataRS.points[3][1]}
                ];
                element.storageEnable = false;
                element.drawType = 'auto';
                element.id = 'SR_analyzer';
                this.chart.overlay.history.push(element);


                for (var i = 0; i < dataRS.extremeSupports.length; i++) {
                    var element = this.chart.overlay.createElement("Trade");
                    element.hasSettings = true;
                    element.settings = {
                        "type_id": 1,
                        "qb": "",
                        "mode": 1,
                        "date_time": '',
                        summ: dataRS.extremeSupports[i]["d" + extTypeSup] / dataRS.extremeSupports[i][extTypeSup] * 100
                    };
                    element.points = [{'x': dataRS.extremeSupports[i].time, 'y': dataRS.extremeSupports[i][extTypeSup]}];
                    element.id = 'SR_analyzer';
                    this.chart.overlay.history.push(element);
                }


                for (var i = 0; i < dataRS.extremeResist.length; i++) {
                    var element = this.chart.overlay.createElement("Trade");
                    element.hasSettings = true;
                    element.drawType = 'auto';
                    element.settings = {
                        "type_id": 0,
                        "qb": "",
                        "mode": 1,
                        "date_time": '',
                        summ: dataRS.extremeResist[i]["d" + extTypeRes] / dataRS.extremeResist[i][extTypeRes] * 100
                    };

                    element.points = [{'x': dataRS.extremeResist[i].time, 'y': dataRS.extremeResist[i][extTypeRes]}];
                    element.id = 'SR_analyzer';
                    this.chart.overlay.history.push(element);
                }
            }

            this.chart.overlay.render();
        }
    };

    iChart.Charting.TA.prototype.clearResistSupport = function () {
        var overlayHistory = this.chart.overlay.history;
        for(var i=0; i < overlayHistory.length; i++) {
            var element = overlayHistory[i];
            if(element.id == "SR_analyzer") {
                overlayHistory.splice(i, 1);
                i--;
            }
        }
        this.chart.overlay.render();
    }


})();

