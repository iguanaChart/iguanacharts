/**
 * Created by Матафонов Денис on 04.12.15.
 *
 *
 * Схема работы: основная функция, которая запускается чтобы показать позицию - это startShowPositionInterval
 * Она вызывает интервал, который чекает текущую позицию и рисует их на графике.
 * Функцию можно вызвать (перевызвать) отдельным статическим методом showPosition.

 */


function extendIChartWithPositions(){

    //Интервал показа приказов на графике
    this.showPositionsCycleInterval = false;

    //Тикер по которому меняются приказы на графике
    this.showPositionsCycleTicker = false;

    //Отрисованная позиция
    this.drawnPosition = false;

    //Сделки которыми была открыта позиция
    this.drawnPositionTrades = false;

    var _this = this;

    //Запуск интервала слушателя приказов
    this.startShowPositionsInterval = function(ticker){

        //Если интервал уже запушен и он по нужному тикеру, то ничего больше делать не надо
        if (this.showPositionsCycleInterval) {
            return false;
        }

        this.showPositionsCycleTicker = ticker;

        //Чистим старый интервал если есть
        if (this.showPositionsCycleInterval) {

            clearInterval(this.showPositionsCycleInterval);
        }

        //Подписываемся на котировки (вдруг нету)
        jNTModel.addCode(ticker);

        this.showPositionsCycleInterval = setInterval(function(){

            if (_this.viewData && _this.viewData.chart && _this.viewData.chart.container) {

                if (!$.contains(document, _this.viewData.chart.container)) {

                    clearInterval(_this.showPositionsCycleInterval);
                    return false;
                }

            }

            //Если график еще не готов
            if (!_this.viewData.chart || !_this.viewData.chart.canvas || !_this.viewData.chart.areas) {

                return false;
            }

            //Если выключена настройка показа приказов
            if (!_this.userSettings.chartSettings.tradingToolsEnable) {

                _this.removePositions();
                _this.drawnPosition = false;
                return false;
            }


            //console.log(_this.showPositionsCycleTicker, _this.userSettings.currentSecurity.nt_ticker);
            //console.log(_this.dataSource.dataSettings.id);
            if (_this.showPositionsCycleTicker != _this.userSettings.currentSecurity.nt_ticker) {

                _this.removePositions();
                _this.showPositionsCycleTicker = _this.userSettings.currentSecurity.nt_ticker;
            }

            var ticker = _this.showPositionsCycleTicker;

            //Если позиции нет
            if (!jNT.pos.json.position[ticker]) {

                _this.removePositions();
                _this.drawnPosition = false;
                return false;
            }

            var position = $.extend(true, {}, jNT.pos.json.position[ticker]);

            var fullRedraw = false,
                paramsRedraw = false;

            //если еещ вообще не рисовали позицию
            if (!_this.drawnPosition || !_this.drawnPositionTrades) {

                fullRedraw = true;

            } else {

                //Проверим изменилась ли позиция
                if (_this.drawnPosition.cur_bal_q != position.cur_bal_q) { //количество
                    fullRedraw = true;
                }

                if (_this.drawnPosition.otp != position.otp) { //стоимость в пунктах
                    fullRedraw = true;
                }

                if (_this.drawnPosition.otps != position.otps) { //стоимость в рублях
                    fullRedraw = true;
                }

                if (_this.drawnPosition.code != ticker) {
                    fullRedraw = true;
                }

                if (_this.drawnPosition.positionId != position.positionId) {
                    fullRedraw = true;
                }

                //Без запроса новых сделок (только лейбл перерисуется)

                if (_this.drawnPosition.pprofit != position.pprofit) { //прибыль
                    paramsRedraw = true;
                }

                if (_this.drawnPosition.gain != position.gain) { //прибыль
                    paramsRedraw = true;
                }



            }

            //Перерисовываем приказы если встретились изменившиеся
            if (fullRedraw && !_this.drawing) {

                _this.drawnPosition = position;
                _this.removePositions();
                _this.getTradesAndRedrawPosition();

            } else if (paramsRedraw) {

                _this.drawnPosition = position;
                _this.redrawPosition();
            }


            //Интервал проверяет и перезапускает при необходимости сам себя
            _this.showPositions();

        }, 300)
    };

    //Данные по позиции
    this.getPositionData = function(position){

        var positionData = {};

        positionData.positionId = position.positionId;

        //Цена
        positionData.price = position.otp;
        //Ограничитель движения
        positionData.restriction = function() {
            var points = arguments[0];
            points[0].y = positionData.price;
        };

        //Текст лейбла
        var step = jNT.quote.jsonP[position.code].min_step;
        var otp = _s(position.otp, _d(step));

        positionData.positionText = (position.cur_bal_q >0) ? _t('15777', 'Открыт лонг %s шт. по %s') : _t('15778', 'Открыт шорт %s шт. по %s');
        positionData.positionText = sprintf(positionData.positionText, _s(position.cur_bal_q), otp);

        positionData.profitText = (position.pprofit > 0) ? _t('15779', 'прибыль +%s (+%s %%)'): _t('15780', 'убыток %s (%s %%)');
        positionData.profitText = sprintf(positionData.profitText, _s(position.pprofit,2), _s(position.gain, 2));

        positionData.fillStyle = '#607d8b';
        positionData.textColor = '#ffffff';
        positionData.profitColor = (position.pprofit > 0 ) ? '#74D108' /*зеленый*/ : '#e53935' /*красный*/;

        var trades = this.drawnPositionTrades;
        positionData.trades = [];

        //Время и цена сделки
        $.each(trades, function(i, trade){

            var time = Date.parse(trade.trade_d.split('+')[0]);
            positionData.trades.push({
                x: time,
                y: trade.p
            });

            if (!positionData.time || positionData.time > time) {
                positionData.time = time;
            }
        });

        positionData.onCancel = function(){

            _this.closePosition(position);

        };

        return positionData;
    }


    this.closePosition = function(position){

        jNTOrder.postOrder(
            {
                code: position.code,
                action: (position.cur_bal_q>0) ? 3 : 1,
                type: 1,
                price: (position.cur_bal_q>0) ? jNT.quote.jsonP[position.code].bbp : jNT.quote.jsonP[position.code].bap,
                stop: 0,
                quantity:  Math.abs(position.cur_bal_q)
            },
            function() {
                //Колбек на отправку приказа
            },
            function(orderId) { //Колбек на прием приказа

                //Если успешно выставили
                if (orderId) {

                    //

                } else {

                    //Если выставить новый приказ не удалось

                }
            }
        );
    }


    //Отрисовка полосок приказов на графике
    this.redrawPosition = function() {

        if (!_this.drawnPosition) return;

        var position = _this.drawnPosition;
        var positionData = this.getPositionData(position);

        var rendered = false;
        _this.setPosition(positionData);

        if(typeof this.viewData.chart != "undefined") {
            rendered = this.viewData.chart.render({ "forceRecalc": true, "resetViewport": true, "testForIntervalChange": false });

        }

        if (!rendered) {
            setTimeout(function(){
                _this.redrawPosition();
            }, 1000);
        }
    };


    //Получаем сделки по позиции и рисуем позицию
    this.getTradesAndRedrawPosition = function() {

        if (this.drawing) return;
        this.drawing = true;

        var position = _this.drawnPosition;
        //Получаем сделки
        $.ajax({
            url: '/terminal/ajax-get-position-trades-by-id/id/' + position.positionId,
            dataType: 'json',
            success: function(json) {

                _this.drawnPositionTrades = json;
                _this.redrawPosition();

                _this.drawing = false;
            }
        });

    };


    //Базовая триггерная функция для запуска или перезапуска интервала отрисовки приказов
    this.showPositions = function () {

        //Просто запускаем интервал
        return this.startShowPositionsInterval(this.userSettings.currentSecurity.nt_ticker);
    };


    //Убираем все приказы с графика
    this.removePositions = function () {

        var needToRender = false;
        if(typeof this.viewData.chart != "undefined") {
            var overlayHistory = this.viewData.chart.overlay.history;
            for(var i=0; i < overlayHistory.length; i++) {
                var element = overlayHistory[i];


                if(element.elementType == "Position") {

                    //Пометим что строка была выбранной чтобы при перерисовке отобразить
                    this.drawnPosition.selected = !!(element.selected);
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



    this.setPosition = function (data) { //@todo допилить

        if(typeof this.viewData.chart != "undefined") {


            //Проверим может быть такой элемент уже нарисован
            var updated = false;
            if (_this.viewData.chart.overlay && _this.viewData.chart.overlay.history) {

                $.each(_this.viewData.chart.overlay.history, function(i, element){
                    if (element && element.elementType == 'Position' && element.positionId == data.positionId) {

                        element.points = [{'x':new Date(), 'y':data.price}];
                        element.settings = data;
                        updated = true;

                        //Если нарисован, но не тот
                    } else if (element && element.elementType == 'Position' && element.positionId != data.positionId) {

                        _this.viewData.chart.overlay.history.splice(i, 1);
                    }
                });

            }




            //Если его еще нет, то создадим заново
            if (!updated) {

                var element = this.viewData.chart.overlay.createElement("Position");
                element.hasSettings = true;
                element.settings = data;
                element.positionId = data.positionId;
                element.points = [{'x':new Date(), 'y':data.price}];
                element.controlEnable = true;
                element.drawSingle = true;


                this.viewData.chart.overlay.history.push(element);
            }

        }
    };

    this.showPositions();
}
