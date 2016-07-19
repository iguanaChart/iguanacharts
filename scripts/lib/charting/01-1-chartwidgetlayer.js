/**
 * @company  Tradernet
 * @package  iguanaChart
 */

(function ()
{
    "use strict";

    iChart.Charting.ChartWidgetLayer = function (chart, settings)
    {

        this.canvas = null;
        this.chart = chart;
        this.widget = {
            widgetCurPrice: {
                enable: false,
                width: 200,
                height: 44,
                valign: 'top',
                halign: 'left',
                vspace: 0,
                hspace: 50
            }
        };

        if(typeof settings != "undefined") {
            for (var widget in settings) {
                this.widget[widget] = $.extend(this.widget[widget], settings[widget]);
            }
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.clear = function ()
    {
    };

    iChart.Charting.ChartWidgetLayer.prototype.render = function (context)
    {
        /// <summary>
        /// Redraws the layer.
        /// </summary>

        if (!context)
        {
            if(!this.context) {
                console.log("ERROR: No context for render");
                return 0;
            }
            context = this.context;
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }

        context.save();
        this.drawWidgets(context);
        context.restore();

        if (typeof FlashCanvas !== "undefined")
        {
            // Flush and execute commands.
            context.e();
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.update = function ()
    {
        /// <summary>
        /// Updates drawing layer.
        /// </summary>

        if (!this.chart.areas)
        {
            return;
        }

        this.area = this.chart.areas[0];

        this._initCanvas(this.chart.canvas.width, this.chart.canvas.height);
        this.render();
    };

    iChart.Charting.ChartWidgetLayer.prototype._initCanvas = function (width, height)
    {
        /// <summary>
        /// Initializes the canvas.
        /// </summary>
        /// <param name="width" type="Number">Canvas width in pixels.</param>
        /// <param name="height" type="Number">Canvas height in pixels.</param>

        this.canvas = iChart.Charting.initCanvas(this.chart.container, this.canvas, width, height);
        if (this.canvas)
        {
            this.context = this.canvas.getContext("2d");
            this.offset = this.chart._containerSize.offset;
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.drawWidgets = function (ctx)
    {
        //ctx.save();
        //ctx.strokeStyle="#FF0000";
        //ctx.strokeRect(0, 0, ctx.canvas.width-1, ctx.canvas.height-1);
        //ctx.restore();

        for (var widget in this.widget) {
            if(this.widget[widget].enable) {
                this[widget](ctx, this.widget[widget]);
            }
        }
    };

    iChart.Charting.ChartWidgetLayer.prototype.widgetCurPrice = function (ctx, options)
    {
        var width = options.width,
            height = options.height;


        if(options.valign == 'top') {
            var yT = this.area.innerOffset.top+options.vspace;
        } else {
            var yT = this.area.innerHeight+this.area.innerOffset.top-height-options.vspace;
        }

        if(options.halign == 'left') {
            var xT = this.area.innerOffset.left+options.hspace;
        } else {
            var xT = this.area.innerWidth+this.area.innerOffset.left-width-options.hspace;
        }

        ctx.save();
        ctx.translate(xT, yT);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = "rgba(214,218,225,0.75)";
        ctx.strokeStyle = "rgba(171,177,192,1)";
        ctx.fillRect(0,0,width,height);
        ctx.rect(0,0,width,height);
        ctx.stroke();


        var q = this.chart.env.userSettings.currentSecurity.q;
        ctx.fillStyle = '#20232a';
        ctx.font = 'normal 26px Arial,Helvetica,sans-serif';
        ctx.textBaseline = "middle";

        if(!this.chart.areas[0].ySeries[0]) { return;}
        var lastIndex = this.chart.areas[0].ySeries[0].points.length-this.chart.chartOptions.futureAmount-1;
        var pointX = this.chart.areas[0].xSeries[lastIndex];
        var pointY = this.chart.areas[0].ySeries[0].points[lastIndex];

        var price = pointY[3];
        var deg = (1/this.chart.env.userSettings.currentSecurity.min_step > 1) ? (Math.round(1/this.chart.env.userSettings.currentSecurity.min_step)).toString().length-1 : 0;
        price = price.toFormat(deg,'.',' ');
        ctx.fillText(price, 10, 30);

        ctx.textBaseline = "top";
        var dataLabel = iChart.formatDateTime(new Date(pointX * 1000), "dd MMMM HH:mm");

        ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
        ctx.fillText(dataLabel, 10, 5);

        /*
        if(q.chg >= 0) {
            ctx.fillStyle = '#228B22';
        } else {
            ctx.fillStyle = '#b7333b';
        }
        var chg = parseFloat(q.chg);
        var sign = (chg > 0) ? "▲+":"▼";
        var diff = q.chg=='0'?'0.00': sign + chg.toFormat(Math.max(chg.getDegree(),2),'.',' ');
        ctx.fillText(diff, 140, 13);

        if(q.pcp) {
            if(q.pcp >= 0) {
                ctx.fillStyle = '#228B22';
            } else {
                ctx.fillStyle = '#b7333b';
            }
            var sign = (parseFloat(q.pcp) > 0) ? "▲+" : "▼";
            var diffpc = sign + q.pcp + '%';
            ctx.fillText(diffpc, 140, 28);
        }
        */

        ctx.restore();

    };

    iChart.Charting.ChartWidgetLayer.prototype.widgetCurPrice2 = function (ctx, options)
    {
        var width = options.width,
            height = options.height;

        if(typeof this.chart.env.userSettings.currentSecurity.q != "undefined") {

            if(options.valign == 'top') {
                var yT = this.area.innerOffset.top+options.vspace;
            } else {
                var yT = this.area.innerHeight+this.area.innerOffset.top-height-options.vspace;
            }

            if(options.halign == 'left') {
                var xT = this.area.innerOffset.left+options.hspace;
            } else {
                var xT = this.area.innerWidth+this.area.innerOffset.left-width-options.hspace;
            }

            ctx.save();
            ctx.translate(xT, yT);
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = "rgba(214,218,225,0.75)";
            ctx.strokeStyle = "rgba(171,177,192,1)";
            ctx.fillRect(0,0,width,height);
            ctx.rect(0,0,width,height);
            ctx.stroke();


            var q = this.chart.env.userSettings.currentSecurity.q;
            ctx.fillStyle = '#20232a';
            ctx.font = 'normal 26px Arial,Helvetica,sans-serif';
            ctx.textBaseline = "middle";
            var price = parseFloat(q.ltp);
            var deg = (1/this.chart.env.userSettings.currentSecurity.min_step > 1) ? (Math.round(1/this.chart.env.userSettings.currentSecurity.min_step)).toString().length-1 : 0;
            price = price.toFormat(deg,'.',' ');
            ctx.fillText(price, 10, 30);

            ctx.textBaseline = "top";
            if(new Date(q.ltt).toString() != "Invalid Date") {
                var ltt = q.ltt;
                ltt = ltt.replace(/^[\d-]{10}T?/, '');
                var dataLabel = iChart.formatDateTime(new Date(q.ltt), "dd MMMM") + " " + ltt;

                ctx.font = 'normal 11px Arial,Helvetica,sans-serif';
                ctx.fillText(dataLabel, 10, 5);
            }

            if(q.chg >= 0) {
                ctx.fillStyle = '#228B22';
            } else {
                ctx.fillStyle = '#b7333b';
            }
            var chg = parseFloat(q.chg);
            var sign = (chg > 0) ? "▲+":"▼";
            var diff = q.chg=='0'?'0.00': sign + chg.toFormat(Math.max(chg.getDegree(),2),'.',' ');
            ctx.fillText(diff, 140, 13);

            if(q.pcp) {
                if(q.pcp >= 0) {
                    ctx.fillStyle = '#228B22';
                } else {
                    ctx.fillStyle = '#b7333b';
                }
                var sign = (parseFloat(q.pcp) > 0) ? "▲+" : "▼";
                var diffpc = sign + q.pcp + '%';
                ctx.fillText(diffpc, 140, 28);
            }

        }

        ctx.restore();

    }

})();
