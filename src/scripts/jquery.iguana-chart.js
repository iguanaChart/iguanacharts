(function ($){

    $iguanaChart =  {};

    $iguanaChart.defaultTheme = {};
    $iguanaChart.thems = [{
        name: "White",
        settings: {
            backgroundColor:'#ffffff',
            axisColor: '#999999',
            showAxes: false,
            labelColor: '#595959',
            gridColor: '#cccccc',
            gridStyle: 'dashed', // [dashed|solid]
            watermarkColor: 'rgba(238,238,238,1)',
            watermarkFont: 'bold 40px Verdana',
            watermarkSubFont: 'bold 25px Verdana',
            candleUp: '#66B85C',
            candleDown: '#C75757',
            candleBorder: true,
            candleBorderUp: '#66B85C',
            candleBorderDown: '#C75757',
            candleWick: true,
            candleWickStyle: '#595959',
            stockUp: '#66B85C',
            stockDown: '#C75757',
            stockWidth: 1,
            lineColor: '#595959',
            lineWidth: 1,
            areaColor: '#eff6fb',
            areaLineColor: '#cccccc',
            volumeStyle: 'rgba(119, 119, 119, 0.3)',
            scrollerOverlayColor: 'rgba(0,0,0, 0.1)',
            scrollerHandlerColor: 'rgba(255,255,255, 1)',
            shadowColor: '#999999'
        }
    },{
        name: "Dark",
        settings: {
            backgroundColor:'#202020',
            axisColor: '#656565',
            showAxes: false,
            showLabels: true,
            labelColor: '#595959',
            gridColor: '#333333',
            gridStyle: 'dashed', // [dashed|solid]
            watermarkColor: 'rgba(238,238,238, 0.2)',
            watermarkFont: 'bold 40px Verdana',
            watermarkSubFont: 'bold 25px Verdana',
            candleUp: '#66B85C',
            candleDown: '#C75757',
            candleBorder: true,
            candleBorderUp: '#66B85C',
            candleBorderDown: '#C75757',
            candleWick: true,
            candleWickStyle: '#878787',
            stockUp: '#66B85C',
            stockDown: '#C75757',
            stockWidth: 1,
            lineColor: '#A4A4A4',
            lineWidth: 1,
            areaColor: '#232323',
            areaLineColor: '#A4A4A4',
            volumeStyle: 'rgba(119, 119, 119, 0.3)',
            scrollerOverlayColor: 'rgba(255,255,255, 0.1)',
            scrollerHandlerColor: 'rgba(130,130,130, 1)',
            shadowColor: '#000000'
        }
    }];

    $iguanaChart.defaultSettings = {
        chartSettings: {
            contextSettings: {
                fillStyle: 'rgba(82,175,201,.2)',
                strokeStyle: 'rgba(82,175,201,1)',
                lineWidth: 1,
                fontFamaly: 'Arial,Helvetica,sans-serif',
                fontColor: '#444444',
                fontSize: '14'
            },
            indicatorsColor: {},
            indicatorsWidth: {},
            showTransactionsMode: 0,
            tradingToolsEnable: 0,
            autochartistEnable: 0,
            defaultTheme: 1
        },
        currentSecurity: {
            id: '',
            short_name: '',
            default_ticker: '',
            nt_ticker: '',
            firstDate: '',
            currency: '',
            min_step: ''
        }
    };

    $iguanaChart.getTemplate = function(containerId, name) {
        return '' +
            '<div class="iChart-control-form" style="min-height: 200px">' +
                '<div class="js-chartContainerWrapper">' +
                    '<div class="iChartToolsContainer"><div class="iChartToolsTop" style="display: none;">' +
                    '</div></div>' +
                    '<div id="' + containerId + '" class="m-chart-container" style="height: 100%;">' +
                    '</div>' +
                '</div>' +
                    '<div data-uk-modal="{center:true}" class="uk-modal iChart-form-simple-v js-chartTADialog uk-padding-remove ' + name + '" id="iChart-tech-analysis-dialog" style="display: none;">' +
                        '<div class="uk-modal-dialog">' +
                            '<a class="uk-modal-close uk-close"></a>' +
                                '<div class="uk-modal-header">' + _t('3101', "Индикаторы") + '</div>' +
                                '<div class="js-chartTADialogContainer"></div>' +
                                '<div class="uk-modal-footer">' +
                                '<div class="uk-flex uk-flex-middle uk-flex-space-between tm-pad-large">' +
                                    '<div class="js-indicator-add md-btn md-btn-small md-btn-success">' +
                                        _t('15460', 'Добавить индикатор') +
                                    '</div>' +
                                '<div class="md-btn-group"><a class="md-btn md-btn-small md-btn-primary indicators-set" href="#">' + _t('532', 'Применить') + '</a>' +
                                '<a class="md-btn md-btn-small indicators-default" href="#">' + _t('15461', 'Для всех') + '</a>' +
                                '<a class="md-btn md-btn-small indicators-close" href="#">' + _t('1403', "Отмена") + '</a></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="chart-loader-wrapper" style="top: 0; width: 100%; height: 100%;"><div class="chart-loader"></div></div>' +
            '</div>'
    };

    $iguanaChart.init = function (chartObj, params) {

        function initReadyCallback (chartOptions) {
            chartObj.initChart(chartOptions);
            if(typeof params.events != "undefined") {
                chartObj.addEvents(params.events);
            }
        }

        chartObj.dataSource.preInit(initReadyCallback, params);
    };

    $iguanaChart.optionsStore = function () {
        var chartsStore = JSON.parse(window.localStorage.getItem('chartsStore') || '{}');

        if($.isPlainObject(arguments[0]) && !$.isEmptyObject(arguments[0])) {
            chartsStore = $.extend(chartsStore, data);
        } else if(typeof arguments[0] == 'string') {
            chartsStore[arguments[0]] = arguments[1];
        }
        window.localStorage.setItem('chartsStore', JSON.stringify(chartsStore));
    };

    $iguanaChart.optionsRestore = function (key) {
        var chartsStore = JSON.parse(window.localStorage.getItem('chartsStore') || '{}');
        if(key) {
            return chartsStore[key];
        } else {
            return chartsStore;
        }
    };

    var methods = {
        // инициализация плагина
        init: function(params, n) {

            var $wrapper = this;

            if ($wrapper.data('iguanaChart')) {

                $iguanaChart.init($wrapper.data('iguanaChart'), params);

            } else {

                var name = 'chart' + n + '_' + (new Date().getTime()),
                    containerId = name + '_container',
                    //template = $.render.iChart_mainTmpl({id: containerId, name: name}),
                    template = $iguanaChart.getTemplate(containerId, name),
                    lib_path = params.lib_path || '',
                    chartObj = new IguanaChart({name: name, container: "#" + containerId, wrapper: $wrapper, lib_path: lib_path, dataSource: $.extend(true, {}, params.dataSource)});

                //chartObj.userSettings = $.extend(true, {}, chartObj.userSettings, params.settings);

                $wrapper
                    .html(template)
                    .data('iguanaChart', chartObj)
                    .on('iguanaChartEvents', function(e, name, data){

                        switch (name) {
                            case 'chartDataReceived':
                                var tmLoader = $wrapper.data('tmLoader');
                                clearTimeout(tmLoader);
                                $wrapper.find('.chart-loader-wrapper').css({opacity: "0.0", height: 0, left: "-2000px", transition: "opacity .75s ease-in-out, height 0s ease-in-out .75s, left 0s ease-in-out .75s"});
                                break;

                            case 'chartDataRequest':
                                var tmLoader = $wrapper.data('tmLoader');
                                clearTimeout(tmLoader);
                                tmLoader = setTimeout(function () {$wrapper.find('.chart-loader-wrapper').css({opacity: "1.0", height: "100%", left: 0, transition: "opacity .0s ease-in-out, height 0s ease-in-out .0s"})}, 750);
                                $wrapper.data('tmLoader', tmLoader);

                                break;
                        }
                    })
                ;
                $iguanaChart.init($wrapper.data('iguanaChart'), params);
            }

            this.trigger('iguanaChartEvents', ['initComplete', params]);

        },
        setType: function(chartType) {

            var chartObj = this.data('iguanaChart');

            if (chartObj.viewData.chart) {
                chartObj.viewData.chart.setChartType(chartType);
            }

            chartObj.setHashValue("type", chartType);

            this.trigger('iguanaChartEvents', ['setType', chartType]);
        },
        setTheme: function(options) {
            var themeName = options[0];
            var theme = $.grep($iguanaChart.thems, function(theme) {return (theme.name == themeName ? theme : null);} )[0];
            if(typeof theme !== "undefined") {
                var iguanaChart = this.data('iguanaChart'),
                    chart = iguanaChart.viewData.chart;
                $.extend(chart.chartOptions, theme.settings);
                methods.render.call(this);
                this.trigger('iguanaChartEvents', ['setTheme', themeName]);
            } else {
                throw new Error('Theme "' + themeName + '" is not exist.');
            }
        },
        render: function(options) {
            if(!$.isArray(options)) {
                options = [];
            }
            var iguanaChart = this.data('iguanaChart'),
                forceRecalc = (typeof options[0] !== "undefined") ? !!options[0] : true,
                resetViewport = (typeof options[1] !== "undefined") ? !!options[1] : false,
                testForIntervalChange = (typeof options[2] !== "undefined") ? !!options[2] : false;
            if(iguanaChart.viewData.chart) {
                var chart = iguanaChart.viewData.chart;
                chart.render({
                    "forceRecalc": forceRecalc,
                    "resetViewport": resetViewport,
                    "testForIntervalChange": testForIntervalChange
                });
                $(iguanaChart.container).find('.js-scrollerOverlay').css({background: chart.chartOptions.scrollerOverlayColor});
                $(iguanaChart.container).find('.js-scrollerHandler').css({background: chart.chartOptions.scrollerHandlerColor});
            }
        },
        chartOptions: function(options) {
            var iguanaChart = this.data('iguanaChart'),
                chart = iguanaChart.viewData.chart;

            if(typeof options[0] !== "undefined") {
                if(typeof options[0] == "object") {
                    $.extend(true, chart.chartOptions, options[0]);
                } else if (typeof options[0] == "string" && typeof options[1] !== "undefined") {
                    chart.chartOptions[options[0]] = options[1];
                }
                methods.render.call(this);
            } else {
                return chart.chartOptions;
            }
        },
        events: function(options) {
            var chart = this.data('iguanaChart');
            chart.clearEvents();
            if(typeof options[0] != 'undefined') {
                chart.addEvents(options[0]);
            }
            methods.render.call(this);
        },
        toolStart: function(options) {
            var iguanaChart = this.data('iguanaChart'),
                chart = iguanaChart.viewData.chart;
            if (chart.overlay) {
                var element = chart.overlay.start(options[0]);
                element.setSettings(options[1]);
            }
            return false;
        },
        addPoint: function(options) {
            var iguanaChart = this.data('iguanaChart');
            iguanaChart.addPoint(options[0]);
        },
        destroy: function() {
            if (this.data('iguanaChart')) {
                var chart = this.data('iguanaChart');
                //console.log('destroy:', chart.name);
                for (var timer in chart.timers) {
                    clearTimeout(chart.timers[timer]);
                    chart.ajaxDataRequest.abort();
                }
            }
        }
    };

    $.fn.iguanaChart = function (options) {

        if(typeof options === "undefined" || typeof options === 'object') {

            return this.each(function(n){
                var selector = $(this);
                methods.init.call(selector, options, n);
                return selector;
            });

        } else if (typeof options === 'string') {

            var args = Array.prototype.slice.call(arguments, 1);

            if (methods[options] && typeof methods[options] == 'function') {

                if(args.length) {
                    return this.each(function (n) {
                        var selector = $(this);
                        methods[options].call(selector, args);
                        return selector;
                    });
                } else {
                    var selector = $(this).eq(0);
                    return methods[options].call(selector, args);
                }

            } else {
                return console.error('Method should be function');
            }
        } else {
            return console.error('Options should be object, string or undefined');
        }

    };

})(jQuery);