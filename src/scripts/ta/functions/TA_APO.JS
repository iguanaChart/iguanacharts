if (!!TA.INDICATOR_TEMPLATE)
    var APO = TA.INDICATOR_TEMPLATE.Create();
else
    var APO = {};

APO.name = 'APO';
APO.type = 'line';

APO.DefaultSettings = {
	FastPeriod: 12,
	SlowPeriod: 26,
	MAType: TA.MATypes.SMA,
	CandleValueIdx: TA.CLOSE
};

APO.Settings = {};

APO._S = function(startIdx, endIdx, dataShape, settings){
	
};

APO.initChart = function (dataShape, hcOptions, ticker) {
	if(!!INDICATOR_TEMPLATE)
		INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

APO.SetSettings(APO.DefaultSettings);

APO._lookback = function ( optInFastPeriod, optInSlowPeriod, optInMAType ) {

    if( !optInFastPeriod )
       optInFastPeriod = this.DefaultSettings.FastPeriod;
    else if( (optInFastPeriod < 2) || (optInFastPeriod > 100000) )
       return -1;
 
    /* min/max are checked for optInSlowPeriod. */
    if( !optInSlowPeriod )
       optInSlowPeriod = this.DefaultSettings.SlowPeriod;
    else if( (optInSlowPeriod < 2) || (optInSlowPeriod > 100000) )
       return -1;
 
    if( !optInMAType )
       optInMAType = this.DefaultSettings.MAType;
    else if( (optInMAType < 0) || (optInMAType > 8) )
       return -1;

   /* insert lookback code here. */

   /* The slow MA is the key factor determining the lookback period. */
   return MA._lookback( Math.max(optInSlowPeriod,optInFastPeriod), optInMAType );
}



 APO.calculate = function( startIdx, endIdx, dataShape, settings ) {
	 var tempBuffer = [],
		 outReal = [];
	 
 
	 if(!!settings)
		 this.SetSettings(settings);
	 
	 if(!startIdx)
		 startIdx = 0;
	 
	 if(!endIdx)
		 endIdx = dataShape.length - 1;
 
    /* Validate the requested output range. */
    if( startIdx < 0 )
       throw 'TA_OUT_OF_RANGE_START_INDEX';
    if( (endIdx < 0) || (endIdx < startIdx))
       throw 'TA_OUT_OF_RANGE_END_INDEX';
 
    if( !dataShape || !dataShape.length )
		throw 'TA_BAD_PARAM';

    /* min/max are checked for optInFastPeriod. */
    if( !this.Settings.FastPeriod )
       this.Settings.FastPeriod = this.DefaultSettings.FastPeriod;
    else if( (this.Settings.FastPeriod < 2) || (this.Settings.FastPeriod > 100000) )
       throw 'TA_BAD_PARAM';
 
    /* min/max are checked for optInSlowPeriod. */
    if( !this.Settings.SlowPeriod )
       this.Settings.SlowPeriod = this.DefaultSettings.SlowPeriod;
    else if( (this.Settings.SlowPeriod < 2) || (this.Settings.SlowPeriod > 100000) )
       throw 'TA_BAD_PARAM';
 
    if( this.Settings.MAType )
       this.Settings.MAType = this.DefaultSettings.MAType;
    else if( (this.Settings.MAType < 0) || (this.Settings.MAType > 8) )
       throw 'TA_BAD_PARAM';
 
    if( !outReal )
       throw 'TA_BAD_PARAM';
 


   outReal = this.INT_PO( startIdx, endIdx, dataShape,
                                    this.Settings.FastPeriod, 
                                    this.Settings.SlowPeriod, 
                                    this.Settings.MAType,
                                    outReal,
                                    tempBuffer,
                                    0 /* No percentage. */ );
	 
	return outReal;
};


APO.INT_PO  = function( startIdx, endIdx, dataShape, optInFastPeriod, optInSlowPeriod, optInMethod_2, outReal, tempBuffer, doPercentageOutput )
{
   var tempReal,
	   tempInteger,
	   outBegIdx1 = 0,
	   outNbElement1 = 0,
	   outBegIdx2 = 0,
	   outNbElement2 = 0,
	   i = 0, j = 0;

   /* Make sure slow is really slower than
    * the fast period! if not, swap...
    */
   if( optInSlowPeriod < optInFastPeriod )
   {
       /* swap */
       tempInteger     = optInSlowPeriod;
       optInSlowPeriod = optInFastPeriod;
       optInFastPeriod = tempInteger;
   }

	/* Calculate the fast MA into the tempBuffer. */

	var MA_local = MA.Create({TimePeriod: optInFastPeriod, MAType: optInMethod_2, CandleValueIdx: this.Settings.CandleValueIdx});
	tempBuffer = MA_local.calculate( startIdx, endIdx, dataShape);

   if( !!tempBuffer && !!tempBuffer.length )
   {
      /* Calculate the slow MA into the output. */
      outReal = MA_local.calculate( startIdx, endIdx, dataShape, {TimePeriod: optInSlowPeriod} );

      if( !!outReal && !!outReal.length )
      {
         tempInteger = (tempBuffer.length - 1) - (outReal.length - 1);
         if( doPercentageOutput != 0 )
         {
            /* Calculate ((fast MA)-(slow MA))/(slow MA) in the output. */   
            for( i=0,j=tempInteger; i < tempBuffer.length - 1; i++, j++ )
            {
               tempReal = outReal[i];
               if( !TA.TA_IS_ZERO(tempReal) )
                  outReal[i] = ((tempBuffer[j]-tempReal)/tempReal)*100.0;
               else
                  outReal[i] = 0.0;
            }
         }
         else
         {
            /* Calculate (fast MA)-(slow MA) in the output. */   
            for( i=0,j=tempInteger; i < tempBuffer.length - 1; i++, j++ )
               outReal[i] = tempBuffer[j]-outReal[i];
         }

         //VALUE_HANDLE_DEREF(outBegIdx)     = VALUE_HANDLE_GET(outBegIdx1);
         //VALUE_HANDLE_DEREF(outNBElement)  = VALUE_HANDLE_GET(outNbElement1);
      }
   }

   return outReal;
};