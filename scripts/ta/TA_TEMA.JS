if (!!TA.INDICATOR_TEMPLATE)
    TA.TEMA = TA.INDICATOR_TEMPLATE.Create();
else
    TA.TEMA = {};

TA.TEMA.name = 'TEMA';
TA.TEMA.type = 'line';

TA.TEMA.DefaultSettings = {
    CandleValueIdx: TA.CLOSE,
    TimePeriod: 12
};

TA.TEMA.Settings = {};


TA.TEMA._lookback = function(optInTimePeriod) {
    var retValue;
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
        return -1;
    retValue = TA.EMA._lookback(optInTimePeriod);
    return retValue * 3;
};

TA.TEMA.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outBegIdx, outNBElement,
        firstEMA = [],
        secondEMA = [],
        k,
        firstEMABegIdx,
        firstEMANbElement,
        secondEMABegIdx,
        secondEMANbElement,
        thirdEMABegIdx,
        thirdEMANbElement,
        tempInt, outIdx, lookbackTotal, lookbackEMA,
        firstEMAIdx, secondEMAIdx,
        retCode, outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';

    lookbackEMA = TA.EMA._lookback(this.Settings.TimePeriod);

    lookbackTotal = lookbackEMA * 3;
    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        return outReal;
    }

    tempInt = lookbackTotal + (endIdx - startIdx) + 1;

    k = TA.PER_TO_K(this.Settings.TimePeriod);

    var localEMA = TA.EMA.Create({TimePeriod: this.Settings.TimePeriod});

    localEMA._int_ema(startIdx - (lookbackEMA * 3), endIdx, dataShape,
        this.Settings.TimePeriod, k, firstEMA);

    if (!firstEMA.length) {
        return outReal;
    }

    var firstEMAArr = [];
    for(var i=0; i< firstEMA.length; i++) {
        firstEMAArr.push([firstEMA[i]]);
    }
    localEMA.SetSettings({CandleValueIdx: 0});
    localEMA._int_ema(0, firstEMAArr.length - 1, firstEMAArr,
        this.Settings.TimePeriod, k, secondEMA);

    if (!secondEMA.length) {
        return outReal;
    }

    var secondEMAArr = [];
    for(var i=0; i< secondEMA.length; i++) {
        secondEMAArr.push([secondEMA[i]]);
    }

    localEMA.SetSettings({CandleValueIdx: 0});
    localEMA._int_ema(0, secondEMAArr.length - 1, secondEMAArr, this.Settings.TimePeriod, k, outReal);

    if (!outReal.length) {
        return outReal;
    }

    firstEMAIdx = lookbackEMA * 2;
    secondEMAIdx = lookbackEMA;
    outIdx = 0;

    while (outIdx < outReal.length) {
        outReal[outIdx] += (3.0 * firstEMA[firstEMAIdx++]) - (3.0 * secondEMA[secondEMAIdx++]);
        outIdx++;
    }

    return outReal;

};