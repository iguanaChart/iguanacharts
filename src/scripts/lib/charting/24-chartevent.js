/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartEvent = function (layer)
    {

        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Event";
        this.drawType = 'auto';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.controlEnable = false;
        this.id = 0;
        this.settings = {
            color: 'red',
            size: 5,
            shape: 'disk', //[disk,circle,square,diamond,triangle]
            pointFormatter: function () {
                return '';
            },
            onHover: function () {},
            onOut: function () {}
        };
    };

    inheritPrototype(iChart.Charting.ChartEvent, iChart.Charting.ChartElement);

    iChart.Charting.ChartEvent.prototype.setSettings = function (settings)
    {
        this.settings = $.extend(this.settings, settings);
    };

    iChart.Charting.ChartEvent.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        ctx.save();

        ctx.fillStyle = this.settings.color;

        if(ctx.inHover) {
            ctx.fillStyle = '#0000ff';
            ctx.stokeStyle = '#000';
        }


        switch (this.settings.shape) {
            case 'circle':
                this.drawCircle(ctx, coords);
                break;
            case 'disk':
                this.drawDisc(ctx, coords);
                break;
            case 'square':
                this.drawSquare(ctx, coords);
                break;
            case 'diamond':
                this.drawDiamond(ctx, coords);
                break;
            case 'triangle':
                this.drawTriangle(ctx, coords);
                break;
            default:
                this.drawDisc(ctx, coords);
                break;
        }

        ctx.restore();

    };

    iChart.Charting.ChartEvent.prototype.drawDisc = function (ctx, coords) {
        ctx.beginPath();

        ctx.arc(coords[0].x, coords[0].y, this.settings.size, 0, 2 * Math.PI, true);

        ctx.fill();
        ctx.closePath();

    };

    iChart.Charting.ChartEvent.prototype.drawCircle = function (ctx, coords) {

        ctx.beginPath();

        ctx.lineWidth=this.settings.size*0.5;
        ctx.arc(coords[0].x, coords[0].y, this.settings.size, 0, 2 * Math.PI, true);
        ctx.closePath();

        if(!ctx.inHover) {
            ctx.strokeStyle = this.settings.color;
        }

        ctx.stroke();

    };

    iChart.Charting.ChartEvent.prototype.drawSquare = function (ctx, coords) {
        ctx.beginPath();

        var ds = this.settings.size;
        ctx.moveTo(coords[0].x-ds, coords[0].y-ds);
        ctx.lineTo(coords[0].x-ds, coords[0].y+ds);
        ctx.lineTo(coords[0].x+ds, coords[0].y+ds);
        ctx.lineTo(coords[0].x+ds, coords[0].y-ds);
        ctx.lineTo(coords[0].x-ds, coords[0].y-ds);

        ctx.fill();
        ctx.closePath();

    };

    iChart.Charting.ChartEvent.prototype.drawDiamond = function (ctx, coords) {
        ctx.beginPath();

        var ds = this.settings.size;
        ctx.moveTo(coords[0].x, coords[0].y-ds);
        ctx.lineTo(coords[0].x-ds*2/3, coords[0].y);
        ctx.lineTo(coords[0].x, coords[0].y+ds);
        ctx.lineTo(coords[0].x+ds*2/3, coords[0].y);
        ctx.lineTo(coords[0].x, coords[0].y-ds);

        ctx.fill();
        ctx.closePath();

    };

    iChart.Charting.ChartEvent.prototype.drawTriangle = function (ctx, coords) {
        ctx.beginPath();

        var ds = this.settings.size*2*Math.sin(Math.PI/3)/2;
        ctx.moveTo(coords[0].x, coords[0].y-ds);
        ctx.lineTo(coords[0].x-ds, coords[0].y+this.settings.size);
        ctx.lineTo(coords[0].x+ds, coords[0].y+this.settings.size);
        ctx.lineTo(coords[0].x, coords[0].y-ds);

        ctx.fill();
        ctx.closePath();

    };

    iChart.Charting.ChartEvent.prototype.onHover = function (ctx) {
        var coords = this.getCoordinates(ctx, this.points);
        var top = coords[0].y + /*$(iChart.viewData.chart.container).position().top + */$(this.layer.chart.container).offset().top;
        var left = coords[0].x + /*$(iChart.viewData.chart.container).position().left + */$(this.layer.chart.container).offset().left;

        this.drawTooltip(this.settings, top, left);

        if(typeof this.settings.onHover == "function") {
            this.settings.onHover.call(this);
        }
    };

    iChart.Charting.ChartEvent.prototype.onOut = function (ctx) {
        $('[chart-element-tooltip]').hide();
        if(typeof this.settings.onOut == "function") {
            this.settings.onOut.call(this);
        }
    };

    iChart.Charting.ChartEvent.prototype.drawTooltip = function (data, top, left) {

        if(this.layer.chart.env.wrapper.find('[chart-element-tooltip]').length == 0) {
            $('body').append('' +
            '<div chart-element-tooltip class="qtip qtip-default qtip-tipsy qtip-pos-rc" tracking="false" role="alert" aria-live="polite" aria-atomic="false" style="z-index: 15002;">' +
                '<div class="qtip-tip" style="background-color: transparent ! important; border: 0px none ! important; height: 6px; width: 6px; line-height: 6px; top: 50%; margin-top: -3px; right: -6px;"><canvas style="background-color: transparent ! important; border: 0px none ! important;" height="6" width="6"></canvas></div>' +
                '<div class="qtip-content" id="qtip-34-content" aria-atomic="true">' +
                '</div>' +
                '</div>' +
            '</div>');
        }

        var dataView = this.settings.pointFormatter.call(this.settings);

        if(dataView) {
            $('[chart-element-tooltip] .qtip-content').html(dataView);
            $('[chart-element-tooltip]').css({
                top: top - $('[chart-element-tooltip]').height() - 0 + 'px',
                left: left + 12 + 'px'
            }).show();
        }
    };

    iChart.Charting.ChartEvent.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}]
        ];
    };

})();