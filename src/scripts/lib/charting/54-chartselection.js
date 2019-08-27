/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartSelection = function (container)
    {
        /// <summary>
        /// Initializes a new instance of the iChart.Charting.ChartSelection class.
        /// </summary>
        /// <param name="container">Selection container.</param>
        /// <field name="$container" type="jQuery">jQuery chart container object.</field>
        /// <field name="$selection" type="jQuery">jQuery selection object.</field>

        this.$container = $(container);
        this.$selection = $("<div/>", { "class": "m-chart-selection" }).appendTo(this.$container);

        //$(document).bind('mousedown mouseup', function(e) {console.log(e.type, e)});
        //this.$container.bind('movestart move moveend', function(e) {console.log(e.type, e)});

        //this.$container.on('moveend', this, function(e) {
        this.$container.off('mouseup.selection').off('mousedown.selection').off('mousemove.selection');
        $(this.$container).on('mouseup.selection', this, function(e) {

            if (e.data.disabled)
            {
                return;
            }
            if (!e.data.selection)
            {
                return;
            }

            e.data.selection = false;
            e.data.$selection.hide();

            e.data.recalculateContainerPosition();
            e.data.x2 = e.pageX - e.data.containerOffset.left;
            e.data.y2 = e.pageY - e.data.containerOffset.top;

            if (e.data.x2 >= 0 && e.data.x2 <= e.data.containerWidth && e.data.y2 >= 0 && e.data.y2 <= e.data.containerHeight)
            {
                if (e.data.moveend)
                {
                    e.data.moveend(e.data);
                }
            }
        });

        this.$container.on('mousedown.selection', this, function(e) {

            if (e.data.disabled || e.which != 1)
            {
                return;
            }

            e.data.selection = true;
            e.data.recalculateContainerPosition();
            e.data.x1 = e.pageX - e.data.containerOffset.left;
            e.data.y1 = e.pageY - e.data.containerOffset.top;

            e.data.timeStampLast = e.timeStamp;
            e.data.timeStamp = e.timeStamp;
            e.data.xPrev = e.data.x1;
            e.data.yPrev = e.data.y1;

            if(e.data.animate) {
                $(e.data.animate).stop();
            }

            if (e.data.movestart)
            {
                e.data.movestart(e.data);
            }


        });

        this.$container.on('mousemove.selection', this, function(e) {
            if (e.data.disabled)
            {
                return;
            }

            if (!e.data.selection)
            {
                return;
            }

            var pageX = e.pageX;
            var pageY = e.pageY;
            if (typeof pageX === "undefined")
            {
                pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            var x2 = Math.round(pageX - e.data.containerOffset.left);
            var y2 = Math.round(pageY - e.data.containerOffset.top);
            if (e.data.x2 === x2 && e.data.y2 === y2)
            {
                // Minor performance optimization: do not handle the same coordinates twice in a row.
                return;
            }

            e.data.xPrev = e.data.x2;
            e.data.yPrev = e.data.y2;

            e.data.x2 = x2;
            e.data.y2 = y2;

            e.data.timeStampLast = e.data.timeStamp;
            e.data.timeStamp = e.timeStamp;
            e.data.xSpeed = Math.abs(e.data.xPrev-x2) / (e.data.timeStamp - e.data.timeStampLast);

            if (e.data.x2 >= 0 && e.data.x2 <= e.data.containerWidth && e.data.y2 >= 0 && e.data.y2 <= e.data.containerHeight)
            {
                var showSelection = true;

                if (e.data.move)
                {
                    showSelection = e.data.move(e.data);
                }

                if (showSelection)
                {
                    e.data.$selection.css({
                        "display": "",
                        "left": (self.x1 < self.x2) ? self.x1 : self.x2,
                        "top": (self.y1 < self.y2) ? self.y1 : self.y2,
                        "width": (self.x1 < self.x2) ? self.x2 - self.x1 : self.x1 - self.x2,
                        "height": (self.y1 < self.y2) ? self.y2 - self.y1 : self.y1 - self.y2
                    });
                }
            }

        });
    };

    iChart.Charting.ChartSelection.prototype.disabled = false;
    iChart.Charting.ChartSelection.prototype.moved = false;
    iChart.Charting.ChartSelection.prototype.movestart = null;
    iChart.Charting.ChartSelection.prototype.move = null;
    iChart.Charting.ChartSelection.prototype.moveend = null;
//    iChart.Charting.ChartSelection.prototype.mousedown = null;
//    iChart.Charting.ChartSelection.prototype.mousemove = null;
//    iChart.Charting.ChartSelection.prototype.mouseup = null;
    iChart.Charting.ChartSelection.prototype.selection = false;

    iChart.Charting.ChartSelection.prototype.x1 = null;
    iChart.Charting.ChartSelection.prototype.y1 = null;
    iChart.Charting.ChartSelection.prototype.x2 = null;
    iChart.Charting.ChartSelection.prototype.y2 = null;

    iChart.Charting.ChartSelection.prototype.shiftAnchor = function (deltaX, deltaY)
    {
        /// <summary>
        /// Shifts selection anchor point.
        /// </summary>
        /// <param name="deltaX" type="">X shift.</param>
        /// <param name="deltaY" type="Number">Y shift.</param>

        if (this.anchorX !== null && deltaX)
        {
            this.anchorX += deltaX;
        }

        if (this.anchorY !== null && deltaY)
        {
            this.anchorY += deltaY;
        }
    };

    iChart.Charting.ChartSelection.prototype.setAnchor = function (x, y)
    {
        /// <summary>
        /// Sets selection anchor point.
        /// </summary>
        /// <param name="x" type="Number">X coordinate.</param>
        /// <param name="y" type="Number">Y coordinate.</param>

        this.anchorX = x;
        this.anchorY = y;
    };

    iChart.Charting.ChartSelection.prototype.disable = function ()
    {
        /// <summary>
        /// Disables the selection and resets it to the default state.
        /// </summary>

        this.disabled = true;
        this.selection = false;

        this.x1 = null;
        this.y1 = null;
        this.x2 = null;
        this.y2 = null;
    };

    iChart.Charting.ChartSelection.prototype.enable = function ()
    {
        /// <summary>
        /// Enables the selection and resets it to the default state.
        /// </summary>

        this.disabled = false;
        this.selection = false;

        this.x1 = null;
        this.y1 = null;
        this.x2 = null;
        this.y2 = null;
    };

    iChart.Charting.ChartSelection.prototype.recalculateContainerPosition = function ()
    {
        this.containerOffset = this.$container.offset();
        this.containerWidth = this.$container.width();
        this.containerHeight = this.$container.height();
    };
})();