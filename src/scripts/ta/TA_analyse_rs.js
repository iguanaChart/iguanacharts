/**
 * Created by gti on 09.02.17.
 */

iChart.Charting.TA.prototype.analyseResistSupport = function (TimePeriod , offset) {

    TimePeriod = TimePeriod || 8;
    offset = offset || 0;

    var data = this.getData();
    var data = data.slice(0,data.length-offset);
    var low = [], high = [];

    var dataRsi = [];

    try {
        var dataRsi = TA.RSI.justifyCalculate(0, data.length-1, data, {TimePeriod: TimePeriod});
    } catch (e) {
        console.log(e);
    }


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
            points: points,
            lastPoint: {x: data.length - 1, y: data[data.length - 1][TA.CLOSE], time: data[data.length - 1][TA.FULLTIME]}
        };
    } else {
        return false;
    }
};

iChart.Charting.TA.prototype.autoResistSupport = function (debug, offset) {
    debug = !!debug;
    var dataRS = this.analyseResistSupport(8, offset);
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

        this.analyser(dataRS);

        if (debug) {

            var data = this.getData();
            var data = data.slice(0,data.length-offset);


            var element = this.chart.overlay.createElement("Event");
            element.hasSettings = true;
            element.drawType = 'auto';
            element.settings = {
                color: 'blue',
                size: 5,
                shape: 'triangle'
            };

            element.id = 'SR_analyzer';
            element.points = [{'x': dataRS.lastPoint.time, 'y': dataRS.lastPoint.y}];
            this.chart.overlay.history.push(element);


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
};


iChart.Charting.TA.prototype.testInPast = function (offset) {
    this.clearResistSupport();
    this.autoResistSupport(1, offset);
};

iChart.Charting.TA.prototype.analyser = function (dataRS, invert) {
    invert = invert || 0;

    var pResist = iChart.getLineEquation(dataRS.resistPoints[0], dataRS.resistPoints[1], dataRS.lastPoint.x);
    var pSupport = iChart.getLineEquation(dataRS.supportPoints[0], dataRS.supportPoints[1], dataRS.lastPoint.x);



    var dtResistSupport = Math.abs(pResist.y - pSupport.y);

    var dtResist = pResist.y - dataRS.lastPoint.y;
    var dtSupport = dataRS.lastPoint.y - pSupport.y;

    var dtpResist = dtResist / dtResistSupport * 100;
    var dtpSupport = dtSupport / dtResistSupport * 100;

    // console.log(pSupport);
    // console.log(dataRS.resistPoints[0], dataRS.resistPoints[1]);
    // console.log(dataRS.supportPoints[0], dataRS.supportPoints[1]);
    // console.log(dtpResist, dtpSupport);

    // if(dtpResist < 10 && dtpResist > 0) {
    //     return invert ? 2 : 1;
    // } else if (dtpSupport < 10 && dtpSupport > 0) {
    //     return invert ? 1: 2;
    // }
    if(Math.abs(dtpResist) < 10) {
        return invert ? 2 : 1;
    } else if (Math.abs(dtpSupport) < 10) {
        return invert ? 1: 2;
    }

    return false;
};

iChart.Charting.TA.prototype.analyserSearch = function (offset, invert) {
    offset = offset || this.chart.areas[0].xSeries.length - 100;

    var currentSignal = 0;
    var firstSignal = 0;
    var lastSignal = 0;
    var summ = 0;
    var lastSumm = 0;

    for(var i=offset;i>0;i--) {
        var dataRS = this.analyseResistSupport(8, i);

        if(!dataRS) {
            continue;
        }

        var advice = this.analyser(dataRS, invert);
        if(advice) {

            if(!firstSignal) {
                firstSignal = advice;
            }

            var element = this.chart.overlay.createElement("Event");
            element.hasSettings = true;
            element.drawType = 'auto';
            element.setSettings({
                color: advice == 1 ? '#f742d0' : '#085fff',
                size: 5,
                shape: 'triangle',
                dataRS: dataRS,
                pointFormatter: function () {
                    //console.log(this.dataRS);
                },
                onHover: function () {
                    var element = this.layer.chart.overlay.createElement("Line");
                    element.points = [{'x': this.settings.dataRS.resistPoints[0].time, 'y': this.settings.dataRS.resistPoints[0].y}, {
                        'x': this.settings.dataRS.resistPoints[1].time,
                        'y': this.settings.dataRS.resistPoints[1].y
                    }];
                    element.drawType = 'auto';
                    element.storageEnable = false;
                    element.controlEnable = false;
                    element.id = 'SR_view';
                    this.layer.chart.overlay.history.push(element);

                    var element = this.layer.chart.overlay.createElement("Line");
                    element.points = [{'x': this.settings.dataRS.supportPoints[0].time, 'y': this.settings.dataRS.supportPoints[0].y}, {
                        'x': this.settings.dataRS.supportPoints[1].time,
                        'y': this.settings.dataRS.supportPoints[1].y
                    }];
                    element.drawType = 'auto';
                    element.storageEnable = false;
                    element.controlEnable = false;
                    element.id = 'SR_view';
                    this.layer.chart.overlay.history.push(element);

                    var extTypeSup = "l",
                        extTypeRes = "h";

                    for (var i = 0; i < this.settings.dataRS.extremeSupports.length; i++) {
                        var element = this.layer.chart.overlay.createElement("Trade");
                        element.hasSettings = true;
                        element.settings = {
                            "type_id": 1,
                            "qb": "",
                            "mode": 1,
                            "date_time": '',
                            summ: this.settings.dataRS.extremeSupports[i]["d" + extTypeSup] / this.settings.dataRS.extremeSupports[i][extTypeSup] * 100
                        };
                        element.points = [{'x': this.settings.dataRS.extremeSupports[i].time, 'y': this.settings.dataRS.extremeSupports[i][extTypeSup]}];
                        element.id = 'SR_view';
                        this.layer.chart.overlay.history.push(element);
                    }


                    for (var i = 0; i < this.settings.dataRS.extremeResist.length; i++) {
                        var element = this.layer.chart.overlay.createElement("Trade");
                        element.hasSettings = true;
                        element.drawType = 'auto';
                        element.settings = {
                            "type_id": 0,
                            "qb": "",
                            "mode": 1,
                            "date_time": '',
                            summ: this.settings.dataRS.extremeResist[i]["d" + extTypeRes] / this.settings.dataRS.extremeResist[i][extTypeRes] * 100
                        };

                        element.points = [{'x': this.settings.dataRS.extremeResist[i].time, 'y': this.settings.dataRS.extremeResist[i][extTypeRes]}];
                        element.id = 'SR_view';
                        this.layer.chart.overlay.history.push(element);
                    }


                },
                onOut: function () {
                    var overlayHistory = this.layer.chart.overlay.history;
                    for(var i=0; i < overlayHistory.length; i++) {
                        var element = overlayHistory[i];
                        if(element.id == "SR_view") {
                            overlayHistory.splice(i, 1);
                            i--;
                        }
                    }
                    this.layer.chart.overlay.render();
                }
            });

            element.id = 'SR_analyserSearch';
            element.points = [{'x': dataRS.lastPoint.time, 'y': dataRS.lastPoint.y}];
            this.chart.overlay.history.push(element);


            if(currentSignal != advice) {

                if(advice == 1) {
                    summ += dataRS.lastPoint.y
                } else {
                    summ -= dataRS.lastPoint.y
                }
                console.log(advice, dataRS.lastPoint, summ);
                lastSumm = dataRS.lastPoint.y;

                currentSignal = advice;
                lastSignal = advice;
            }

            this.chart.overlay.render();
        }
    }

    if(firstSignal == lastSignal) {
        if(firstSignal == 1) {
            summ -= lastSumm;
        } else {
            summ += lastSumm;
        }
    }


    console.log("Profit: ", summ);

};


