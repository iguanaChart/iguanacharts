/**
 * Created by Матафонов Денис on 04.12.15.
 *
 *
 * Схема работы: основная функция, которая запускается чтобы показать торговые панели - это startShowTradePanelsInterval
 * Она вызывает интервал, который чекает текущую позицию и рисует их на графике.
 * Функцию можно вызвать (перевызвать) отдельным статическим методом showTradePanels.

 */


function extendIChartWithTradePanels(){

    //Интервал показа приказов на графике
    this.showTradePanelsCycleInterval = false;

    //Тикер по которому меняются приказы на графике
    this.showTradePanelsCycleTicker = false;

    //Отрисованная позиция
    this.drawnTradePanels = false;

    //Выбранный тип SLTP приказа
    this.sltpActive = false;

    //Оправляемый в текущий момент приказ
    this.sendingOrderType = false;

    //Показывать ли элементы /по дфеолту false. Если включаем, то туда же пишется первый price
    this.tradePanelsInitPrice = false;

    var _this = this;

    //Запуск интервала слушателя приказов
    this.startShowTradePanelsInterval = function(ticker){

        //Если интервал уже запушен и он по нужному тикеру, то ничего больше делать не надо
        if (this.showTradePanelsCycleInterval) {
            return false;
        }

        this.showTradePanelsCycleTicker = ticker;

        //Чистим старый интервал если есть
        if (this.showTradePanelsCycleInterval) {

            clearInterval(this.showTradePanelsCycleInterval);
        }

        //Подписываемся на котировки (вдруг нету)
        jNTModel.addCode(ticker);

        this.showTradePanelsCycleInterval = setInterval(function(){

            if (_this.viewData && _this.viewData.chart && _this.viewData.chart.container) {

                if (!$.contains(document, _this.viewData.chart.container)) {

                    clearInterval(_this.showTradePanelsCycleInterval);
                    return false;
                }

            }

            //Если график еще не готов
            if (!_this.viewData.chart || !_this.viewData.chart.canvas || !_this.viewData.chart.areas) {

                return false;
            }

            //Если нет котировки

            //Если выключена настройка показа приказов
            if (!_this.tradePanelsInitPrice) {

                _this.removeTradePanels();
                _this.drawnTradePanels = false;
                return false;
            }


            if (_this.showTradePanelsCycleTicker != _this.userSettings.currentSecurity.nt_ticker) {

                _this.removeTradePanels();
                _this.showTradePanelsCycleTicker = _this.userSettings.currentSecurity.nt_ticker;
            }

            var ticker = _this.showTradePanelsCycleTicker;

            var position = jNT.pos.json.position[ticker];
            var Q = jNT.quote.jsonP[ticker];
            var quantity = (jNTChartTrading.initialized) ? jNTChartTrading.order.quantity : Q.x_lot;
            var cur_quantity = (jNT.pos.json.position[ticker]) ? jNT.pos.json.position[ticker].cur_bal_q : 0;

            //Создаем возможные панели - лимитный приказ
            var tradePanels = {
                'limit': {
                    quantity:quantity,
                    cur_quantity:cur_quantity,
                    ltp: Q.ltp,
                    min_step: Q.min_step,
                    autoInit: (Object.keys(_this.drawnTradePanels).length == 0) ? _this.tradePanelsInitPrice : false
                }
            };

            //Стоп лосс
            if (position && !jNT.order.slList[ticker]) {
                tradePanels['sl'] = {
                    quantity:quantity,
                    cur_quantity:cur_quantity,
                    ltp: Q.ltp,
                    min_step: Q.min_step
                }
            }

            //Тейк профит
            if (position && !jNT.order.tpList[ticker]) {
                tradePanels['tp'] = {
                    quantity:quantity,
                    cur_quantity:cur_quantity,
                    ltp: Q.ltp,
                    min_step: Q.min_step
                }
            }

            //Проверяем нужно ли перерисовывать
            var fullRedraw = false;
            if (!_this.drawnTradePanels) {

                fullRedraw = true;
            } else {

                if (Object.keys(tradePanels).length != Object.keys(_this.drawnTradePanels).length) {

                    fullRedraw = true;
                }

                if (tradePanels.limit.ltp != _this.drawnTradePanels.limit.ltp) {

                    fullRedraw = true;
                }

                if (tradePanels.limit.quantity != _this.drawnTradePanels.limit.quantity) {

                    fullRedraw = true;
                }

            }

            //Перерисовываем приказы если встретились изменившиеся
            if (fullRedraw && _this.tradePanelsInitPrice) {

                _this.drawnTradePanels = tradePanels;
                _this.redrawTradePanel();
            }


            //Интервал проверяет и перезапускает при необходимости сам себя
            _this.showTradePanels();

        }, 300)
    };

    //Данные по позиции
    this.getTradePanelData = function(type, panel){

        var tradePanelData = {};

        tradePanelData.type = type;
        tradePanelData.quantity = panel.quantity;
        tradePanelData.min_step = panel.min_step;
        tradePanelData.ltp = panel.ltp;

        switch (type) {
            case 'limit':
                tradePanelData.buyText = _t('15801', 'Выставить приказ на покупку %quantity% шт. по %price%');
                tradePanelData.sellText = _t('15802', 'Выставить приказ на продажу %quantity% шт. по %price%');
                tradePanelData.fillStyle = '#2196f3';
                tradePanelData.price = (panel.autoInit) ? panel.autoInit : panel.ltp;
                tradePanelData.autoInit = panel.autoInit;

                break;

            case 'sl':
                tradePanelData.buyText = _t('15804', 'Выставить StopLoss по %price% (%percent% от текущей)');
                tradePanelData.sellText = _t('15804', 'Выставить StopLoss по %price% (%percent% от текущей)');
                tradePanelData.fillStyle = '#e53935';
                tradePanelData.price = (panel.cur_quantity > 0) ? panel.ltp * 0.99 : panel.ltp * 1.01;
                tradePanelData.selected = (this.sltpActive == 'stopLoss');

                tradePanelData.restriction = function(points){

                    var balancePrice = (jNT.pos.json.position[_this.showTradePanelsCycleTicker]) ? jNT.pos.json.position[_this.showTradePanelsCycleTicker].otp : panel.ltp;

                    if (panel.cur_quantity > 0) {

                        points[0].y = Math.min(points[0].y, balancePrice);
                        tradePanelData.max = balancePrice;

                    } else {

                        points[0].y = Math.max(points[0].y, balancePrice);
                        tradePanelData.min = balancePrice;
                    }
                }



                break;

            case 'tp':
                tradePanelData.buyText = _t('15805', 'Выставить TakeProfit по %price% (%percent% от текущей)');
                tradePanelData.sellText = _t('15805', 'Выставить TakeProfit по %price% (%percent% от текущей)');
                tradePanelData.fillStyle = '#74D108';
                tradePanelData.price = (panel.cur_quantity > 0) ? panel.ltp * 1.01 : panel.ltp * 0.99;
                tradePanelData.selected = (this.sltpActive == 'takeProfit');

                tradePanelData.restriction = function(points){

                    var balancePrice = (jNT.pos.json.position[_this.showTradePanelsCycleTicker]) ? jNT.pos.json.position[_this.showTradePanelsCycleTicker].otp : panel.ltp;

                    if (panel.cur_quantity > 0) {

                        points[0].y = Math.max(points[0].y, balancePrice);
                        tradePanelData.min = balancePrice;

                    } else {

                        points[0].y = Math.min(points[0].y, balancePrice);
                        tradePanelData.max = balancePrice;
                    }
                }

                break;
        }


        tradePanelData.onDrag = function() {
            if (this.markers) {

                var newPrice = iChart.roundToPrecision(this.markers[0].y, _this.userSettings.currentSecurity.min_step);
                var oldPrice = iChart.roundToPrecision(this.points[0].y, _this.userSettings.currentSecurity.min_step);

                if (newPrice == oldPrice) return;

                $(jNTChartTrading).trigger('priceExternalUpdate', [this.settings.type, newPrice, _this.userSettings.currentSecurity.min_step]);


                var y = _this.wrapper.offset().top - $(document).scrollTop() + _this.viewData.chart.overlay.area.getYPosition(newPrice) - 19;
                $(jNTChartTrading).trigger('positionExternalUpdate', y);
            }
        };

        tradePanelData.onDrop = function() {
            //console.log('dropped trade panel', this);
        };

        tradePanelData.onSelect = function(event) {

            var price = iChart.roundToPrecision(this.points[0].y, _this.userSettings.currentSecurity.min_step);
            var ltp = this.settings.ltp;
            var x = this.layer.area.getXPositionByValue(this.points[0].x / 1000);

            var ticker = _this.showTradePanelsCycleTicker;

            var sl = (this.type == 'sl') ? price : null;
            var tp = (this.type == 'tp') ? price : null;

            var position = {
                x: x,
                y: event.pageY - 19 /*19 это половины высоты самого элемента управления - чтобы он посередине располагался*/
            };


            $(jNTChartTrading).trigger('priceExternalUpdate', [this.settings.type, price, this.settings.min_step]);

            var y = _this.wrapper.offset().top - $(document).scrollTop() + _this.viewData.chart.overlay.area.getYPosition(price) - 19;
            $(jNTChartTrading).trigger('positionExternalUpdate', y);

        }

        //Ограничитель движения
        /*positionData.restriction = function() {
            var points = arguments[0];
            points[0].y = positionData.price;
        };*/



        tradePanelData.onCancel = function(){

            _this.closeTradePanel(panel);

        };

        return tradePanelData;
    };


    this.closeTradePanel = function(panel){


    };

    //Отрисовка полосок приказов на графике
    this.redrawTradePanel = function() {

        if (!_this.drawnTradePanels) return;

        var tradePanels = [];

        $.each(_this.drawnTradePanels, function(type, panel){
            tradePanels.push({type: type, panel: panel});
        });

        tradePanels.sort(function(a, b){
            if (a.type == 'limit') return 1;
            return -1;
        });

        tradePanels.forEach(function(p){
            var tradePanelData = _this.getTradePanelData(p.type, p.panel);
            _this.setTradePanel(tradePanelData);
        })

    };

    //Базовая триггерная функция для запуска или перезапуска интервала отрисовки приказов
    this.showTradePanels = function () {

        //Просто запускаем интервал
        return this.startShowTradePanelsInterval(this.userSettings.currentSecurity.nt_ticker);
    };


    //Убираем все приказы с графика
    this.removeTradePanels = function () {

        var needToRender = false;

        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];


                //Удаляем все подряд
                if(element.elementType == "TradePanel") {
                    overlayHistory.splice(i, 1);
                    i--;
                    needToRender = true;

                }
            }

            if (needToRender) {

                this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });

            }

        }
    };



    this.setTradePanel = function (data) { //@todo допилить

        if(typeof this.viewData.chart != "undefined") {


            var needFullRender = false;

            //Проверим может быть такой элемент уже нарисован
            var updated = false;
            if (_this.viewData.chart.overlay && _this.viewData.chart.overlay.history) {

                $.each(_this.viewData.chart.overlay.history, function(i, element){

                    if (element && element.elementType == 'TradePanel' && element.type == data.type) {

                        element.settings = data;
                        element.settings.sendingOrder = (element.type == _this.sendingOrderType);

                        element.layer.render();
                        updated = true;

                    }
                });

            }

            //Если его еще нет, то создадим заново
            if (!updated) {

                var element = this.viewData.chart.overlay.createElement("TradePanel");
                element.hasSettings = true;
                element.settings = data;
                element.type = data.type;
                element.points = [{'x':new Date(), 'y':data.price}];
                element.controlEnable = true;
                element.drawSingle = true;

                this.viewData.chart.overlay.history.push(element);

                needFullRender = true;
            }

            //Если нарисован какой то не тот, который сейчас может быть показан (при выборе принудительно)
            $.each(_this.viewData.chart.overlay.history, function(i, element){

                if (element && element.elementType == 'TradePanel' && !_this.drawnTradePanels[element.type]) {
                    _this.viewData.chart.overlay.history.splice(i, 1);

                    needFullRender = true;
                }

            });


            //Если принудительно установлено какой из sltp должен быть выбранным
            if (_this.sltpActive) {

                var foundSelected = false;
                $.each(_this.viewData.chart.overlay.history, function(i, element){
                    if (element.elementType == 'TradePanel') {

                        if ( (element.type == 'sl' && _this.sltpActive == 'stopLoss') || (element.type == 'tp' && _this.sltpActive == 'takeProfit')) {

                            element.selected = true;
                            _this.viewData.chart.overlay.selected = element;
                            element.layer.render();

                            foundSelected = true;

                        } else {

                            element.selected = false;

                        }

                    }
                });

                //Если ни одна панель не оказалась выбранной, нужно найти SL/TP приказ и выбрать его
                if (!foundSelected) {

                    $.each(_this.viewData.chart.overlay.history, function(i, element){
                        if (element.elementType == 'Order') {

                            if ( (element.settings.type == 'sl' && _this.sltpActive == 'stopLoss') || (element.settings.type == 'tp' && _this.sltpActive == 'takeProfit')) {

                                element.selected = true;
                                _this.viewData.chart.overlay.selected = element;

                                $(jNTChartTrading).trigger('priceExternalUpdate', [this.settings.type, this.settings.price, this.settings.price]);

                                foundSelected = true;
                                needFullRender = true;

                            } else {

                                element.selected = false;

                            }

                        }
                    });

                }

                _this.sltpActive = false;
            }


            //Отсортируем так, чтобы элементы TradePanel были в самом конце и имели приоритет при хувере и селекте
            _this.viewData.chart.overlay.history.sort(function(a, b){
                if (a && a.elementType == 'TradePanel') return -1;
                return 1;
            });


            //Если нужно все перерендерить
            if (needFullRender) {

                if(typeof this.viewData.chart != "undefined") {

                    this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });
                }
            }

        }
    };

    //Перемотка
    this.addVisualTradeUI = function (offsetY) {

        if (_this.viewData.chart.areas[0].xSeries.length - _this.viewData.chart.chartOptions.futureAmount > _this.viewData.chart.areas[0].viewport.x.max) {

            this.viewData.chart.viewport.x.min = this.viewData.chart.areas[0].viewport.x.min;
            this.viewData.chart.viewport.x.max = this.viewData.chart.areas[0].viewport.x.max;

            var length = this.viewData.chart.areas[0].viewport.x.max - this.viewData.chart.areas[0].viewport.x.min;
            var lastPoint = this.viewData.chart.areas[0].getXPositionByIndex(this.viewData.chart.areas[0].xSeries.length - 1 - this.viewData.chart.chartOptions.futureAmount) + 400;
            lastPoint = Math.min(lastPoint, this.viewData.chart.areas[0].getXPositionByIndex(this.viewData.chart.areas[0].xSeries.length - 1));
            var max = this.viewData.chart.areas[0].getXIndexByValue(this.viewData.chart.areas[0].getXValue(lastPoint));
            var p = $('<p>').css({width: this.viewData.chart.viewport.x.max});
            var duration = 1000 + (max - this.viewData.chart.viewport.x.max);

            p.animate({
                width: max
            }, {
                duration: duration,
                //easing: 'easeOutQuart',
                step: function (now, fx) {
                    _this.viewData.chart.viewport.x.max = now;
                    _this.viewData.chart.viewport.x.min = now - length;
                    _this.viewData.chart.render({
                        "forceRecalc": true,
                        "resetViewport": false,
                        "testForIntervalChange": true
                    });
                },
                complete: function () {
                    _this.viewData.chart.onDataSettingsChange.call(_this.viewData.chart);

                    _this.wrapper.trigger('iguanaChartEvents', ['hashChanged']);

                    _this.callVisualTrade(offsetY);
                }
            });
        } else {
            _this.callVisualTrade(offsetY);
        }
    };

    //Делаем рендер и вызываем окно выставления приказа
    this.callVisualTrade = function(offsetY) {

        var price = iChart.roundToPrecision(_this.viewData.chart.overlay.area.getYValue(offsetY), _this.userSettings.currentSecurity.min_step);
        var x = _this.viewData.chart.overlay.area.xSeries[_this.viewData.chart.overlay.area.xSeries.length - 1 - _this.viewData.chart.chartOptions.futureAmount];
        x = _this.viewData.chart.overlay.area.getXPositionByValue(x);

        var y = _this.wrapper.offset().top - $(document).scrollTop() + _this.viewData.chart.overlay.area.getYPosition(price);
        console.log('call visual trade', price, x, y);

        var position = {
            x: x - 50, //@todo здесь нужно из икса получить экранные координаты
            y: y - 19 /*19 это половины высоты самого элемента управления - чтобы он посередине располагался*/
        };

        var ticker = _this.userSettings.currentSecurity.nt_ticker;
        var Q = jNT.quote.jsonP[ticker];

        //Если котировки вдруг нет
        if (!Q) {
            jNTModel.addCode(ticker);
            return setTimeout(function(){
                _this.callVisualTrade(offsetY);
            }, 500)
        }

        var ltp = jNT.quote.jsonP[ticker].ltp;
        var operation = (price > ltp) ? 4 : 2;

        jNTChartTrading.show(ticker, operation, price, null, null, function(){

            _this.tradePanelsInitPrice = price; //@todo здесь скачет обратно
            $(jNTChartTrading).trigger('priceExternalUpdate', ['limit', price]);


        }, position);

    }



    //Перерисуем элемент если нужно
    $(jNTChartTrading).on('operationInternalUpdate', function(e){

        _this.redrawTradePanel();
    });

    //Если переключаем стоп лосс/тейк профит
    $(jNTChartTrading).on('sltpInternalUpdate', function(e, sltp){

        _this.sltpActive = sltp;
        _this.redrawTradePanel();
    });

    //Во время отправки приказа немного поменяем текст
    $(jNTChartTrading).on('sendingOrder', function(e, type){

        _this.sendingOrderType = type;
        _this.redrawTradePanel();
    });

    //Когда отправился приказ, текст вернем обратно
    $(jNTChartTrading).on('placedOrder', function(e, orderId){

        _this.sendingOrderType = false;
        _this.selectedOrder = orderId;
        _this.tradePanelsInitPrice = false;
        _this.removeTradePanels();
        jNTChartTrading.close();

    });

    //Слушаем нажатие правой кнопки
    $(_this.wrapper).on('iguanaChartEvents', function(event, name, origEvent) {
        if(name === 'contextmenuCallback') {

            if (!jNTChartTrading.initialized) {

                if(!_this.userSettings.chartSettings.tradingToolsEnable) {
                    console.log('_this.switchTrading()');
                    _this.switchTrading();
                }

                _this.addVisualTradeUI(origEvent.offsetY);
                origEvent.preventDefault();
                return;
                var x = _this.viewData.chart.overlay.area.getXPositionByValue(new Date().getTime()/1000);
                var y = _this.wrapper.offset().top - $(document).scrollTop() + _this.viewData.chart.overlay.area.getYPosition(price);

                var position = {
                    x: x - 50,
                    y: y - 19 /*19 это половины высоты самого элемента управления - чтобы он посередине располагался*/
                };

                var ticker = _this.userSettings.currentSecurity.nt_ticker;
                var ltp = jNT.quote.jsonP[ticker].ltp;
                var operation = (price > ltp) ? 4 : 2;

                jNTChartTrading.show(ticker, operation, price, null, null, function(){

                    _this.tradePanelsInitPrice = price;
                    $(jNTChartTrading).trigger('priceExternalUpdate', ['limit', price]);

                }, position);

            } else {

                _this.tradePanelsInitPrice= false;
                jNTChartTrading.close();
            }

            origEvent.preventDefault();
        }
    });

    this.showTradePanels();
}
