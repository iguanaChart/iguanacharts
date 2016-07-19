if (!!TA.INDICATOR_TEMPLATE)
    var PPO = TA.INDICATOR_TEMPLATE.Create();
else
    var PPO = {};


PPO.DefaultSettings = {
    "CandleValueIdx": TA.CLOSE,
    "FastPeriod": 12,
    "SlowPeriod": 26,
    "MAType": TA.MATypes.SMA
};

PPO.Settings = {};

PPO.name = 'PPO';
PPO.type = 'line';

PPO._lookback = function (optInFastPeriod, optInSlowPeriod, optInMAType) {
    if (!optInFastPeriod)
        optInFastPeriod = this.DefaultSettings.FastPeriod;
    else if ((optInFastPeriod < 2) || (optInFastPeriod > 100000))
        return -1;
    if (!optInSlowPeriod)
        optInSlowPeriod = this.DefaultSettings.SlowPeriod;
    else if ((optInSlowPeriod < 2) || (optInSlowPeriod > 100000))
        return -1;
    if (!optInMAType)
        optInMAType = this.DefaultSettings.MAType;
    else if ((optInMAType < 0) || (optInMAType > 8))
        return -1;
    return MA._lookback(Math.max(optInSlowPeriod, optInFastPeriod), optInMAType);
};

PPO.calculate = function (startIdx, endIdx, dataShape, settings) {
        var outBegIdx, outNBElement,
            tempBuffer = [],
            retCode, outReal = [];

        this.SetSettings(settings);

        if (startIdx < 0)
            throw 'TA_OUT_OF_RANGE_START_INDEX';
        if ((endIdx < 0) || (endIdx < startIdx))
            throw 'TA_OUT_OF_RANGE_END_INDEX';
        if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';
        if (!this.Settings.FastPeriod)
            this.Settings.FastPeriod = this.DefaultSettings.FastPeriod;
        else if ((this.Settings.FastPeriod < 2) || (this.Settings.FastPeriod > 100000))
            throw 'TA_BAD_PARAM';
        if (!this.Settings.SlowPeriod)
            this.Settings.SlowPeriod = this.DefaultSettings.SlowPeriod;
        else if ((this.Settings.SlowPeriod < 2) || (this.Settings.SlowPeriod > 100000))
            throw 'TA_BAD_PARAM';
        if (!this.Settings.MAType)
            this.Settings.MAType = this.DefaultSettings.MAType;
        else if ((this.Settings.MAType < 0) || (this.Settings.MAType > 8))
            throw 'TA_BAD_PARAM';
        if (!outReal)
            throw 'TA_BAD_PARAM';


        outReal = APO.INT_PO(startIdx, endIdx, dataShape, this.Settings.FastPeriod, this.Settings.SlowPeriod, this.Settings.MAType, outReal, tempBuffer, 1);

        return outReal;
};

PPO.SetSettings(PPO.DefaultSettings);