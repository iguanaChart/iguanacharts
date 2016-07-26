if (!!TA.INDICATOR_TEMPLATE)
    TA.TRANGE = TA.INDICATOR_TEMPLATE.Create();
else
    TA.TRANGE = {};

TA.TRANGE.name = 'AROON';
TA.TRANGE.type = 'line';

TA.TRANGE.DefaultSettings = {
};

TA.TRANGE.Settings = {};

TA.TRANGE._lookback = function() {
    return 1;
};
TA.TRANGE.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outBegIdx, outNBElement,
        today, outIdx,
        val2, val3, greatest,
        tempCY, tempLT, tempHT,
        outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (startIdx < 1)
        startIdx = 1;
    if (startIdx > endIdx) {
        return outReal;
    }
    outIdx = 0;
    today = startIdx;
    while (today <= endIdx) {
        tempLT = dataShape[today][TA.LOW];
        tempHT = dataShape[today][TA.HIGH];
        tempCY = dataShape[today][TA.CLOSE];
        greatest = tempHT - tempLT;
        val2 = Math.abs(tempCY - tempHT);
        if (val2 > greatest)
            greatest = val2;
        val3 = Math.abs(tempCY - tempLT);
        if (val3 > greatest)
            greatest = val3;
        outReal[outIdx++] = greatest;
        today++;
    }
    outNBElement = outIdx;
    outBegIdx = startIdx;
    return outReal;
};