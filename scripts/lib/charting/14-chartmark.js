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
        $('<div id="elementSettings" class="mark chartInstrument">'+
            '<div class="popupWrapper">'+
            '<div class="rowTop">'+
            '<span class="up" data-mark="up"></span>'+
            '<span class="left" data-mark="left"></span>'+
            '<span class="upLeft" data-mark="leftUp"></span>'+
            '<span class="upRight" data-mark="rightUp"></span>'+
            '<span class="smileUp" data-mark="smileUp"></span>'+
            '<span class="exclamation" data-mark="exclamation"></span>'+
            '<span class="buy" data-mark="buy"></span>'+
            '<span class="down" data-mark="down"></span>'+
            '<span class="right" data-mark="right"></span>'+
            '<span class="downLeft" data-mark="leftDown"></span>'+
            '<span class="downRight" data-mark="rightDown"></span>'+
            '<span class="smileDown" data-mark="smileDown"></span>'+
            '<span class="question" data-mark="question"></span>'+
            '<span class="sell" data-mark="sell"></span>'+
            '</div>'+
            '</div>'+
            '</div>').appendTo($(this.layer.chart.container));
        var x = coord.x - $('#elementSettings.mark').width()+8;
        $('#elementSettings').css({ "left": this.layer.area.innerOffset.left+x, "top": this.layer.area.innerOffset.top+coord.y + 15 });

        var self = this;
        var setSettings_onClick = function (i)
        {
            self.setSettings({mark: i});
            self.layer.render();
        };

        $('#elementSettings span').unbind("mousedown").mousedown(function(event){
            event.stopPropagation();
            setSettings_onClick($(this).attr('data-mark'));
            $('#elementSettings').remove();
        });

        return false;
    }


    iChart.Charting.ChartMark.prototype.setTestSegments = function ()
    {

        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y}]
        ];
    };

})();