if (!!TA.INDICATOR_TEMPLATE)
    TA.MINUS_DI = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MINUS_DI = {};

TA.MINUS_DI.name = 'MINUS_DI';
TA.MINUS_DI.type = 'line';

TA.MINUS_DI.DefaultSettings = {
    TimePeriod: 14
};

TA.MINUS_DI.Settings = {};

TA.MINUS_DI._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
        return -1;
    if (optInTimePeriod > 1)
        return optInTimePeriod;
    else
        return 1;
};


TA.MINUS_DI.calculate = function(startIdx, endIdx, dataShape, settings) {
    var today, lookbackTotal, outIdx;
    var prevHigh, prevLow, prevClose;
    var prevMinusDM, prevTR;
    var tempReal, tempReal2, diffP, diffM;
    var i;

    var outReal = [];
    this.SetSettings(settings);

    function TRUE_RANGE(TH, TL, YC, OUT) {
        return '\
              ' + OUT + ' = ' + TH + '-' + TL + '; \
              tempReal2 = Math.abs(' + TH + '-' + YC + '); \
              if( tempReal2 > ' + OUT + ' ) \
                 ' + OUT + ' = tempReal2; \
              tempReal2 = Math.abs(' + TL + '-' + YC + '); \
              if( tempReal2 > ' + OUT + ' ) \
                 ' + OUT + ' = tempReal2;';
    }

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 1) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';

    function round_pos(x) {
        return x;
    };

    if (this.Settings.TimePeriod > 1)
        lookbackTotal = this.Settings.TimePeriod;
    else
        lookbackTotal = 1;

    if (startIdx < lookbackTotal)
        startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        var outBegIdx;
        var outNBElement;
        return outReal;
    }
    outIdx = 0;
    if (this.Settings.TimePeriod <= 1) {
        var outBegIdx = startIdx;
        today = startIdx - 1;
        prevHigh = dataShape[today][TA.HIGH];
        prevLow = dataShape[today][TA.LOW];
        prevClose = dataShape[today][TA.CLOSE];
        while (today < endIdx) {
            today++;
            tempReal = dataShape[today][TA.HIGH];
            diffP = tempReal - prevHigh;
            prevHigh = tempReal;
            tempReal = dataShape[today][TA.LOW];
            diffM = prevLow - tempReal;
            prevLow = tempReal;
            if ((diffM > 0) && (diffP < diffM)) {
                eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
                if (TA.TA_IS_ZERO(tempReal))
                    outReal[outIdx++] = 0.0;
                else
                    outReal[outIdx++] = diffM / tempReal;
            } else
                outReal[outIdx++] = 0.0;
            prevClose = dataShape[today][TA.CLOSE];
        }
        outNBElement = outIdx;
        return outReal;
    }
    outBegIdx = today = startIdx;
    prevMinusDM = 0.0;
    prevTR = 0.0;
    today = startIdx - lookbackTotal;
    prevHigh = dataShape[today][TA.HIGH];
    prevLow = dataShape[today][TA.LOW];
    prevClose = dataShape[today][TA.CLOSE];
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
        eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
        prevTR += tempReal;
        prevClose = dataShape[today][TA.CLOSE];
    }
    i = 1;
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
        eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
        prevTR = prevTR - (prevTR / this.Settings.TimePeriod) + tempReal;
        prevClose = dataShape[today][TA.CLOSE];
    }
    if (!TA.TA_IS_ZERO(prevTR))
        outReal[0] = round_pos(100.0 * (prevMinusDM / prevTR));
    else
        outReal[0] = 0.0;
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
        eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
        prevTR = prevTR - (prevTR / this.Settings.TimePeriod) + tempReal;
        prevClose = dataShape[today][TA.CLOSE];
        if (!TA.TA_IS_ZERO(prevTR))
            outReal[outIdx++] = round_pos(100.0 * (prevMinusDM / prevTR));
        else
            outReal[outIdx++] = 0.0;
    }
    outNBElement = outIdx;
    return outReal;
};
