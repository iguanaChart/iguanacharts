/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartMark = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Mark";
        this.drawType = 'manually';
        this.maxPointCount = 1;
        this.hasSettings = true;
        this.hasPopupSettings = true;
        this.settings = {mark: 'smileUp'};

        this.img = {};

        this.img["up"] = new Image();
        this.img["up"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'up' + ".png";
        this.img["left"] = new Image();
        this.img["left"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'left' + ".png";
        this.img["leftUp"] = new Image();
        this.img["leftUp"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'leftUp' + ".png";
        this.img["rightUp"] = new Image();
        this.img["rightUp"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'rightUp' + ".png";
        this.img["smileUp"] = new Image();
        this.img["smileUp"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'smileUp' + ".png";
        this.img["exclamation"] = new Image();
        this.img["exclamation"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'exclamation' + ".png";
        this.img["buy"] = new Image();
        this.img["buy"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'buy' + ".png";
        this.img["down"] = new Image();
        this.img["down"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'down' + ".png";
        this.img["right"] = new Image();
        this.img["right"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'right' + ".png";
        this.img["leftDown"] = new Image();
        this.img["leftDown"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'leftDown' + ".png";
        this.img["rightDown"] = new Image();
        this.img["rightDown"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'rightDown' + ".png";
        this.img["smileDown"] = new Image();
        this.img["smileDown"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'smileDown' + ".png";
        this.img["question"] = new Image();
        this.img["question"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'question' + ".png";
        this.img["sell"] = new Image();
        this.img["sell"].src = this.layer.chart.env.lib_path + "/images/" + 'icon-' + 'sell' + ".png";



        $('#elementSettings').remove();

    };

    inheritPrototype(iChart.Charting.ChartMark, iChart.Charting.ChartElement);

    iChart.Charting.ChartMark.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }

        if(this.settings != undefined) {
            var settings = this.settings;

            var img = this.img[settings.mark];
                ctx.save();
            ctx.translate(- 0.5, - 0.5);
            ctx.drawImage(img,coords[0].x-img.width/2, coords[0].y- img.height/2, img.width, img.height);
            ctx.restore();
            $('.Mark-select').hide();
        }
    };

    iChart.Charting.ChartMark.prototype.drawPopupSettings = function (ctx, coord)
    {
        $('#elementSettings').remove();

        $('<div id="elementSettings" class="mark chartInstrument">' +
            '<div class="uk-flex uk-flex-left">' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"up"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-up"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"left"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-left"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"leftUp"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-upLeft"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"rightUp"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-upRight"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"smileUp"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-smileUp"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"exclamation"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-exclamation"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"buy"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-buy"></i></div></div>' +
            '<div class="uk-flex uk-flex-left">' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"down"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-down"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"right"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-right"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"leftDown"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-downLeft"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"rightDown"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-downRight"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"smileDown"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-smileDown"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"question"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-question"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-settings=\'{"mark":"sell"}\' name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-sell"></i></div>' +
            '</div>' +
            '</div>').appendTo($(this.layer.chart.container));
        var x = coord.x - $('#elementSettings.mark').width()+8;
        $('#elementSettings').css({ "left": this.layer.area.innerOffset.left+x, "top": this.layer.area.innerOffset.top+coord.y + 15 });

        var self = this;
        var setSettings_onClick = function (settings)
        {
            self.setSettings(settings);
            self.layer.render();
        };

        $('#elementSettings .chartTool').off("mousedown").on('mousedown', function(event){
            event.stopPropagation();
            setSettings_onClick($(this).data('settings'));
            $('#elementSettings').remove();
        });

        return false;
    };

    iChart.Charting.ChartMark.prototype.drawPoints = function (ctx, pointCoords) {};

    iChart.Charting.ChartMark.prototype.setTestSegments = function ()
    {

        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}]
        ];
    };

})();