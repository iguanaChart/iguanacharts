/**
 * Константы определения нужного индекса в массиве dataShape
 */
const TICKER = 0;
const PER = 1;
const DATE = 2;
const TIME = 3;
const OPEN = 4;
const HIGH = 5;
const LOW = 6;
const CLOSE = 7;
const VOL = 8;
const FULLDATE = 9;
const FULLTIME = 10;
const DATESTRING = 11;

function PER_TO_K(per) {
	return (2.0 / ((per + 1)));
};

/*
if(!!INDICATOR_TEMPLATE)
	var EMA = INDICATOR_TEMPLATE.Create();
else 
	EMA = {};
*/

EMA = {};

EMA.name = 'EMA';
EMA.type = 'line';

EMA.DefaultSettings = {
	TimePeriod: 30,
	CandleValueIdx: CLOSE
};

EMA.Settings = {};


EMA.SetSettings = function (settings) {
    var name;

    if (!!settings) {
        if (settings != this.DefaultSettings) {
            this.SetSettings(this.DefaultSettings);
        }

        for (name in settings) {
            this.Settings[name] = settings[name];
        }
    }

    return this;
};

EMA.calculate = function(startIdx, endIdx, dataShape, settings){
	 
	var outReal = [];
	
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
		this.Settings.TimePeriod = 30;
	else if ((this.Settings.TimePeriod < 2) || (this.Settings.TimePeriod > 100000))
		throw 'TA_BAD_PARAM';

	return this._int_ema(startIdx, endIdx, dataShape,
		this.Settings.TimePeriod,
		PER_TO_K(this.Settings.TimePeriod),
		outReal);
};

EMA._int_ema = function ( startIdx, endIdx, dataShape, optInTimePeriod, optInK_1, outReal ) {
   var tempReal, prevMA;
   var i, today, outIdx, lookbackTotal;

   /* Ususally, optInK_1 = 2 / (optInTimePeriod + 1),
    * but sometime there is exception. This
    * is why both value are parameters.
    */

   /* Identify the minimum number of price bar needed
    * to calculate at least one output.
    */
   lookbackTotal = this._lookback( optInTimePeriod );

   /* Move up the start index if there is not
    * enough initial data.
    */
   if( startIdx < lookbackTotal )
      startIdx = lookbackTotal;

   /* Make sure there is still something to evaluate. */
   if( startIdx > endIdx )
   {
      return outReal;
   }

   
  today = startIdx-lookbackTotal;
  i = optInTimePeriod;
  tempReal = 0.0;
  while( i-- > 0 )
	 tempReal += dataShape[today++][this.Settings.CandleValueIdx];

  prevMA = tempReal / optInTimePeriod;
   
   
   while( today <= startIdx )
      prevMA = ((dataShape[today++][this.Settings.CandleValueIdx]-prevMA)*optInK_1) + prevMA;

   /* Write the first value. */
   outReal[0] = prevMA;
   outIdx = 1;

   /* Calculate the remaining range. */
   while( today <= endIdx ) {
      prevMA = ((dataShape[today++][this.Settings.CandleValueIdx]-prevMA)*optInK_1) + prevMA;
      outReal[outIdx++] = prevMA;
   }

   return outReal;
};

EMA.getValue = function(dataShape, itemIdx, settings) {
	
};

EMA._lookback = function(optInTimePeriod) {
	if ( !optInTimePeriod )
		optInTimePeriod = 30;
	else if (( optInTimePeriod < 2) || ( optInTimePeriod > 100000))
		return -1;


	return optInTimePeriod - 1; // + TA_GLOBALS_UNSTABLE_PERIOD(TA_FUNC_UNST_EMA, Ema);
};

EMA._S = function(startIdx, endIdx, dataShape, settings) {
	/*var tempReal, prevMA;
	var i, today, outIdx, lookbackTotal;
	var outReal = [];

	lookbackTotal = this._lookback(this.Settings.TimePeriod);
	if (startIdx < lookbackTotal)
		startIdx = lookbackTotal;
	if (startIdx > endIdx) {
		return outReal;
	}
	

		today = startIdx - lookbackTotal;
		i = this.Settings.TimePeriod;
		tempReal = 0.0;
		while (i-- > 0)
			tempReal += dataShape[today++][this.Settings.CandleValueIdx];
		prevMA = tempReal / this.Settings.TimePeriod;

	while (today <= startIdx)
		prevMA = ((dataShape[today++][this.Settings.CandleValueIdx] - prevMA) * optInK_1) + prevMA;
	outReal[0] = prevMA;
	outIdx = 1;
	while (today <= endIdx) {
		prevMA = ((inReal[today++] - prevMA) * optInK_1) + prevMA;
		outReal[outIdx++] = prevMA;
	}
	
	return outReal;*/
};

EMA.initChart = function (dataShape, hcOptions, ticker) {
	//INDICATOR_TEMPLATE.initChart.apply(this, arguments);
	
	
};

EMA.SetSettings(EMA.DefaultSettings);

/*if(!!MainController) {
	MainController.AvailableIndicators.push({name: EMA.name, indicator: EMA});
	MainController.GraphicIndicators.push( EMA.Create() );
}*/