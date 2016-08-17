if (!!TA.INDICATOR_TEMPLATE)
    TA.MEDPRICE = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MEDPRICE = {};

TA.MEDPRICE.name = 'MEDPRICE';
TA.MEDPRICE.type = 'line';

TA.MEDPRICE.DefaultSettings = {};

TA.MEDPRICE.Settings = {};

TA.MEDPRICE._lookback = function() {
    return 0;
};


TA.MEDPRICE.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outIdx, i, outReal = [];
    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    outIdx = 0;
    for (i = startIdx; i <= endIdx; i++) {
        outReal[outIdx++] = (dataShape[i][TA.HIGH] + dataShape[i][TA.LOW]) / 2.0;
    }
    return outReal;
};