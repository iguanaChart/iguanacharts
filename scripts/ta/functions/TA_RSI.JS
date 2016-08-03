if (!!TA.INDICATOR_TEMPLATE)
    TA.RSI = TA.INDICATOR_TEMPLATE.Create();
else
    TA.RSI = {};

TA.RSI.name = 'RSI';
TA.RSI.type = 'line';

TA.RSI.DefaultSettings = {
	TimePeriod: 14,
    CandleValueIdx: TA.CLOSE
};

TA.RSI.Settings = {};


TA.RSI.calculate = function (startIdx, endIdx, dataShape, settings) {

    this.SetSettings(settings);

	var outIdx;

	var today, lookbackTotal, unstablePeriod, i;
	var prevGain, prevLoss, prevValue, savePrevValue;
	var tempValue1, tempValue2;

	var outReal = [];

	if (!startIdx)
		startIdx = 0;

	if (!endIdx)
		endIdx = dataShape.length - 1;

	if (startIdx < 0)
		throw 'TA_OUT_OF_RANGE_START_INDEX';
	if ((endIdx < 0) || (endIdx < startIdx))
		throw 'TA_OUT_OF_RANGE_END_INDEX';

	if (!dataShape || !dataShape.length) throw 'TA_BAD_PARAM';

	if (!this.Settings.TimePeriod)
		this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
	else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';

	/* Insert TA function code here. */

	/* The following algorithm is base on the original 
	 * work from Wilder's and shall represent the
	 * original idea behind the classic RSI.
	 *
	 * Metastock is starting the calculation one price
	 * bar earlier. To make this possible, they assume
	 * that the very first bar will be identical to the
	 * previous one (no gain or loss).
	 */

	/* If changing this function, please check also CMO 
	 * which is mostly identical (just different in one step
	 * of calculation).
	 */

	/* Adjust startIdx to account for the lookback period. */
	lookbackTotal = this._lookback(this.Settings.TimePeriod);

	if (startIdx < lookbackTotal)
		startIdx = lookbackTotal;

	/* Make sure there is still something to evaluate. */
	if (startIdx > endIdx)
		return outReal;

	outIdx = 0; /* Index into the output. */

	/* Trap special case where the period is '1'.
	 * In that case, just copy the input into the
	 * output for the requested range (as-is !)
	 */
	if (this.Settings.TimePeriod == 1) {

		outReal = dataShape.slice(startIdx);
		
		return outReal;
	}

	/* Accumulate Wilder's "Average Gain" and "Average Loss" 
	 * among the initial period.
	 */
	today = startIdx - lookbackTotal;
	prevValue = dataShape[today][this.Settings.CandleValueIdx];

	unstablePeriod = 0; //TA_GLOBALS_UNSTABLE_PERIOD(TA_FUNC_UNST_RSI, Rsi);

	
//	/* If there is no unstable period,
//	 * calculate the 'additional' initial
//	 * price bar who is particuliar to
//	 * metastock.
//	 * If there is an unstable period,
//	 * no need to calculate since this
//	 * first value will be surely skip.
//	 */
//	if ((unstablePeriod == 0) &&
//		(TA_GLOBALS_COMPATIBILITY == ENUM_VALUE(Compatibility, TA_COMPATIBILITY_METASTOCK, Metastock))) {
//		/* Preserve prevValue because it may get 
//		 * overwritten by the output.
//		 *(because output ptr could be the same as input ptr).
//		 */
//		savePrevValue = prevValue;
//
//		/* No unstable period, so must calculate first output
//		 * particular to Metastock.
//		 * (Metastock re-use the first price bar, so there
//		 *  is no loss/gain at first. Beats me why they
//		 *  are doing all this).
//		 */
//		prevGain = 0.0;
//		prevLoss = 0.0;
//		for (i = optInTimePeriod; i > 0; i--) {
//			tempValue1 = inReal[today++];
//			tempValue2 = tempValue1 - prevValue;
//			prevValue = tempValue1;
//			if (tempValue2 < 0)
//				prevLoss -= tempValue2;
//			else
//				prevGain += tempValue2;
//		}
//
//
//		tempValue1 = prevLoss / optInTimePeriod;
//		tempValue2 = prevGain / optInTimePeriod;
//
//		/* Write the output. */
//		tempValue1 = tempValue2 + tempValue1;
//		if (!TA_IS_ZERO(tempValue1))
//			outReal[outIdx++] = 100 * (tempValue2 / tempValue1);
//		else
//			outReal[outIdx++] = 0.0;
//
//		/* Are we done? */
//		if (today > endIdx) {
//			VALUE_HANDLE_DEREF(outBegIdx) = startIdx;
//			VALUE_HANDLE_DEREF(outNBElement) = outIdx;
//			return ENUM_VALUE(RetCode, TA_SUCCESS, Success);
//		}
//
//		/* Start over for the next price bar. */
//		today -= optInTimePeriod;
//		prevValue = savePrevValue;
//	}


	/* Remaining of the processing is identical
	 * for both Classic calculation and Metastock.
	 */
	prevGain = 0.0;
	prevLoss = 0.0;
	today++;
	for (i = this.Settings.TimePeriod; i > 0; i--) {
		tempValue1 = dataShape[today++][this.Settings.CandleValueIdx];
		tempValue2 = tempValue1 - prevValue;
		prevValue = tempValue1;
        if (tempValue2 < 0)
			prevLoss -= tempValue2;
		else
			prevGain += tempValue2;
	}


	/* Subsequent prevLoss and prevGain are smoothed
	 * using the previous values (Wilder's approach).
	 *  1) Multiply the previous by 'period-1'.
	 *  2) Add today value.
	 *  3) Divide by 'period'.
	 */
	prevLoss /= this.Settings.TimePeriod;
	prevGain /= this.Settings.TimePeriod;

	/* Often documentation present the RSI calculation as follow:
	 *    RSI = 100 - (100 / 1 + (prevGain/prevLoss))
	 *
	 * The following is equivalent:
	 *    RSI = 100 * (prevGain/(prevGain+prevLoss))
	 *
	 * The second equation is used here for speed optimization.
	 */

	if (today > startIdx) {
		tempValue1 = prevGain + prevLoss;
		if (!TA.TA_IS_ZERO(tempValue1))
			outReal[outIdx++] = 100.0 * (prevGain / tempValue1);
		else
			outReal[outIdx++] = 0.0;
	} else {
		/* Skip the unstable period. Do the processing 
		 * but do not write it in the output.
		 */
		while (today < startIdx) {
			tempValue1 = dataShape[today][this.Settings.CandleValueIdx];
			tempValue2 = tempValue1 - prevValue;
			prevValue = tempValue1;

			prevLoss *= (this.Settings.TimePeriod - 1);
			prevGain *= (this.Settings.TimePeriod - 1);
			if (tempValue2 < 0)
				prevLoss -= tempValue2;
			else
				prevGain += tempValue2;

			prevLoss /= this.Settings.TimePeriod;
			prevGain /= this.Settings.TimePeriod;

			today++;
		}
	}

	/* Unstable period skipped... now continue
	 * processing if needed.
	 */
	while (today <= endIdx) {
		tempValue1 = dataShape[today++][this.Settings.CandleValueIdx];
		tempValue2 = tempValue1 - prevValue;
		prevValue = tempValue1;

		prevLoss *= (this.Settings.TimePeriod - 1);
		prevGain *= (this.Settings.TimePeriod - 1);
		if (tempValue2 < 0)
			prevLoss -= tempValue2;
		else
			prevGain += tempValue2;

		prevLoss /= this.Settings.TimePeriod;
		prevGain /= this.Settings.TimePeriod;
		tempValue1 = prevGain + prevLoss;
		if (!TA.TA_IS_ZERO(tempValue1))
			outReal[outIdx++] = 100.0 * (prevGain / tempValue1);
		else
			outReal[outIdx++] = 0.0;
	}

	return outReal;

};

TA.RSI.getValue = function (dataShape, itemIdx, settings) {

};

TA.RSI._lookback = function (optInTimePeriod) {
	if (!optInTimePeriod)
		optInTimePeriod = this.Settings.TimePeriod || this.DefaultSettings.TimePeriod;
	else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
		return -1;

	return optInTimePeriod;
};

TA.RSI._S = function (startIdx, endIdx, dataShape, settings) {

};

TA.RSI.initChart = function (dataShape, hcOptions, ticker) {
	if (!!TA.INDICATOR_TEMPLATE)
		TA.INDICATOR_TEMPLATE.initChart.apply(this, arguments);
};

TA.RSI.SetSettings(TA.RSI.DefaultSettings);
