if (!!TA.INDICATOR_TEMPLATE)
    TA.DPO = TA.INDICATOR_TEMPLATE.Create();
else
    TA.DPO = {};

TA.DPO.name = 'DPO';
TA.DPO.type = 'line';

TA.DPO.DefaultSettings = {
    TimePeriod: 20,
    CandleValueIdx: TA.CLOSE
};

TA.DPO.Settings = {};

TA.DPO.calculate = function(startIdx, endIdx, dataShape, settings){

    var outReal = [];
    this.SetSettings(settings);

    var localSMA = TA.SMA.Create({TimePeriod: this.Settings.TimePeriod});
    var tempArr = localSMA.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, CandleValueIdx: TA.CLOSE});

    var period = this.Settings.TimePeriod;
    var outputOffset = TA.SMA._lookback(period);
    var shift = ((period / 2) | 0) + 1;
    outputOffset += shift;

    for (var i = endIdx - outputOffset; i >= 0; --i)
    {
        outReal[i] = dataShape[i + outputOffset][TA.CLOSE] - tempArr[i];
    }

    return outReal;
};


TA.DPO._lookback = function(optInTimePeriod) {
    return TA.SMA._lookback(optInTimePeriod) + ((optInTimePeriod / 2) | 0) + 1;
};

