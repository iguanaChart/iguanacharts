if (!!TA.INDICATOR_TEMPLATE)
    TA.MFI = TA.INDICATOR_TEMPLATE.Create();
else
    TA.MFI = {};

TA.MFI.name = 'MFI';
TA.MFI.type = 'line';

TA.MFI.DefaultSettings = {
    TimePeriod: 14
};

TA.MFI.Settings = {};

TA.MFI._lookback = function (optInTimePeriod) {
    if (!optInTimePeriod) optInTimePeriod = this.DefaultSettings.TimePeriod;
    else if ((optInTimePeriod < 2) || (optInTimePeriod > 100000)) return -1;
    return optInTimePeriod;
};

TA.MFI.calculate = function (startIdx, endIdx, dataShape, settings) {
    var posSumMF, negSumMF, prevValue;
    var tempValue1, tempValue2;
    var lookbackTotal, outIdx, i, today;
    var outReal = [];

    this.SetSettings(settings);

    var mflow_Idx = 0;
    var mflow = [];
    var maxIdx_mflow = 49;

    if (startIdx < 0) throw 'TA_OUT_OF_RANGE_START_INDEX';
    if ((endIdx < 0) || (endIdx < startIdx)) throw 'TA_OUT_OF_RANGE_END_INDEX';

    if (!this.Settings.TimePeriod) this.Settings.TimePeriod = this.DefaultSettings.TimePeriod;
    else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000)) throw 'TA_BAD_PARAM';

    if(this.Settings.TimePeriod <= 0) {
        return outReal;
    }

    mflow = new Array(this.Settings.TimePeriod);

    for (var i=0; i<mflow.length; i++) {
        mflow[i] = {};
    }

    if(!mflow) {
        return outReal;
    }

    maxIdx_mflow = mflow.length - 1;

    lookbackTotal = this.Settings.TimePeriod;
    if (startIdx < lookbackTotal) startIdx = lookbackTotal;
    if (startIdx > endIdx) {
        return outReal;
    }

    outIdx = 0;
    today = startIdx - lookbackTotal;
    prevValue = (dataShape[today][TA.HIGH] + dataShape[today][TA.LOW] + dataShape[today][TA.CLOSE]) / 3.0;
    posSumMF = 0.0;
    negSumMF = 0.0;
    today++;
    for (i = this.Settings.TimePeriod; i > 0; i--) {
        tempValue1 = (dataShape[today][TA.HIGH] + dataShape[today][TA.LOW] + dataShape[today][TA.CLOSE]) / 3.0;
        tempValue2 = tempValue1 - prevValue;
        prevValue = tempValue1;
        tempValue1 *= dataShape[today++][TA.VOL];
        if (tempValue2 < 0) {
            mflow[mflow_Idx].negative = tempValue1;
            negSumMF += tempValue1;
            mflow[mflow_Idx].positive = 0.0;
        } else if (tempValue2 > 0) {
            mflow[mflow_Idx].positive = tempValue1;
            posSumMF += tempValue1;
            mflow[mflow_Idx].negative = 0.0;
        } else {
            mflow[mflow_Idx].positive = 0.0;
            mflow[mflow_Idx].negative = 0.0;
        }

        mflow_Idx++;
        if(mflow_Idx > maxIdx_mflow) {
            mflow_Idx = 0;
        }
    }

    if (today > startIdx) {
        tempValue1 = posSumMF + negSumMF;
        if (tempValue1 < 1.0) outReal[outIdx++] = 0.0;
        else outReal[outIdx++] = 100.0 * (posSumMF / tempValue1);
    } else {
        while (today < startIdx) {
            posSumMF -= mflow[mflow_Idx].positive;
            negSumMF -= mflow[mflow_Idx].negative;
            tempValue1 = (dataShape[today][TA.HIGH] + dataShape[today][TA.LOW] + dataShape[today][TA.CLOSE]) / 3.0;
            tempValue2 = tempValue1 - prevValue;
            prevValue = tempValue1;
            tempValue1 *= dataShape[today++][TA.VOL];
            if (tempValue2 < 0) {
                mflow[mflow_Idx].negative = tempValue1;
                negSumMF += tempValue1;
                mflow[mflow_Idx].positive = 0.0;
            } else if (tempValue2 > 0) {
                mflow[mflow_Idx].positive = tempValue1;
                posSumMF += tempValue1;
                mflow[mflow_Idx].negative = 0.0;
            } else {
                mflow[mflow_Idx].positive = 0.0;
                mflow[mflow_Idx].negative = 0.0;
            }
            mflow_Idx++;
            if(mflow_Idx > maxIdx_mflow) {
                mflow_Idx = 0;
            }
        }
    }

    while (today <= endIdx) {
        posSumMF -= mflow[mflow_Idx].positive;
        negSumMF -= mflow[mflow_Idx].negative;
        tempValue1 = (dataShape[today][TA.HIGH] + dataShape[today][TA.LOW] + dataShape[today][TA.CLOSE]) / 3.0;
        tempValue2 = tempValue1 - prevValue;
        prevValue = tempValue1;
        tempValue1 *= dataShape[today++][TA.VOL];
        if (tempValue2 < 0) {
            mflow[mflow_Idx].negative = tempValue1;
            negSumMF += tempValue1;
            mflow[mflow_Idx].positive = 0.0;
        } else if (tempValue2 > 0) {
            mflow[mflow_Idx].positive = tempValue1;
            posSumMF += tempValue1;
            mflow[mflow_Idx].negative = 0.0;
        } else {
            mflow[mflow_Idx].positive = 0.0;
            mflow[mflow_Idx].negative = 0.0;
        }
        tempValue1 = posSumMF + negSumMF;
        if (tempValue1 < 1.0) {
            outReal[outIdx++] = 0.0;
        } else {
            outReal[outIdx++] = 100.0 * (posSumMF / tempValue1);
        }
        mflow_Idx++;
        if(mflow_Idx > maxIdx_mflow) {
            mflow_Idx = 0;
        }
    }
    return outReal;
};
