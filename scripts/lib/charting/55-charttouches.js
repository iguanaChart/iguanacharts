/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartTouches = function (chart)
    {

        this.chart = chart;
        this.$container = $(chart.container);

        var _this = this;

        //this.$container.hammer().off("pinchstart pinchmove pinchend panstart panmove panend");
        this.$container.hammer({recognizers: [[Hammer.Pan],[Hammer.Pinch, { enable: true }]]}).on("pinchstart pinchmove pinchend panstart panmove panend", function(e) {
            //console.log(e);

            if(e.gesture.pointerType !== "touch") {
                return;
            }

            var area = _this.chart.areas[0],
                offset = _this.$container.offset();

            switch (e.type) {
                case "panstart":

                    var startPointX = e.gesture.pointers[0].pageX - e.gesture.deltaX - offset.left;
                    _this.startTouchIndexes.push(area.getXIndex(startPointX));
                    _this.lastGesture = e.gesture;

                    break;
                case "panend":
                    _this.startTouchIndexes = [];
                    _this.lastGesture = null;
                    break;
                case "panmove":
                    //console.log(e);

                    var x = e.gesture.pointers[0].pageX - offset.left;

                    if (_this.chart.viewport.x.min === null)
                    {
                        _this.chart.viewport.x.min = area.viewport.x.bounded.min;
                    }
                    if (_this.chart.viewport.x.max === null)
                    {
                        _this.chart.viewport.x.max = area.viewport.x.bounded.max;
                    }
                    _this.chart.viewport.areaName = area.name;

                    var deltaX = e.gesture.deltaX - _this.lastGesture.deltaX;
                    var dX = deltaX / ( area.innerWidth / (area.viewport.x.max - area.viewport.x.min));

                    _this.chart.viewport.x.min += -dX;
                    _this.chart.viewport.x.max += -dX;

                    _this.chart._fixViewportBounds();

                    _this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
                    _this.chart.loadMissingData();


                    _this.lastGesture = e.gesture;

                    break;
                case "pinchstart":

                    _this.disabled = false;

                    $.each(e.gesture.pointers, function(i, pointer) {
                        var startPointX = pointer.pageX - offset.left;
                        _this.startTouchIndexes.push(area.getXIndex(startPointX));
                    });

                    break;
                case "pinchend":
                    _this.startTouchIndexes = [];
                    break;
                case "pinchmove":

                    if(_this.disabled) {
                        return;
                    }

                    //console.log(e);

                    var minIdx = _this.startTouchIndexes.indexOf(Math.min.apply(null, _this.startTouchIndexes));
                    var maxIdx = _this.startTouchIndexes.indexOf(Math.max.apply(null, _this.startTouchIndexes));
                    var xMin = e.gesture.pointers[minIdx].pageX - offset.left;
                    var xMax = e.gesture.pointers[maxIdx].pageX - offset.left;

                    if (_this.chart.viewport.x.min === null)
                    {
                        _this.chart.viewport.x.min = area.viewport.x.bounded.min;
                    }
                    if (_this.chart.viewport.x.max === null)
                    {
                        _this.chart.viewport.x.max = area.viewport.x.bounded.max;
                    }

                    var newViewportXmin = _this.startTouchIndexes[minIdx] - xMin * (_this.startTouchIndexes[maxIdx] - _this.startTouchIndexes[minIdx]) / (xMax - xMin);
                    var newViewportXmax = _this.startTouchIndexes[maxIdx] + (area.innerWidth - xMax) * (_this.startTouchIndexes[maxIdx] - _this.startTouchIndexes[minIdx]) / (xMax - xMin);

                    var limit = newViewportXmax - newViewportXmin;

                    if(_this.chart.chartOptions.maxZoom > 0 && limit >= _this.chart.chartOptions.maxZoom) {
                        _this.chart.viewport.x.min = newViewportXmin;
                        _this.chart.viewport.x.max = newViewportXmax;

                        _this.chart.render({ "forceRecalc": true, "resetViewport": false, "testForIntervalChange": true });
                        _this.chart.loadMissingData();
                    }

                    break;
            }

        });
    };

    iChart.Charting.ChartTouches.prototype.disabled = false;
    iChart.Charting.ChartTouches.prototype.startTouchIndexes = [];
    iChart.Charting.ChartTouches.prototype.lastGesture = null;

})();