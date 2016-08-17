if (!!TA.INDICATOR_TEMPLATE)
    TA.CCI = TA.INDICATOR_TEMPLATE.Create();
else
    TA.CCI = {};

TA.CCI.name = 'CCI';
TA.CCI.type = 'line';

TA.CCI.DefaultSettings = {
	TimePeriod: 14
};

TA.CCI.Settings = {};

TA.CCI.calculate = function (startIdx, endIdx, dataShape, settings) {
	var tempReal, tempReal2, theAverage, lastValue,
		i, j, outIdx, lookbackTotal;

    this.SetSettings(settings);

	//	#define CIRCBUF_PROLOG(Id,Type,Size) Type local_##Id[Size]; \
	//                                  int Id##_Idx; \
	//                                  Type *Id; \
	//                                  int maxIdx_##Id

	//	CIRCBUF_PROLOG(circBuffer,double,30);
	var local_circBuffer = new Array(30),
		circBuffer_Idx, circBuffer, maxIdx_circBuffer;

	var outReal = [];

	if (!startIdx)
		startIdx = 0;

	if (!endIdx)
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

	/* Insert TA function code here. */

	/* Identify the minimum number of price bar needed
	 * to calculate at least one output.
	 */
	lookbackTotal = (this.Settings.TimePeriod - 1);

	/* Move up the start index if there is not
	 * enough initial data.
	 */
	if (startIdx < lookbackTotal)
		startIdx = lookbackTotal;

	/* Make sure there is still something to evaluate. */
	if (startIdx > endIdx) {
		return outReal;
	}

	/* Allocate a circular buffer equal to the requested
	 * period.
	 */
	//   CIRCBUF_INIT( circBuffer, double, optInTimePeriod );
	//	#define CIRCBUF_INIT(Id,Type,Size) \
	//   { \
	//      if( Size < 1 ) \
	//         return TA_INTERNAL_ERROR(137); \
	//      if( (int)Size > (int)(sizeof(local_##Id)/sizeof(Type)) ) \
	//      { \
	//         Id = TA_Malloc( sizeof(Type)*Size ); \
	//         if( !Id ) \
	//            return TA_ALLOC_ERR; \
	//      } \
	//      else \
	//         Id = &local_##Id[0]; \
	//      maxIdx_##Id = (Size-1); \
	//      Id##_Idx = 0; \
	//   }


	circBuffer = [];
	//local_circBuffer[0];
	maxIdx_circBuffer = (this.Settings.TimePeriod - 1);
	circBuffer_Idx = 0;


	/* Do the MA calculation using tight loops. */

	/* Add-up the initial period, except for the last value. 
	 * Fill up the circular buffer at the same time.
	 */
	i = startIdx - lookbackTotal;
	if (this.Settings.TimePeriod > 1) {
		while (i < startIdx) {
			circBuffer[circBuffer_Idx] = (dataShape[i][TA.HIGH] + dataShape[i][TA.LOW] + dataShape[i][TA.CLOSE]) / 3;
			i++;

			circBuffer_Idx++;
			if (circBuffer_Idx > maxIdx_circBuffer)
				circBuffer_Idx = 0;
		}
	}

	/* Proceed with the calculation for the requested range.
	 * Note that this algorithm allows the inReal and
	 * outReal to be the same buffer.
	 */
	outIdx = 0;
	do {
		lastValue = (dataShape[i][TA.HIGH] + dataShape[i][TA.LOW] + dataShape[i][TA.CLOSE]) / 3;
		circBuffer[circBuffer_Idx] = lastValue;

		/* Calculate the average for the whole period. */
		theAverage = 0;
		for (j = 0; j < this.Settings.TimePeriod; j++)
			theAverage += circBuffer[j];
		theAverage /= this.Settings.TimePeriod;

		/* Do the summation of the ABS(TypePrice-average)
		 * for the whole period.
		 */
		tempReal2 = 0;
		for (j = 0; j < this.Settings.TimePeriod; j++)
			tempReal2 += Math.abs(circBuffer[j] - theAverage);

		/* And finally, the CCI... */
		tempReal = lastValue - theAverage;

		if ((tempReal != 0.0) && (tempReal2 != 0.0)) {
			outReal[outIdx++] = tempReal / (0.015 * (tempReal2 / this.Settings.TimePeriod));
		} else
			outReal[outIdx++] = 0.0;

		/* Move forward the circular buffer indexes. */
		circBuffer_Idx++;
		if (circBuffer_Idx > maxIdx_circBuffer)
			circBuffer_Idx = 0;

		i++;
	} while (i <= endIdx);

	return outReal;

};

TA.CCI.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.CCI._lookback = function(optInTimePeriod) {
 	if( !optInTimePeriod )
       optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if( (optInTimePeriod < 2) || (optInTimePeriod > 100000) )
       return -1;
	
   return (optInTimePeriod-1);	
};

TA.CCI._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.CCI.initChart = function (dataShape, hcOptions, ticker) {
	if(!!TA.INDICATOR_TEMPLATE)
		TA.INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.CCI.SetSettings(TA.CCI.DefaultSettings);

