/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartLabel = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Label";
        this.drawType = 'manually';
        this.maxPointCount = 1;

        this.hasSettings = true;
        this.hasPopupSettings = true;
        this.settings = 0;

        this.settings = {text: '', size: 12};
        this.sizes = [12,15,19];

        $('#elementSettings').remove();

    };

    inheritPrototype(iChart.Charting.ChartLabel, iChart.Charting.ChartElement);

    iChart.Charting.ChartLabel.prototype.drawString = function (ctx, text, posX, posY, fontSize, textColor, rotation, font)
    {
        var lines = text.split("\n");
        if (!rotation) rotation = 0;
        if (!font) font = 'Arial,Helvetica,sans-serif';
        if (!fontSize) fontSize = this.sizes[0];
        if (!textColor) textColor = '#000000';
        ctx.save();
        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = textColor;
        ctx.translate(posX, posY);
        ctx.rotate(rotation * Math.PI / 180);
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i],0, i*fontSize);
        }
        ctx.restore();
    }

    iChart.Charting.ChartLabel.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 1)
        {
            return;
        }
        var data = this.settings;
        this.drawString(ctx, data.text, coords[0].x, coords[0].y, data.size);
    };

    iChart.Charting.ChartLabel.prototype.setSettings = function (i) {
        this.settings = i;

        if(this.layer.context) {
            this.layer.render();
            this.layer.syncHash();
        }
    };


    iChart.Charting.ChartLabel.prototype.drawPopupSettings = function (ctx, coord)
    {
        var data = this.settings;

        var sltd0 = (data.size == this.sizes[0])? 'selected':'';
        var sltd1 = (data.size == this.sizes[1])? 'selected':'';
        var sltd2 = (data.size == this.sizes[2])? 'selected':'';

        $('#elementSettings').remove();
        /*        $('<div id="elementSettings" class="label">'+
         '<textarea rows="3" style="width: 99%;">' + data.text + '</textarea><br/>' +
         'Размер шрифта:<br/>' +
         '<select id="elementSize"><option '+sltd0+' value="'+this.sizes[0]+'">Маленький</option><option '+sltd1+' value="'+this.sizes[1]+'">Средний</option><option '+sltd2+' value="'+this.sizes[2]+'">Большой</option></select>' +
         '<img class="save" style="margin-left: 15px; margin-top: 3px;" src="/i/admin/btn/save.gif"/>' +
         '<div class="close">[X]</div>' +
         '</div>').prependTo('#chartContainerWrapper');
         $('#elementSettings.label').css({ "margin-left": coord.x + 2, "margin-top": coord.y + 2 });
         */

        $('<div id="elementSettings" class="label">'+
            '<textarea rows="3" style="width: 99%;">' + data.text + '</textarea><br/>' +
            'Размер шрифта:<br/>' +
            '<select id="elementSize"><option '+sltd0+' value="'+this.sizes[0]+'">Маленький</option><option '+sltd1+' value="'+this.sizes[1]+'">Средний</option><option '+sltd2+' value="'+this.sizes[2]+'">Большой</option></select>' +
            '<img class="save" style="margin-left: 15px; margin-top: 3px;" src="/i/admin/btn/save.gif"/>' +
            '<div class="close">[X]</div>' +
            '</div>').prependTo($(this.layer.chart.container).parent());
        $('#elementSettings.label').css({ "margin-left": coord.x + 2, "margin-top": coord.y + 2 });

        var self = this;
        var setSettings_onClick = function (i) { self.setSettings(i); }
        var remove_Element = function () { self.remove(); }
        var get_Text = function () { var data = self.settings; return data.text; }

        $('#elementSettings .save').unbind("mousedown").mousedown(function(event){
            event.stopPropagation();

            var params = {text: $('#elementSettings.label textarea').val(), size: $('#elementSettings.label #elementSize').val()};

            if(!$('#elementSettings.label textarea').val().length) {
                remove_Element();
                $('#elementSettings.label').remove();
            } else {
                setSettings_onClick(params);
                $('#elementSettings.label').remove();
            }
        });

        $('#elementSettings.label .close').unbind("mousedown").mousedown(function(event){
            event.stopPropagation();

            if(!get_Text().length) {
                remove_Element();
            }
            $('#elementSettings.label').remove();
        });

        return false;

    };

    iChart.Charting.ChartLabel.prototype.setTestSegments = function ()
    {
        var ctx = this.layer.context;
        var data = this.settings;

        var font= 'Arial,Helvetica,sans-serif';
        var fontSize = data.size;
        var textColor = '#000000';

        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = textColor;

        var width = 0;
        var height = 0;

        var lines = data.text.split("\n");

        for (var i = 0; i < lines.length; i++) {

            if(ctx.measureText(lines[i]).width > width) {
                width = ctx.measureText(lines[i]).width;
                height += fontSize;
            }
        }

        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x+width, "y": this.testContext.points[0].y}],
            [{ "x": this.testContext.points[0].x+width, "y": this.testContext.points[0].y}, { "x": this.testContext.points[0].x+width, "y": this.testContext.points[0].y+height}],
            [{ "x": this.testContext.points[0].x+width, "y": this.testContext.points[0].y+height}, { "x": this.testContext.points[0].x, "y": this.testContext.points[0].y+height}],
            [{ "x": this.testContext.points[0].x, "y": this.testContext.points[0].y+height}, this.testContext.points[0]]
        ];
    };

})();