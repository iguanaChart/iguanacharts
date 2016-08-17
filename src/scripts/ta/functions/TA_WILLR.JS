if (!!TA.INDICATOR_TEMPLATE)
    TA.WILLR = TA.INDICATOR_TEMPLATE.Create();
else
    TA.WILLR = {};

TA.WILLR.name = 'WILLR';
TA.WILLR.type = 'line';

TA.WILLR.DefaultSettings = {
    TimePeriod: 14
};

TA.WILLR.Settings = {};

TA.WILLR._lookback = function(optInTimePeriod) {
    if (!optInTimePeriod)
        optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000))
        return -1;
    return (optInTimePeriod - 1);
};

TA.WILLR.calculate = function(startIdx, endIdx, dataShape, settings) {
    var lowest, highest, tmp, diff;
    var outIdx, nbInitialElementNeeded;
    var trailingIdx, lowestIdx, highestIdx;
    var today, i;
    var outReal = [];

    this.SetSettings(settings);

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!this.Settings.TimePeriod)
        this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
        throw 'TA_BAD_PARAM';


    nbInitialElementNeeded = (this.Settings.TimePeriod - 1);
    if (startIdx < nbInitialElementNeeded) {
        startIdx = nbInitialElementNeeded;
    }
    if (startIdx > endIdx) {
        return outReal;
    }

    diff = 0.0;
    outIdx = 0;
    today = startIdx;
    trailingIdx = startIdx - nbInitialElementNeeded;
    lowestIdx = highestIdx = -1;
    diff = highest = lowest = 0.0;
    while (today <= endIdx) {
        tmp = dataShape[today][TA.LOW];
        if (lowestIdx < trailingIdx) {
            lowestIdx = trailingIdx;
            lowest = dataShape[lowestIdx][TA.LOW];
            i = lowestIdx;
            while (++i <= today) {
                tmp = dataShape[i][TA.LOW];
                if (tmp < lowest) {
                    lowestIdx = i;
                    lowest = tmp;
                }
            }
            diff = (highest - lowest) / (-100.0);
        } else if (tmp <= lowest) {
            lowestIdx = today;
            lowest = tmp;
            diff = (highest - lowest) / (-100.0);
        }
        tmp = dataShape[today][TA.HIGH];
        if (highestIdx < trailingIdx) {
            highestIdx = trailingIdx;
            highest = dataShape[highestIdx][TA.HIGH];
            i = highestIdx;
            while (++i <= today) {
                tmp = dataShape[i][TA.HIGH];
                if (tmp > highest) {
                    highestIdx = i;
                    highest = tmp;
                }
            }
            diff = (highest - lowest) / (-100.0);
        } else if (tmp >= highest) {
            highestIdx = today;
            highest = tmp;
            diff = (highest - lowest) / (-100.0);
        }
        if (diff != 0.0) {
            outReal[outIdx++] = (highest - dataShape[today][TA.CLOSE]) / diff;
        } else {
            outReal[outIdx++] = 0.0;
        }
        trailingIdx++;
        today++;
    }
    return outReal;
};