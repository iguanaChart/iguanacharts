/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.Prediction = function (data, chart)
    {
        this.data = data;
        this.chart = chart;

        this.style = {
            patternend: {strokeStyle: "rgb(153,153,153)", lineWidth: 1, lineDash: [7,2]},
            rectangle: {
                up: {strokeStyle: "rgb(0,137,0)", lineWidth: 1, lineDash: [5,2], fillStyle: "rgba(0,137,0,.3)"},
                down: {strokeStyle: "rgb(255,2,27)", lineWidth: 1, lineDash: [5,2], fillStyle: "rgba(255,2,27,.3)"}
            },
            polygon:  {strokeStyle: "rgb(102,178,139)", strokeStyle2: "rgb(72,118,177)", lineWidth: 3, fillStyle: "rgba(82,175,201,.2)"},
            fibonacci: {
                correction:     {strokeStyle: "rgb(119,119,119)"},
                arrow:          {strokeStyle: "rgb(251,0,251)", lineWidth: 1},
                line:           {strokeStyle: "rgb(204,204,204)", lineWidth: 1}
            },
            arrow: {
                down:   {strokeStyle: "rgb(219,132,61)", lineWidth: 3},
                up:     {strokeStyle: "rgb(15,156,0)", lineWidth: 3}
            },
            line: {
                simple:     {strokeStyle: "rgb(153,153,153)"},
                resistance: {strokeStyle: "rgb(102,178,139)", lineWidth: 2},
                support:    {strokeStyle: "rgb(72,118,177)", lineWidth: 2},
                patternend: {strokeStyle: "rgb(153,153,153)", lineWidth: 1, lineDash: [7,2]}
            },
            label: {
                size: 15
            }
        };

        return this;
    };

    iChart.Charting.Prediction.prototype.draw = function ()
    {
//console.log(this.data.clickthroughurl);
        switch (this.data.patterntype)
        {
            case "ChartPattern":
                this.ChartPattern();
                break;
            case "FibonacciPattern":
                this.FibonacciPattern();
                break;
            case "KeyLevelsPattern":
                this.KeyLevelsPattern();
                break;
            default:
                return undefined;
        }
        this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": false });
    }

    iChart.Charting.Prediction.prototype.getTimeRange = function ()
    {
        switch (this.data.patterntype)
        {
            case "ChartPattern":
                var x0 = Math.min(this.data.resistancex0, this.data.supportx0);

                if(this.data.predictiontimefrom != undefined) {
                    var x1 = this.data.predictiontimeto;
                } else {
                    /*var x1 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];*/
                    var x1 = parseInt(this.data.patternendtime) + this.data.interval*60*7;
                }

                return [x0*1000, x1*1000];
            //--------------------------------------------------------------------------------------------------------------
            case "FibonacciPattern":
                var startTime = this.data.timeA;
                if(this.data.timeX > 0) {
                    startTime = Math.min(startTime, this.data.timeX);
                }

                var x0 = startTime;

                if(this.data.timeD > 0 && this.data.priceD > 0) {
                    var x1 = this.data.timeD;
                } else if (this.data.priceD > 0) {
                    var x1 = parseFloat(this.data.timeC) + parseFloat(this.data.interval) * 60 * parseInt(this.data.length);
                }

                if(this.data.target0 > 0 && this.data.target10 > 0) {
                    var endTime = parseInt(startTime) + this.data.interval * this.data.length * ((this.data.interval < 1440) ? 3 : 1);
                    x1 = endTime;
                }

                return [x0*1000, x1*1000];
            //--------------------------------------------------------------------------------------------------------------

            case "KeyLevelsPattern":
                var x0 = this.data.point1;

                /*
                if(this.data.predictionpricefrom) {
                    var predictiontimeto = parseFloat(this.data.predictiontimefrom) +  parseFloat(this.data.interval) * 60 * parseInt(this.data.predictiontimebars);
                    var x1 = this.chart.areas[0].getXValue(this.chart.areas[0].getXPositionByIndex(this.chart.areas[0].getXIndexByValue2(predictiontimeto)));

                } else {
                    var x1 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];
                }
                */
                if(this.data.predictionpricefrom) {
                    var predictiontimeto = parseFloat(this.data.predictiontimefrom) +  parseFloat(this.data.interval) * 60 * parseInt(this.data.predictiontimebars);
                    var x1 = predictiontimeto;

                } else {
                    var x1 = parseInt(this.data.patternendtime) + parseFloat(this.data.interval) * 60 * 7;
                }

                return [x0*1000, x1*1000];

            default:
                return false;
        }
    }

    /**
     *  Построение ChartPattern
     */
    iChart.Charting.Prediction.prototype.ChartPattern = function ()
    {
        var patternendtime  = this.chart.areas[0].getXPositionByValue(this.data.patternendtime);
        var resistancex0    = this.chart.areas[0].getXPositionByValue(this.data.resistancex0);
        var resistancex1    = this.chart.areas[0].getXPositionByValue(this.data.resistancex1);
        var supportx0       = this.chart.areas[0].getXPositionByValue(this.data.supportx0);
        var supportx1       = this.chart.areas[0].getXPositionByValue(this.data.supportx1);
        var resistancey0    = this.chart.areas[0].getYPosition(this.data.resistancey0);
        var resistancey1    = this.chart.areas[0].getYPosition(this.data.resistancey1);
        var supporty0       = this.chart.areas[0].getYPosition(this.data.supporty0);
        var supporty1       = this.chart.areas[0].getYPosition(this.data.supporty1);

        var shapeTimeX0     = Math.min(this.data.resistancex0, this.data.supportx0);
        var shapeTimeX1     = Math.max(this.data.resistancex1, this.data.supportx1);
        var shapeX0         = this.chart.areas[0].getXPositionByValue(shapeTimeX0);
        var shapeX1         = this.chart.areas[0].getXPositionByValue(shapeTimeX1);

/*        var ry0 = (((shapeX0-resistancex0)*(resistancey1-resistancey0))/(resistancex1-resistancex0))+parseFloat(resistancey0);
        var sy0 = (((shapeX0-supportx0)*(supporty1-supporty0))/(supportx1-supportx0))+parseFloat(supporty0);
        var ry1 = (((shapeX1-resistancex0)*(resistancey1-resistancey0))/(resistancex1-resistancex0))+parseFloat(resistancey0);
        var sy1 = (((shapeX1-supportx0)*(supporty1-supporty0))/(supportx1-supportx0))+parseFloat(supporty0);
*/
        var ry0 = (((shapeX0-resistancex0)*(resistancey1-resistancey0))/(resistancex1-resistancex0))+parseFloat(resistancey0);
        var sy0 = (((shapeX0-supportx0)*(supporty1-supporty0))/(supportx1-supportx0))+parseFloat(supporty0);
        var ry1 = (((patternendtime-resistancex0)*(resistancey1-resistancey0))/(resistancex1-resistancex0))+parseFloat(resistancey0);
        var sy1 = (((patternendtime-supportx0)*(supporty1-supporty0))/(supportx1-supportx0))+parseFloat(supporty0);

/*
        var element = this.chart.overlay.createElement("Line");
        element.points = [{'x':this.chart.areas[0].getXValue(x0)*1000, 'y':this.chart.areas[0].getYValue(ry0)},{'x':this.chart.areas[0].getXValue(patternendtime)*1000,'y':this.chart.areas[0].getYValue(ry1)}];
        element.hasSettings = true;
        element.settings = this.style.line.resistance;
        this.chart.overlay.history.push(element);

        var element = this.chart.overlay.createElement("Line");
        element.points = [{'x':this.chart.areas[0].getXValue(x0)*1000, 'y':this.chart.areas[0].getYValue(sy0)},{'x':this.chart.areas[0].getXValue(patternendtime)*1000,'y':this.chart.areas[0].getYValue(sy1)}];
        element.hasSettings = true;
        element.settings = this.style.line.support;
        this.chart.overlay.history.push(element);
*/

        var element = this.chart.overlay.createElement("Polygon");
/*        element.points = [{'x':this.chart.areas[0].getXValue(shapeX0)*1000, 'y':this.chart.areas[0].getYValue(ry0)},
                          {'x':this.chart.areas[0].getXValue(shapeX1)*1000,'y':this.chart.areas[0].getYValue(ry1)},
                          {'x':this.chart.areas[0].getXValue(shapeX1)*1000,'y':this.chart.areas[0].getYValue(sy1)},
                          {'x':this.chart.areas[0].getXValue(shapeX0)*1000, 'y':this.chart.areas[0].getYValue(sy0)}
                         ];
*/
        element.points = [{'x':this.chart.areas[0].getXValue(shapeX0)*1000, 'y':this.chart.areas[0].getYValue(ry0)},
                          {'x':this.chart.areas[0].getXValue(patternendtime)*1000,'y':this.chart.areas[0].getYValue(ry1)},
                          {'x':this.chart.areas[0].getXValue(patternendtime)*1000,'y':this.chart.areas[0].getYValue(sy1)},
                          {'x':this.chart.areas[0].getXValue(shapeX0)*1000, 'y':this.chart.areas[0].getYValue(sy0)}
                         ];
//        element.hasSettings = true;
        element.settings = this.style.polygon;
        this.chart.overlay.history.push(element);


        var element = this.chart.overlay.createElement("VerticalLine");
        element.hasSettings = true;
        element.settings = this.style.line.patternend;
        element.points = [{'x':this.chart.areas[0].getXValue(patternendtime)*1000, 'y':this.chart.areas[0].getYValue(sy0)}];
        this.chart.overlay.history.push(element);


        if(this.data.predictiontimefrom != undefined) {
//console.log(this.data.patternendtime);
//console.log(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime)));
//console.log(this.chart.areas[0].ySeries[0].points[Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))]);

//            var prx = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(shapeTimeX1)))+1];
//            var pry = this.chart.areas[0].ySeries[0].points[Math.round(this.chart.areas[0].getXIndexByValue2(shapeTimeX1))+1][3];
            var prx = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime)))-1];

            var pryIndex = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1);
            var pry = this.chart.areas[0].ySeries[0].points[pryIndex][3];
            var prx2 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];

