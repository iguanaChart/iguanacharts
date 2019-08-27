/**
* @company  Tradernet
* @package  iguanaChart
*/

(function ()
{
    "use strict";

    if (typeof iChart === "undefined")
    {
        iChart = {};
    }

    iChart.Charting = {};

    iChart.Charting.indexOfFirstElementGreaterThanOrEqualTo = function (arr, val)
    {
        /// <summary>
        /// Finds the index of the first element in the specified sorted array that is greater than or equal to the specified value.
        /// </summary>
        /// <param name="arr" type="Array">Sorted array to search.</param>
        /// <param name="val">Array element to compare against.</param>

        var low = 0;
        var high = arr.length - 1;
        var i;

        if (high === -1)
        {
            return -1;
        }

        if (arr[low] >= val)
        {
            return low;
        }

        if (arr[high] < val)
        {
            return -1;
        }

        while (low <= high)
        {
            if (low === high)
            {
                return low;
            }

            if (low === high - 1)
            {
                return arr[low] < val ? high : low;
            }

            i = Math.floor((low + high) / 2);

            if (arr[i] < val)
            {
                low = i + 1;
            }
            else
            {
                high = i;
            }
        }

        return i;
    };

    iChart.Charting.indexOfLastElementLessThanOrEqualTo = function (arr, val)
    {
        /// <summary>
        /// Finds the index of the last element in the specified sorted array that is less than or equal to the specified value.
        /// </summary>
        /// <param name="arr" type="Array">Sorted array to search.</param>
        /// <param name="val">Array element to compare against.</param>

        var low = 0;
        var high = arr.length - 1;
        var i;

        if (high === -1)
        {
            return -1;
        }

        if (arr[low] > val)
        {
            return -1;
        }

        if (arr[high] <= val)
        {
            return high;
        }

        while (low <= high)
        {
            if (low === high)
            {
                return low;
            }

            if (low === high - 1)
            {
                return arr[high] <= val ? high : low;
            }

            i = Math.floor((low + high) / 2);

            if (arr[i] > val)
            {
                high = i - 1;
            }
            else
            {
                low = i;
            }
        }

        return i;
    };

    iChart.Charting.getNearestNotNullIndex = function(arr, index)
    {
        var indexL, indexR;
        indexL = indexR = index;

        while(1) {
            if($.isArray(arr[indexL])) {
                if(arr[indexL][0] != null)
                    return indexL;
            } else {
                if(arr[indexL] != null)
                    return indexL;
            }
            if($.isArray(arr[indexR])) {
                if(arr[indexR][0] != null)
                    return indexR;
            } else {
                if(arr[indexR] != null)
                    return indexR;
            }
            indexL > 0 ? indexL-- : '';
            indexR < arr.length-1 ? indexR++ : '';

            if(indexL < 0 && indexR > arr.length-1) {
                return false;
            }
        }
    }

    iChart.Charting.initCanvas = function (container, oldCanvas, newWidth, newHeight)
    {
        /// <summary>
        /// Initializes a HTML5 canvas with the specified width and height.
        /// </summary>
        /// <param name="newWidth" type="Number">Canvas width in pixels.</param>
        /// <param name="newHeight" type="Number">Canvas height in pixels.</param>

        if (!container) {
            console.log('No chart container. Abort');
            return;
        }

        var dpr = Math.max(window.devicePixelRatio || 1, 1);
        newWidth = newWidth * dpr;
        newHeight =  newHeight * dpr;

        if (oldCanvas)
        {
            if (oldCanvas.width === newWidth && oldCanvas.height === newHeight)
            {
                return oldCanvas;
            }

            if (typeof FlashCanvas === "undefined")
            {
                oldCanvas.width = newWidth;
                oldCanvas.height = newHeight;
                var ctx = oldCanvas.getContext('2d');
                ctx.scaled = 0;

                return oldCanvas;
            }

            $(oldCanvas).remove();
        }

        var newCanvas = document.createElement("canvas");
        newCanvas.style.left = 0;
        newCanvas.style.position = "absolute";
        newCanvas.style.top = 0;
        $(newCanvas).unbind("selectstart");
        $(newCanvas).attr("unselectable", "on").css("user-select", "none").on("selectstart", false);

        container.appendChild(newCanvas);
        if (typeof newCanvas.getContext === "undefined")
        {
            if (typeof FlashCanvas === "undefined")
            {
                alert("Ваш браузер не поддерживается.");
                return null;
            }

            FlashCanvas.initElement(newCanvas);
        }

        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        return newCanvas;
    };

    iChart.Charting.pointToPointDistanceSquared = function (a, b)
    {
        /// <summary>
        /// Gets the squared distance between the two specified points on a plane.
        /// </summary>
        /// <param name="a">Coordinates of the first point.</param>
        /// <param name="b">Coordinates of the second point.</param>
        /// <returns type="Number">Squared distance between the two points.</returns>

        var x = a.x - b.x;
        var y = a.y - b.y;
        return (x * x) + (y * y);
    };

    iChart.Charting.pointToSegmentDistanceSquared = function (segment, point, ignoreOutside)
    {
        /// <summary>
        /// Gets the squared distance between the specified segment and the specified point on a 2D plane.
        /// </summary>
        /// <param name="a">Coordinates of the first point.</param>
        /// <param name="b">Coordinates of the second point.</param>
        /// <param name="ignoreOutside">A value indicating whether the distance is calculated to the segment itself or the line on which it resides.</param>
        /// <returns type="Number">Squared distance between the segment and a point on a 2D plane.</returns>

        var a = ((point.x - segment[0].x) * (segment[1].x - segment[0].x)) + ((point.y - segment[0].y) * (segment[1].y - segment[0].y));
        if (a < 0)
        {
            return ignoreOutside ? Infinity : iChart.Charting.pointToPointDistanceSquared(point, segment[0]);
        }

        var b = iChart.Charting.pointToPointDistanceSquared(segment[1], segment[0]);
        var epsilon = 1e-5;
        if (a > b || b < epsilon)
        {
            return ignoreOutside ? Infinity : iChart.Charting.pointToPointDistanceSquared(point, segment[1]);
        }

        var c = a / b;
        var intersection = {
            "x": segment[0].x + (c * (segment[1].x - segment[0].x)),
            "y": segment[0].y + (c * (segment[1].y - segment[0].y))
        };

        return iChart.Charting.pointToPointDistanceSquared(point, intersection);
    };
})();