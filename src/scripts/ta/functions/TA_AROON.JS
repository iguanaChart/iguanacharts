if (!!TA.INDICATOR_TEMPLATE)
    TA.AROON = TA.INDICATOR_TEMPLATE.Create();
else
    TA.AROON = {};

TA.AROON.name = 'AROON';
TA.AROON.type = 'line';

TA.AROON.DefaultSettings = {
	TimePeriod: 14
};

TA.AROON.Settings = {};

TA.AROON._S = function (startIdx, endIdx, dataShape, settings) {

};

TA.AROON.initChart = function (dataShape, hcOptions, ticker) {
	if (!!TA.INDICATOR_TEMPLATE)
		TA.INDICATOR_TEMPLATE.initChart.apply(this, arguments);
};

TA.AROON.SetSettings(TA.AROON.DefaultSettings);

TA.AROON.calculate = function (startIdx, endIdx, dataShape, settings) {
	var outAroonDown = [],
		outAroonUp = [],
		lowest, highest, tmp, factor,
		outIdx,
		trailingIdx, lowestIdx, highestIdx, today, i;

    this.SetSettings(settings);

	startIdx = startIdx || 0;
	endIdx = endIdx || dataShape.length - 1;

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

	/* Insert TA function code here. */

	/* This function is using a speed optimized algorithm
	 * for the min/max logic.
	 *
	 * You might want to first look at how TA_MIN/TA_MAX works
	 * and this function will become easier to understand.
	 */

	/* Move up the start index if there is not
	 * enough initial data.
	 */
	if (startIdx < this.Settings.TimePeriod)
		startIdx = this.Settings.TimePeriod;

	/* Make sure there is still something to evaluate. */
	if (startIdx > endIdx) {
		return {AroonDown: outAroonDown, AroonUp: outAroonUp};
	}

	/* Proceed with the calculation for the requested range.
	 * Note that this algorithm allows the input and
	 * output to be the same buffer.
	 */
	outIdx = 0;
	today = startIdx;
	trailingIdx = startIdx - this.Settings.TimePeriod;
	lowestIdx = -1;
	highestIdx = -1;
	lowest = 0.0;
	highest = 0.0;
	factor = 100.0 / this.Settings.TimePeriod;

	while (today <= endIdx) {
		/* Keep track of the lowestIdx */
		tmp = dataShape[today][TA.LOW];
		if (lowestIdx < trailingIdx) {
			lowestIdx = trailingIdx;
			lowest = dataShape[lowestIdx][TA.LOW];
			i = lowestIdx;
			while (++i <= today) {
				tmp = dataShape[i][TA.LOW];
				if (tmp <= lowest) {
					lowestIdx = i;
					lowest = tmp;
				}
			}
		} else if (tmp <= lowest) {
			lowestIdx = today;
			lowest = tmp;
		}

		/* Keep track of the highestIdx */
		tmp = dataShape[today][TA.HIGH];
		if (highestIdx < trailingIdx) {
			highestIdx = trailingIdx;
			highest = dataShape[highestIdx][TA.HIGH];
			i = highestIdx;
			while (++i <= today) {
				tmp = dataShape[i][TA.HIGH];
				if (tmp >= highest) {
					highestIdx = i;
					highest = tmp;
				}
			}
		} else if (tmp >= highest) {
			highestIdx = today;
			highest = tmp;
		}

		/* Note: Do not forget that input and output buffer can be the same,
		 *       so writing to the output is the last thing being done here.
		 */
		outAroonUp[outIdx] = factor * (this.Settings.TimePeriod - (today - highestIdx));
		outAroonDown[outIdx] = factor * (this.Settings.TimePeriod - (today - lowestIdx));

		outIdx++;
		trailingIdx++;
		today++;
	}

	return {AroonDown: outAroonDown, AroonUp: outAroonUp};
};

TA.AROON.getValue = function (dataShape, itemIdx, settings) {

};

TA.AROON._lookback = function (optInTimePeriod) {

	if (!optInTimePeriod)
		optInTimePeriod = this.DefaultSettings.TimePeriod;
	else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
		return -1;

	return optInTimePeriod;
};