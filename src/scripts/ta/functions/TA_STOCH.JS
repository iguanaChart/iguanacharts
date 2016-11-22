if (!!TA.INDICATOR_TEMPLATE)
    TA.STOCH = TA.INDICATOR_TEMPLATE.Create();
else
    TA.STOCH = {};

TA.STOCH.name = 'STOCH';
TA.STOCH.type = 'line';

TA.STOCH.DefaultSettings = {
    PeriodFastK: 5,
    PeriodSlowK: 3,
    PeriodSlowD: 3,
    SlowKMAType: TA.MATypes.SMA,
    SlowDMAType: TA.MATypes.SMA
};

TA.STOCH.Settings = {};

TA.STOCH.calculate = function(startIdx, endIdx, dataShape, settings) {
    var outSlowK = [];
    var outSlowD = [];

    var lowest, highest, tmp, diff;
    var tempBuffer = [];
    var outIdx, lowestIdx, highestIdx;
    var lookbackTotal, lookbackK, lookbackKSlow, lookbackDSlow;
    var trailingIdx, today, i;

    if(!!settings)
        this.SetSettings(settings);

    if(!startIdx)
        startIdx = 0;

    if(!endIdx)
        endIdx = dataShape.length-1;

    if( startIdx < 0 )
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if( (endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';

    if( !dataShape || !dataShape.length )
        throw 'TA_BAD_PARAM';

    if( !this.Settings.PeriodFastK )
        this.Settings.PeriodFastK = this.DefaultSettings.PeriodFastK;
    else if( (this.Settings.PeriodFastK < 1) || (this.Settings.PeriodFastK > 100000) )
        throw 'TA_BAD_PARAM';


    if( !this.Settings.PeriodSlowK )
        this.Settings.PeriodSlowK = this.DefaultSettings.PeriodSlowK;
    else if( (this.Settings.PeriodSlowK < 1) || (this.Settings.PeriodSlowK > 100000) )
        throw 'TA_BAD_PARAM';


    if( !this.Settings.PeriodSlowD )
        this.Settings.PeriodSlowD = this.DefaultSettings.PeriodSlowD;
    else if( (this.Settings.PeriodSlowD < 1) || (this.Settings.PeriodSlowD > 100000) )
        throw 'TA_BAD_PARAM';

    if (this.Settings.SlowKMAType)
        this.Settings.SlowKMAType = this.DefaultSettings.SlowKMAType;
    else if ((this.Settings.SlowKMAType < 0) || (this.Settings.SlowKMAType > 8))
        throw 'TA_BAD_PARAM';

    if (this.Settings.SlowDMAType)
        this.Settings.SlowDMAType = this.DefaultSettings.SlowDMAType;
    else if ((this.Settings.SlowDMAType < 0) || (this.Settings.SlowDMAType > 8))
        throw 'TA_BAD_PARAM';

    if (!outSlowK)
        throw 'TA_BAD_PARAM';

    if (!outSlowD)
        throw 'TA_BAD_PARAM';

    lookbackK      = this.Settings.PeriodFastK - 1;
    lookbackKSlow  = TA.MA._lookback( this.Settings.PeriodSlowK, this.Settings.SlowKMAType );
    lookbackDSlow  = TA.MA._lookback( this.Settings.PeriodSlowD, this.Settings.SlowDMAType );
    lookbackTotal  = lookbackK + lookbackDSlow + lookbackKSlow;

    /* Move up the start index if there is not
     * enough initial data.
     */
    if( startIdx < lookbackTotal )
        startIdx = lookbackTotal;

    /* Make sure there is still something to evaluate. */
    if( startIdx > endIdx )
    {
        /* Succeed... but no data in the output. */
        return {slowK: [], slowD: []};
    }

    /* Proceed with the calculation for the requested range.
     * Note that this algorithm allows the input and
     * output to be the same buffer.
     */
    outIdx = 0;

    /* Calculate just enough K for ending up with the caller
     * requested range. (The range of k must consider all
     * the lookback involve with the smoothing).
     */
    trailingIdx = startIdx-lookbackTotal;
    today       = trailingIdx+lookbackK;
    lowestIdx   = highestIdx = -1;
    diff = highest = lowest  = 0.0;

    /* Do the K calculation */
    while( today <= endIdx )
    {
        /* Set the lowest low */
        tmp = dataShape[today][TA.LOW];
        if( lowestIdx < trailingIdx )
        {
            lowestIdx = trailingIdx;
            lowest = dataShape[lowestIdx][TA.LOW];
            i = lowestIdx;
            while( ++i<=today )
            {
                tmp = dataShape[i][TA.LOW];
                if( tmp < lowest )
                {
                    lowestIdx = i;
                    lowest = tmp;
                }
            }
            diff = (highest - lowest)/100.0;
        }
        else if( tmp <= lowest )
        {
            lowestIdx = today;
            lowest = tmp;
            diff = (highest - lowest)/100.0;
        }

        /* Set the highest high */
        tmp = dataShape[today][TA.HIGH];
        if( highestIdx < trailingIdx )
        {
            highestIdx = trailingIdx;
            highest = dataShape[highestIdx][TA.HIGH];
            i = highestIdx;
            while( ++i<=today )
            {
                tmp = dataShape[i][TA.HIGH];
                if( tmp > highest )
                {
                    highestIdx = i;
                    highest = tmp;
                }
            }
            diff = (highest - lowest)/100.0;
        }
        else if( tmp >= highest )
        {
            highestIdx = today;
            highest = tmp;
            diff = (highest - lowest)/100.0;
        }

        /* Calculate stochastic. */
        if( diff != 0.0 )
            tempBuffer[outIdx++] = [(dataShape[today][TA.CLOSE]-lowest)/diff];
        else
            tempBuffer[outIdx++] = [0.0];

        trailingIdx++;
        today++;
    }

    var localMA = TA.MA.Create({TimePeriod: this.Settings.PeriodSlowK, MAType: this.Settings.SlowKMAType});
    outSlowK = localMA.calculate(0, outIdx-1, tempBuffer, {TimePeriod: this.Settings.PeriodSlowK, MAType: this.Settings.SlowKMAType, CandleValueIdx: 0});

    var outNBElement = outSlowK.length;

    outSlowK.forEach(function(n,i){tempBuffer[i] = [n]});

    var localMA = TA.MA.Create({TimePeriod: this.Settings.PeriodSlowK, MAType: this.Settings.SlowKMAType});
    outSlowD = localMA.calculate(0, outNBElement-1, tempBuffer, {TimePeriod: this.Settings.PeriodSlowD, MAType: this.Settings.SlowDMAType, CandleValueIdx: 0});

    //outSlowD.forEach(function(n,i){outSlowD[i] = [n]});

    outSlowK = outSlowK.slice(lookbackDSlow);

    return {slowK: outSlowK, slowD: outSlowD};
};

TA.STOCH._lookback = function( optInPeriodFastK, optInPeriodSlowK, optInPeriodSlowD, optInSlowKMAType, optInSlowDMAType ) {

    if( !optInPeriodFastK )
        optInPeriodFastK = this.DefaultSettings.PeriodFastK;
    else if( (optInPeriodFastK < 1) || (optInPeriodFastK > 100000) )
        return -1;

    if( !optInPeriodSlowK )
        optInPeriodSlowK = this.DefaultSettings.PeriodSlowK;
    else if( (optInPeriodSlowK < 1) || (optInPeriodSlowK > 100000) )
        return -1;

    if( !optInSlowKMAType)
        optInSlowKMAType = this.DefaultSettings.SlowKMAType;
    else if( (optInSlowKMAType < 0) || (optInSlowKMAType > 8) )
        return -1;

    if( !optInPeriodSlowD )
        optInPeriodSlowD = this.DefaultSettings.PeriodSlowD;
    else if( (optInPeriodSlowD < 1) || (optInPeriodSlowD > 100000) )
        return -1;

    if( !optInSlowDMAType)
        optInSlowDMAType = this.DefaultSettings.SlowDMAType;
    else if( (optInSlowDMAType < 0) || (optInSlowDMAType > 8) )
        return -1;

    var retValue = optInPeriodFastK - 1;
    retValue += TA.MA._lookback( optInPeriodSlowK, optInSlowKMAType );
    retValue += TA.MA._lookback( optInPeriodSlowD, optInSlowDMAType );

    return retValue;
};