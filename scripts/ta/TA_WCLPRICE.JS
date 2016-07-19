if (!!TA.INDICATOR_TEMPLATE)
    TA.WCLPRICE = TA.INDICATOR_TEMPLATE.Create();
else
    TA.WCLPRICE = {};

TA.WCLPRICE.name = 'WCLPRICE';
TA.WCLPRICE.type = 'line';

TA.WCLPRICE.DefaultSettings = {};

TA.WCLPRICE.Settings = {};

TA.WCLPRICE._lookback = function() {
    return 0;
};
TA.WCLPRICE.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outIdx, i, outReal = [];

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    outIdx = 0;
    for (i = startIdx; i <= endIdx; i++) {
        outReal[outIdx++] = (dataShape[i][TA.HIGH] +
            dataShape[i][TA.LOW] +
            (dataShape[i][TA.CLOSE] * 2.0)) / 4.0;
    }
    return outReal;
};