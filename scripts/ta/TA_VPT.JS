if (!!TA.INDICATOR_TEMPLATE)
    TA.VPT = TA.INDICATOR_TEMPLATE.Create();
else
    TA.VPT = {};

TA.VPT.name = 'VPT';
TA.VPT.type = 'line';

TA.VPT.DefaultSettings = {
};

TA.VPT.Settings = {};


TA.VPT._lookback = function() {
    return 0;
};

TA.VPT.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outReal = [];
    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    var previousClose = dataShape[startIdx][TA.CLOSE];
    outReal[0] = 0;
    for (var i = startIdx + 1; i <= endIdx; ++i)
    {
        outReal[i - startIdx] = outReal[i - startIdx - 1] + (dataShape[i][TA.VOL] * (dataShape[i][TA.CLOSE] - previousClose) / previousClose);
        previousClose = dataShape[i][TA.CLOSE];
    }

    return outReal;
};