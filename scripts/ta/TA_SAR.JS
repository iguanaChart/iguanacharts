if (!!TA.INDICATOR_TEMPLATE)
    TA.SAR = TA.INDICATOR_TEMPLATE.Create();
else
    TA.SAR = {};

TA.SAR.name = 'SAR';
TA.SAR.type = 'line';

TA.SAR.DefaultSettings = {
    "Acceleration": 0.02,
    "Maximum": 0.2
};

TA.SAR.Settings = {};

TA.SAR._lookback = function(optInAcceleration, optInMaximum) {
    if (!optInAcceleration)
        optInAcceleration = this.DefaultSettings.Acceleration;
    else if ((optInAcceleration < 0.000000e+0) || (optInAcceleration > 3.000000e+37))
        return -1;
    if (!optInMaximum)
        optInMaximum = this.DefaultSettings.Maximum;
    else if ((optInMaximum < 0.000000e+0) || (optInMaximum > 3.000000e+37))
        return -1;
    return 1;
};

TA.SAR.calculate = function(startIdx, endIdx, dataShape, settings) {
    var isLong;
    var todayIdx, outIdx;
    var newHigh, newLow, prevHigh, prevLow;
    var af, ep, sar;

    var outReal = [];
    this.SetSettings(settings);

    var ep_temp;

    if (startIdx < 0)
        throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx))
        throw 'TA_OUT_OF_RANGE_END_INDEX';
    if (!this.Settings.Acceleration)
        this.Settings.Acceleration = this.DefaultSettings.Acceleration;
    else if ((this.Settings.Acceleration < 0.000000e+0) || (this.Settings.Acceleration > 3.000000e+37))
        throw 'TA_BAD_PARAM';
    if (!this.Settings.Maximum)
        this.Settings.Maximum = this.DefaultSettings.Maximum;
    else if ((this.Settings.Maximum < 0.000000e+0) || (this.Settings.Maximum > 3.000000e+37))
        throw 'TA_BAD_PARAM';

    if (startIdx < 1)
        startIdx = 1;
    if (startIdx > endIdx) {
        return outReal;
    }

    af = this.Settings.Acceleration;
    if (af > this.Settings.Maximum) {
        af = this.Settings.Acceleration = this.Settings.Maximum;
    }

    ep_temp = TA.MINUS_DM.calculate(startIdx, startIdx, dataShape, {TimePeriod: 1});
    if (ep_temp[0] > 0) {
        isLong = 0;
    } else {
        isLong = 1;
    }

    outIdx = 0;
    todayIdx = startIdx;
    newHigh = dataShape[todayIdx - 1][TA.HIGH];
    newLow = dataShape[todayIdx - 1][TA.LOW];
    if (isLong == 1) {
        ep = dataShape[todayIdx][TA.HIGH];
        sar = newLow;
    } else {
        ep = dataShape[todayIdx][TA.LOW];
        sar = newHigh;
    }
    newLow = dataShape[todayIdx][TA.LOW];
    newHigh = dataShape[todayIdx][TA.HIGH];
    while (todayIdx <= endIdx) {
        prevLow = newLow;
        prevHigh = newHigh;
        newLow = dataShape[todayIdx][TA.LOW];
        newHigh = dataShape[todayIdx][TA.HIGH];
        todayIdx++;
        if (isLong == 1) {
            if (newLow <= sar) {
                isLong = 0;
                sar = ep;
                if (sar < prevHigh)
                    sar = prevHigh;
                if (sar < newHigh)
                    sar = newHigh;
                outReal[outIdx++] = sar;
                af = this.Settings.Acceleration;
                ep = newLow;
                sar = sar + af * (ep - sar);
                if (sar < prevHigh)
                    sar = prevHigh;
                if (sar < newHigh)
                    sar = newHigh;
            } else {
                outReal[outIdx++] = sar;
                if (newHigh > ep) {
                    ep = newHigh;
                    af += this.Settings.Acceleration;
                    if (af > this.Settings.Maximum)
                        af = this.Settings.Maximum;
                }
                sar = sar + af * (ep - sar);
                if (sar > prevLow)
                    sar = prevLow;
                if (sar > newLow)
                    sar = newLow;
            }
        } else {
            if (newHigh >= sar) {
                isLong = 1;
                sar = ep;
                if (sar > prevLow)
                    sar = prevLow;
                if (sar > newLow)
                    sar = newLow;
                outReal[outIdx++] = sar;
                af = this.Settings.Acceleration;
                ep = newHigh;
                sar = sar + af * (ep - sar);
                if (sar > prevLow)
                    sar = prevLow;
                if (sar > newLow)
                    sar = newLow;
            } else {
                outReal[outIdx++] = sar;
                if (newLow < ep) {
                    ep = newLow;
                    af += this.Settings.Acceleration;
                    if (af > this.Settings.Maximum)
                        af = this.Settings.Maximum;
                }
                sar = sar + af * (ep - sar);
                if (sar < prevHigh)
                    sar = prevHigh;
                if (sar < newHigh)
                    sar = newHigh;
            }
        }
    }
    return outReal;
};