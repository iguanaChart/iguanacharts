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
    return 0;
};

TA.ZLEMA.calculate = function(startIdx, endIdx, dataShape, settings) {
    var firstEMA = [],
        secondEMA = [],
        tempBuffer = [],
        zlema = [],
        lookbackTotal, lookbackEMA,
        outReal = zlema;

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

    var k = TA.PER_TO_K(this.Settings.TimePeriod);
    var lag = Math.ceil((this.Settings.TimePeriod-1) / 2.0);
    var zlema = [];

    for (var i = 0; i<=endIdx; i++) {
        if(i < lag) {
            zlema[i] = dataShape[i][TA.CLOSE];
        } else {
            zlema[i] = k * (2 * dataShape[i][TA.CLOSE] - dataShape[i - lag][TA.CLOSE]) + (1 - k) * zlema[i -1];
        }
    }

    return zlema;

};