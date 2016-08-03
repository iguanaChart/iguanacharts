if (!!TA.INDICATOR_TEMPLATE)
    TA.ADOSC = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ADOSC = {};

TA.ADOSC.name = 'ADOSC';
TA.ADOSC.type = 'line';

TA.ADOSC.DefaultSettings = {
	/**
	 * Number of period for the fast MA
	 */
	FastPeriod: 3,
	
	/**
	 * Number of period for the slow MA
	 */
	SlowPeriod: 10
};

TA.ADOSC.Settings = {};

TA.ADOSC.calculate = function (startIdx, endIdx, dataShape, settings) {
	var today, outIdx, lookbackTotal;
	var slowestPeriod;
	var high, low, close, tmp;

	var slowEMA, slowk, one_minus_slowk;
	var fastEMA, fastk, one_minus_fastk;
	var ad;

	var outReal = [];

	this.SetSettings(settings);

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

	if (!this.Settings.FastPeriod)
		this.Settings.FastPeriod = 3;
	else if ((this.Settings.FastPeriod < 2) || (this.Settings.FastPeriod > 100000))
		throw 'TA_BAD_PARAM';

	if (!this.Settings.SlowPeriod)
		this.Settings.SlowPeriod = 10;
	else if ((this.Settings.SlowPeriod < 2) || (this.Settings.SlowPeriod > 100000))
		throw 'TA_BAD_PARAM';


	if (this.Settings.FastPeriod < this.Settings.SlowPeriod)
		slowestPeriod = this.Settings.SlowPeriod;
	else
		slowestPeriod = this.Settings.FastPeriod;


	lookbackTotal = TA.EMA._lookback(slowestPeriod);
	if (startIdx < lookbackTotal)
		startIdx = lookbackTotal;

	if (startIdx > endIdx) {
		return outReal;
	}

	today = startIdx - lookbackTotal;

	ad = 0.0;
	var CALCULATE_AD = '\
   { \
      high  = dataShape[today][TA.HIGH]; \
      low   = dataShape[today][TA.LOW]; \
      tmp   = high-low; \
      close = dataShape[today][TA.CLOSE]; \
      if( tmp > 0.0 ) \
         ad += (((close-low)-(high-close))/tmp)*(dataShape[today][TA.VOL]); \
      today++; \
   }';


	fastk = TA.PER_TO_K(this.Settings.FastPeriod);
	one_minus_fastk = 1.0 - fastk;

	slowk = TA.PER_TO_K(this.Settings.SlowPeriod);
	one_minus_slowk = 1.0 - slowk;


	eval(CALCULATE_AD);
	fastEMA = ad;
	slowEMA = ad;


	while (today < startIdx) {
		eval(CALCULATE_AD);
		fastEMA = (fastk * ad) + (one_minus_fastk * fastEMA);
		slowEMA = (slowk * ad) + (one_minus_slowk * slowEMA);
	}


	outIdx = 0;
	while (today <= endIdx) {
		eval(CALCULATE_AD);
		fastEMA = (fastk * ad) + (one_minus_fastk * fastEMA);
		slowEMA = (slowk * ad) + (one_minus_slowk * slowEMA);

		outReal[outIdx++] = fastEMA - slowEMA;
	}

	return outReal;
};

TA.ADOSC.getValue = function(dataShape, itemIdx, settings) {
	return NaN;
};

TA.ADOSC._lookback = function() {
	var slowestPeriod;

	if ( this.Settings.FastPeriod )
		this.Settings.FastPeriod = 3;
	else if (( this.Settings.FastPeriod < 2) || ( this.Settings.FastPeriod > 100000))
		return -1;


	if ( !this.Settings.SlowPeriod )
		this.Settings.SlowPeriod = 10;
	else if (( this.Settings.SlowPeriod < 2) || ( this.Settings.SlowPeriod > 100000))
		return -1;

	if (this.Settings.FastPeriod < this.Settings.SlowPeriod)
		slowestPeriod = this.Settings.SlowPeriod;
	else
		slowestPeriod = this.Settings.FastPeriod;


	return TA.EMA._lookback(slowestPeriod);
};

TA.ADOSC._S = function(startIdx, endIdx, dataShape, settings){
	return NaN;
};

TA.ADOSC.initChart = function (dataShape, hcOptions, ticker) {
	INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.ADOSC.SetSettings(TA.ADOSC.DefaultSettings);
