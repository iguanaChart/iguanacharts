if (!!TA.INDICATOR_TEMPLATE)
    TA.STDDEV = TA.INDICATOR_TEMPLATE.Create();
else
    TA.STDDEV = {};

TA.STDDEV.name = 'STDDEV';
TA.STDDEV.type = 'line';

TA.STDDEV.DefaultSettings = {
	TimePeriod: 10,
	Deviations: 1,
	CandleValueIdx: TA.CLOSE
};

TA.STDDEV.Settings = {};

TA.STDDEV.calculate = function (startIdx, endIdx, dataShape, settings) {
	var i;
	var tempReal;
	var outReal = [];
	var outNBElement;

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

	if (!this.Settings.TimePeriod)
		this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
	else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';

	if (!this.Settings.Deviations)
		this.Settings.Deviations = this.DefaultSettings.Deviations;
	else if ((this.Settings.Deviations < -3.000000e+37) || (this.Settings.Deviations > 3.000000e+37))
		throw 'TA_BAD_PARAM';

	/* Insert TA function code here. */

	/* Calculate the variance. */
	var localINTVAR = TA.INT_VAR.Create({
		TimePeriod: this.Settings.TimePeriod,
		CandleValueIdx: this.Settings.CandleValueIdx
	});
	outReal = localINTVAR.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod,CandleValueIdx: this.Settings.CandleValueIdx});

	if (!outReal || !outReal.length)
		return outReal;

	/* Calculate the square root of each variance, this
	 * is the standard deviation.
	 *
	 * Multiply also by the ratio specified.
	 */
	if (this.Settings.Deviations != 1.0) {
		for (i = 0; i < outNBElement; i++) {
			tempReal = outReal[i];
			if (!!tempReal)
				outReal[i] = Math.sqrt(tempReal) * this.Settings.Deviations;
			else
				outReal[i] = 0.0;
		}
	} else {
		for (i = 0; i < outReal.length; i++) {
			tempReal = outReal[i];
			if (!!tempReal)
				outReal[i] = Math.sqrt(tempReal);
			else
				outReal[i] = 0.0;
		}
	}

	return outReal;

};

TA.STDDEV.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.STDDEV._lookback = function (optInTimePeriod, optInNbDev) {

	if ( !optInTimePeriod )
		optInTimePeriod = this.DefaultSettings.TimePeriod;
	else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
		return -1;

	if ( !optInNbDev)
		optInNbDev = this.DefaultSettings.Deviations;
	else if ((optInNbDev < -3.000000e+37) || (optInNbDev > 3.000000e+37))
		return -1;


	return TA.VAR._lookback(optInTimePeriod, optInNbDev);
};

TA.STDDEV._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.STDDEV.initChart = function (dataShape, hcOptions, ticker) {
	if(!!TA.INDICATOR_TEMPLATE)
		TA.INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.STDDEV.SetSettings(TA.STDDEV.DefaultSettings);
