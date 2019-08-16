/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartOptions = function ()
    {
        this.backgroundColor = '#ffffff';
        this.axisColor =  '#999999';
        this.labelColor =  '#595959';
        this.labelFont =  "10px Arial";
        this.showLabels =  true;
        this.gridColor =  '#cccccc';
        /**
         *
         * @type {'dashed'|'solid'}
         * @private
         */
        this._gridStyle =  'dashed';
        this.watermarkShow =  true;
        this.watermarkColor =  'rgba(238,238,238,1)';
        this.watermarkFont =  'bold 40px Verdana';
        this.watermarkSubFont =  'bold 25px Verdana';
        this.watermarkText =  '';
        this.watermarkSubText =  '';
        this.candleUp =  '#66B85C';
        this.candleDown =  '#C75757';
        this.candleBorderUp =  '#66B85C';
        this.candleBorderDown =  '#C75757';
        this.candleWick =  true;
        this.candleWickStyle =  '#595959';
        this.stockUp =  '#66B85C';
        this.stockDown =  '#C75757';
        this.stockWidth =  1;
        this.lineColor =  '#595959';
        this.lineWidth =  1;
        this.areaColor =  '#eff6fb';
        this.areaLineColor =  '#cccccc';
        this.volumeStyle =  'rgba(119, 119, 119, 0.3)';
        this.scrollerOverlayColor =  'rgba(0,0,0, 0.1)';
        this.scrollerHandlerColor =  'rgba(255,255,255, 1)';
        this.areaPaddingBottom   =  30;
        this.areaPaddingLeft     =  0;
        this.areaPaddingRight    =  60;
        this.areaPaddingTop      =  0;
        this.paddingBottom       =  0;
        this.candleBorder        =  0;
        this.tooltipPosition     =  'bottom';
        this.showAxes = 0;
        this.shadowColor =  '#999999';
        this.indicatorColors =  [
                ["#3D96AE", "#80699B", "#DB843D", "#B5CA92"],
                ["#A47D7C", "#B5CA92", "#e0400a", "#617db4"],
                ["#ff8c00", "#617db4", "#999999", "#80699B"],
                ["#3D96AE", "#80699B", "#DB843D", "#B5CA92"],
                ["#A47D7C", "#B5CA92", "#e0400a", "#617db4"],
                ["#ff8c00", "#617db4", "#999999", "#80699B"],
                ["#3D96AE", "#80699B", "#DB843D", "#B5CA92"],
                ["#A47D7C", "#B5CA92", "#e0400a", "#617db4"],
                ["#ff8c00", "#617db4", "#999999", "#80699B"],
                ["#3D96AE", "#80699B", "#DB843D", "#B5CA92"],
                ["#A47D7C", "#B5CA92", "#e0400a", "#617db4"],
                ["#ff8c00", "#617db4", "#999999", "#80699B"]
            ];
        this.minAreaHeight =  100;
        this.minHeight =  0;
        this.seriesColors =  ["#4BA1B8", "#FF8C00", "#A47D7C", "#3D96AE", "#80699B", "#DB843D", "#80699B"];
        this.mousewheelZoom =  true;
        this.maxZoom =  20;
        this.panStep =  0.3;
        this.primaryAreaHeight =  350;
        this.primaryAreaAxisYpaddingTop =  30;
        this.primaryAreaAxisYpaddingBottom =  30;
        this.primaryToSecondaryAreaHeightRatio =  2;
        this.scrollerHeight =  80;
        this.updateInterval =  true;
        this.showCurrentLabel =  true;
        this.yLabelsOutside =  true;
        this.percentMode =  false;
        this.futureAmount =  100;
        this.crosshairEnable =  true;
        /**
         *
         * @type {'Candlestick'|'Stock'|'Line','Area'}
         * @private
         */
        this._chartType =  'Candlestick';
        /**
         *
         * @type {'inside'|'outside'|'hidden'}
         * @private
         */
        this._showVolume =  'hidden';
        this.showVolumeByPrice =  false;
        this.floatingLegend =  false;
        this.floatingLegendFontSize =  12;
        this.floatingLegendTextColor =  '#444444';
        this.floatingLegendBorderColor =  'rgba(82,175,201,1)';
        this.floatingLegendBackground =  'rgba(82,175,201,.6)';

        this.elementStyle = {
            'Arrow': {
                fillStyle: 'rgba(255,0,0,.2)',
                strokeStyle: 'rgba(255,0,0,1)',
                lineWidth: 3
            },
            'Text': {
                fontColor: '#777777',
                fontSize: '28'
            }
        };

        this.uiTools = {
            top: false,
        };

        this.inertialScrolling = true
    };

    iChart.Charting.ChartOptions.themesParams = [
        'backgroundColor',
        'axisColor',
        'showAxes',
        'labelColor',
        'gridColor',
        'gridStyle',
        'watermarkColor',
        'watermarkFont',
        'watermarkSubFont',
        'candleUp',
        'candleDown',
        'candleBorder',
        'candleBorderUp',
        'candleBorderDown',
        'candleWick',
        'candleWickStyle',
        'stockUp',
        'stockDown',
        'stockWidth',
        'lineColor',
        'lineWidth',
        'areaColor',
        'areaLineColor',
        'volumeStyle',
        'scrollerOverlayColor',
        'scrollerHandlerColor',
        'shadowColor',
        'chartType'
    ];


    iChart.Charting.ChartOptions.getThemeOptions = function (chartOptions) {
        var result = {};
        if(chartOptions) {
            $.each(this.themesParams, function (i, key) {
                if (typeof chartOptions[key] == "object") {
                    if ($.isArray(chartOptions[key])) {
                        result[key] = $.extend(true, [], chartOptions[key]);
                    } else {
                        result[key] = $.extend(true, {}, chartOptions[key]);
                    }
                } else if(chartOptions[key]) {
                    result[key] = chartOptions[key];
                }
            });
        }
        return result;
    };

    Object.defineProperty(iChart.Charting.ChartOptions.prototype, 'chartType', {
        get: function() {
            return this['_chartType'];
        },
        set: function(data) {
            var values = ['Candlestick','Stock','Line', 'Area'];
            if(values.indexOf(data) >= 0) {
                this['_chartType'] = data;
            } else {
                this['_chartType'] = 'Candlestick';
                console.warn("ChartOptions: Недопустимое значение chartType:'%s'. Установлен по умлчанию: 'Candlestick'", data);
            }
        }
    });

    Object.defineProperty(iChart.Charting.ChartOptions.prototype, 'showVolume', {
        get: function() {
            return this['_showVolume'];
        },
        set: function(data) {
            var values = ['inside','outside','hidden'];
            if(values.indexOf(data) >= 0) {
                this['_showVolume'] = data;
            } else {
                this['_showVolume'] = 'hidden';
                console.warn("ChartOptions: Недопустимое значение showVolume. Установлен по умлчанию: 'hidden'");
            }
        }
    });

    Object.defineProperty(iChart.Charting.ChartOptions.prototype, 'gridStyle', {
        get: function() {
            return this['_gridStyle'];
        },
        set: function(data) {
            var values = ['dashed', 'solid'];
            if(values.indexOf(data) >= 0) {
                this['_gridStyle'] = data;
            } else {
                this['_gridStyle'] = 'dashed';
                console.warn("ChartOptions: Недопустимое значение gridStyle. Установлен по умлчанию: 'dashed'");
            }
        }
    });

})();