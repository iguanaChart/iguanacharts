if (!!TA.INDICATOR_TEMPLATE)
    TA.PCH = TA.INDICATOR_TEMPLATE.Create();
else
    TA.PCH = {};

TA.PCH.name = 'PCH';
TA.PCH.type = 'line';

TA.PCH.DefaultSettings = {
    TimePeriodLower: 13,
    TimePeriodUpper: 13
};

TA.PCH.Settings = {};


TA.PCH._lookback = function(optTimePeriodLower, optTimePeriodUpper) {
    if (!optTimePeriodLower) {
        optTimePeriodLower = this.Settings.TimePeriodLower || this.DefaultSettings.TimePeriodLower;
    }

    if (!optTimePeriodUpper) {
        optTimePeriodUpper = this.Settings.TimePeriodUpper || this.DefaultSettings.TimePeriodUpper;
    }

    var period = Math.min(optTimePeriodLower, optTimePeriodUpper) - 1;

    if ((period < 1) || (period > 100000))
        return -1;
    if (period > 1)
        return period;
    else
        return 1;
};

TA.PCH.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outReal = [];
    var high = [];
    var low = [];
    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    this.SetSettings(settings);

    var lookbackLower = this.Settings.TimePeriodLower;
    var lookbackUpper = this.Settings.TimePeriodUpper;

    for(var i = lookbackLower - 1; i<=endIdx; i++) {
        var low20 = dataShape[i][TA.LOW];
        for(var j = i-lookbackLower+1; j<=i; j++) {
            if(dataShape[j][TA.LOW] < low20) {
                low20 = dataShape[j][TA.LOW];
            }
        }
        low.push(low20);
    }

    for(var i = lookbackUpper - 1; i<=endIdx; i++) {
        var high20 = dataShape[i][TA.HIGH];
        for(var j = i-lookbackUpper+1; j<=i; j++) {
            if(dataShape[j][TA.HIGH] > high20) {
                high20 = dataShape[j][TA.HIGH];
            }
        }
        high.push(high20);
    }

    if(lookbackLower > lookbackUpper) {
        for (var i=0; i<(lookbackLower - lookbackUpper); i++) {
            low.splice(0,0,0);
        }

    } else if (lookbackLower > lookbackUpper) {
        for (var i=0; i<(lookbackUpper - lookbackLower); i++) {
            high.splice(0,0,0);
        }
    }

    outReal = {high: high, low: low};

    return outReal;
};