if (!!TA.INDICATOR_TEMPLATE)
    TA.CHV = TA.INDICATOR_TEMPLATE.Create();
else
    TA.CHV = {};

TA.CHV.name = 'CHV';
TA.CHV.type = 'line';

TA.CHV.DefaultSettings = {
    TimePeriod: 10,
    TimePeriodRoc: 10,
    CandleValueIdx: TA.CLOSE
};

TA.CHV.Settings = {};

TA.CHV.calculate = function(startIdx, endIdx, dataShape, settings){

    var outReal = [];
    var output = [];
    this.SetSettings(settings);

    for (var i = startIdx; i <= endIdx; ++i)
    {
        output[i] = [dataShape[i][TA.HIGH] - dataShape[i][TA.LOW]];
    }

    var localEMA = TA.EMA.Create({TimePeriod: this.Settings.TimePeriod, CandleValueIdx: 0});
    var tempArr = localEMA.calculate(startIdx, endIdx, output, {TimePeriod: this.Settings.TimePeriod, CandleValueIdx: 0});
    var outputCount = tempArr.length - this.Settings.TimePeriodRoc;

    for (var i = 0; i < outputCount; i++)
    {
        outReal[i] = 100 * (tempArr[i + this.Settings.TimePeriodRoc] - tempArr[i]) / tempArr[i];
    }

    return outReal;
};


TA.CHV._lookback = function(optInTimePeriod) {
    return TA.EMA._lookback(optInTimePeriod) + this.Settings.TimePeriodRoc;
};

