if (!!TA.INDICATOR_TEMPLATE)
    TA.ENV = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ENV = {};

TA.ENV.name = 'ENV';
TA.ENV.type = 'line';

TA.ENV.DefaultSettings = {
    TimePeriod: 20,
    shift: 1,
    CandleValueIdx: TA.CLOSE
};

TA.ENV.Settings = {};

TA.ENV.calculate = function(startIdx, endIdx, dataShape, settings){

    var outputLower = [];
    var outputUpper = [];
    this.SetSettings(settings);

    var localSMA = TA.SMA.Create({TimePeriod: this.Settings.TimePeriod});
    var tempArr = localSMA.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, CandleValueIdx: TA.CLOSE});

    var multiplierUpper = 1 + (this.Settings.shift / 100);
    var multiplierLower = 1 - (this.Settings.shift / 100);
    for (var i = 0; i < tempArr.length; i++)
    {
        outputLower[i] = tempArr[i] * multiplierLower;
        outputUpper[i] = tempArr[i] * multiplierUpper;
    }

    return {Lower: outputLower, Upper: outputUpper};
};


TA.ENV._lookback = function(optInTimePeriod) {
    return TA.SMA._lookback(optInTimePeriod);
};

