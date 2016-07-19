if (!!TA.INDICATOR_TEMPLATE)
	TA.SMA = TA.INDICATOR_TEMPLATE.Create();
else
	TA.SMA = {};

TA.SMA.name = 'SMA';
TA.SMA.type = 'line';

TA.SMA.DefaultSettings = {
	TimePeriod: 30,
	CandleValueIdx: TA.CLOSE
};

TA.SMA.Settings = {};

TA.SMA.calculate = function (startIdx, endIdx, dataShape, settings, dontFillTotalArray) {
	var periodTotal, tempReal;
	var i, outIdx, trailingIdx, lookbackTotal;
	var outReal = [];

	this.SetSettings(settings);
	
	if(!startIdx)
		startIdx = 0;
	
	if(!endIdx)
		endIdx = dataShape.length - 1;
		
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

	/* Do the MA calculation using tight loops. */
	/* Add-up the initial period, except for the last value. */
	periodTotal = 0;
	trailingIdx = startIdx - lookbackTotal;

	i = trailingIdx;
	if (this.Settings.TimePeriod > 1) {
		while (i < startIdx)
			periodTotal += dataShape[i++][this.Settings.CandleValueIdx];
	}

	/* Proceed with the calculation for the requested range.
	 * Note that this algorithm allows the inReal and
	 * outReal to be the same buffer.
	 */
	outIdx = 0;
	do {
		periodTotal += dataShape[i++][this.Settings.CandleValueIdx];
		tempReal = periodTotal;
		periodTotal -= dataShape[trailingIdx++][this.Settings.CandleValueIdx];
		outReal[outIdx++] = tempReal / this.Settings.TimePeriod;
	} while (i <= endIdx);

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

TA.SMA.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.SMA._lookback = function(optInTimePeriod) {
    
    if( !optInTimePeriod )
       optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if( (optInTimePeriod < 2) || (optInTimePeriod > 100000) )
       return -1;
 
 	return optInTimePeriod - 1;
};

TA.SMA._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.SMA.initChart = function (dataShape, hcOptions, ticker) {
	if(!!INDICATOR_TEMPLATE)
		INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.SMA.SetSettings(TA.SMA.DefaultSettings);
