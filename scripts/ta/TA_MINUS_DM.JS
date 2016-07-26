if (!!TA.INDICATOR_TEMPLATE)
    TA.MINUS_DM = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MINUS_DM = {};

TA.MINUS_DM.name = 'MINUS_DM';
TA.MINUS_DM.type = 'line';

TA.MINUS_DM.DefaultSettings = {
    TimePeriod: 14
};

TA.MINUS_DM.Settings = {};

TA.MINUS_DM._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
        return -1;
    if (optInTimePeriod > 1)
        return optInTimePeriod - 1;
    else
        return 1;
};

TA.MINUS_DM.calculate = function(startIdx, endIdx, dataShape, settings) {
    var today, lookbackTotal, outIdx;
    var prevHigh, prevLow, tempReal;
    var prevMinusDM;
    var diffP, diffM;
    var i;

    var outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 1) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';
    if (this.Settings.TimePeriod > 1)
        lookbackTotal = this.Settings.TimePeriod - 1;
    else
        lookbackTotal = 1;

    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        return outReal;
    }
    outIdx = 0;
    if (this.Settings.TimePeriod <= 1) {
        today = startIdx - 1;
        prevHigh = dataShape[today][TA.HIGH];
        prevLow = dataShape[today][TA.LOW];
        while (today < endIdx) {
            today++;
            tempReal = dataShape[today][TA.HIGH];
            diffP = tempReal - prevHigh;
            prevHigh = tempReal;
            tempReal = dataShape[today][TA.LOW];
            diffM = prevLow - tempReal;
            prevLow = tempReal;
            if ((diffM > 0) && (diffP < diffM)) {
                outReal[outIdx++] = diffM;
            } else
                outReal[outIdx++] = 0;
        }
        return outReal;
    }
    prevMinusDM = 0.0;
    today = startIdx - lookbackTotal;
    prevHigh = dataShape[today][TA.HIGH];
    prevLow = dataShape[today][TA.LOW];
    i = this.Settings.TimePeriod - 1;
    while (i-- > 0) {
        today++;
        tempReal = dataShape[today][TA.HIGH];
        diffP = tempReal - prevHigh;
        prevHigh = tempReal;
        tempReal = dataShape[today][TA.LOW];
        diffM = prevLow - tempReal;
        prevLow = tempReal;
        if ((diffM > 0) && (diffP < diffM)) {
            prevMinusDM += diffM;
        }
    }
    i = 0;
    while (i-- != 0) {
        today++;
        tempReal = dataShape[today][TA.HIGH];
        diffP = tempReal - prevHigh;
        prevHigh = tempReal;
        tempReal = dataShape[today][TA.LOW];
        diffM = prevLow - tempReal;
        prevLow = tempReal;
        if ((diffM > 0) && (diffP < diffM)) {
            prevMinusDM = prevMinusDM - (prevMinusDM / this.Settings.TimePeriod) + diffM;
        } else {
            prevMinusDM = prevMinusDM - (prevMinusDM / this.Settings.TimePeriod);
        }
    }
    outReal[0] = prevMinusDM;
    outIdx = 1;
    while (today < endIdx) {
        today++;
        tempReal = dataShape[today][TA.HIGH];
        diffP = tempReal - prevHigh;
        prevHigh = tempReal;
        tempReal = dataShape[today][TA.LOW];
        diffM = prevLow - tempReal;
        prevLow = tempReal;
        if ((diffM > 0) && (diffP < diffM)) {
            prevMinusDM = prevMinusDM - (prevMinusDM / this.Settings.TimePeriod) + diffM;
        } else {
            prevMinusDM = prevMinusDM - (prevMinusDM / this.Settings.TimePeriod);
        }
        outReal[outIdx++] = prevMinusDM;
    }
    return outReal;
};