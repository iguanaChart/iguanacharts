if (!!TA.INDICATOR_TEMPLATE)
    TA.AD = TA.INDICATOR_TEMPLATE.Create();
else
    TA.AD = {};

TA.AD.name = 'AD';
TA.AD.type = 'line';

TA.AD.DefaultSettings = {};

TA.AD.Settings = {};

TA.AD.calculate = function(startIdx, endIdx, dataShape){
	var nbBar, currentBar, outIdx;

	var high, low, close, tmp;
	var ad;
	
	var outReal = [];

	if(!startIdx)
		startIdx = 0;
	
	if(!endIdx)
		endIdx = dataShape.length - 1;

	if( startIdx < 0 )
		throw 'TA_OUT_OF_RANGE_START_INDEX';
	if( (endIdx < 0) || (endIdx < startIdx))
		throw 'TA_OUT_OF_RANGE_END_INDEX';

	if(!dataShape || !dataShape.length)
		throw 'TA_BAD_PARAM';


	if( !outReal )
		throw 'TA_BAD_PARAM';


	/* Default return values */
	nbBar = endIdx-startIdx+1;
	
	currentBar = startIdx;
	outIdx = 0;
	ad = 0.0;

	while( nbBar != 0 ) {
		high  = dataShape[currentBar][TA.HIGH];
		low   = dataShape[currentBar][TA.LOW];
		tmp   = high-low;
		close = dataShape[currentBar][TA.CLOSE];

		if( tmp > 0.0 )
			ad += (((close-low)-(high-close))/tmp)*( dataShape[currentBar][TA.VOL]);

		outReal[outIdx++] = ad;

		currentBar++;
		nbBar--;
	}

	return outReal;
};

TA.AD.getValue = function(dataShape, itemIdx) {
	var high, low, close, tmp;
	var ad = 0;
	
	high  = dataShape[itemIdx][TA.HIGH];
	low   = dataShape[itemIdx][TA.LOW];
	tmp   = high-low;
	close = dataShape[itemIdx][TA.CLOSE];

	if( tmp > 0 )
		ad += (((close-low)-(high-close))/tmp)*( dataShape[itemIdx][TA.VOL]);
	
	return ad;
};

TA.AD._lookback = function() {
	return 0;
};

TA.AD._S = function(startIdx, endIdx, dataShape) {
	var nbBar, currentBar, outIdx;
    var high, low, close, tmp;
	var ad;

	var outReal = [];
	
	if( startIdx < 0 )
		throw 'TA_OUT_OF_RANGE_START_INDEX';
	if( (endIdx < 0) || (endIdx < startIdx))
		throw 'TA_OUT_OF_RANGE_END_INDEX';

	if(!dataShape || !dataShape.length)
		throw 'TA_BAD_PARAM';


	if( !outReal )
		throw 'TA_BAD_PARAM';

    nbBar = endIdx-startIdx+1;

    currentBar = startIdx;
    outIdx = 0;
    ad = 0.0;
    while( nbBar != 0 ) {
		high  = dataShape[currentBar][TA.HIGH];
		low   = dataShape[currentBar][TA.LOW];
		tmp   = high-low;
		close = dataShape[currentBar][TA.CLOSE];

		if( tmp > 0 )
			ad += (((close-low)-(high-close))/tmp)*( dataShape[currentBar][TA.VOL]);

		outReal[outIdx++] = ad;
		currentBar++;
		nbBar--;
    }
    
	return outReal;
};
