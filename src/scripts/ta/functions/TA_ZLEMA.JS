if (!!TA.INDICATOR_TEMPLATE)
    TA.ZLEMA = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ZLEMA = {};

TA.ZLEMA.name = 'ZLEMA';
TA.ZLEMA.type = 'line';

TA.ZLEMA.DefaultSettings = {
    CandleValueIdx: TA.CLOSE,
    TimePeriod: 12
};

TA.ZLEMA.Settings = {};


TA.ZLEMA._lookback = function(optInTimePeriod) {
    var retValue;
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
        return -1;
    retValue = TA.EMA._lookback(optInTimePeriod);
    return retValue;
};

TA.ZLEMA.calculate = function(startIdx, endIdx, dataShape, settings) {
    var firstEMA = [],
        secondEMA = [],
        tempBuffer = [],
        zlema1 = [],
        zlema2 = [],
        lookbackTotal, lookbackEMA,
        outReal = [];

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

    lookbackTotal = lookbackEMA;
    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        return outReal;
    }


    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    firstEMA = localMA.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType, CandleValueIdx: TA.CLOSE});
    firstEMA.forEach(function(n,i){tempBuffer[i] = [n]});

    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    secondEMA = localMA.calculate(startIdx, tempBuffer.length-1, tempBuffer, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType, CandleValueIdx: 0});

    for (var i=0; i< secondEMA.length; i++) {
        zlema1[i] = firstEMA[i+lookbackEMA] + firstEMA[i + lookbackEMA] - secondEMA[i];
    }

    for (var i=0; i<lookbackEMA; i++) {
        zlema1.splice(0,0,0);
    }

/*
    var lag = Math.floor((this.Settings.TimePeriod-1) / 2);
    var EmaData = [];

    for (var i = lag; i<=endIdx; i++) {
        EmaData.push(dataShape[i][TA.CLOSE] + (dataShape[i][TA.CLOSE] - dataShape[i-lag][TA.CLOSE]));
    }

    EmaData.forEach(function(n,i){tempBuffer[i] = [n]});
    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    var secondEMA = localMA.calculate(0, tempBuffer.length-1, tempBuffer, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType, CandleValueIdx: 0});

    zlema2 = secondEMA;

    for (var i=0; i<lag; i++) {
        zlema2.splice(0,0,0);
    }*/

    return {out1: zlema1/*, out2: zlema2*/};

};