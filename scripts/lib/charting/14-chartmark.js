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
        this.settings = {mark: $("[data-instrument=\'Mark\'].active").attr('data-mark')};

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

            var img = new Image();

            img.src = "/iguanachart/images/" + 'icon-' + settings.mark + ".png";
            ctx.drawImage(img,coords[0].x-img.width/2, coords[0].y- img.height/2, img.width, img.height);
            $('.Mark-select').hide();
        }
    };

    iChart.Charting.ChartMark.prototype.drawPopupSettings = function (ctx, coord)
    {
        $('#elementSettings').remove(); 
        $('<div id="elementSettings" class="mark chartInstrument">' +
            '<div class="uk-flex uk-flex-left">' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="up" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-up"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="left" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-left"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="leftUp" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-leftUp"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="rightUp" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-rightUp"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="smileUp" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-smileUp"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="exclamation" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-exclamation"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="buy" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-buy"></i></div></div>' +
            '<div class="uk-flex uk-flex-left">' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="down" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-down"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="right" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-right"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="leftDown" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-leftDown"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="rightDown" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-rightDown"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="smileDown" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-smileDown"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="question" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-question"></i></div>' +
            '<div class="chartTool uk-flex uk-flex-center uk-flex-middle" data-mark="sell" name="SelectInstrument" data-instrument="Mark"><i class="sprite sprite-icon-sell"></i></div>' +
            '</div>' +
            '</div>').appendTo($(this.layer.chart.container));
        var x = coord.x - $('#elementSettings.mark').width()+8;
        $('#elementSettings').css({ "left": this.layer.area.innerOffset.left+x, "top": this.layer.area.innerOffset.top+coord.y + 15 });

        var self = this;
        var setSettings_onClick = function (i)
        {
            self.setSettings({mark: i});
            self.layer.render();
        };

        $('#elementSettings .chartTool').off("mousedown").on('mousedown', function(event){
            event.stopPropagation();
            setSettings_onClick($(this).attr('data-mark'));
            $('#elementSettings').remove();
        });

        return false;
    };

    iChart.Charting.ChartMark.prototype.setTestSegments = function ()
    {

        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}]
        ];
    };

})();