//console.log(prx2);
            var prx2 = Math.min(prx2, parseFloat(this.data.predictiontimefrom) + Math.round((this.data.predictiontimeto - this.data.predictiontimefrom) / 2));
//console.log(parseFloat(this.data.predictiontimefrom) + Math.round((this.data.predictiontimeto - this.data.predictiontimefrom) / 2));

            var element = this.chart.overlay.createElement("Arrow");
            element.hasSettings = true;
            if(this.data.direction == 1) {
                element.points = [{'x':prx*1000,'y':pry},{'x':prx2*1000, 'y':this.data.predictionpricefrom}];
                element.settings = this.style.arrow.up;
            } else {
                element.points = [{'x':prx*1000,'y':pry},{'x':prx2*1000, 'y':this.data.predictionpriceto}];
                element.settings = this.style.arrow.down;
            }
            this.chart.overlay.history.push(element);


            var element = this.chart.overlay.createElement("Rectangle");
            element.hasSettings = true;
            if(this.data.direction == 1) {
                element.settings = this.style.rectangle.up;
            } else {
                element.settings = this.style.rectangle.down;
            }
            var predictiontimeto = this.chart.areas[0].getXValue(this.chart.areas[0].getXPositionByIndex(this.chart.areas[0].getXIndexByValue2(this.data.predictiontimeto)));
            element.points = [{'x':this.data.patternendtime*1000,'y':this.data.predictionpricefrom},{'x':predictiontimeto*1000, 'y':this.data.predictionpriceto}];
