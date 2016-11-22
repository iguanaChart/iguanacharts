if (!!TA.INDICATOR_TEMPLATE)
    TA.MACD = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MACD = {};

TA.MACD.name = 'MACD';
TA.MACD.type = 'line';

TA.MACD.DefaultSettings = {
    FastPeriod: 12,
    SlowPeriod: 26,
    SignalPeriod: 9,
    CandleValueIdx: TA.CLOSE
};

TA.MACD.Settings = {};

TA.MACD.calculate = function(startIdx, endIdx, dataShape, settings){
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
    
    if( !this.Settings.FastPeriod )
       this.Settings.FastPeriod = this.DefaultSettings.FastPeriod;
    else if( (this.Settings.FastPeriod < 2) || (this.Settings.FastPeriod > 100000) )
       throw 'TA_BAD_PARAM';
 
    
    if( !this.Settings.SlowPeriod )
       this.Settings.SlowPeriod = this.DefaultSettings.SlowPeriod;
    else if( (this.Settings.SlowPeriod < 2) || (this.Settings.SlowPeriod > 100000) )
       throw 'TA_BAD_PARAM';
 
    
    if( !this.Settings.SignalPeriod )
       this.Settings.SignalPeriod = this.DefaultSettings.SignalPeriod;
    else if( (this.Settings.SignalPeriod < 1) || (this.Settings.SignalPeriod > 100000) )
       throw 'TA_BAD_PARAM';
 
    var int_macd_settings = $.extend(true, {}, this.Settings);
    int_macd_settings.SignalPeriod_2 = int_macd_settings.SignalPeriod;
    delete int_macd_settings.SignalPeriod;
    
    return TA.INT_MACD.calculate( startIdx, endIdx, dataShape, int_macd_settings);
};

TA.MACD._lookback = function (optInFastPeriod, optInSlowPeriod, optInSignalPeriod) {


    if (!optInFastPeriod)
        optInFastPeriod = this.DefaultSettings.FastPeriod;
    else if ((optInFastPeriod < 2) || (optInFastPeriod > 100000))
        return -1;


    if (!optInSlowPeriod)
        optInSlowPeriod = this.DefaultSettings.SlowPeriod;
    else if ((optInSlowPeriod < 2) || (optInSlowPeriod > 100000))
        return -1;


    if (!optInSignalPeriod)
        optInSignalPeriod = this.DefaultSettings.SignalPeriod;
    else if ((optInSignalPeriod < 1) || (optInSignalPeriod > 100000)) return -1;

    var tempInteger;
    if (optInSlowPeriod < optInFastPeriod) {
        /* swap */
        tempInteger = optInSlowPeriod;
        optInSlowPeriod = optInFastPeriod;
        optInFastPeriod = tempInteger;
    }

    return TA.EMA._lookback(optInSlowPeriod) + TA.EMA._lookback(optInSignalPeriod);
};

TA.MACD.SetSettings(TA.MACD.DefaultSettings);

if (!!TA.INDICATOR_TEMPLATE)
    TA.INT_MACD = TA.INDICATOR_TEMPLATE.Create();
else
    TA.INT_MACD = {};

TA.INT_MACD.name = 'INT_MACD';
TA.INT_MACD.type = 'line';

TA.INT_MACD.DefaultSettings = {
    FastPeriod: 12,
    SlowPeriod: 26,
    SignalPeriod_2: 9,
    CandleValueIdx: TA.CLOSE
};

TA.INT_MACD.Settings = {};

