/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartVisualtrade = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Visualtrade";
        this.drawType = 'auto';
        this.hoverCursor = MOBILE_BROWSER_DETECTED ? "move" : "url('" + this.layer.chart.env.lib_path + "/styles/cursors/red_vertical_cursor.cur'), move";
        this.moveCursor = MOBILE_BROWSER_DETECTED ? "move": "url('" + this.layer.chart.env.lib_path + "/styles/cursors/red_vertical_cursor.cur'), move";
        this.maxPointCount = 5;
        this.hasSettings = true;
        this.controlEnable = true;
        this.storageEnable = false;
        this.settings = {
            redColor: '#bc353d',
            greenColor: '#7fcc1a',
            blueColor: '#4684c6',
            greyColor: '#999999',
            offset: 40//вправо от последий свечи
        };
        this.drawSingle = true;

    };

    inheritPrototype(iChart.Charting.ChartVisualtrade, iChart.Charting.ChartElement);

    iChart.Charting.ChartVisualtrade.prototype.setSettings = function (settings) {

        this.settings = $.extend(this.settings, settings);

        this.settings.onDrop = function (mode) {
            if(!isNaN(parseInt(mode))) {
                var i = parseInt(mode) - 1;
                if(i === 0) {
                    $(jNTChartTrading).trigger('priceExternalUpdate', ['price', iChart.roundToPrecision(this.points[0].y, this.layer.chart.env.userSettings.currentSecurity.min_step)]);
                } else if (i === 1) {
                    var order_type = this.getControlValue('order_type');
                    if (order_type == 'sell_at' || order_type == 'sell') {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['tp', iChart.roundToPrecision(this.points[1].y, this.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    } else {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['sl', iChart.roundToPrecision(this.points[1].y, this.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    }
                } else if (i === 2) {
                    var order_type = this.getControlValue('order_type');
                    if (order_type == 'sell_at' || order_type == 'sell') {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['sl', iChart.roundToPrecision(this.points[2].y, this.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    } else {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['tp', iChart.roundToPrecision(this.points[2].y, this.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    }
                }
            }
        };

        this.priceControl = {
            width: 180,
            height: 30
        };

        this.elementArea = {
            top: 70,
            bottom: 47,
            left: 10,
            right: 10
        };

        this.points[0].fActive = 1;
        this.points[1].fActive = 0;
        this.points[2].fActive = 0;
        this.points[0].enable = 1;
        this.points[1].enable = !!this.settings.stoplossEnable;
        this.points[2].enable = !!this.settings.takeprofitEnable;
        this.points[1].fHover = 0;
        this.points[2].fHover = 0;

        this.controls = {
            1: {
                enabled: false,
                element: this,
                x: 10, y: 10, w: 100, h: 17,
                click: function () {
                    this.element.switchControl(this);
                },
                type: 'order_type',
                label: _t('4018','Продать'),
                value: 'sell_at',
                active: false
            },
            2: {
                enabled: false,
                element: this,
                x: 10, y: 33, w: 100, h: 17,
                click: function () {
                    this.element.switchControl(this);
                },
                type: 'order_type',
                label: _t('4875', "Продать по рынку"),
                value: 'sell',
                active: false
            },
            3: {
                enabled: false,
                element: this,
                x: 120, y: 10, w: 100, h: 17,
                click: function () {
                    this.element.switchControl(this);
                },
                type: 'order_type',
                label: _t('4019','Купить'),
                value: 'buy_at',
                active: false
            },
            4: {
                enabled: false,
                element: this,
                x: 120, y: 33, w: 100, h: 17,
                click: function () {
                    this.element.switchControl(this);
                },
                type: 'order_type',
                label: _t('5452', 'Купить по рынку'),
                value: 'buy',
                active: false
            },
            5: {
                enabled: false,
                element: this,
                x: 120, y: -27, w: 100, h: 17,
                click: function () {
                    var order_type = this.element.getControlValue('order_type');
                    var operMap = {
                        'sell_at' : 3,
                        'sell': 4,
                        'buy_at': 1,
                        'buy': 2
                    };

                    var price = iChart.roundToPrecision(this.element.points[0].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step),
                        sl = 0,
                        tp = 0;

                    if(order_type == 'buy_at' || order_type == 'buy') {
                        sl = Math.min(iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step), iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step));
                        tp = Math.max(iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step), iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step));
                        if(price == sl) {
                            sl = null;
                        }
                        if(price == tp) {
                            tp = null;
                        }
                    } else if (order_type == 'sell_at' || order_type == 'sell') {
                        sl = Math.min(iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step), iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step));
                        tp = Math.max(iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step), iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step));
                        if(price == sl) {
                            sl = null;
                        }
                        if(price == tp) {
                            tp = null;
                        }
                    }

                    //jNTPanel.show(userSettings.currentSecurity.nt_ticker, operMap[order_type], price, sl, tp); @deprecated
                },
                type: 'action',
                label: _t('614','Ok'),
                value: 'ok',
                active: false
            },
            6: {
                enabled: false,
                element: this,
                x: 10, y: -27, w: 100, h: 17,
                click: function () {
                    this.element.remove();
                },
                type: 'action',
                label: _t('1403','Отмена'),
                value: 'cancel',
                active: false
            },
            7: {
                enabled: true,
                element: this,
                click: function () {
                    jNTChartTrading.close();
                    this.element.layer.chart.env.removeVisualTrade();
                },
                type: 'close',
                value: 'stoploss'
            },
            8: {
                enabled: true,
                element: this,
                click: function () {
                    jNTChartTrading.close();
                    this.element.layer.chart.env.removeVisualTrade();
                },
                type: 'close',
                value: 'takeprofit'
            },
            9: {
                enabled: true,
                element: this,
                active: true,
                click: function () {
                    this.element.points[0].fActive = 0;
                    jNTChartTrading.close();
                    this.element.layer.chart.env.removeVisualTrade();
                },
                type: 'close',
                value: 'price'
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
                    this.element.points[0].fActive = 1;
                    this.element.points[1].fActive = 0;
                    this.element.points[2].fActive = 0;
                    this.element.setTestSegments();
                    $(jNTChartTrading).trigger('priceExternalUpdate', ['price', iChart.roundToPrecision(this.element.points[0].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step)]);
                },
                hoverIn: function () {
                    this.element.points[0].fHover = 1;
                    this.element.layer.render();
                },
                hoverOut: function () {
                    this.element.points[0].fHover = 0;
                    this.element.layer.render();
                },
                type: 'sltp',
                value: 'price'
            },
            1: {
                element: this,
                click: function () {
                    this.element.points[1].fActive = 1;
                    this.element.points[0].fActive = 0;
                    this.element.points[2].fActive = 0;
                    this.element.setTestSegments();
                    var order_type = this.element.getControlValue('order_type');
                    if (order_type == 'sell_at' || order_type == 'sell') {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['tp', iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    } else {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['sl', iChart.roundToPrecision(this.element.points[1].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    }
                },
                hoverIn: function () {
                    this.element.points[1].fHover = 1;
                    this.element.layer.render();
                },
                hoverOut: function () {
                    this.element.points[1].fHover = 0;
                    this.element.layer.render();
                },
                type: 'sltp',
                value: 'stoploss'
            },
            2: {
                element: this,
                click: function () {
                    this.element.points[2].fActive = 1;
                    this.element.points[0].fActive = 0;
                    this.element.points[1].fActive = 0;
                    this.element.setTestSegments();
                    var order_type = this.element.getControlValue('order_type');
                    if (order_type == 'sell_at' || order_type == 'sell') {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['sl', iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    } else {
                        $(jNTChartTrading).trigger('priceExternalUpdate', ['tp', iChart.roundToPrecision(this.element.points[2].y, this.element.layer.chart.env.userSettings.currentSecurity.min_step)]);
                    }
                },
                hoverIn: function () {
                    this.element.points[2].fHover = 1;
                    this.element.layer.render();
                },
                hoverOut: function () {
                    this.element.points[2].fHover = 0;
                    this.element.layer.render();
                },
                type: 'sltp',
                value: 'takeprofit'
            }
        }
    };

    /**
     *
     * @param ctx
     * @param coords
     */
    iChart.Charting.ChartVisualtrade.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 3) { return; }

        var lastPoint = this.layer.chart.env.viewData.chart.areas[0].getXPositionByIndex(this.layer.chart.env.viewData.chart.areas[0].xSeries.length-1-this.layer.chart.env.viewData.chart.chartOptions.futureAmount) + this.settings.offset;
        lastPoint = Math.min(lastPoint, this.layer.chart.env.viewData.chart.areas[0].getXPositionByIndex(this.layer.chart.env.viewData.chart.areas[0].xSeries.length-1));
        var point = this.layer.chart.env.viewData.chart.areas[0].getXValue(lastPoint);

        this.points[0].x = point * 1000;
        this.points[1].x = this.points[2].x = this.points[0].x;


        coords[0].x = this.layer.area.getXPositionByValue(point);
        coords[1].x = coords[2].x = coords[0].x;

        if(this.selected) {
            this.drawArea(ctx, coords);
        }

        ctx.fillStyle = 'rgba(255,255,255,1)';

        for (var i = coords.length-1; i >= 0; i--) {
            if(i>=3) { continue; }
            this.drawPriceBox(ctx, coords, i);
            this.drawLabel(ctx, coords, i);
        }

        //габаритные точки для ресайза области видимости
        var areaPoints = this.getElementAreaPos(coords);
        this.points[3].y = this.layer.area.getYValue(areaPoints[0].y).toFixed(2);
        this.points[4].y = this.layer.area.getYValue(areaPoints[1].y).toFixed(2);
    };

    iChart.Charting.ChartVisualtrade.prototype.drawPoints = function (ctx, pointCoords) {};

    iChart.Charting.ChartVisualtrade.prototype.drawTestSegments = function (ctx) {
        if(typeof this.testContext != 'undefined') {
            ctx.save();
            ctx.fillStyle = '#000000';
            for(var i in this.testContext.controls) {
                var c = this.testContext.controls[i];
                ctx.rect(c[0].x, c[0].y, c[1].x - c[0].x, c[1].y - c[0].y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    iChart.Charting.ChartVisualtrade.prototype.getColorForPoint = function (type)
    {
        var fillStyle = '#999999';
        switch (type) {
            case 0:
                fillStyle = this.settings.blueColor;
                break;
            case 1:
                if(this.points[type].fActive) {
                    if (this.getControlValue('order_type') == "sell" || this.getControlValue('order_type') == "sell_at") {
                        fillStyle = this.settings.greenColor;
                    } else {
                        fillStyle = this.settings.redColor;
                    }
                }
                break;
            case 2:
                if(this.points[type].fActive) {
                    if (this.getControlValue('order_type') == "sell" || this.getControlValue('order_type') == "sell_at") {
                        fillStyle = this.settings.redColor;
                    } else {
                        fillStyle = this.settings.greenColor;
                    }
                }
                break;
            default:
                fillStyle = '#5a6378';
                break;
        }
        return fillStyle;
    };

    iChart.Charting.ChartVisualtrade.prototype.drawExtended = function (ctx)
    {
        if (typeof this.markers !== "undefined") {
            var pointCoords = this.getCoordinates(ctx, this.markers);
            var points = this.markers;
        } else {
            var pointCoords = this.getCoordinates(ctx, this.points);
            var points = this.points;
        }

        if (pointCoords.length < 1) { return; }

        for(var i = 0; i < pointCoords.length && i<3; i++) {
            if(points[i].fActive) {
                var label = iChart.roundToPrecision(points[i].y, this.layer.chart.env.userSettings.currentSecurity.min_step);
                this.layer.chart.renderer.drawLable(ctx, this.getColorForPoint(i), 0, this.layer.area.innerWidth, pointCoords[i].y, label);
            }
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.drawArea = function (ctx, coords) {

        var areaPoints = this.getElementAreaPos(coords);

        //ctx.fillStyle = 'rgba(113,121,138,0.5)';
        //ctx.fillRect(areaPoints[0].x, areaPoints[0].y, areaPoints[1].x - areaPoints[0].x, areaPoints[1].y - areaPoints[0].y);

        if(this.selected) {
            for(var i in this.controls) {
                var control = this.controls[i];

                if (!control.enabled) { continue; }
                this.drawControl(ctx, coords, control)
            }
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.drawControl = function (ctx, coords, control)
    {
        ctx.save();
        var areaPoints = this.getElementAreaPos(coords);

        if(control.type == 'order_type' || control.type == 'action') {
            if(control.active) {
                ctx.fillStyle = 'rgba(57,63,79,1)';
            } else {
                ctx.fillStyle = '#ffffff';
            }

            if(control.y >= 0) {
                ctx.fillRect(areaPoints[0].x + control.x, areaPoints[0].y + control.y, control.w, control.h);
            } else {
                ctx.fillRect(areaPoints[0].x + control.x, areaPoints[1].y + control.y, control.w, control.h);
            }

            if(control.active) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
            } else {
                ctx.fillStyle = '#428bca';
                ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
            }

            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            if(control.y >= 0) {
                ctx.fillText(control.label, areaPoints[0].x + control.x + 2, areaPoints[0].y + control.y + 4);
            } else {
                ctx.fillText(control.label, areaPoints[0].x + control.x + 2, areaPoints[1].y + control.y + 4);
            }
        } else if(control.type == 'close') {
            if(control.value == 'stoploss' || control.value == 'takeprofit') {
                if (this.getControlValue('order_type') == "sell" || this.getControlValue('order_type') == "sell_at") {
                    if(control.value == 'stoploss' && this.points[2].fActive) {
                        var point = coords[2];
                    } else if (control.value == 'takeprofit' && this.points[1].fActive) {
                        var point = coords[1];
                    }
                } else if (this.getControlValue('order_type') == "buy" || this.getControlValue('order_type') == "buy_at") {
                    if(control.value == 'stoploss' && this.points[1].fActive) {
                        var point = coords[1];
                    } else if (control.value == 'takeprofit' && this.points[2].fActive) {
                        var point = coords[2];
                    }
                }
            } else if(this.points[0].fActive) {
                var point = coords[0];
            }

            if(point) {
                ctx.fillStyle = '#ff9999';
                //ctx.fillRect(point.x + this.priceControl.width + 2, point.y - 23, 16, 16);
                ctx.strokeStyle = '#777777';
                ctx.beginPath();
                //ctx.arc(point.x + this.priceControl.width + 10, point.y - 15, 8, 0, 2*Math.PI);
                ctx.lineWidth = 2;
                ctx.moveTo(point.x + this.priceControl.width + 10-4, point.y - 15-4);
                ctx.lineTo(point.x + this.priceControl.width + 10+4, point.y - 15+4);

                ctx.moveTo(point.x + this.priceControl.width + 10+4, point.y - 15-4);
                ctx.lineTo(point.x + this.priceControl.width + 10-4, point.y - 15+4);

                ctx.closePath();

                ctx.stroke();
            }

        }
        ctx.restore();
    };

    iChart.Charting.ChartVisualtrade.prototype.drawPriceBox = function (ctx, coords, type)
    {
        var fillStyle = '';

        switch (type) {
            case 0:
                fillStyle = this.settings.blueColor;
                break;
            case 1:
                if(this.points[type].fActive) {
                    switch (this.getControlValue('order_type')) {
                        case "sell":
                        case "sell_at":
                            fillStyle = this.settings.greenColor;
                            break;
                        case "buy":
                        case "buy_at":
                            fillStyle = this.settings.redColor;
                            break;
                    }
                } else {
                    fillStyle = this.settings.greyColor;
                }
                break;
            case 2:
                if(this.points[type].fActive) {
                    switch (this.getControlValue('order_type')) {
                        case "sell":
                        case "sell_at":
                            fillStyle = this.settings.redColor;
                            break;
                        case "buy":
                        case "buy_at":
                            fillStyle = this.settings.greenColor;
                            break;
                    }
                } else {
                    fillStyle = this.settings.greyColor;
                }
                break;
            default:
                fillStyle = 'ffffff';
                break;
        }

        if(this.points[type].fActive) {
            ctx.save();
            ctx.fillStyle = fillStyle;
            //Прямоугольник
            ctx.beginPath();
            ctx.moveTo(coords[type].x-10, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.priceControl.width, coords[type].y-10);
            ctx.lineTo(coords[type].x+this.priceControl.width + 8, coords[type].y);
            ctx.lineTo(coords[type].x+this.priceControl.width, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y+10);
            ctx.lineTo(coords[type].x-10, coords[type].y-10);
            ctx.moveTo(coords[type].x+10, coords[type].y-10);
            ctx.lineTo(coords[type].x+10, coords[type].y+10);
            ctx.closePath();
            //ctx.stroke();
            ctx.fill();
            ctx.restore();

            //Штрихи слева
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(coords[type].x-5, coords[type].y-3);
            ctx.lineTo(coords[type].x+5, coords[type].y-3);
            ctx.moveTo(coords[type].x-5, coords[type].y);
            ctx.lineTo(coords[type].x+5, coords[type].y);
            ctx.moveTo(coords[type].x-5, coords[type].y+3);
            ctx.lineTo(coords[type].x+5, coords[type].y+3);
            ctx.closePath();
            ctx.stroke();

            //Направляющие
            ctx.strokeStyle = fillStyle;
            ctx.beginPath();
            ctx.moveTo(coords[type].x + this.priceControl.width + 8, coords[type].y);
            ctx.lineTo(ctx.canvas.width, coords[type].y);
            ctx.moveTo(0, coords[type].y);
            ctx.lineTo(coords[type].x - 10, coords[type].y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else {
            if(this.points[type].enable) {
                ctx.save();
                //ctx.strokeStyle = 'rgba(170,170,170)';
                if (this.points[type].fHover) {
                    ctx.strokeStyle = this.settings.blueColor;
                } else {
                    ctx.strokeStyle = '#AAAAAA';
                }
                //Прямоугольник
                ctx.beginPath();
                ctx.moveTo(coords[type].x - 10, coords[type].y - 10);
                ctx.lineTo(coords[type].x + this.priceControl.width, coords[type].y - 10);
                ctx.lineTo(coords[type].x + this.priceControl.width + 8, coords[type].y);
                ctx.lineTo(coords[type].x + this.priceControl.width, coords[type].y + 10);
                ctx.lineTo(coords[type].x - 10, coords[type].y + 10);
                ctx.lineTo(coords[type].x - 10, coords[type].y - 10);
                //ctx.moveTo(coords[type].x+10, coords[type].y-10);
                //ctx.lineTo(coords[type].x+10, coords[type].y+10);
                ctx.closePath();
                ctx.stroke();
                //ctx.fill();
                ctx.restore();
            }
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.drawLabel = function (ctx, coords, type)
    {

        var label = '',
            fillStyle = 'rgba(0,0,0,1)';

        switch (type) {
            case 0:
                var price = this.points[0].y;
                if (typeof this.markers !== "undefined") {
                    price = this.markers[0].y;
                }
                switch (this.getControlValue('order_type')) {
                    case "sell":
                        label = _t('4875', 'Продать по рынку');
                        break;
                    case "sell_at":
                        label = _t('4876', "Продать по") + iChart.roundToPrecision(price, this.layer.chart.env.userSettings.currentSecurity.min_step);
                        break;
                    case "buy":
                        label = _t('5452', 'Купить по рынку');
                        break;
                    case "buy_at":
                        label = _t('5458', 'Купить по') + iChart.roundToPrecision(price, this.layer.chart.env.userSettings.currentSecurity.min_step);
                        break;
                }
                break;
            case 1:
                var price = this.points[1].y;
                if (typeof this.markers !== "undefined") {
                    price = this.markers[1].y;
                }
                switch (this.getControlValue('order_type')) {
                    case "sell":
                    case "sell_at":
                        label = _t('3917', 'TakeProfit') + ' ';
                        var pp = (this.points[0].y / price - 1) * 100;
                        break;
                    case "buy":
                    case "buy_at":
                        label = _t('3916', 'StopLoss') + ' ';
                        var pp = (1 - this.points[0].y / price) * 100;
                        break;
                }
                label  +=  pp.toFixed(2) + '%';
                break;
            case 2:
                var price = this.points[2].y;
                if (typeof this.markers !== "undefined") {
                    price = this.markers[2].y;
                }
                switch (this.getControlValue('order_type')) {
                    case "sell":
                    case "sell_at":
                        label = _t('3916', 'StopLoss') + ' ';
                        var pp = (1- price / this.points[0].y) * 100;
                        break;
                    case "buy":
                    case "buy_at":
                        label = _t('3917', 'TakeProfit') + ' ';
                        var pp = (price / this.points[0].y - 1) * 100;
                        break;
                }
                label  += pp.toFixed(2) + '%';
                break;
        }

        ctx.save();
        ctx.font = 'normal 13px Arial,Helvetica,sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#ffffff';

        if(this.points[type].fActive) {
            ctx.fillText(label, coords[type].x + 15, coords[type].y);
        } else {
            if(this.points[type].fHover) {
                ctx.fillStyle = this.settings.blueColor;
            } else {
                ctx.fillStyle = '#AAAAAA';
            }
            if(this.points[type].enable) {
                ctx.fillText(label, coords[type].x + 15, coords[type].y);
            }
        }

        ctx.restore();
    };


    iChart.Charting.ChartVisualtrade.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            //[{ "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}, { "x": this.testContext.points[0].x + this.priceControl.width, "y": this.testContext.points[0].y}]
        ];

        var areaPoints = this.getElementAreaPos(this.testContext.points);

        this.testContext.elementArea = areaPoints;

        this.testContext.controls = {};
        for(var i in this.controls) {
            if(!this.controls[i].enabled) { continue; }
            if(this.controls[i].type == 'order_type' || this.controls[i].type == 'action') {
                if (this.controls[i].y >= 0) {
                    this.testContext.controls[i] = [{
                        x: areaPoints[0].x + this.controls[i].x,
                        y: areaPoints[0].y + this.controls[i].y
                    }, {
                        x: areaPoints[0].x + this.controls[i].x + this.controls[i].w,
                        y: areaPoints[0].y + this.controls[i].y + this.controls[i].h
                    }];
                } else {//рисовать от нижнег к
                    this.testContext.controls[i] = [{
                        x: areaPoints[0].x + this.controls[i].x,
                        y: areaPoints[1].y + this.controls[i].y
                    }, {
                        x: areaPoints[0].x + this.controls[i].x + this.controls[i].w,
                        y: areaPoints[1].y + this.controls[i].y + this.controls[i].h
                    }];
                }
            } else if(this.controls[i].type == 'close') {
                var control = this.controls[i];

                if(control.value == 'stoploss' || control.value == 'takeprofit') {
                    if (this.getControlValue('order_type') == "sell" || this.getControlValue('order_type') == "sell_at") {
                        if(control.value == 'stoploss' && this.points[2].fActive) {
                            var point = this.testContext.points[2];
                        } else if (control.value == 'takeprofit' && this.points[1].fActive) {
                            var point = this.testContext.points[1];
                        }
                    } else {
                        if(control.value == 'stoploss' && this.points[1].fActive) {
                            var point = this.testContext.points[1];
                        } else if (control.value == 'takeprofit' && this.points[2].fActive) {
                            var point = this.testContext.points[2];
                        }
                    }
                } else if(this.points[0].fActive) {
                    var point = this.testContext.points[0];
                }


                if(point) {
                    this.testContext.controls[i] = [{
                        x: point.x + this.priceControl.width + 2,
                        y: point.y - 23
                    }, {
                        x: point.x + this.priceControl.width + 2 + 16,
                        y: point.y - 23 + 16
                    }];
                }
            }
        }

        this.testContext.maps = {};
        if(!this.points[0].fActive) {
            this.testContext.maps[0] = [{x: this.testContext.points[0].x + 10, y: this.testContext.points[0].y - 10},
                {x: this.testContext.points[0].x + this.priceControl.width + 10, y: this.testContext.points[0].y + 10}];
        }

        if(!this.points[1].fActive && this.points[1].enable) {
            this.testContext.maps[1] = [{x: this.testContext.points[1].x + 10, y: this.testContext.points[1].y - 10},
                {x: this.testContext.points[1].x + this.priceControl.width + 10, y: this.testContext.points[1].y + 10}];
        }
        if(!this.points[2].fActive && this.points[2].enable) {
            this.testContext.maps[2] = [{x: this.testContext.points[2].x + 10, y: this.testContext.points[2].y - 10},
                {x: this.testContext.points[2].x + this.priceControl.width + 10, y: this.testContext.points[2].y + 10}];
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.onDrag  = function (points)
    {
        if(typeof this.settings.restriction == 'function') {
            this.settings.restriction.call(this, points);
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.onDrop = function (mode) {
        if(typeof this.settings.onDrop == 'function') {
            this.settings.onDrop.call(this, mode);
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.getElementAreaPos = function (coords)
    {
        var max = Math.max.apply(Math,coords.map(function(o, i){return i < 3 ? o.y : null;}));
        var min = Math.min.apply(Math,coords.map(function(o, i){return i < 3 ? o.y : max;}));

        if(this.selected) {
            return [
                { x: coords[0].x - this.elementArea.left, y: min - this.elementArea.top },
                { x: coords[0].x + this.priceControl.width + this.elementArea.right, y: max + this.elementArea.bottom }
            ];
        } else {
            return [
                { x: coords[0].x - this.elementArea.left, y: min - this.elementArea.top + 30 },
                { x: coords[0].x + this.priceControl.width + this.elementArea.right, y: max + this.elementArea.bottom }
            ];
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.switchControl = function (control)
    {
        for(var i in this.controls) {
            if(control.type == this.controls[i].type) {
                this.controls[i].active = false;
            }
        }
        control.active = true;

        this.layer.render();
    };

    iChart.Charting.ChartVisualtrade.prototype.getControl = function (type, value)
    {
        for(var i in this.controls) {
            if(this.controls[i].type == type && this.controls[i].value == value) {
                return this.controls[i];
            }
        }
    };

    iChart.Charting.ChartVisualtrade.prototype.getControlValue = function (type)
    {
        for(var i in this.controls) {
            if(this.controls[i].type == type && this.controls[i].active) {
                return this.controls[i].value;
            }
        }
    };

    iChart.Charting.ChartVisualtrade.lightColor = function (rgb)
    {
        rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
        for (var i = 0; i < 3; i++) {
            rgb[i] = parseInt(rgb[i]) + 40;
        }
        return 'rgba(' + rgb.join(", ") + ')';
    };
})();

