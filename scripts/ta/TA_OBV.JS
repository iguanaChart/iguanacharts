if (!!TA.INDICATOR_TEMPLATE)
    TA.OBV = TA.INDICATOR_TEMPLATE.Create();
else
    TA.OBV = {};

TA.OBV.name = 'OBV';
TA.OBV.type = 'line';

TA.OBV.DefaultSettings = {
    CandleValueIdx: TA.CLOSE
};

TA.OBV.Settings = {};


TA.OBV._lookback = function() {
    return 0;
};

TA.OBV.calculate = function(startIdx, endIdx, dataShape, settings) {
    var i;
    var outIdx;
    var prevReal, tempReal, prevOBV;
    var outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';

    prevOBV = dataShape[startIdx][TA.VOL];
    prevReal = dataShape[startIdx][this.Settings.CandleValueIdx];
    outIdx = 0;
    for (i = startIdx; i <= endIdx; i++) {
        tempReal = dataShape[i][this.Settings.CandleValueIdx];
        if (tempReal > prevReal)
            prevOBV += dataShape[i][TA.VOL];
        else if (tempReal < prevReal)
            prevOBV -= dataShape[i][TA.VOL];
        outReal[outIdx++] = prevOBV;
        prevReal = tempReal;
    }
    return outReal;
};