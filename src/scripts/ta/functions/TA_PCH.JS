if (!!TA.INDICATOR_TEMPLATE)
    TA.PCH = TA.INDICATOR_TEMPLATE.Create();
else
    TA.PCH = {};

TA.PCH.name = 'PCH';
TA.PCH.type = 'line';

TA.PCH.DefaultSettings = {
    TimePeriod: 13
};

TA.PCH.Settings = {};


TA.PCH._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
        return -1;
    if (optInTimePeriod > 1)
        return optInTimePeriod;
    else
        return 1;
};

TA.PCH.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outReal = [];
    var high = [];
    var middle = [];
    var low = [];
    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    this.SetSettings(settings);

    var lookback = this._lookback(this.Settings.TimePeriod);

    for(var i = lookback - 1; i<=endIdx; i++) {
        var high20 = dataShape[i][TA.HIGH];
        var low20 = dataShape[i][TA.LOW];
        for(var j = i-lookback+1; j<=i; j++) {
            if(dataShape[j][TA.HIGH] > high20) {
                high20 = dataShape[j][TA.HIGH];
            }
            if(dataShape[j][TA.LOW] < low20) {
                low20 = dataShape[j][TA.LOW];
            }
        }
        high.push(high20);
        low.push(low20);
        middle.push((high20 + low20) / 2);
    }

    outReal = {high: high, low: low, middle: middle};

    return outReal;
};