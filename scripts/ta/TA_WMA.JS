if (!!TA.INDICATOR_TEMPLATE)
    TA.WMA = TA.INDICATOR_TEMPLATE.Create();
else
    TA.WMA = {};

TA.WMA.name = 'WMA';
TA.WMA.type = 'line';

TA.WMA.DefaultSettings = {
	TimePeriod: 30,
	CandleValueIdx: TA.CLOSE
};

TA.WMA.Settings = {};

TA.WMA.calculate = function (startIdx, endIdx, dataShape, settings, dontFillTotalArray) {
	var inIdx, outIdx, i, trailingIdx, divider;
	var periodSum, periodSub, tempReal, trailingValue;
	var lookbackTotal;


	var outReal = [];

    this.SetSettings(settings);

	if(!startIdx)
		startIdx = 0;
	
	if(!endIdx)
		endIdx = dataShape.length - 1;

	if (startIdx < 0)
		throw 'TA_OUT_OF_RANGE_START_INDEX';
	if ((endIdx < 0) || (endIdx < startIdx))
		throw 'TA_OUT_OF_RANGE_END_INDEX';

	if (!dataShape || !dataShape.length)
		throw 'TA_BAD_PARAM';

	if (!this.Settings.TimePeriod)
		this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
	else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';

	if (!outReal)
		throw 'TA_BAD_PARAM';

	lookbackTotal = this.Settings.TimePeriod - 1;

/* Move up the start index if there is not
    * enough initial data.
    */
   if( startIdx < lookbackTotal )
      startIdx = lookbackTotal;

   /* Make sure there is still something to evaluate. */
   if( startIdx > endIdx ) {
      return outReal;
   }

   /* To make the rest more efficient, handle exception
    * case where the user is asking for a period of '1'.
    * In that case outputs equals inputs for the requested
    * range.
    */
   if( this.Settings.TimePeriod == 1 ) 
   {      
      return outReal;
   }

   /* Calculate the divider (always an integer value).
    * By induction: 1+2+3+4+'n' = n(n+1)/2
    * '>>1' is usually faster than '/2' for unsigned.
    */

   divider = (this.Settings.TimePeriod*( +(this.Settings.TimePeriod) + 1))/2;

   /* The algo used here use a very basic property of
    * multiplication/addition: (x*2) = x+x
    *   
    * As an example, a 3 period weighted can be 
    * interpreted in two way:
    *  (x1*1)+(x2*2)+(x3*3)
    *      OR
    *  x1+x2+x2+x3+x3+x3 (this is the periodSum)
    *   
    * When you move forward in the time serie
    * you can quickly adjust the periodSum for the
    * period by substracting:
    *   x1+x2+x3 (This is the periodSub)
    * Making the new periodSum equals to:
    *   x2+x3+x3
    *
    * You can then add the new price bar
    * which is x4+x4+x4 giving:
    *   x2+x3+x3+x4+x4+x4
    *
    * At this point one iteration is completed and you can
    * see that we are back to the step 1 of this example.
    *
    * Why making it so un-intuitive? The number of memory
    * access and floating point operations are kept to a
    * minimum with this algo.
    */
   outIdx      = 0;
   trailingIdx = startIdx - lookbackTotal;

   /* Evaluate the initial periodSum/periodSub and trailingValue. */
   periodSum = periodSub = 0.0;
   inIdx=trailingIdx;
   i = 1;
   while( inIdx < startIdx )
   {
      tempReal = dataShape[inIdx++][this.Settings.CandleValueIdx];
      periodSub += tempReal;
      periodSum += tempReal*i;
      i++;
   }
   trailingValue = 0.0;

   /* Tight loop for the requested range. */
   while( inIdx <= endIdx )
   {
      /* Add the current price bar to the sum
       * who are carried through the iterations.
       */
      tempReal = dataShape[inIdx++][this.Settings.CandleValueIdx];
      periodSub += tempReal;
      periodSub -= trailingValue;
      periodSum += tempReal*this.Settings.TimePeriod;

      /* Save the trailing value for being substract at
       * the next iteration.
       * (must be saved here just in case outReal and
       *  inReal are the same buffer).
       */
      trailingValue = dataShape[trailingIdx++][this.Settings.CandleValueIdx];

      /* Calculate the WMA for this price bar. */
      outReal[outIdx++] = periodSum / divider;

      /* Prepare the periodSum for the next iteration. */
      periodSum -= periodSub;
   }

   /* Set output limits. */
    /*
   if(!dontFillTotalArray) {
		if(outReal.length >= dataShape.length)
			throw 'Ошибка расчета ADX';
		else if(outReal.length <= dataShape.length)
			while(outReal.length != dataShape.length){
				outReal.unshift(0);
			}
	}
	*/

   return outReal;
};

TA.WMA.getValue = function (dataShape, itemIdx, settings) {

};

TA.WMA._lookback = function (optInTimePeriod) {

	if (!optInTimePeriod)
		optInTimePeriod = 30;
	else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
		return -1;

	return optInTimePeriod - 1;
};

TA.WMA._S = function (startIdx, endIdx, dataShape, settings) {

};

TA.WMA.initChart = function (dataShape, hcOptions, ticker) {
	if (!!INDICATOR_TEMPLATE)
		INDICATOR_TEMPLATE.initChart.apply(this, arguments);


};

TA.WMA.SetSettings(TA.WMA.DefaultSettings);
