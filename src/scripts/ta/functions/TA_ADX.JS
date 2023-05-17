if (!!TA.INDICATOR_TEMPLATE)
    TA.ADX = TA.INDICATOR_TEMPLATE.Create();
else
    TA.ADX = {};

TA.ADX.name = 'ADX';
TA.ADX.type = 'line';

TA.ADX.DefaultSettings = {
	TimePeriod: 14
};

TA.ADX.Settings = {};

TA.ADX.calculate = function (startIdx, endIdx, dataShape, settings, dontFillTotalArray) {
	/* insert local variable here */
	var today, lookbackTotal, outIdx;
	var prevHigh, prevLow, prevClose;
	var prevMinusDM, prevPlusDM, prevTR;
	var tempReal, tempReal2, diffP, diffM;
	var minusDI, plusDI, sumDX, prevADX;

	var i;

	var outReal = [];

    this.SetSettings(settings);

	function TRUE_RANGE(TH, TL, YC, OUT) {
		return '\
      ' + OUT + ' = ' + TH + '-' + TL + '; \
      tempReal2 = Math.abs(' + TH + '-' + YC + '); \
      if( tempReal2 > ' + OUT + ' ) \
         ' + OUT + ' = tempReal2; \
      tempReal2 = Math.abs(' + TL + '-' + YC + '); \
      if( tempReal2 > ' + OUT + ' ) \
         ' + OUT + ' = tempReal2;';
	}

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
		this.Settings.TimePeriod = 14;
	else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';


	/**** END GENCODE SECTION 4 - DO NOT DELETE THIS LINE ****/

	/* Insert TA function code here. */

	/* 
	 * The DM1 (one period) is base on the largest part of
	 * today's range that is outside of yesterdays range.
	 *
	 * The following 7 cases explain how the +DM and -DM are
	 * calculated on one period:
	 *
	 * Case 1:                       Case 2:
	 *    C|                        A|
	 *     |                         | C|
	 *     | +DM1 = (C-A)           B|  | +DM1 = 0
	 *     | -DM1 = 0                   | -DM1 = (B-D)
	 * A|  |                           D|
	 *  | D|
	 * B|
	 *
	 * Case 3:                       Case 4:
	 *    C|                           C|
	 *     |                        A|  |
	 *     | +DM1 = (C-A)            |  | +DM1 = 0
	 *     | -DM1 = 0               B|  | -DM1 = (B-D)
	 * A|  |                            |
	 *  |  |                           D|
	 * B|  |
	 *    D|
	 *
	 * Case 5:                      Case 6:
	 * A|                           A| C|
	 *  | C| +DM1 = 0                |  |  +DM1 = 0
	 *  |  | -DM1 = 0                |  |  -DM1 = 0
	 *  | D|                         |  |
	 * B|                           B| D|
	 *
	 *
	 * Case 7:
	 *
	 *    C|
	 * A|  |
	 *  |  | +DM=0
	 * B|  | -DM=0
	 *    D|
	 *
	 * In case 3 and 4, the rule is that the smallest delta between
	 * (C-A) and (B-D) determine which of +DM or -DM is zero.
	 *
	 * In case 7, (C-A) and (B-D) are equal, so both +DM and -DM are
	 * zero.
	 *
	 * The rules remain the same when A=B and C=D (when the highs
	 * equal the lows).
	 *
	 * When calculating the DM over a period > 1, the one-period DM
	 * for the desired period are initialy sum. In other word,
	 * for a -DM14, sum the -DM1 for the first 14 days (that's
	 * 13 values because there is no DM for the first day!)
	 * Subsequent DM are calculated using the Wilder's
	 * smoothing approach:
	 *
	 *                                    Previous -DM14
	 *  Today's -DM14 = Previous -DM14 -  -------------- + Today's -DM1
	 *                                         14
	 *
	 * (Same thing for +DM14)
	 *
	 * Calculation of a -DI14 is as follow:
	 *
	 *               -DM14
	 *     -DI14 =  --------
	 *                TR14
	 *
	 * (Same thing for +DI14)
	 *
	 * Calculation of the TR14 is:
	 *
	 *                                   Previous TR14
	 *    Today's TR14 = Previous TR14 - -------------- + Today's TR1
	 *                                         14
	 *
	 *    The first TR14 is the summation of the first 14 TR1. See the
	 *    TA_TRANGE function on how to calculate the true range.
	 *
	 * Calculation of the DX14 is:
	 *
	 *    diffDI = ABS( (-DI14) - (+DI14) )
	 *    sumDI  = (-DI14) + (+DI14)
	 *
	 *    DX14 = 100 * (diffDI / sumDI)
	 *
	 * Calculation of the first ADX:
	 *
	 *    ADX14 = SUM of the first 14 DX
	 *
	 * Calculation of subsequent ADX:
	 *
	 *            ((Previous ADX14)*(14-1))+ Today's DX
	 *    ADX14 = -------------------------------------
	 *                             14
	 *
	 * Reference:
	 *    New Concepts In Technical Trading Systems, J. Welles Wilder Jr
	 */

	/* Original implementation from Wilder's book was doing some integer
	 * rounding in its calculations.
	 *
	 * This was understandable in the context that at the time the book
	 * was written, most user were doing the calculation by hand.
	 *
	 * For a computer, rounding is unnecessary (and even problematic when inputs
	 * are close to 1).
	 *
	 * TA-Lib does not do the rounding. Still, if you want to reproduce Wilder's examples,
	 * you can comment out the following #undef/#define and rebuild the library.
	 */

	function round_pos(x) {
		return x;
	};

	lookbackTotal = (2 * this.Settings.TimePeriod) /*+ TA_GLOBALS_UNSTABLE_PERIOD(TA_FUNC_UNST_ADX, Adx)*/ - 1;

	/* Adjust startIdx to account for the lookback period. */
	if (startIdx < lookbackTotal)
		startIdx = lookbackTotal;

	/* Make sure there is still something to evaluate. */
	if (startIdx > endIdx) {
		return outReal;
	}

	/* Indicate where the next output should be put
	 * in the outReal.
	 */
	outIdx = 0;

	/* Process the initial DM and TR */

	prevMinusDM = 0.0;
	prevPlusDM = 0.0;
	prevTR = 0.0;
	today = startIdx - lookbackTotal;
	prevHigh = dataShape[today][TA.HIGH];
	prevLow = dataShape[today][TA.LOW];
	prevClose = dataShape[today][TA.CLOSE];
	i = this.Settings.TimePeriod - 1;
	while (i-- > 0) {
		/* Calculate the prevMinusDM and prevPlusDM */
		today++;
		tempReal = dataShape[today][TA.HIGH];
		diffP = tempReal - prevHigh; /* Plus Delta */
		prevHigh = tempReal;

		tempReal = dataShape[today][TA.LOW];
		diffM = prevLow - tempReal; /* Minus Delta */
		prevLow = tempReal;

		if ((diffM > 0) && (diffP < diffM)) {
			/* Case 2 and 4: +DM=0,-DM=diffM */
			prevMinusDM += diffM;
		} else if ((diffP > 0) && (diffP > diffM)) {
			/* Case 1 and 3: +DM=diffP,-DM=0 */
			prevPlusDM += diffP;
		}

		eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
		prevTR += tempReal;
		prevClose = dataShape[today][TA.CLOSE];
	}

	/* Add up all the initial DX. */
	sumDX = 0.0;
	i = this.Settings.TimePeriod;
	while (i-- > 0) {
		/* Calculate the prevMinusDM and prevPlusDM */
		today++;
		tempReal = dataShape[today][TA.HIGH];
		diffP = tempReal - prevHigh; /* Plus Delta */
		prevHigh = tempReal;

		tempReal = dataShape[today][TA.LOW];
		diffM = prevLow - tempReal; /* Minus Delta */
		prevLow = tempReal;

		prevMinusDM -= prevMinusDM / this.Settings.TimePeriod;
		prevPlusDM -= prevPlusDM / this.Settings.TimePeriod;

		if ((diffM > 0) && (diffP < diffM)) {
			/* Case 2 and 4: +DM=0,-DM=diffM */
			prevMinusDM += diffM;
		} else if ((diffP > 0) && (diffP > diffM)) {
			/* Case 1 and 3: +DM=diffP,-DM=0 */
			prevPlusDM += diffP;
		}

		/* Calculate the prevTR */
		eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
		prevTR = prevTR - (prevTR / this.Settings.TimePeriod) + tempReal;
		prevClose = dataShape[today][TA.CLOSE];

		/* Calculate the DX. The value is rounded (see Wilder book). */
		if (!TA.TA_IS_ZERO(prevTR)) {
			minusDI = round_pos(100.0 * (prevMinusDM / prevTR));
			plusDI = round_pos(100.0 * (prevPlusDM / prevTR));
			/* This loop is just to accumulate the initial DX */
			tempReal = minusDI + plusDI;
			if (!TA.TA_IS_ZERO(tempReal))
				sumDX += round_pos(100.0 * (Math.abs(minusDI - plusDI) / tempReal));
		}
	}

	/* Calculate the first ADX */
	prevADX = round_pos(sumDX / this.Settings.TimePeriod);

	/* Skip the unstable period */
	i = TA.TA_GLOBALS_UNSTABLE_PERIOD(TA.TA_FUNC_UNST_ADX);
	while (i-- > 0) {
		/* Calculate the prevMinusDM and prevPlusDM */
		today++;
		tempReal = dataShape[today][TA.HIGH];
		diffP = tempReal - prevHigh; /* Plus Delta */
		prevHigh = tempReal;

		tempReal = dataShape[today][TA.LOW];
		diffM = prevLow - tempReal; /* Minus Delta */
		prevLow = tempReal;

		prevMinusDM -= prevMinusDM / this.Settings.TimePeriod;
		prevPlusDM -= prevPlusDM / this.Settings.TimePeriod;

		if ((diffM > 0) && (diffP < diffM)) {
			/* Case 2 and 4: +DM=0,-DM=diffM */
			prevMinusDM += diffM;
		} else if ((diffP > 0) && (diffP > diffM)) {
			/* Case 1 and 3: +DM=diffP,-DM=0 */
			prevPlusDM += diffP;
		}

		/* Calculate the prevTR */
		eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
		prevTR = prevTR - (prevTR / this.Settings.TimePeriod) + tempReal;
		prevClose = dataShape[today][TA.CLOSE];

		if (!TA.TA_IS_ZERO(prevTR)) {
			/* Calculate the DX. The value is rounded (see Wilder book). */
			minusDI = round_pos(100.0 * (prevMinusDM / prevTR));
			plusDI = round_pos(100.0 * (prevPlusDM / prevTR));
			tempReal = minusDI + plusDI;
			if (!TA.TA_IS_ZERO(tempReal)) {
				tempReal = round_pos(100.0 * (Math.abs(minusDI - plusDI) / tempReal));
				/* Calculate the ADX */
				prevADX = round_pos(((prevADX * (this.Settings.TimePeriod - 1)) + tempReal) / this.Settings.TimePeriod);
			}
		}
	}

	/* Output the first ADX */
	outReal[0] = prevADX;
	outIdx = 1;

	/* Calculate and output subsequent ADX */
	while (today < endIdx) {
		/* Calculate the prevMinusDM and prevPlusDM */
		today++;
		tempReal = dataShape[today][TA.HIGH];
		diffP = tempReal - prevHigh; /* Plus Delta */
		prevHigh = tempReal;

		tempReal = dataShape[today][TA.LOW];
		diffM = prevLow - tempReal; /* Minus Delta */
		prevLow = tempReal;

		prevMinusDM -= prevMinusDM / this.Settings.TimePeriod;
		prevPlusDM -= prevPlusDM / this.Settings.TimePeriod;

		if ((diffM > 0) && (diffP < diffM)) {
			/* Case 2 and 4: +DM=0,-DM=diffM */
			prevMinusDM += diffM;
		} else if ((diffP > 0) && (diffP > diffM)) {
			/* Case 1 and 3: +DM=diffP,-DM=0 */
			prevPlusDM += diffP;
		}

		/* Calculate the prevTR */
		eval(TRUE_RANGE('prevHigh', 'prevLow', 'prevClose', 'tempReal'));
		prevTR = prevTR - (prevTR / this.Settings.TimePeriod) + tempReal;
		prevClose = dataShape[today][TA.CLOSE];

		if (!TA.TA_IS_ZERO(prevTR)) {
			/* Calculate the DX. The value is rounded (see Wilder book). */
			minusDI = round_pos(100.0 * (prevMinusDM / prevTR));
			plusDI = round_pos(100.0 * (prevPlusDM / prevTR));
			tempReal = minusDI + plusDI;
			if (!TA.TA_IS_ZERO(tempReal)) {
				tempReal = round_pos(100.0 * (Math.abs(minusDI - plusDI) / tempReal));
				/* Calculate the ADX */
				prevADX = round_pos(((prevADX * (this.Settings.TimePeriod - 1)) + tempReal) / this.Settings.TimePeriod);
			}
		}

		/* Output the ADX */
		outReal[outIdx++] = prevADX;
	}

	//Приведение возврщаемого массива к общей длине
	if(!dontFillTotalArray) {
		if(outReal.length >= dataShape.length)
			throw 'Ошибка расчета ADX';
		else if(outReal.length <= dataShape.length)
			while(outReal.length != dataShape.length){
				outReal.unshift(0);
			}
	}
	
	return outReal;
};

TA.ADX.getValue = function(dataShape, itemIdx, settings) {
	
};

TA.ADX._lookback = function() {
	return (2 * this.Settings.TimePeriod) /*+ TA_GLOBALS_UNSTABLE_PERIOD(TA_FUNC_UNST_ADX,Adx)*/ - 1;
};

TA.ADX._S = function(startIdx, endIdx, dataShape, settings){
	
};

TA.ADX.initChart = function (dataShape, hcOptions, ticker) {
	TA.INDICATOR_TEMPLATE.initChart.apply(this, arguments);
};

TA.ADX.SetSettings(TA.ADX.DefaultSettings);
