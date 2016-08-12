/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartDataSource = function (chart, settings)
    {
        /**
         Через эту функцию график осуществляет получение данных.
         Вызов производится в двух случаях
         1 — при инициализации
         2 — при прокрутке по достижению границы имеющихся данных.
         Функция получает объект параметров, по которому должна сформировать запрос.
         Результат должен передаться в callback(data)
         data — объект со следующей структурой

         data = {
            "hloc":{
                "<STOCK_1>": [[<high>, <low>, <open>, <close>],...k],
                ...
                "<STOCK_N>": [[<high>, <low>, <open>, <close>],...l],
            },
            "vl":{
                "<STOCK_1>": [<volume1>, <volume2>,...k],
                ...
                "<STOCK_N>": [<volume1>, <volume2>,...l],
            },
            "xSeries":{
                "<STOCK_1>": [<timestamp1>, <timestamp2>,...k],
                ...
                "<STOCK_N>": [<timestamp1>, <timestamp2>,...l],
            }

        };


         Минимальный набор поступающих параметров, может быть расширен
        params = {
            "useHash": false,
            "date_from": "31.12.2013 00:00",
            "date_to": "23.01.2015",
            "graphicIndicators": "",
            "hash": "",
            "id": "LKOH",
            "interval": "D1",
            "timeframe": 1440,
            "start": "23.01.2015 00:00",
            "intervalMode": "ClosedRay",
            "count": -1
        }
         */
        function onRequestCallback (callback, params) {
            console.log(params);
            var data = this.dataAdapter(this.data, params);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartDataReceived', data]);
            callback(data);
            this.chart.wrapper.trigger('iguanaChartEvents', ['chartDataReady', data]);
            this.chart.dataRequestCounter++;
        };

        /**
        Параметры известны, перед инициализацией можно произвести
        дополнительные манипуляции с параметрами, сделать запросы.
        В конце всех действий должен быть вызов параметрической колбэк функции
        с параметрами графика initReadyCallback(params.chartOptions);
        */
        function preInitCallback(initReadyCallback, params) {
            initReadyCallback(params.chartOptions);
        };

        var dataSettings = {
            useHash: false,
            date_from: formatDate(-90),
            date_to: formatDate(0),
            graphicIndicators: '',
            hash: '',
            id: "",
            interval: "D1",
            timeframe: 1440
        };

        settings = settings || {};
        /**
         * @var IguanaChart
         */
        this.chart = chart;
        this.data = settings.data || {};
        this.dataSettings = settings.dataSettings || dataSettings;
        this.preInitCallback = (typeof settings.preInitCallback == "function") ? settings.preInitCallback.bind(this) : preInitCallback.bind(this);
        this.onRequestCallback = (typeof settings.onRequestCallback == "function") ? settings.onRequestCallback.bind(this) : onRequestCallback.bind(this);
    };

    iChart.Charting.ChartDataSource.prototype.set = function (settings)
    {

    };

    iChart.Charting.ChartDataSource.prototype.preInit = function (callback, params)
    {

        this.dataSettings.date_from = params.date_from || this.dataSettings.date_from  || formatDate(-90);
        this.dataSettings.date_to = params.date_to || this.dataSettings.date_to || formatDate(0);

        if(params.period) {
            var periodDates = this.chart.getPeriodDates(params.period);
            this.dataSettings.date_from = periodDates.date_from;
            this.dataSettings.date_to = periodDates.date_to;
        }

        this.dataSettings.start = this.dataSettings.start || this.dataSettings.date_from;
        this.dataSettings.end = this.dataSettings.end || this.dataSettings.date_to;
        this.dataSettings.interval = params.interval || this.dataSettings.interval;
        this.dataSettings.timeframe = iChart.getChartTimeframe(this.dataSettings.interval);

        params.chartOptions = $.extend(true, {}, params.chartOptions);
        params.theme = typeof params.theme != "undefined" ? params.theme : IGUANACHART_THEME;

        if(params.theme) {
            var theme = $.grep($iguanaChart.thems, function(theme) {return (theme.name == params.theme ? theme : null);} )[0];
            if(typeof theme !== "undefined") {
                params.chartOptions = $.extend(true, {}, params.chartOptions, theme.settings);
            } else if (params.theme == 'default') {
                params.chartOptions = $.extend(true, {}, params.chartOptions, $iguanaChart.defaultTheme);
            }
        }

        this.preInitCallback(callback, params);
    };

    iChart.Charting.ChartDataSource.prototype.onRequest = function (callback, params)
    {
        this.onRequestCallback(callback, params);
    };

    iChart.Charting.ChartDataSource.prototype.dataAdapter = function (data, params) {
        var chartData = {
            "xSeries": [],
            "ySeries": [],
            "success": true,
            "warnings": [],
            "message": ''
        };

        var hloc = {
            "chartType": "Column",
            "enabled": true,
            "formatProvider": {
                "decimalPlaces": "2",
                "decimalPrecision": null
            },
            "indicatorIndex": null,
            "indicatorIndex2": null,
            "kind": "HLOC",
            "name": params.id,
            "overlay": false,
            "points": [],
            "valuesPerPoint": 4
        };

        var volume = {
            "chartType": "Column",
            "enabled": true,
            "formatProvider": {
                "decimalPlaces": null,
                "decimalPrecision": null
            },
            "indicatorIndex": null,
            "indicatorIndex2": null,
            "kind": "Volume",
            "name": params.id + " - V",
            "overlay": false,
            "points": [],
            "valuesPerPoint": 1
        };

        if(data.hloc) {
            var tickers = Object.keys(data.hloc);

            if(tickers.length == 1) {
                chartData.ySeries[0] = $.extend(true,{},hloc);
                chartData.ySeries[1] = $.extend(true,{},volume);
                chartData.ySeries[0].name = tickers[0];

                for (var i = 0; i < data.xSeries[tickers[0]].length; i++) {
                    //chartData.xSeries.push(+(data.xSeries[tickers[0]][i]));
                    chartData.xSeries.push(+(data.xSeries[tickers[0]][i]) + getTimeOffsetServer(tzOffsetMoscow));
                    chartData.ySeries[0].points.push(data.hloc[tickers[0]][i]);
                    chartData.ySeries[1].points.push([data.vl[tickers[0]][i]]);
                }

            } else if (tickers.length > 1) {
                // При сравнении нескольких бумаг
                //Нормализация по времени
                var x = {}
                for (var j = 0; j < tickers.length; j++) {
                    for (var i = 0; i < data.xSeries[tickers[j]].length; i++) {
                        if(typeof x[data.xSeries[tickers[j]][i]] == "undefined") {
                            x[data.xSeries[tickers[j]][i]] = {}
                        }
                        x[data.xSeries[tickers[j]][i]][tickers[j]] = data.hloc[tickers[j]][i];
                    }
                }

                for (var j = 0; j < tickers.length; j++) {
                    chartData.ySeries[j] = $.extend(true,{},hloc);
                    chartData.ySeries[j].name = tickers[j];
                }
                //Распределение котировок
                for(var tmstmp in x) {
                    chartData.xSeries.push(+(tmstmp) + getTimeOffsetServer(tzOffsetMoscow));

                    for (var j = 0; j < tickers.length; j++) {
                        if(typeof x[tmstmp][tickers[j]] == "undefined") {
                            chartData.ySeries[j].points.push([null, null, null, null]);
                        } else {
                            chartData.ySeries[j].points.push(x[tmstmp][tickers[j]]);
                        }
                    }
                }
            }
        }
        return chartData;
    };

})();