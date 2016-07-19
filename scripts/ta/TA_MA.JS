if (!!TA.INDICATOR_TEMPLATE)
    TA.MA = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MA = {};

TA.MA.name = 'MA';
TA.MA.type = 'line';

TA.MA.DefaultSettings = {
	TimePeriod: 30,
	CandleValueIdx: TA.CLOSE,
	MAType: TA.MATypes.SMA
};

TA.MA.Settings = {};

TA.MA.calculate = function (startIdx, endIdx, dataShape, settings) {
	
	this.SetSettings(settings);

	var dummyBuffer = [];
	//ENUM_DECLARATION(RetCode) retCode;

	var outIdx, todayIdx;
	var outReal = [];

	if (startIdx < 0)
		throw 'TA_OUT_OF_RANGE_START_INDEX';
	if ((endIdx < 0) || (endIdx < startIdx))
		throw 'TA_OUT_OF_RANGE_END_INDEX';


	if (!dataShape || !dataShape.length)
		throw 'TA_BAD_PARAM';


	if (!this.Settings.TimePeriod)
		this.Settings.TimePeriod = 30;
	else if ((this.Settings.TimePeriod < 1) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';

	if (!this.Settings.MAType)
		this.Settings.MAType = TA.MATypes.SMA;
	else if ((this.Settings.MAType < 0) || (this.Settings.MAType > 8))
		throw 'TA_BAD_PARAM';

	if (this.Settings.TimePeriod == 1) {
		nbElement = endIdx - startIdx + 1;
		for (todayIdx = startIdx, outIdx = 0; outIdx < nbElement; outIdx++, todayIdx++)
			outReal[outIdx] = dataShape[todayIdx][this.Settings.CandleValueIdx];

		return outReal;
	}
	/* Simply forward the job to the corresponding TA function. */
	switch (this.Settings.MAType) {
	case TA.MATypes.SMA:
		outReal = TA.SMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.EMA:
		outReal = TA.EMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.WMA:
		outReal = TA.WMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.DEMA:
		outReal = DEMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.TEMA:
		outReal = TEMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.TRIMA:
		outReal = TRIMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.KAMA:
		outReal = KAMA.calculate(startIdx, endIdx, dataShape, this.Settings);
		break;

	case TA.MATypes.MAMA:
		/* The optInTimePeriod is ignored and the FAMA output of the MAMA
		 * is ignored.
		 */
		/*ARRAY_ALLOC(dummyBuffer, (endIdx - startIdx + 1));


		if (!dummyBuffer)
			return ENUM_VALUE(RetCode, TA_ALLOC_ERR, AllocErr);*/


		outReal = MAMA.calculate(startIdx, endIdx, dataShape, {FastLimit: 0.5, SlowLimit: 0.05});
		break;

	case TA.MATypes.T3:
		outReal = T3.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, VFactor: 0.7});
		break;

	default:
		throw 'TA_BAD_PARAM';
		break;
	}

	return outReal;
};

TA.MA.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.MA._lookback = function (optInTimePeriod, optInMAType) {
	var retValue;

	if (!optInTimePeriod)
		optInTimePeriod = this.DefaultSettings.TimePeriod;
	else if ((optInTimePeriod < 1) || (optInTimePeriod > 100000))
		return -1;

	if (!optInMAType)
		optInMAType = this.DefaultSettings.MAType;
	else if ((optInMAType < 0) || (optInMAType > 8))
		return -1;

	if (optInTimePeriod <= 1)
		return 0;

	switch (optInMAType) {
	case TA.MATypes.SMA:
		retValue = TA.SMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.EMA:
		retValue = TA.EMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.WMA:
		retValue = TA.WMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.DEMA:
		retValue = DEMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.TEMA:
		retValue = TEMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.TRIMA:
		retValue = TRIMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.KAMA:
		retValue = KAMA._lookback(optInTimePeriod);
		break;

	case TA.MATypes.MAMA:
		retValue = MAMA._lookback(0.5, 0.05);
		break;

	case TA.MATypes.T3:
		retValue = T3._lookback(optInTimePeriod, 0.7);
		break;

	default:
		retValue = 0;
	}

	return retValue;
};

TA.MA._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.MA.initChart = function (dataShape, hcOptions, ticker) {
	if(!!INDICATOR_TEMPLATE)
		INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

TA.MA.SetSettings(TA.MA.DefaultSettings);
