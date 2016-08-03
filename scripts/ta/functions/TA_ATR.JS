if (!!TA.INDICATOR_TEMPLATE)
    TA.ATR = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ATR = {};

TA.ATR.name = 'ATR';
TA.ATR.type = 'line';

TA.ATR.DefaultSettings = {
    TimePeriod: 14
};

TA.ATR.Settings = {};


TA.ATR._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
        return -1;
    if (optInTimePeriod > 1)
        return optInTimePeriod;
    else
        return 1;
};


TA.ATR.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outIdx, today, lookbackTotal,
        nbATR,
        prevATR,
        tempBuffer = [],
        prevATRTemp,
        outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 1) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';

    lookbackTotal = this._lookback(this.Settings.TimePeriod);

    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx)
        return outReal;
    if (this.Settings.TimePeriod <= 1) {
        return TA.TRANGE.calculate(startIdx, endIdx, dataShape, {});
    }

    tempBuffer = TA.TRANGE.calculate((startIdx - lookbackTotal + 1), endIdx, dataShape, {});

    if( !tempBuffer || !tempBuffer.length )
    {
        return outReal;
    }

    var tempBufferArr = [];
    for(var i=0;i<tempBuffer.length-1;i++){
        tempBufferArr.push([tempBuffer[i]]);
    }

    var prevATRTemp = TA.SMA.calculate( this.Settings.TimePeriod-1,
        this.Settings.TimePeriod-1,
        tempBufferArr, {TimePeriod: this.Settings.TimePeriod, CandleValueIdx: 0});

    if( !prevATRTemp || !prevATRTemp.length )
    {
        return outReal;
    }

    prevATR = prevATRTemp[0];

    today = this.Settings.TimePeriod;

    outIdx = 0;

    while (outIdx != 0) {
        prevATR *= this.Settings.TimePeriod - 1;
        prevATR += tempBuffer[today++];
        prevATR /= this.Settings.TimePeriod;
        outIdx--;
    }
    outIdx = 1;
    outReal[0] = prevATR;
    nbATR = (endIdx - startIdx) + 1;
    while (--nbATR != 0) {
        prevATR *= this.Settings.TimePeriod - 1;
        prevATR += tempBuffer[today++];
        prevATR /= this.Settings.TimePeriod;
        outReal[outIdx++] = prevATR;
    }
    return outReal;
};