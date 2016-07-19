if (!!TA.INDICATOR_TEMPLATE)
    TA.BBANDS = TA.INDICATOR_TEMPLATE.Create();
else
	TA.BBANDS = {};

TA.BBANDS.name = 'BBANDS';
TA.BBANDS.type = 'line';

TA.BBANDS.DefaultSettings = {
	TimePeriod:		7,
	DeviationsUp:	2,
	DeviationsDown:	2,
	MAType:			TA.MATypes.SMA,
	CandleValueIdx: TA.CLOSE
};

TA.BBANDS.Settings = {};

TA.BBANDS.calculate = function (startIdx, endIdx, dataShape, settings) {

	var i;
	var tempReal, tempReal2;
	var tempBuffer1 = [];
	var tempBuffer2 = [];

	var outRealUpperBand = [];
	var outRealMiddleBand = [];
	var outRealLowerBand = [];
	
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

	if (!this.Settings.DeviationsUp)
		this.Settings.DeviationsUp = this.DefaultSettings.DeviationsUp;
	else if ((this.Settings.DeviationsUp < -3.000000e+37) || (this.Settings.DeviationsUp > 3.000000e+37))
		throw 'TA_BAD_PARAM';

	if (!this.Settings.DeviationsDown)
		this.Settings.DeviationsDown = this.DefaultSettings.DeviationsDown;
	else if ((this.Settings.DeviationsDown < -3.000000e+37) || (this.Settings.DeviationsDown > 3.000000e+37))
		throw 'TA_BAD_PARAM';

	if (this.Settings.MAType)
		this.Settings.MAType = this.DefaultSettings.MAType;
	else if ((this.Settings.MAType < 0) || (this.Settings.MAType > 8))
		throw 'TA_BAD_PARAM';

	if (!outRealUpperBand)
		throw 'TA_BAD_PARAM';

	if (!outRealMiddleBand)
		throw 'TA_BAD_PARAM';

	if (!outRealLowerBand)
		throw 'TA_BAD_PARAM';

	tempBuffer1 = outRealMiddleBand;
	tempBuffer2 = outRealUpperBand;

	/* Calculate the middle band, which is a moving average.
	 * The other two bands will simply add/substract the
	 * standard deviation from this middle band.
	 */

	var localMA = TA.MA.Create({TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});
	tempBuffer1 = localMA.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, MAType: this.Settings.MAType});

	if (!tempBuffer1 || !tempBuffer1.length) {
		return {UpperBand: [], LowerBand: [], MiddleBand: []};
	}

	
	/* Calculate the Standard Deviation */
	var localSTDDEV = TA.STDDEV.Create({TimePeriod: this.Settings.TimePeriod, Deviations: 1});

	tempBuffer2 = localSTDDEV.calculate(startIdx, endIdx, dataShape, {TimePeriod: this.Settings.TimePeriod, Deviations: 1});

	if ( !tempBuffer2 || !tempBuffer2.length ) {
		return {UpperBand: [], LowerBand: [], MiddleBand: []};
	}

	/* Copy the MA calculation into the middle band ouput, unless
	 * the calculation was done into it already!
	 */
	outRealMiddleBand = tempBuffer1.slice();

	//outNBElement = outRealMiddleBand.length - 1;
	outNBElement = outRealMiddleBand.length;
	/* Now do a tight loop to calculate the upper/lower band at
	 * the same time.
	 *
	 * All the following 5 loops are doing the same, except there
	 * is an attempt to speed optimize by eliminating uneeded
	 * multiplication.
	 */
	if (this.Settings.DeviationsUp == this.Settings.DeviationsDown) {
		if (this.Settings.DeviationsUp == 1.0) {
			/* No standard deviation multiplier needed. */
			for (i = 0; i < outNBElement; i++) {
				tempReal			= tempBuffer2[i];
				tempReal2			= outRealMiddleBand[i];
				outRealUpperBand[i] = tempReal2 + tempReal;
				outRealLowerBand[i] = tempReal2 - tempReal;
			}
		} else {
			/* Upper/lower band use the same standard deviation multiplier. */
			for (i = 0; i < outNBElement; i++) {
				tempReal = tempBuffer2[i] * this.Settings.DeviationsUp;
				tempReal2 = outRealMiddleBand[i];
				outRealUpperBand[i] = tempReal2 + tempReal;
				outRealLowerBand[i] = tempReal2 - tempReal;
			}
		}
	} else if (this.Settings.DeviationsUp == 1.0) {
		/* Only lower band has a standard deviation multiplier. */
		for (i = 0; i < outNBElement; i++) {
			tempReal = tempBuffer2[i];
			tempReal2 = outRealMiddleBand[i];
			outRealUpperBand[i] = tempReal2 + tempReal;
			outRealLowerBand[i] = tempReal2 - (tempReal * this.Settings.DeviationsDown);
		}
	} else if (this.Settings.DeviationsDown == 1.0) {
		/* Only upper band has a standard deviation multiplier. */
		for (i = 0; i < outNBElement; i++) {
			tempReal = tempBuffer2[i];
			tempReal2 = outRealMiddleBand[i];
			outRealLowerBand[i] = tempReal2 - tempReal;
			outRealUpperBand[i] = tempReal2 + (tempReal * this.Settings.DeviationsUp);
		}
	} else {
		/* Upper/lower band have distinctive standard deviation multiplier. */
		for (i = 0; i < outNBElement; i++) {
			tempReal = tempBuffer2[i];
			tempReal2 = outRealMiddleBand[i];
			outRealUpperBand[i] = tempReal2 + (tempReal * this.Settings.DeviationsUp);
			outRealLowerBand[i] = tempReal2 - (tempReal * this.Settings.DeviationsDown);
		}
	}

	return {UpperBand: outRealUpperBand, LowerBand: outRealLowerBand, MiddleBand: outRealMiddleBand};
};

TA.BBANDS.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.BBANDS._lookback = function( optInTimePeriod, optInNbDevUp, optInNbDevDn, optInMAType ) {
    if( !optInTimePeriod )
       optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if( (optInTimePeriod < 2) || (optInTimePeriod > 100000) )
       return -1;
 
    if( !optInNbDevUp )
       optInNbDevUp = this.DefaultSettings.DeviationsUp;
    else if( (optInNbDevUp < -3.000000e+37) ||  (optInNbDevUp > 3.000000e+37) )
       return -1;
 
    if( !optInNbDevDn )
       optInNbDevDn = this.DefaultSettings.DeviationsDown;
    else if( (optInNbDevDn < -3.000000e+37) ||  (optInNbDevDn > 3.000000e+37) )
       return -1;
 
    if( !optInMAType)
       optInMAType = this.DefaultSettings.MAType;
    else if( (optInMAType < 0) || (optInMAType > 8) )
       return -1;

	return TA.MA._lookback( optInTimePeriod, optInMAType );
};

TA.BBANDS.SetSettings(TA.BBANDS.DefaultSettings);
