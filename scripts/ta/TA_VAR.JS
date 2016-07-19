if (!!TA.INDICATOR_TEMPLATE)
    TA.VAR = TA.INDICATOR_TEMPLATE.Create();
else
    TA.VAR = {};

TA.VAR.name = 'VAR';
TA.VAR.type = 'line';

TA.VAR.DefaultSettings = {
	TimePeriod: 2,
	Deviations: 1,
	CandleValueIdx: TA.CLOSE
};

TA.VAR.Settings = {};

TA.VAR.calculate = function (startIdx, endIdx, dataShape, settings) {
	var tempReal, periodTotal1, periodTotal2, meanValue1, meanValue2;
	var i, outIdx, trailingIdx, nbInitialElementNeeded;
	var outReal = [];

    this.SetSettings(settings);

	if (!startIdx)
		startIdx = 0;

	if (!endIdx)
		endIdx = dataShape.length - 1;

	nbInitialElementNeeded = (this.Settings.TimePeriod - 1);

	if (startIdx < nbInitialElementNeeded)
		startIdx = nbInitialElementNeeded;

	if (startIdx > endIdx) {
		return outReal;
	}

	/* Do the MA calculation using tight loops. */
	/* Add-up the initial periods, except for the last value. */
	periodTotal1 = 0;
	periodTotal2 = 0;
	trailingIdx = startIdx - nbInitialElementNeeded;

	i = trailingIdx;
	if (this.Settings.TimePeriod > 1) {
		while (i < startIdx) {
			tempReal = dataShape[i++][this.Settings.CandleValueIdx];
			periodTotal1 += tempReal;
			tempReal *= tempReal;
			periodTotal2 += tempReal;
		}
	}

	/* Proceed with the calculation for the requested range.
	 * Note that this algorithm allows the inReal and
	 * outReal to be the same buffer.
	 */
	outIdx = 0;
	do {
		tempReal = dataShape[i++][this.Settings.CandleValueIdx];

		/* Square and add all the deviation over
		 * the same periods.
		 */

		periodTotal1 += tempReal;
		tempReal *= tempReal;
		periodTotal2 += tempReal;

		/* Square and add all the deviation over
		 * the same period.
		 */

		meanValue1 = periodTotal1 / this.Settings.CandleValueIdx;
		meanValue2 = periodTotal2 / this.Settings.CandleValueIdx;

		tempReal = dataShape[trailingIdx++][this.Settings.CandleValueIdx];
		periodTotal1 -= tempReal;
		tempReal *= tempReal;
		periodTotal2 -= tempReal;

		outReal[outIdx++] = meanValue2 - meanValue1 * meanValue1;
	} while (i <= endIdx);

	return outReal;
};

TA.VAR.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.VAR._lookback = function(optInTimePeriod, optInNbDev) {
    
    if( !optInTimePeriod )
       optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if( (optInTimePeriod < 1) || (optInTimePeriod > 100000) )
       return -1;
 
    if( !optInNbDev )
       optInNbDev = this.DefaultSettings.Deviations;
    else if( (optInNbDev < -3.000000e+37) ||  (optInNbDev > 3.000000e+37) )
       return -1;
 
   return optInTimePeriod-1;
};

TA.VAR._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.VAR.initChart = function (dataShape, hcOptions, ticker) {
	if(!!INDICATOR_TEMPLATE)
		INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.VAR.SetSettings(TA.VAR.DefaultSettings);


TA.INT_VAR = TA.VAR.Create();

TA.INT_VAR.calculate = function (startIdx, endIdx, dataShape, settings) {
	
	var tempReal, periodTotal1, periodTotal2, meanValue1, meanValue2;
	var i, outIdx, trailingIdx, nbInitialElementNeeded;
	var outReal = [];

    this.SetSettings(settings);

	if (!startIdx)
		startIdx = 0;

	if (!endIdx)
		endIdx = dataShape.length - 1;
	
	nbInitialElementNeeded = (this.Settings.TimePeriod - 1);
	if (startIdx < nbInitialElementNeeded)
		startIdx = nbInitialElementNeeded;
	if (startIdx > endIdx) {
		return outReal;
	}
	
	periodTotal1 = 0;
	periodTotal2 = 0;
	trailingIdx = startIdx - nbInitialElementNeeded;
	i = trailingIdx;
	if (this.Settings.TimePeriod > 1) {
		while (i < startIdx) {
			tempReal = dataShape[i++][this.Settings.CandleValueIdx];
			periodTotal1 += tempReal;
			tempReal *= tempReal;
			periodTotal2 += tempReal;
		}
	}
	outIdx = 0;
	do {
		tempReal = dataShape[i++][this.Settings.CandleValueIdx];
		periodTotal1 += tempReal;
		tempReal *= tempReal;
		periodTotal2 += tempReal;
		meanValue1 = periodTotal1 / this.Settings.TimePeriod;
		meanValue2 = periodTotal2 / this.Settings.TimePeriod;
		tempReal = dataShape[trailingIdx++][this.Settings.CandleValueIdx];
		periodTotal1 -= tempReal;
		tempReal *= tempReal;
		periodTotal2 -= tempReal;
		outReal[outIdx++] = meanValue2 - meanValue1 * meanValue1;
	} while (i <= endIdx);
	
	return outReal;
};