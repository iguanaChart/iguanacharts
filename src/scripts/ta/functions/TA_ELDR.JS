if (!!TA.INDICATOR_TEMPLATE)
    TA.ELDR = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ELDR = {};

TA.ELDR.name = 'ELDR';
TA.ELDR.type = 'line';

TA.ELDR.DefaultSettings = {
    TimePeriod: 13,
    MAType: TA.MATypes.EMA
};

TA.ELDR.Settings = {};

TA.ELDR._lookback = function(TimePeriod, MAType) {
    if( !TimePeriod )
        TimePeriod = this.DefaultSettings.TimePeriod;
    else if( (TimePeriod < 1) || (TimePeriod > 100000) )
        return -1;

    if( !MAType)
        MAType = this.DefaultSettings.MAType;
    else if( (MAType < 0) || (MAType > 8) )
        return -1;

    return TA.MA._lookback( TimePeriod, MAType );
};

TA.ELDR.calculate = function(startIdx, endIdx, dataShape, settings) {
    var EMA = [],
        Bulls = [],
        Bears = [],
        ELDR = [],
        Signal = [],
        Smooth = [],
        tempBuffer = [],
        SmoothPeriod = 2;

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';

    lookbackTotal = TA.EMA._lookback(this.Settings.TimePeriod);

    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    EMA = localMA.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType, CandleValueIdx: TA.CLOSE});

    for(var i=0; i < EMA.length; i++) {
        Bulls[i] = dataShape[i+lookbackTotal][TA.HIGH] - EMA[i];
        Bears[i] = dataShape[i+lookbackTotal][TA.LOW] - EMA[i];
        ELDR[i] = ((dataShape[i+lookbackTotal][TA.HIGH] + dataShape[i+lookbackTotal][TA.LOW]) / 2) - EMA[i];
    }

    ELDR.forEach(function(n,i){tempBuffer[i] = [n]});

    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    Signal = localMA.calculate(0, tempBuffer.length-1, tempBuffer, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType, CandleValueIdx: 0});

    for (var i=0; i<this.Settings.TimePeriod-1; i++) {
        Signal.splice(0,0,0);
    }

    var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
    Smooth = localMA.calculate(0, tempBuffer.length-1, tempBuffer, {TimePeriod: SmoothPeriod, MAType: this.Settings.MAType, CandleValueIdx: 0});

    for (var i=0; i<SmoothPeriod-1; i++) {
        Smooth.splice(0,0,0);
    }

    return {"ELDR": ELDR, "Signal": Signal, "Smooth": Smooth, "EMA": EMA};
};