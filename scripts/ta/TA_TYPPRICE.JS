if (!!TA.INDICATOR_TEMPLATE)
    TA.TYPPRICE = TA.INDICATOR_TEMPLATE.Create();
else
    TA.TYPPRICE = {};

TA.TYPPRICE.name = 'TYPPRICE';
TA.TYPPRICE.type = 'line';

TA.TYPPRICE.DefaultSettings = {
};

TA.TYPPRICE.Settings = {};


TA.TYPPRICE._lookback = function() {
    return 0;
};

TA.TYPPRICE.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outIdx, i, outReal = [];
    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    outIdx = 0;
    for (i = startIdx; i <= endIdx; i++) {
        outReal[outIdx++] = (dataShape[i][TA.HIGH] +
            dataShape[i][TA.LOW] +
            dataShape[i][TA.CLOSE]) / 3.0;
    }
    return outReal;
};