TA.INT_MACD.calculate = function(startIdx, endIdx, dataShape, settings){
    var slowEMABuffer = [],
        fastEMABuffer = [],
        k1, k2, tempInteger,
        lookbackTotal, lookbackSignal,
        i, len;
    
    var outMACD = [],
        outMACDSignal = [],
        outMACDHist = [];
    
    if(!!this.Settings) {
        this.SetSettings(settings);
    }

    /* !!! A lot of speed optimization could be done
    * !!! with this function. 
    * !!!
    * !!! A better approach would be to use TA_INT_EMA
    * !!! just to get the seeding values for the
    * !!! fast and slow EMA. Then process the difference
    * !!! in an allocated buffer until enough data is
    * !!! available for the first signal value.
    * !!! From that point all the processing can
    * !!! be done in a tight loop.
    * !!!
    * !!! That approach will have the following
    * !!! advantage:
    * !!!   1) One mem allocation needed instead of two.
    * !!!   2) The mem allocation size will be only the
    * !!!      signal lookback period instead of the 
    * !!!      whole range of data.
    * !!!   3) Processing will be done in a tight loop.
    * !!!      allowing to avoid a lot of memory store-load
    * !!!      operation.
    * !!!   4) The memcpy at the end will be eliminated!
    * !!!
    * !!! If only I had time....
    */

   /* Make sure slow is really slower than
    * the fast period! if not, swap...
    */
    if( this.Settings.SlowPeriod < this.Settings.FastPeriod )
    {
       /* swap */
       tempInteger              = this.Settings.SlowPeriod;
       this.Settings.SlowPeriod = this.Settings.FastPeriod;
       this.Settings.FastPeriod = tempInteger;
    }

    /* Catch special case for fix 26/12 MACD. */
    if( this.Settings.SlowPeriod != 0 ) {
        k1 = TA.PER_TO_K(this.Settings.SlowPeriod);
    } else {
      this.Settings.SlowPeriod = this.DefaultSettings.SlowPeriod;
      k1 = TA.PER_TO_K(this.Settings.SlowPeriod); /* Fix 26 */
    }

    if( this.Settings.FastPeriod != 0 ) {
        k2 = TA.PER_TO_K(this.Settings.FastPeriod);
    } else {
        this.Settings.FastPeriod = this.DefaultSettings.FastPeriod;
        k2 = TA.PER_TO_K(this.Settings.FastPeriod); /* Fix 12 */
    }

    lookbackSignal = TA.EMA._lookback( this.Settings.SignalPeriod_2 );

    /* Move up the start index if there is not
    * enough initial data.
    */
    lookbackTotal =  lookbackSignal;
    lookbackTotal += TA.EMA._lookback( this.Settings.SlowPeriod );

    if( startIdx < lookbackTotal ) {
        startIdx = lookbackTotal;
    }

    /* Make sure there is still something to evaluate. */
    if( startIdx > endIdx ){
      return {MACD: outMACD, MACDSignal: outMACDSignal, MACDHist: outMACDHist};
    }

    /* Allocate intermediate buffer for fast/slow EMA. */
    tempInteger = (endIdx-startIdx)+1+lookbackSignal;

   /* Calculate the slow EMA. 
    *
    * Move back the startIdx to get enough data
    * for the signal period. That way, once the
    * signal calculation is done, all the output
    * will start at the requested 'startIdx'.
    */
    tempInteger = startIdx-lookbackSignal;
    TA.EMA.SetSettings({CandleValueIdx:this.Settings.CandleValueIdx});
    TA.EMA._int_ema( tempInteger, endIdx, dataShape, this.Settings.SlowPeriod, k1, slowEMABuffer);

    if( !slowEMABuffer || !slowEMABuffer.length ) {
      return {MACD: outMACD, MACDSignal: outMACDSignal, MACDHist: outMACDHist};
    }

    /* Calculate the fast EMA. */
    TA.EMA._int_ema( tempInteger, endIdx, dataShape, this.Settings.FastPeriod, k2, fastEMABuffer );

    if( !fastEMABuffer || !fastEMABuffer.length ) {
       return {MACD: outMACD, MACDSignal: outMACDSignal, MACDHist: outMACDHist};
    }

    /* Calculate (fast EMA) - (slow EMA). */
    for( i=0, len = fastEMABuffer.length; i < len; i++ ) {
        fastEMABuffer[i] = fastEMABuffer[i] - slowEMABuffer[i];
    }

    /* Copy the result into the output for the caller. */
    outMACD = fastEMABuffer.slice(-fastEMABuffer.length+this.Settings.SignalPeriod_2-1);

    /* Calculate the signal/trigger line. */
    var fastEMABufferArr = [];
    for(var i=0; i< fastEMABuffer.length; i++) {
        fastEMABufferArr.push({'7': fastEMABuffer[i]});
    }

    TA.EMA._int_ema(0, fastEMABuffer.length - 1, fastEMABufferArr, this.Settings.SignalPeriod_2, TA.PER_TO_K(this.Settings.SignalPeriod_2), outMACDSignal);

    if( !outMACDSignal || !outMACDSignal.length ) {
        return {MACD: outMACD, MACDSignal: outMACDSignal, MACDHist: outMACDHist};
    }

    /* Calculate the histogram. */
    for( i=0, len = outMACDSignal.length; i < len; i++ ) {
        outMACDHist[i] = outMACD[i] - outMACDSignal[i];
    }

    /* All done! Indicate the output limits and return success. */
    return {MACD: outMACD, MACDSignal: outMACDSignal, MACDHist: outMACDHist};
};

TA.INT_MACD._lookback = function(optInTimePeriod) {
    TA.EMA._lookback(optInTimePeriod)
};

TA.INT_MACD.SetSettings(TA.INT_MACD.DefaultSettings);
