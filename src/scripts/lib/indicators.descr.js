/**
 * Created by gti on 14.10.15.
 */

iChart.indicators = {
    "AD":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('428', 'AD (Распределение накопления)'),
        "value": "AD",
        "outputRegion": "self",
        "description": _t('4789', 'Формула распределения накопления использует отношение между объемом и ценами, чтобы оценить интенсивность изменения цен; если объем увеличивается, весьма вероятно, что цены поднимутся.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5400">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[]
    },
    "ADOSC":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('429', 'ADOSC (Осциллятор Чайкина)'),
        "value": "ADOSC",
        "outputRegion": "self",
        "description":_t('4790', 'Индикатор осциллятора Чайкина – это разница между трехдневным экспоненциальным скользящим средним и десятидневным экспоненциальным скользящим средним, примененная к распределению накопления.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5425">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"FastPeriod", "Name":_t('4791', 'Краткосрочный интервал'), "Value":3},
            {"Code":"SlowPeriod", "Name":_t('4792', 'Долгосрочный интервал'), "Value":10}
        ]
    },
    "ADX":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('430', 'ADX (Индекс направленного движения)'),
        "value": "ADX",
        "outputRegion": "self",
        "description":_t('4793', 'Индикатор среднего направленного движения служит для определения вероятного направления основного тренда.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('5421', 'Интервал'), "Value":14}
        ]
    },
    "ADXDI":{
        "type": 'TA_LIB',
        "output": 3,
        "outputNames": ['ADX','PLUS_DI','MINUS_DI'],
        "name": _t('431', 'ADXDI (Индекс направленного движения (с индикаторами направления))'),
        "value": "ADXDI",
        "outputRegion": "self",
        "description":_t('4793', 'Индикатор среднего направленного движения служит для определения вероятного направления основного тренда.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5421">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('5421', 'Интервал'), "Value":14}
        ]
    },
    "AROON":{
        "type": 'TA_LIB',
        "output": 2,
        "outputNames": ['AroonDown','AroonUp'],
        "name": _t('432', 'AROON (Арун)'),
        "value": "AROON",
        "outputRegion": "self",
        "description":_t('4797', 'Индикатор Арун применяется для изучения силы и направления трендов.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('5421', 'Интервал'), "Value":25}
        ]
    },
    "ATR":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('433', 'ATR (Средний истинный диапазон)'),
        "value": "ATR",
        "outputRegion": "self",
        "description":_t('4799', 'Индикатор среднего истинного диапазона измеряет фиксацию и сравнивает диапазоны между высокими и низкими ценами и ценами закрытия.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('5421', 'Интервал'), "Value":14}
        ]
    },
    "BBANDS":{
        "type": 'TA_LIB',
        "output": 3,
        "outputNames": ['UpperBand','MiddleBand','LowerBand'],
        "name": _t('434', 'BBANDS (Уровни Боллинджера)'),
        "value": "BBANDS",
        "outputRegion": "price",
        "description":_t('4801', 'Индикаторы с линиями Боллинджера наносятся на график как уровни стандартного отклонения выше и ниже скользящего среднего.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5397">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('5421', 'Интервал'), "Value":7},
            {"Code":"DeviationsUp", "Name":_t('4803', 'Верхнее число станд. отклонения'), "Value":2},
            {"Code":"DeviationsDown", "Name":_t('4804', 'Нижнее число станд. отклонения'), "Value":2}
        ]
    },
    "CCI":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('435', 'CCI (Индекс товарного канала)'),
        "value": "CCI",
        "outputRegion": "self",
        "description":_t('4805', 'Индикатор ценовых моментов сравнивает цены с их скользящими средними.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5424">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":10}
        ]
    },
    "CHV":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('436', 'CHV (Волатильность Чайкина)'),
        "value": "CHV",
        "outputRegion": "self",
        "description":_t('4807', 'Индикатор волатильности Чайкина показывает разницу между максимальными и минимальными ценами и используется для обозначения верхних и нижних частей рынка.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('4808', 'Период EMA'), "Value":10},
            {"Code":"PeriodROC", "Name":_t('4809', 'Период ROC'), "Value":10}
        ]
    },
    "DPO":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('437', 'DPO (Осциллятор цен с исключенным трендом)'),
        "value": "DPO",
        "outputRegion": "self",
        "description":_t('4810', 'Осциллятор цен с исключенным трендом пытается исключить из цен тренды.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5432">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":20}
        ]
    },
    "ELDR":{
        "type": 'TA_LIB',
        "output": 4,
        "outputNames": ['Bull','Bear','Rays'],
        "name": _t('17699', 'ELDR (Лучи Элдера)'),
        "value": "ELDR",
        "outputRegion": "self",
        "description":_t('17700', 'Индикатор Лучи Элдера поможет вам оценить, в какой момент времени «быки» и «медведи» становятся слабее или сильнее.') +
        ' ' + '' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":13}
        ]
    },
    "EMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('438', 'EMA (Экспоненциальное скользящее среднее)'),
        "value": "EMA",
        "outputRegion": "price",
        "description":_t('4812', 'Экспоненциальное скользящее среднее – это среднее значение данных, рассчитанное за некий период времени, причем последние дни имеют в вычислении больший вес.') + ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5396">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":12}
        ]
    },
    "ENV":{
        "type": 'TA_LIB',
        "output": 2,
        "outputNames": ['Upper','Lower'],
        "name": _t('439', 'ENV (Конверты)'),
        "value": "ENV",
        "outputRegion": "price",
        "description":_t('4815', 'Конверты наносятся над и под скользящим средним; смещение определяется указанным процентом.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5431">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":20},
            {"Code":"shift", "Name":_t('4817', 'Сдвиг, %'), "Value":1}
        ]
    },
    "MACD":{
        "type": 'TA_LIB',
        "output": 3,
        "outputNames": ['MACD','MACDSignal','MACDHist'],
        "name": _t('441', 'MACD (Конвергенция и дивергенция скользящих средних)'),
        "value": "MACD",
        "outputRegion": "self",
        "description":_t('4818', 'Индикатор конвергенции и дивергенции скользящих средних сравнивает два скользящих средних цен и используется вместе с девятидневным экспоненциальным скользящим средним в качестве сигнала для моментов покупки и продажи.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5428">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"FastPeriod", "Name":_t('4819', 'Краткосрочный период'), "Value":12},
            {"Code":"SlowPeriod", "Name":_t('4820', 'Долгосрочный период'), "Value":26},
            {"Code":"SignalPeriod", "Name":_t('4821', 'Период сигнальной линии'), "Value":9}
        ]
    },
    "MEDPRICE":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('443', 'MEDPRICE (Медианная цена)'),
        "value": "MEDPRICE",
        "outputRegion": "price",
        "description":_t('4822', 'Медианные цены – это средние значения цен за день, которые могут использоваться как фильтр для индикаторов трендов.'),
        "parameters":[]
    },
    "MFI":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('444', 'MFI (Денежный поток)'),
        "value": "MFI",
        "outputRegion": "self",
        "description":_t('4823', 'Индикатор денежных потоков сравнивает восходящие и нисходящие изменения типичных цен, приведенных к объему.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":14}
        ]
    },
    "OBV":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('445', 'OBV (Балансовый объём)'),
        "value": "OBV",
        "outputRegion": "self",
        "description":_t('4828', 'Индикатор балансового объема измеряет положительный и отрицательный поток объема.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5434">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[]
    },
    "PCH":{
        "type": 'TA_LIB',
        "output": 3,
        "name": _t('17701', 'PCH (Price chanel)'),
        "value": "PCH",
        "outputRegion": "price",
        "description":_t('17702', 'price channel это уровни потдержки и сопротивления, которые меняются вместе с ценой.'),
        "parameters":[
            {"Code":"TimePeriodLower", "Name":_t('17703', 'Период Lower'), "Value":20},
            {"Code":"TimePeriodUpper", "Name":_t('17704', 'Период Upper'), "Value":20}
        ]
    },
    "PSAR":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('447', 'PSAR (Параболик)'),
        "value": "PSAR",
        "outputRegion": "price",
        "description":_t('4833', 'Индикатор Параболик помогает определять точки разворота тренда.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5399">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"Acceleration", "Name":_t('860', 'Шаг'), "Value":0.02},
            {"Code":"Maximum", "Name":_t('4835', 'Максимальный шаг'), "Value":0.2}
        ]
    },
    "ROC":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('449', 'ROC (Темп изменения)'),
        "value": "ROC",
        "outputRegion": "self",
        "description":_t('4840', 'Индикатор темпов изменений сравнивает указанную цену закрытия с текущей ценой.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5430">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":10}
        ]
    },
    "RSI":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('450', 'RSI (Индекс относительной силы)'),
        "value": "RSI",
        "outputRegion": "self",
        "description":_t('4842', 'Индекс относительной силы – это осциллятор момента, сравнивающий восходящие изменения цены закрытия с нисходящими изменениями и выдающий значения в диапазоне от 0 до 100.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5411">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":10}
        ]
    },
    "SMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('451', 'SMA (Простое скользящее среднее)'),
        "value": "SMA",
        "outputRegion": "price",
        "description":_t('4844', 'Простое скользящее среднее – это среднее значение данных, рассчитанное за некий период времени. Скользящее среднее – самый распространенный индикатор цен в техническом анализе, который можно использовать с любой ценой, например высокой, низкой, ценами открытия и закрытия, а также применять к другим индикаторам.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":10}
        ]
    },
    "STDDEV":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('452', 'STDDEV (Стандартное отклонение)'),
        "value": "STDDEV",
        "outputRegion": "self",
        "description":_t('4846', 'Стандартное отклонение используется для обозначения волатильности и показывает, например, разницу между значениями цены закрытия и ее скользящего среднего.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":10}
        ]
    },
    "STOCH":{
        "type": 'TA_LIB',
        "output": 2,
        "name": _t('453', 'STOCH (Вероятностный индикатор)'),
        "value": "STOCH",
        "description":_t('4848', 'Вероятностный индикатор помогает находить изменения трендов, обнаруживая моменты, когда цены закрытия приближаются к низким ценам на рынке, имеющем восходящий тренд, и когда цены закрытия близки к высоким ценам на рынке, имеющем нисходящий тренд.'),
        "parameters":[
            {"Code":"PeriodFastK", "Name":_t('4849', 'Краткосрочный период %K'), "Value":5},
            {"Code":"PeriodSlowK", "Name":_t('4850', 'Долгосрочный период %K'), "Value":3},
            {"Code":"PeriodSlowD", "Name":_t('4851', 'Период %D'), "Value":3}
        ]
    },
    "TEMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('454', 'TEMA (Тройное экспоненциальное скользящее среднее)'),
        "value": "TEMA",
        "outputRegion": "price",
        "description":_t('4852', 'Тройное экспоненциальное скользящее среднее основано на тройном скользящем среднем цены закрытия. Его назначение – исключить короткие циклы. Этот индикатор сохраняет цену закрытия в трендах, которые короче указанного периода.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":12}
        ]
    },
    "TRIMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('455', 'TRIMA (Треугольное скользящее среднее)'),
        "value": "TRIMA",
        "outputRegion": "price",
        "description":_t('4854', 'Треугольное скользящее среднее – это среднее значение данных, рассчитанное за некий период времени, причем средняя часть данных имеет в вычислении больший вес.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":20}
        ]
    },
    "TYPPRICE":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('456', 'TYPPRICE (Типичная цена)'),
        "value": "TYPPRICE",
        "outputRegion": "price",
        "description":_t('4856', 'Типичная цена – это среднее значение цен за день, которое может использоваться как фильтр для индикаторов трендов.'),
        "parameters":[]
    },
    "VPT":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('457', 'VPT (Тренд объёма цен)'),
        "value": "VPT",
        "outputRegion": "self",
        "description":_t('4857', 'Тренд объема цен – это совокупное значение объема, рассчитываемое на основе относительных изменений цены закрытия; его следует использовать с другими индикаторами.'),
        "parameters":[]
    },
    "WCLPRICE":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('458', 'WCLPRICE (Взвешенная цена закрытия)'),
        "value": "WCLPRICE",
        "outputRegion": "price",
        "description":_t('4858', 'Формула взвешенной цены закрытия вычисляет среднее значение цен за день. Единственное отличие взвешенной цены закрытия и типичной цены в том, что у цены закрытия больший вес и она считается самой важной ценой.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5433">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[]
    },
    "WILLR":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('459', 'WILLR (Процентный диапазон Уильямса)'),
        "value": "WILLR",
        "outputRegion": "self",
        "description":_t('4859', 'Процентный диапазон Уильямса – это индикатор момента, который показывает уровни перекупленности и перепроданности.') +
            ' ' + '<a target="_blank" href="http://www.nettrader.ru/education/book/5410">' + _t('15840', 'Подробнее.') + '</a>',
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":14}
        ]
    },
    "WMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('460', 'WMA (Взвешенное скользящее среднее)'),
        "value": "WMA",
        "outputRegion": "price",
        "description":_t('4861', 'Взвешенное скользящее среднее – это среднее значение данных, рассчитанное за некий период времени, причем последние данные имеют в вычислении больший вес.'),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":9}
        ]
    },
    "ZLEMA":{
        "type": 'TA_LIB',
        "output": 1,
        "name": _t('17705', 'ZLEMA (Zero-Lag Moving Average Indicator)'),
        "value": "ZLEMA",
        "outputRegion": "price",
        "description":_t('13667', ''),
        "parameters":[
            {"Code":"TimePeriod", "Name":_t('1296', 'Период'), "Value":12}
        ]
    },
    "TRPLN":{
        "type": 'TA_LIB',
        "output": 0,
        "name": _t('13838', 'TRPLN (Тенденциальная планиметрия)'),
        "value": "TRPLN",
        "outputRegion": "price",
        "description": _t('13843', 'Тенденциальная планиметрия'),
        "parameters":[]
    }
};