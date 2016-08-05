/**
 * Created by Матафонов Денис on 04.12.15.
 *
 *
 * Схема работы: основная функция, которая запускается чтобы показать приказы - это startShowOrdersInterval
 * Она вызывает интервал, который чекает при приказы и рисует их на графике.
 * Функцию можно вызвать (перевызвать) отдельным статическим методом showOrders который раньше использовался и который вызывается по событию нового приказа.
 * Сейчас этот метод просто запускает интервал если он еще не запущен.
 */


function extendIChartWithTrandorders(){

    //Интервал показа приказов на графике
    this.showOrdersCycleInterval = false;

    //Тикер по которому меняются приказы на графике
    this.showOrdersCycleTicker = false;

    //Коллекция уже отрисованных приказов
    this.drawnOrders = {};

    this.selectedOrder = false;

    //Принудительно выбранный стоп-лосс (из JntChartTRading_
    this.sltpActive = false;

    var _this = this;

    //Запуск интервала слушателя приказов
    this.startShowOrdersInterval = function(ticker){

        //Если интервал уже запушен и он по нужному тикеру, то ничего больше делать не надо
        if (this.showOrdersCycleInterval) {
            return false;
        }

        this.showOrdersCycleTicker = ticker;

        //Чистим старый интервал если есть
        if (this.showOrdersCycleInterval) {

            clearInterval(this.showOrdersCycleInterval);
            this.drawnOrders = {};
        }

        //Подписываемся на котировки (вдруг нету)
        jNTModel.addCode(ticker);

        this.showOrdersCycleInterval = setInterval(function(){

            if (_this.viewData && _this.viewData.chart && _this.viewData.chart.container) {

                if (!$.contains(document, _this.viewData.chart.container)) {

                    clearInterval(_this.showOrdersCycleInterval);
                    return false;
                }

            }

            //Если график еще не готов
            if (!_this.viewData.chart || !_this.viewData.chart.canvas || !_this.viewData.chart.areas) {

                return false;
            }

            //Если выключена настройка показа приказов
            if (!_this.userSettings.chartSettings.tradingToolsEnable) {

                _this.removeOrders();
                _this.drawnOrders = {};

                return false;
            }


            if (_this.showOrdersCycleTicker != _this.userSettings.currentSecurity.nt_ticker) {

                _this.removeOrders();
                _this.drawnOrders = {};

                _this.showOrdersCycleTicker = _this.userSettings.currentSecurity.nt_ticker;
            }

            var ticker = _this.showOrdersCycleTicker;


            //Проверим есть ли приказы, которые еще не были отрисованы на графике
            var allOrdersDrawn = true;
            var orders = jNT.order.activeList[ticker];
            var activeOrdersIds = [];

            if (orders) {

                $.each(orders, function(price, priceOrders){
                    $.each(priceOrders, function(orderId, order){

                        //Берем все, кроме тех, которые в процессе удаления
                        if (order.stat != 2) {

                            activeOrdersIds.push(orderId);

                            //Таймстемп последней смены статуса
                            order.statChangeTimeStamp = Date.parse(order.stat_d);

                            //Если такого приказа вообще еще не рисовали, то точно надо перерисовывать
                            if (!_this.drawnOrders[orderId]) {

                                //Активные приказы нарисуем
                                allOrdersDrawn = false;

                            } else {

                                //Если более свежий приказ
                                if (order.statChangeTimeStamp > _this.drawnOrders[orderId].statChangeTimeStamp) {

                                    allOrdersDrawn = false;

                                }

                                //Если это трейлинговый приказ, то нужно отдельно проверить цену
                                if (order.type ==5 && order.stop != _this.drawnOrders[orderId].stop) {

                                    allOrdersDrawn = false;
                                }
                            }

                            _this.drawnOrders[orderId] = order;

                        }

                        //Если пришла инфа по фейковому ордеру, то удалим фейковый
                        if (_this.drawnOrders['fake'] && _this.drawnOrders['fake'].id == orderId) {

                            delete _this.drawnOrders['fake'];
                        }
                    })
                });
            }

            //Проверим нет ли у нас на графике приказов которые были активным, а сейчас уже нет
            $.each(_this.drawnOrders, function(orderId, order){

                //fake - это специальный флаг фейкового приказа который только ожидается
                if (activeOrdersIds.indexOf(orderId) == -1 && orderId != 'fake') {

                    delete _this.drawnOrders[orderId];
                    allOrdersDrawn = false;
                }
            });


            //Перерисовываем приказы если встретились изменившиеся
            if (!allOrdersDrawn) {

                _this.redrawOrders();
            }


            //Интервал проверяет и перезапускает при необходимости сам себя
            _this.showOrders();

        }, 300)
    };


    //Отрисовка полосок приказов на графике
    this.redrawOrders = function() {

        this.removeOrders();

        var orders = _this.drawnOrders;

        if (orders) {

            $.each(orders, function(orderId, order){
                var orderData = {};

                orderData.date = new Date(order.date.replace(/T/, ' '));
                orderData = _this.getDrawOrderParams(order, orderData);

                if(!$.isEmptyObject(orderData)) {
                    _this.setOrder(orderData);
                }
            });
        } else {

            _this.drawnOrders = {};
        }

        if(typeof this.viewData.chart != "undefined") {
            var rendered = this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });
            if (!rendered) {
                _this.drawnOrders = {};
            }
        } else {
            _this.drawnOrders = {};
        }
    };

    //Базовая триггерная функция для запуска или перезапуска интервала отрисовки приказов
    this.showOrders = function () {

        //Просто запускаем интервал
        return this.startShowOrdersInterval(this.userSettings.currentSecurity.nt_ticker);
    };


    //Убираем все приказы с графика
    this.removeOrders = function () {

        var needToRender = false;
        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];

                //если элемент в обработке this.orders[element.settings.id], то не удаляем
                if(element.elementType == "Trendorder") {
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

    //Окно подтверждения приказа
    this.confirmOrderChange = function(order, oldPrice, newPrice, confirmCallback) {

        //Если подтверждение приказа не требуется
        if (jNTCore.getStItem("one-click-deal") == '1') {
            return _this.changeOrder(order, function(orderId){

                if (confirmCallback && typeof confirmCallback == 'function') {
                    confirmCallback(orderId);
                }

            });
        }


        var chartOrderWindow = $("<div />").kendoWindow(
            {
                title: _t('5440', "Подтверждение приказа"),
                actions: [],
                resizable: false
            }
        );

        var orderString = '',
            cancelString = '',
            confirmString = '';

        switch (order.type) {

            //Лимитный приказ
            case 2:

                cancelString = (order.oper < 3) ? _t('15664', 'Снять лимитный приказ на покупку %s шт. %s по %s') : _t('15665', 'Снять лимитный приказ на продажу %s шт. %s по %s');
                confirmString = (order.oper < 3) ? _t('15666', 'Выставить лимитный приказ на покупку %s шт. %s по %s') : _t('15667', 'Выставить лимитный приказ на продажу %s шт. %s по %s');

                orderString = ''
                    + '<p>' + sprintf(cancelString, _s(order.q), order.instr, _s(oldPrice)) + '</p>'
                    + '<p>' + sprintf(confirmString, _s(order.q), order.instr, _s(newPrice)) + '</p>';

                break;

            case 3:

                cancelString = (order.oper < 3) ? _t('15668', 'Снять рыночный приказ на покупку %s шт. %s с условием %s') : _t('15669', 'Снять рыночный приказ на продажу %s шт. %s с условием %s');
                confirmString = (order.oper < 3) ? _t('15670', 'Выставить рыночный приказ на покупку %s шт. %s с условием %s') : _t('15671', 'Выставить рыночный приказ на продажу %s шт. %s с условием %s');

                orderString = ''
                    + '<p>' + sprintf(cancelString, _s(order.q), order.instr, _s(oldPrice)) + '</p>'
                    + '<p>' + sprintf(confirmString, _s(order.q), order.instr, _s(newPrice)) + '</p>';

                break;

            case 4:

                cancelString = (order.oper < 3) ? _t('15672', 'Снять лимитный приказ на покупку %s шт. %s по %s с условием %s') : _t('15673', 'Снять лимитный приказ на продажу %s шт. %s с условием %s');
                confirmString = (order.oper < 3) ? _t('15674', 'Выставить лимитный приказ на покупку %s шт. %s по %s с условием %s') : _t('15675', 'Выставить лимитный приказ на продажу %s шт. %s с условием %s');

                orderString = ''
                    + '<p>' + sprintf(cancelString, _s(order.q), order.instr, _s(order.p), _s(oldPrice)) + '</p>'
                    + '<p>' + sprintf(confirmString, _s(order.q), order.instr, _s(order.p), _s(newPrice)) + '</p>';

                break;


            case 5:

                cancelString = (order.trailing == 0) ? _t('15676', 'Снять Stop Loss по %s') : _t('15677', 'Снять следящий Stop Loss');
                confirmString = (order.trailing == 0) ? _t('15678', 'Выставить Stop Loss по %s') : '' /*//текст для выставления следящего определяется ниже*/;

                if (order.trailing !=0) {
                    confirmString = _t('15679', 'Выставить следящий Stop Loss %s%% от текущей рыночной цены');
                    if (jNT.pos.json.position[order.instr].cur_bal_q > 0) {

                        newPrice = '-' + _s(order.stop_loss_percent, 2);
                    } else {
                        newPrice = '+' + _s(order.stop_loss_percent, 2);
                    }
                }

                orderString = ''
                    + '<p>' + sprintf(cancelString, _s(oldPrice)) + '</p>'
                    + '<p>' + sprintf(confirmString, _s(newPrice)) + '</p>';

                break;

            case 6:

                cancelString = _t('15680', 'Снять Take Profit по %s');
                confirmString = _t('15681', 'Выставить Take Profit по %s');

                orderString = ''
                    + '<p>' + sprintf(cancelString, _s(oldPrice)) + '</p>'
                    + '<p>' + sprintf(confirmString, _s(newPrice)) + '</p>';

                break;


        }


        var windowContent = orderString;

        windowContent += '<div class="uk-form uk-margin-bottom uk-margin-top"><input type="checkbox" checked="checked" class="need-confirm">'+ _t('15682', 'Спрашивать подтверждение') +'</div>';
        windowContent += '<div class="center">' +
            '<button class="ok-confirm k-button">' + _t('614', "Ok") + '</button> ' +
            '<button class="cancel-confirm k-button">' + _t('1403', "Отмена") + '</button>' +
            '</div>';

        chartOrderWindow.data("kendoWindow")
            .content(windowContent)
            .center()
            .open();

        chartOrderWindow.on('change', '.need-confirm', function(){
            var $this = $(this),
                enabledOneClick = !$this.prop('checked');

            jNTCore.setStItem("one-click-deal", (enabledOneClick ? 1 : 0) );

        });

        chartOrderWindow.one('click touchend', '.ok-confirm,.cancel-confirm', function() {
            if ($(this).hasClass("ok-confirm")) {

                _this.changeOrder(order, function(orderId){

                    chartOrderWindow.data("kendoWindow").destroy();

                    if (confirmCallback && typeof confirmCallback == 'function') {
                        confirmCallback(orderId);
                    }

                });

            } else {

                chartOrderWindow.data("kendoWindow").destroy();

            }

            _this.redrawOrders();
        });

    };

    //Рисование приказа
    this.getDrawOrderParams = function(_order, orderData) {

        var order = $.extend(true, {}, _order);
        orderData.id = order.id;

        //Нельзя таскать и выбирать- просто линия рисуется
        orderData.controlEnable = !(order.uiState == 'placing' || order.uiState == 'cancelling');

        //Немного прозрачности для выставляемых и отправляемых приказов, которые нельзя двигать
        var opacity = (order.uiState == 'placing' || order.uiState == 'cancelling') ? 0.1 : 0.75;

        orderData = this.getOrderDataParams(order, orderData, opacity);

        if (order.type == 5) orderData.type = 'sl';
        if (order.type == 6) orderData.type = 'tp';

        //Для приказов в промежуточном статусе поменяем текст
        if (order.uiState == 'cancelling') {

            orderData.text = sprintf(_t('15683', 'Отменяем...'));
            orderData.fillStyle = "rgba(119,119,119,1)" /*темно серый*/;
            orderData.selected = true;

        } else if (order.uiState == 'placing') {

            orderData.text = sprintf(_t('15684', 'Выставляем...'));
            orderData.fillStyle = "rgba(119,119,119,1)" /*темно серый*/;
            orderData.selected = true;
        }

        //Когда бросили приказ
        orderData.onDrop = function() {

            if(this.settings.mode == "trend") {
                var price = iChart.roundToPrecision(this.settings.newOrderParams.points[0].y, _this.userSettings.currentSecurity.min_step);
                var price2 = iChart.roundToPrecision(this.settings.newOrderParams.points[1].y, _this.userSettings.currentSecurity.min_step);

                if(!order.condition || order.condition.price1 != price || order.condition.price2 != price2) {
                    var priceChanged = true;
                }

            } else {
                var price = iChart.roundToPrecision(this.points[0].y, _this.userSettings.currentSecurity.min_step),
                    orderPrice = order.p;

                //Если при действии пользователя изменилась цена приказа - стоп для всех или p для лимитного приказа
                var priceChanged = (order.type == 2) ? (order.p != price) : (order.stop != price);
            }

            if(!priceChanged) {

                //Цена не изменилась, ничего не делаем
                return false;

            } else {

                if(this.settings.mode == "trend") {
                    var d1 = new Date(this.settings.newOrderParams.points[0].x);
                    var d2 = new Date(this.settings.newOrderParams.points[1].x);
                    var condition = {
                        date1: iChart.formatDateTime(d1, "yyyy-MM-ddTHH:mm:ss") + "." + d1.getMilliseconds(),
                        date2: iChart.formatDateTime(d2, "yyyy-MM-ddTHH:mm:ss") + "." + d2.getMilliseconds(),
                        tm1: this.settings.newOrderParams.points[0].x,
                        tm2: this.settings.newOrderParams.points[1].x,
                        price1: iChart.roundToPrecision(this.settings.newOrderParams.points[0].y, _this.userSettings.currentSecurity.min_step),
                        price2: iChart.roundToPrecision(this.settings.newOrderParams.points[1].y, _this.userSettings.currentSecurity.min_step),
                        tf: this.layer.chart.env.dataSource.dataSettings.timeframe * 60
                    };
                    order.condition = JSON.stringify(condition);
                    order.type =  3;
                }


                switch (order.type) {

                    //Меняем цену у лимитного приказа
                    case 2:
                        order.p = price;
                        break;

                    case 3:
                        order.stop_price = price;
                        order.stop = price;
                        break;

                    case 5:

                        order.stop = price;

                       if (order.trailing != 0) {

                           //Нужно определить на какой процент изменится трейлинг по сравнению с текущей ценой если выставить сейчас
                           var ltp = jNT.quote.jsonP[order.instr].ltp;
                           var percent = 100- Math.min(price, ltp) * 100 / (Math.max(price, ltp));

                           order.stop_loss_percent = percent;
                           order.stoploss_trailing_percent = percent;
                       }

                        break;

                    //Меняем стоп у всех остальных
                    default:
                        order.stop = price;
                }
            }

            this.controlEnable = false;


            //Пометим, что приказ отправляется

            _this.drawnOrders[order.id].price = price;

            //Окно подтверждения приказа
            _this.confirmOrderChange(order, orderPrice, price, function(orderId){

                //Приказ успешно перевыставлен, можно делать что то новое
            })

        };


        orderData.onSelect = function(){
            this.timeSelected = new Date().getTime();
        };


        //Пока двигаем приказ
        orderData.onDrag = function(markers){
            var chartOfElement = this.layer.chart.env;
            var newPrice = iChart.roundToPrecision(markers[0].y, chartOfElement.userSettings.currentSecurity.min_step),
                orderId = this.settings.id,
                _order = $.extend(true, {}, chartOfElement.drawnOrders[orderId]);

            switch (_order.type) {

                case 2:
                    _order.p = newPrice;
                    break;

                default:
                    _order.stop = newPrice;
            }

            var orderData = chartOfElement.getOrderDataParams(_order, this.settings, 1);


            this.settings.text = orderData.text;

        }

        orderData.onCancel = function() {

            _this.removeOrder(order);
        };

        return orderData;

    };

    //Получение параметров приказа в зависимости от типа
    this.getOrderDataParams = function(order, orderData, opacity) {

        var digits = _d(this.userSettings.currentSecurity.min_step);
        var ltp = jNT.quote.jsonP[order.instr].ltp;
        var diffToCurrentPrice = 100*(order.stop/ltp-1);
        diffToCurrentPrice = (diffToCurrentPrice>0) ? '+' + _s(diffToCurrentPrice, 2) : _s(diffToCurrentPrice, 2);
        diffToCurrentPrice += '%';

        var string;
        switch (order.type) {

            //Лимитный приказ
            case 2:
                orderData.fillStyle = (order.oper < 3) ? "rgba(0,176,255," + opacity +")" : "rgba(0,176,255," + opacity + ")" /*голубой*/;
                orderData.price = parseFloat(order.p);

                orderData.text = (order.oper < 3) ? _t('15793', 'Приказ на покупку %QUANTITY% шт. по %PRICE%', {'QUANTITY':_s(order.q),'PRICE':_s(order.p, digits)}) : _t('15794', 'Приказ на продажу %QUANTITY% шт. по %PRICE%', {'QUANTITY':_s(order.q),'PRICE':_s(order.p, digits)});
                //orderData.text = sprintf(string, _s(order.q), _s(order.p, digits));

                break;

            //Стоп приказ
            case 3:
                orderData.fillStyle = (order.oper < 3) ? "rgba(0,176,255," + opacity +")" : "rgba(0,176,255," + opacity + ")" /*голубой*/;
                orderData.price = parseFloat(order.stop);

                orderData.text = (order.oper < 3) ? _t('15795', 'Приказ на покупку по рынку %QUANTITY% шт. при достижении цены %STOP%', {'QUANTITY':_s(order.q),'STOP':_s(order.stop, digits)}) : _t('15796', 'Приказ на продажу по рынку %QUANTITY% шт. при достижении цены %STOP%', {'QUANTITY':_s(order.q),'STOP':_s(order.stop, digits)});
                //orderData.text = sprintf(string, _s(order.q), _s(order.stop, digits));

                var condition = JSON.parse(order.condition);

                if(!$.isEmptyObject(condition)) {
                    orderData.date = condition.tm1;
                    orderData.price = condition.price1;
                    orderData.date2 = condition.tm2;
                    orderData.price2 = condition.price2;
                    orderData.tf = condition.tf;
                    orderData.mode = "trend";
                }

                break;

            //Стоп лимитный приказ
            case 4:
                orderData.fillStyle = (order.oper < 3) ? "rgba(0,176,255," + opacity +")" : "rgba(0,176,255," + opacity + ")" /*голубой*/;
                orderData.price = parseFloat(order.stop);

                orderData.text = (order.oper < 3) ? _t('15797', 'Приказ на покупку по %PRICE% %QUANTITY% шт. при достижении цены %STOP%',{'QUANTITY':_s(order.q),'PRICE':_s(order.p, digits),'STOP':_s(order.stop, digits)}) : _t('15798', 'Приказ на продажу по %PRICE% %QUANTITY% шт. при достижении цены %STOP%',{'QUANTITY':_s(order.q),'PRICE':_s(order.p, digits),'STOP':_s(order.stop, digits)});
                //orderData.text = sprintf(string, _s(order.p, digits), _s(order.q), _s(order.stop, digits));

                break;

            //Стоп лосс
            case 5:
                orderData.fillStyle = (order.trailing == 0) ? "rgba(244,67,54," + opacity +")" /*красный*/ : "rgba(255,160,0," + opacity + ")" /*оранжевый*/;
                orderData.price = parseFloat(order.stop);

                orderData.text = (order.trailing == 0) ? _t('15799', 'Stop Loss по %STOP% (%DIFFTOCURRENTPRICE%)', {'STOP':_s(order.stop, digits), 'DIFFTOCURRENTPRICE':diffToCurrentPrice}) : _t('15809', 'Следящий Stop Loss по %STOP%, (-%TRAILING%% от %STOPINITPRICE%)', {'STOP':_s(order.stop, digits),'TRAILING':_s(100*order.trailing, 2),'STOPINITPRICE':_s(order.stop_init_price, digits)});
                //orderData.text = (order.trailing == 0) ? sprintf(string, _s(order.stop, digits), diffToCurrentPrice) : sprintf(string, _s(order.stop, digits), _s(100*order.trailing, 2), _s(order.stop_init_price, digits));

                //Ограничения на сдвиги
                if(order.oper < 3) {
                    orderData.restriction = function() {
                        var points = arguments[0];
                        var limitPrice = this.layer.area.ySeries[0].points[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1][3];
                        var limitTime = this.layer.area.xSeries[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1] * 1000;

                        if(this.settings.mode == "line") {
                            if(points[0].y < limitPrice) {
                                points[0].y = limitPrice;
                                points[1].y = limitPrice;
                            }
                        } else {
                            if(this.settings.newOrderParams) {
                                var coords = this.getCoordinates(null, [{x:limitTime, y: limitPrice}, points[0], points[1]]);
                                var screenLimit = iChart.getLineEquation(coords[0], coords[2], coords[1].x);
                                if(coords[1].y > screenLimit.y) {
                                    points[0].y = this.layer.area.getYValue(screenLimit.y);
                                }
                            }
                        }
                    }
                } else {
                    orderData.restriction = function() {
                        var points = arguments[0];
                        var limitPrice = this.layer.area.ySeries[0].points[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1][3];
                        var limitTime = this.layer.area.xSeries[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1] * 1000;

                        if(this.settings.mode == "line") {
                            if(points[0].y > limitPrice) {
                                points[0].y = limitPrice;
                                points[1].y = limitPrice;
                            }
                        } else {
                            if(this.settings.newOrderParams) {
                                var coords = this.getCoordinates(null, [{x:limitTime, y: limitPrice}, points[0], points[1]]);
                                var screenLimit = iChart.getLineEquation(coords[0], coords[2], coords[1].x);
                                if(coords[1].y < screenLimit.y) {
                                    points[0].y = this.layer.area.getYValue(screenLimit.y);
                                }
                            }
                        }
                    }
                }

                break;

            //Тейк профит
            case 6:
                orderData.fillStyle = "rgba(116,208,8," + opacity +")" /*зеленый*/;
                orderData.price = parseFloat(order.stop);

                orderData.text = _t('15800', 'Take Profit по %STOP% (%DIFFTOCURRENTPRICE%)',{'STOP':_s(order.stop, digits),'DIFFTOCURRENTPRICE':diffToCurrentPrice});
                //orderData.text = sprintf(string, _s(order.stop, digits), diffToCurrentPrice);

                if(order.oper == 1) {
                    orderData.restriction = function() {
                        var points = arguments[0];
                        var limitPrice = this.layer.area.ySeries[0].points[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1][3];
                        var limitTime = this.layer.area.xSeries[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1] * 1000;

                        if(this.settings.mode == "line") {
                            if(points[0].y > limitPrice) {
                                points[0].y = limitPrice;
                                points[1].y = limitPrice;
                            }
                        } else {
                            if(this.settings.newOrderParams) {
                                var coords = this.getCoordinates(null, [{x:limitTime, y: limitPrice}, points[0], points[1]]);
                                var screenLimit = iChart.getLineEquation(coords[0], coords[2], coords[1].x);
                                if(coords[1].y < screenLimit.y) {
                                    points[0].y = this.layer.area.getYValue(screenLimit.y);
                                }
                            }
                        }
                    }
                } else {
                    orderData.restriction = function() {
                        var points = arguments[0];
                        var limitPrice = this.layer.area.ySeries[0].points[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1][3];
                        var limitTime = this.layer.area.xSeries[this.layer.area.ySeries[0].points.length-this.layer.chart.chartOptions.futureAmount-1] * 1000;

                        if(this.settings.mode == "line") {
                            if(points[0].y < limitPrice) {
                                points[0].y = limitPrice;
                                points[1].y = limitPrice;
                            }
                        } else {
                            if(this.settings.newOrderParams) {
                                var coords = this.getCoordinates(null, [{x:limitTime, y: limitPrice}, points[0], points[1]]);
                                var screenLimit = iChart.getLineEquation(coords[0], coords[2], coords[1].x);
                                if(coords[1].y > screenLimit.y) {
                                    points[0].y = this.layer.area.getYValue(screenLimit.y);
                                }
                            }
                        }
                    }
                }

                break;
        }

        return orderData;
    }

    //Удаление приказа с графика и отмена в системе
    this.removeOrder = function(order, callback){

        //Найдем старый приказ в активных и удалим его там
        delete _this.drawnOrders[order.id];
        var orders = jNT.order.activeList[order.instr];
        if (orders) {
            $.each(orders, function(price, priceOrders){
                $.each(priceOrders, function(orderId, ord){

                    if (ord.id == order.id) {
                        delete jNT.order.activeList[order.instr][price][order.id];
                    }
                })
            })
        }

        _this.redrawOrders();
        jNTOrder.cancelOrder(order.id, function(){
            if (callback && typeof callback == 'function') {
                callback();
            }
        });
    };

    //Измнение активного приказа
    this.changeOrder = function(order, callback) {

        var orderId = order.id;

        //Не будем показывать сообщение об отмене приказа
        Notifications.skipOrders[orderId] = {hide: true};

        //А спустя пару секунд уже снова будем показывать новости по этому приказу
        setTimeout(function(ordId){

            delete Notifications.skipOrders[ordId];
        }, 1000, orderId);


        //То что нужно сделать после успешного выставления приказа
        function successOrderPlacedCallback(orderId) {

            //Уберем фейковый приказ
            delete _this.drawnOrders['fake'];


            if (typeof callback == 'function') {
                callback(orderId);
            }

            //Пометим что именно этот приказ при отрисовке нужно сделать выбранным
            _this.selectedOrder = orderId;
        }


        //То что нужно сделать если выставить ордер не удалось
        function errorOrderPlacedCallback(){

            delete _this.drawnOrders['fake'];
            _this.redrawOrders();

            if (typeof callback == 'function') {
                callback();
            }
        }


        //Создаем фейковый приказ, который будет висеть, пока не появится новый приказ
        _this.drawnOrders['fake'] = $.extend(true, {}, order);
        _this.drawnOrders['fake'].uiState = 'cancelling';

        //Канселим старый приказ
        _this.removeOrder(order, function(){

            _this.drawnOrders['fake'].uiState = 'placing';
            _this.redrawOrders();

            //Выставляем новый приказ, кроме стоп-лосов и тейк профитов
            if (order.type !=5 && order.type != 6) {

                var postOrder = {
                    code: order.instr,
                    action: order.oper,
                    type: order.type,
                    price: order.p,
                    stop: 0,
                    quantity: order.q,
                    expire: order.exp
                };

                if(order.type == 3) {
                    postOrder.price = "";
                    postOrder.limit_price = "";
                    postOrder.stop = order.stop;
                }

                if(order.condition) {
                    postOrder.condition = order.condition;
                }

                jNTOrder.postOrder(
                    postOrder,
                    function() {
                        //Колбек на отправку приказа
                    },
                    function(orderId) { //Колбек на прием приказа

                        //Если успешно выставили
                        if (orderId) {

                            successOrderPlacedCallback.call(_this, orderId);

                        } else {

                            //Если выставить новый приказ не удалось
                            errorOrderPlacedCallback.call(_this);
                        }
                    }
                );
            }


            //Выставляем SLTP
            else {


                var postOrder = {
                    code: order.instr
                };

                if (order.type == 6) {

                    postOrder['tp'] = order.stop;

                } else if (order.type == 5) {

                    if (order.trailing == 0) {

                        postOrder['sl'] = order.stop;

                    } else {

                        postOrder['slp'] = order.stop_loss_percent;
                        postOrder['stoploss_trailing_percent'] = order.stoploss_trailing_percent;
                    }
                }

                jNTOrder.postOrderSLTP(
                    postOrder,
                    function() {
                        //Колбек на отправку приказа
                    },
                    function(orderId) { //Колбек на прием приказа

                        //Если успешно выставили
                        if (orderId) {

                            successOrderPlacedCallback.call(_this, orderId);

                        } else {

                            //Если выставить новый приказ не удалось
                            errorOrderPlacedCallback.call(_this);
                        }
                    }
                );

            }


        });

    };

    this.setOrder = function (data) {

        if(typeof this.viewData.chart != "undefined") {

            var element = this.viewData.chart.overlay.createElement("Trendorder");
            element.hasSettings = true;
            //element.settings = data;

            //element.points = [{'x':new Date(), 'y':data.price}];
            element.controlEnable = data.controlEnable;

            if (data.selected) {

                element.selected = true;
                _this.viewData.chart.overlay.selected = element;
            }

            if (data.onDrag && typeof data.onDrag == 'function') {

                data.restriction = function(markers){
                    data.onDrag.call(element, markers)
                };
            }

            element.drawSingle = true;

            element.setSettings(data);
            this.viewData.chart.overlay.history.push(element);


            //Если нужно какой то приказ сделать выбранным
            if (_this.selectedOrder) {

                $.each(this.viewData.chart.overlay.history, function(i, element){

                    if (element) {

                        //element.selected = false;

                        if (element.elementType == 'Trendorder') {

                            if (element.settings.id == _this.selectedOrder) {

                                element.selected = true;
                                _this.viewData.chart.overlay.selected = element;

                                _this.selectedOrder = false;
                            }
                        }
                    }
                });

            }


            //Если нужно какой то SLTP приказ сделать выбранным
            if (_this.sltpActive) {


                $.each(this.viewData.chart.overlay.history, function(i, element){

                    if (element) {

                        element.selected = false;

                        if (element.elementType == 'Trendorder') {

                            if (element.settings.type == 'sl' && _this.sltpActive == 'stopLoss') {

                                element.selected = true;
                                _this.viewData.chart.overlay.selected = element;



                            } else if (element.settings.type == 'tp' && _this.sltpActive == 'takeProfit') {

                                element.selected = true;
                                _this.viewData.chart.overlay.selected = element;

                                console.log('setSelected', element);
                            }
                        }
                    }
                });

                _this.sltpActive = false;
            }
        }
    };

    //Если переключаем стоп лосс/тейк профит
    $(jNTChartTrading).on('sltpInternalUpdate', function(e, sltp){

        _this.sltpActive = sltp;
        _this.redrawOrders();
    });

    this.showOrders();

}
