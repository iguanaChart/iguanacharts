if (!!TA.INDICATOR_TEMPLATE)
    TA.TRIMA = TA.INDICATOR_TEMPLATE.Create();
else
    TA.TRIMA = {};

TA.TRIMA.name = 'TRIMA';
TA.TRIMA.type = 'line';

TA.TRIMA.DefaultSettings = {
    CandleValueIdx: TA.CLOSE,
    TimePeriod: 20
};

TA.TRIMA.Settings = {};


TA.TRIMA._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
        return -1;
    return optInTimePeriod - 1;
};

TA.TRIMA.calculate = function(startIdx, endIdx, dataShape, settings) {
    var lookbackTotal;
    var numerator;
    var numeratorSub;
    var numeratorAdd;
    var i, outIdx, todayIdx, trailingIdx, middleIdx;
    var factor, tempReal;
    var outReal = [];

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

    lookbackTotal = (this.Settings.TimePeriod - 1);
    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        return outReal;
    }
    outIdx = 0;
    if ((this.Settings.TimePeriod % 2) == 1) {
        i = (this.Settings.TimePeriod >> 1);
        factor = (i + 1) * (i + 1);
        factor = 1.0 / factor;
        trailingIdx = startIdx - lookbackTotal;
        middleIdx = trailingIdx + i;
        todayIdx = middleIdx + i;
        numerator = 0.0;
        numeratorSub = 0.0;
        for (i = middleIdx; i >= trailingIdx; i--) {
            tempReal = dataShape[i][this.Settings.CandleValueIdx];
            numeratorSub += tempReal;
            numerator += numeratorSub;
        }
        numeratorAdd = 0.0;
        middleIdx++;
        for (i = middleIdx; i <= todayIdx; i++) {
            tempReal = dataShape[i][this.Settings.CandleValueIdx];
            numeratorAdd += tempReal;
            numerator += numeratorAdd;
        }
        outIdx = 0;
        tempReal =  dataShape[trailingIdx++][this.Settings.CandleValueIdx];
        outReal[outIdx++] = numerator * factor;
        todayIdx++;
        while (todayIdx <= endIdx) {
            numerator -= numeratorSub;
            numeratorSub -= tempReal;
            tempReal = dataShape[middleIdx++][this.Settings.CandleValueIdx];
            numeratorSub += tempReal;
            numerator += numeratorAdd;
            numeratorAdd -= tempReal;
            tempReal = dataShape[todayIdx++][this.Settings.CandleValueIdx];
            numeratorAdd += tempReal;
            numerator += tempReal;
            tempReal = dataShape[trailingIdx++][this.Settings.CandleValueIdx];
            outReal[outIdx++] = numerator * factor;
        }
    } else {
        i = (this.Settings.TimePeriod >> 1);
        factor = i * (i + 1);
        factor = 1.0 / factor;
        trailingIdx = startIdx - lookbackTotal;
        middleIdx = trailingIdx + i - 1;
        todayIdx = middleIdx + i;
        numerator = 0.0;
        numeratorSub = 0.0;
        for (i = middleIdx; i >= trailingIdx; i--) {
            tempReal = dataShape[i][this.Settings.CandleValueIdx];
            numeratorSub += tempReal;
            numerator += numeratorSub;
        }

        numeratorAdd = 0.0;
        middleIdx++;
        for (i = middleIdx; i <= todayIdx; i++) {
            tempReal = dataShape[i][this.Settings.CandleValueIdx];
            numeratorAdd += tempReal;
            numerator += numeratorAdd;
        }
        outIdx = 0;
        tempReal = dataShape[trailingIdx++][this.Settings.CandleValueIdx];
        outReal[outIdx++] = numerator * factor;
        todayIdx++;
        while (todayIdx <= endIdx) {
            numerator -= numeratorSub;
            numeratorSub -= tempReal;
            tempReal = dataShape[middleIdx++][this.Settings.CandleValueIdx];
            numeratorSub += tempReal;
            numeratorAdd -= tempReal;
            numerator += numeratorAdd;
            tempReal = dataShape[todayIdx++][this.Settings.CandleValueIdx];
            numeratorAdd += tempReal;
            numerator += tempReal;
            tempReal = dataShape[trailingIdx++][this.Settings.CandleValueIdx];
            outReal[outIdx++] = numerator * factor;
        }
    }
    return outReal;
};