//console.log(element.points);
            this.chart.overlay.history.push(element);
        } else {
//console.log((Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1));
            var prx = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime)))-1];

            var pryIndex = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1);
            var pry = this.chart.areas[0].ySeries[0].points[pryIndex][3];
            var prx2 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];
            var prx2Pos = this.chart.areas[0].getXPositionByValue(prx2);

            var element = this.chart.overlay.createElement("Arrow");
            element.hasSettings = true;
            if(this.data.direction == 1) {
                var ry2Pos = (((prx2Pos-resistancex0)*(resistancey1-resistancey0))/(resistancex1-resistancex0))+parseFloat(resistancey0);
                element.settings = this.style.arrow.up;
            } else {
                var ry2Pos = (((prx2Pos-supportx0)*(supporty1-supporty0))/(supportx1-supportx0))+parseFloat(supporty0);
                element.settings = this.style.arrow.down;
            }
            element.points = [{'x':prx*1000,'y':pry},{'x':prx2*1000, 'y':this.chart.areas[0].getYValue(ry2Pos)}];
            this.chart.overlay.history.push(element);

        }

        this.chart.overlay.render();
        //iChart.setHashValues(this.chart.overlay.serialize());
        this.chart.overlay.syncHash();

//console.log(this.data);
    }

    /**
     * Построение FibonacciPattern
     */
    iChart.Charting.Prediction.prototype.FibonacciPattern = function ()
    {
//console.log(this.data);

        if(this.data.priceX > 0) {
            var element = this.chart.overlay.createElement("Line");
            element.hasSettings = true;
            element.settings = this.style.line.support;
            element.points = [{'x':this.data.timeX*1000, 'y':this.data.priceX},{'x':this.data.timeA*1000,'y':this.data.priceA}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.priceA > 0) {
            var element = this.chart.overlay.createElement("Line");
            element.hasSettings = true;
            element.settings = this.style.line.support;
            element.points = [{'x':this.data.timeA*1000, 'y':this.data.priceA},{'x':this.data.timeB*1000,'y':this.data.priceB}];
            this.chart.overlay.history.push(element);
        }

        var element = this.chart.overlay.createElement("Line");
        element.hasSettings = true;
        element.settings = this.style.line.support;
        element.points = [{'x':this.data.timeB*1000, 'y':this.data.priceB},{'x':this.data.timeC*1000,'y':this.data.priceC}];
        this.chart.overlay.history.push(element);


        var startTime = this.data.timeA;
        if(this.data.timeX > 0) {
            startTime = Math.min(startTime, this.data.timeX);
        }
        var startIndex = this.chart.areas[0].getXIndexByValue2(startTime);
        var endIndex = startIndex + parseInt(this.data.interval/this.chart._dataSettings.timeframe * this.data.length*1.6);

        if(this.data.timeD > 0 && this.data.priceD > 0) {
            var element = this.chart.overlay.createElement("Line");
            element.hasSettings = true;
            element.settings = this.style.line.support;
            element.points = [{'x':this.data.timeC*1000, 'y':this.data.priceC},{'x':this.data.timeD*1000,'y':this.data.priceD}];
            this.chart.overlay.history.push(element);
        } else if (this.data.priceD > 0) {
            var element = this.chart.overlay.createElement("Arrow");
            element.hasSettings = true;
            element.settings = this.style.fibonacci.arrow;
            element.points = [{'x':this.data.timeC*1000, 'y':this.data.priceC},{'x':this.chart.areas[0].xSeries[endIndex]*1000 ,'y':this.data.priceD}];
            this.chart.overlay.history.push(element);

            if(this.data.priceX > 0) {
                var element = this.chart.overlay.createElement("Line");
                element.hasSettings = true;
                element.settings = this.style.fibonacci.line;
                element.points = [{'x':this.data.timeX*1000, 'y':this.data.priceX},{'x':this.chart.areas[0].xSeries[endIndex]*1000,'y':this.data.priceD}];
                this.chart.overlay.history.push(element);
            }
        }

        if(this.data.target0 > 0 && this.data.target10 > 0) {
            var element = this.chart.overlay.createElement("FibonacciCorrection");
            element.hasSettings = true;
            element.settings = this.style.fibonacci.correction;
            element.points = [{'x':this.chart.areas[0].xSeries[endIndex]*1000, 'y':this.data.target0},{'x':this.chart.areas[0].xSeries[endIndex]*1000,'y':this.data.target10}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.target0 > 0 && this.data.target3 > 0) {
            var element = this.chart.overlay.createElement("Arrow");
            var prx2 = this.chart.areas[0].xSeries[endIndex+4];
            element.points = [{'x':this.chart.areas[0].xSeries[endIndex]*1000,'y':this.data.target0},{'x':prx2*1000, 'y':this.data.target3}];
            element.hasSettings = true;
            element.settings = this.style.fibonacci.correction;
            this.chart.overlay.history.push(element);
        }

        var element = this.chart.overlay.createElement("VerticalLine");
        element.points = [{'x':this.data.patternendtime*1000, 'y':this.data.price}];
        element.hasSettings = true;
        element.settings = this.style.line.simple;
        this.chart.overlay.history.push(element);


        if(this.data.timeX > 0) {
            var element = this.chart.overlay.createElement("Label");
            element.settings = {text: 'X', size: this.style.label.size};
            if(this.data.directionX == "down") {
                var price = this.chart.areas[0].getYPosition(this.data.priceX) + this.style.label.size;
                price = this.chart.areas[0].getYValue(price);
            } else {
                var price = this.data.priceX;
            }
            element.points = [{'x':this.data.timeX*1000, 'y':price}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.timeA > 0) {
            var element = this.chart.overlay.createElement("Label");
            element.settings = {text: 'A', size: this.style.label.size};
            if(this.data.directionA == "down") {
                var price = this.chart.areas[0].getYPosition(this.data.priceA) + this.style.label.size;
                price = this.chart.areas[0].getYValue(price);
            } else {
                var price = this.data.priceA;
            }
            element.points = [{'x':this.data.timeA*1000, 'y':price}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.timeB > 0) {
            var element = this.chart.overlay.createElement("Label");
            element.settings = {text: 'B', size: this.style.label.size};
            if(this.data.directionB == "down") {
                var price = this.chart.areas[0].getYPosition(this.data.priceB) + this.style.label.size;
                price = this.chart.areas[0].getYValue(price);
            } else {
                var price = this.data.priceB;
            }
            element.points = [{'x':this.data.timeB*1000, 'y':price}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.timeC > 0) {
            var element = this.chart.overlay.createElement("Label");
            element.settings = {text: 'C', size: this.style.label.size};
            if(this.data.directionC == "down") {
                var price = this.chart.areas[0].getYPosition(this.data.priceC) + this.style.label.size;
                price = this.chart.areas[0].getYValue(price);
            } else {
                var price = this.data.priceC;
            }
            element.points = [{'x':this.data.timeC*1000, 'y':price}];
            this.chart.overlay.history.push(element);
        }

        if(this.data.timeD > 0) {
            var element = this.chart.overlay.createElement("Label");
            element.settings = {text: 'D', size: this.style.label.size};
            if(this.data.directionD == "down") {
                var price = this.chart.areas[0].getYPosition(this.data.priceD) + this.style.label.size;
                price = this.chart.areas[0].getYValue(price);
            } else {
                var price = this.data.priceD;
            }
            element.points = [{'x':this.data.timeD*1000, 'y':price}];
            this.chart.overlay.history.push(element);
        }

        this.chart.overlay.render();
        //iChart.setHashValues(this.chart.overlay.serialize());
        this.chart.overlay.syncHash();

    }

    /**
     * Построение KeyLevelsPattern
     */
    iChart.Charting.Prediction.prototype.KeyLevelsPattern = function ()
    {
//console.log(this.data);

        var element = this.chart.overlay.createElement("HorizontalLine");
        element.points = [{'x':this.data.patternendtime*1000, 'y':this.data.price}];
        element.hasSettings = true;
        element.settings = this.style.line.simple;
        this.chart.overlay.history.push(element);

        var element = this.chart.overlay.createElement("VerticalLine");
        element.points = [{'x':this.data.patternendtime*1000, 'y':this.data.price}];
        element.hasSettings = true;
        element.settings = this.style.line.simple;
        this.chart.overlay.history.push(element);

        var element = this.chart.overlay.createElement("Line");
        element.points = [{'x':this.data.point1*1000, 'y':this.data.price},{'x':this.data.patternendtime*1000,'y':this.data.price}];
        element.hasSettings = true;
        if(this.data.pattern == "Support") {
            element.settings = this.style.line.support;
        } else {
            element.settings = this.style.line.resistance;
        }
        this.chart.overlay.history.push(element);


        if(this.data.predictionpricefrom) {
            var prx = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1)];
            var pryIndex = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1);
            var pry = this.chart.areas[0].ySeries[0].points[pryIndex][3];
            var prx2 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];

            var element = this.chart.overlay.createElement("Arrow");
            element.hasSettings = true;
            if(this.data.direction == 1) {
                var pry2 = this.data.predictionpricefrom;
                element.settings = this.style.arrow.up;
            } else {
                element.settings = this.style.arrow.down;
                var pry2 = this.data.predictionpriceto;
            }

            element.points = [{'x':prx*1000,'y':pry},{'x':prx2*1000,'y':pry2}];
            this.chart.overlay.history.push(element);


            var element = this.chart.overlay.createElement("Rectangle");
            element.hasSettings = true;
            if(this.data.direction == 1) {
                element.settings = this.style.rectangle.up;
            } else {
                element.settings = this.style.rectangle.down;
            }

            var predictiontimeto = parseFloat(this.data.predictiontimefrom) +  parseFloat(this.data.interval) * 60 * parseInt(this.data.predictiontimebars);
            predictiontimeto = this.chart.areas[0].getXValue(this.chart.areas[0].getXPositionByIndex(this.chart.areas[0].getXIndexByValue2(predictiontimeto)));
            element.points = [{'x':this.data.patternendtime*1000,'y':this.data.predictionpricefrom},{'x':predictiontimeto*1000, 'y':this.data.predictionpriceto}];
//console.log(element.points);
            this.chart.overlay.history.push(element);

        } else {
            var prx = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1)];
            var pryIndex = iChart.Charting.getNearestNotNullIndex(this.chart.areas[0].ySeries[0].points, Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))-1);
            var pry = this.chart.areas[0].ySeries[0].points[pryIndex][3];
            var prx2 = this.chart.areas[0].xSeries[(Math.round(this.chart.areas[0].getXIndexByValue2(this.data.patternendtime))+7)];

            var element = this.chart.overlay.createElement("Arrow");
            element.points = [{'x':prx*1000,'y':pry},{'x':prx2*1000,'y':this.data.price}];
            element.hasSettings = true;
            if(this.data.direction == 1) {
                element.settings = this.style.arrow.up;
            } else {
                element.settings = this.style.arrow.down;
            }
            this.chart.overlay.history.push(element);
        }


        this.chart.overlay.render();
        //iChart.setHashValues(this.chart.overlay.serialize());
        this.chart.overlay.syncHash();

    }

    iChart.Charting.Prediction.prototype.getThirdPoint = function (point1, point2, x)
    {
        var y = (((parseFloat(x)-parseFloat(point1.x))*(parseFloat(point2.y)-parseFloat(point1.y)))/(parseFloat(point2.x)-parseFloat(point1.x)))+parseFloat(point1.y);
        return {x: parseFloat(x), y: y};
    }

    iChart.Charting.Prediction.prototype.getIntersection = function (p1, p2, p3, p4)
    {
        if(((p1.y-p2.y)*(p4.x-p3.x)-(p3.y-p4.y)*(p2.x-p1.x)) != 0 && (p4.x-p3.x) != 0) {
            var x=-((p1.x*p2.y-p2.x*p1.y)*(p4.x-p3.x)-(p3.x*p4.y-p4.x*p3.y)*(p2.x-p1.x))/((p1.y-p2.y)*(p4.x-p3.x)-(p3.y-p4.y)*(p2.x-p1.x));
            var y=((p3.y-p4.y)*(-x)-(p3.x*p4.y-p4.x*p3.y))/(p4.x-p3.x);
            return {x: x, y: y};
        } else {
            return false;
        }

    }

})();
