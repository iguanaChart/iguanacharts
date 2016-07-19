if (!!TA.INDICATOR_TEMPLATE)
    TA.ROC = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ROC = {};

TA.ROC.name = 'ROC';
TA.ROC.type = 'line';

TA.ROC.DefaultSettings = {
    CandleValueIdx: TA.CLOSE,
    TimePeriod: 10
};

TA.ROC.Settings = {};

TA.ROC._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
        return -1;
    return optInTimePeriod;
};

TA.ROC.calculate = function(startIdx, endIdx, dataShape, settings) {
    var inIdx, outIdx, trailingIdx,
        tempReal, outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 1) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';
    if (!outReal)
        throw 'TA_BAD_PARAM';

    if (startIdx < this.Settings.TimePeriod)
        startIdx = this.Settings.TimePeriod;
    if (startIdx > endIdx) {
        return outReal;
    }

    outIdx = 0;
    inIdx = startIdx;
    trailingIdx = startIdx - this.Settings.TimePeriod;
    while (inIdx <= endIdx) {
        tempReal = dataShape[trailingIdx++][TA.CLOSE];
        if (tempReal != 0.0) {
            outReal[outIdx++] = ((dataShape[inIdx][TA.CLOSE] / tempReal) - 1.0) * 100.0;
        } else {
            outReal[outIdx++] = 0.0;
        }
        inIdx++;
    }
    return outReal;
};