var iChartDataSource = {
    data: {},

    dataSettings: {
        useHash: false,
        date_from: formatDate(-90),
        date_to: formatDate(0),
        graphicIndicators: '',
        timeframe: 1440,
        hash: '',
        id: "MICEX:SBER",
        interval: "D1",

        compareIds: "",
        compareStocks: "",
        compareTickets: "",
        start: '',
        end: '',
    },

    host: "",
    url: "/api/get-hloc?",

    getUrl: function (params) {
        var cachedParams = {
            'id': params.id,
            'compareIds': params.compareIds,
            'compareStocks': params.compareStocks,
            'compareTickets': params.compareTickets,
            'count': params.count,
            'timeframe': iChart.getChartTimeframe(params.interval),
            'date_from': params.date_from,
            'date_to': params.date_to,
            'interval': params.interval,
            'intervalMode': params.intervalMode,
            'type': params.type,
            'demo': params.demo
        };

        //Спецальная метка для nginx по которой он будет пытаться взять hloc из файла а не с сервера
        cachedParams['hash'] = cachedParams.id.toString() + Date.parse(cachedParams.date_from).toString() + Date.parse(cachedParams.date_to).toString() + JSON.stringify(cachedParams).hashCode();

        return iChartDataSource.host + iChartDataSource.url + iChart.toQueryString(cachedParams);
    },

    onRequestCallback: function(callback, params) {
        if(!params.id) { return 0; }

        //ключ для кеша nginx
        params.demo = typeof jNTUserinfo !== "undefined" && jNTUserinfo.isDemo ? 1 : 0;

        var $params = params;

        var _this = this;
        var _chart = this.chart;

        this.chart.wrapper.trigger('iguanaChartEvents', ['chartDataRequest', iChartDataSource.getUrl(params)]);
        this.chart.ajaxDataRequest = $.ajax({
            "dataType":"text json",
            "error":function (xhr, textStatus, errorThrown) {
                clearTimeout(_chart.timers.loading);

                _chart.wrapper.trigger('iguanaChartEvents', ['clearLoader']);
                _chart.viewData.chart.setSelectionMode('pan');

                callback({ "warnings":["Ошибка: " + textStatus + "."], "success":false });
            },
            "success": function (data, textStatus, xhr)
            {
                _chart.wrapper.trigger('iguanaChartEvents', ['chartDataReceived', data]);

                if(data.info && data.info[_chart.dataSource.dataSettings.id]) {
                    var stockInfo = data.info[_chart.dataSource.dataSettings.id];
                    _chart.userSettings.currentSecurity = {
                        id: stockInfo.nt_ticker,
                        short_name: stockInfo.short_name,
                        default_ticker: stockInfo.default_ticker,
                        nt_ticker: stockInfo.nt_ticker,
                        firstDate: stockInfo.firstDate,
                        currency: stockInfo.currency,
                        min_step: stockInfo.min_step
                    };
                    _chart.viewData.chart.chartOptions.watermarkText = stockInfo.nt_ticker;
                    _chart.viewData.chart.chartOptions.watermarkSubText = stockInfo.short_name;
                }

                data = _this.dataAdapter(data, $params);

                clearTimeout(_chart.timers.loading);

                _chart.wrapper.trigger('iguanaChartEvents', ['clearLoader']);
                _chart.viewData.chart.setSelectionMode('pan');

                if(data.success == false) {
                    console.log('ERROR:', data.d.Message);
                }
                if (data) {
                    callback(data);
                }
                else {
                    callback({ "warnings":[_t('2125', 'Ошибка: пустой ответ.')], "success":false });
                }
                _chart.response = data.d;

                _chart.wrapper.trigger('iguanaChartEvents', ['chartDataReady', data]);
                _chart.dataRequestCounter++;

                _chart.fixViewport();
                _chart.updateUnlocked = true;

            },
            //"type":"POST",
            "url": iChartDataSource.getUrl(params)
        });
    },
    preInitCallback: function(initReadyCallback, params) {
        var _this = this;
        if(typeof params === "undefined") {
            params = {};
        }
        params.ticker = params.ticker || this.chart.dataSource.dataSettings.id  || 'SBER';
        params.f_history = typeof params.f_history === "undefined" ? 0 : params.f_history;

        this.chart.userSettings = $.extend(true, {}, $iguanaChart.defaultSettings, params.userSettings);


        if(params.hash) {
            this.chart.dataSource.dataSettings.hash = params.hash;
            var hash = iChart.parseQueryString(params.hash.substr(1));
            for (var key in this.chart.dataSource.dataSettings) {
                if (hash[key]) {
                    this.chart.dataSource.dataSettings[key] = hash[key];
                }
            }
            var graphicIndicators = [];
            for (var paramKey in hash)
            {
                if (paramKey.match(new RegExp("^i[0-9]", "i")))
                {
                    var name = paramKey.charAt(0) + paramKey.substr(1);
                    graphicIndicators[name] = hash[paramKey];
                }
            }

            if(graphicIndicators.length) {
                this.chart.dataSource.dataSettings.graphicIndicators = iChart.toQueryString(graphicIndicators);
            }

            params.ticker = hash.id;
            params.interval = hash.interval;
        }

        _this.chart.userSettings.currentSecurity = {
            id: params.ticker,
            short_name: params.ticker,
            default_ticker: params.ticker,
            nt_ticker: params.ticker,
            firstDate: '',
            currency: '',
            min_step: ''
        };
        _this.chart.dataSource.dataSettings.useHash = false;
        _this.chart.dataSource.dataSettings.id = params.ticker;
        _this.chart.dataSource.dataSettings.intervalRestriction = "";

        params.chartOptions.watermarkText = params.ticker;
        params.chartOptions.watermarkSubText = params.ticker;

        if(typeof params.type != "undefined") {
            params.chartOptions.chartType = params.type;
        }

        initReadyCallback(params.chartOptions);

    }
};
