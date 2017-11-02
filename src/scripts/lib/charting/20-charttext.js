/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartText = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Text";
        this.drawType = 'manually';
        this.maxPointCount = 2;
        this.hasSettings = true;
        this.hasPopupSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings, {text: ''});
    };

    inheritPrototype(iChart.Charting.ChartText, iChart.Charting.ChartElement);

    iChart.Charting.ChartText.prototype.onInsert = function () {
        this.selected = true;

        var coords = this.getCoordinates(null, this.points);

        if (coords.length < 2)
        {
            return;
        }

        this.settings.width = coords[1].x - coords[0].x;
        this.settings.height = coords[1].y - coords[0].y;
    };

    iChart.Charting.ChartText.prototype.drawInternal = function (ctx, coords)
    {
        if (coords.length < 2)
        {
            return;
        }

        if(typeof this.markers != "undefined") {
            var size = {
                width: coords[1].x - coords[0].x,
                height: coords[1].y - coords[0].y
            };

            this.settings.width = coords[1].x - coords[0].x;
            this.settings.height = coords[1].y - coords[0].y;
        } else if(this.settings.width && this.settings.height) {
            this.points[1].x = this.layer.area.getXValue(coords[0].x + this.settings.width) * 1000;
            this.points[1].y = this.layer.area.getYValue(coords[0].y + this.settings.height);
            coords[1].x = this.layer.area.getXPositionByValue(this.points[1].x / 1000);
            coords[1].y = this.layer.area.getYPosition(this.points[1].y);
        }

        this.initDrawSettings(ctx, this.settings);

        this.drawLabel(ctx, coords);

    };

    iChart.Charting.ChartText.prototype.drawLabel = function (ctx, coords)
    {

        var radius = 30,
            radiusMax = 5,
            width = Math.abs(coords[0].x - coords[1].x),
            heigh = Math.abs(coords[0].y - coords[1].y),
            xD = coords[0].x < coords[1].x ? true : false,
            yD = coords[0].y < coords[1].y ? true : false,
            handle = [{},{},{}],
            handleBase,
            handleBaseMax = 80,
            xSide = false,
            ySide = false;

        radius = Math.min(parseInt(width/3),parseInt(heigh/3), radiusMax);

        ctx.save();

        ctx.beginPath();
//        ctx.strokeStyle="black";
//        ctx.lineWidth="1";

        ctx.moveTo(coords[0].x + (xD ? radius:-radius), coords[0].y);
        ctx.lineTo(coords[1].x - (xD ? radius:-radius), coords[0].y);
        ctx.quadraticCurveTo(coords[1].x, coords[0].y, coords[1].x, coords[0].y + (yD ? radius:-radius));
        ctx.lineTo(coords[1].x, coords[1].y - (yD ? radius:-radius));
        ctx.quadraticCurveTo(coords[1].x, coords[1].y, coords[1].x - (xD ? radius:-radius), coords[1].y);
        ctx.lineTo(coords[0].x + (xD ? radius:-radius), coords[1].y);
        ctx.quadraticCurveTo(coords[0].x, coords[1].y, coords[0].x, coords[1].y - (yD ? radius:-radius));
        ctx.lineTo(coords[0].x, coords[0].y + (yD ? radius:-radius));
        ctx.quadraticCurveTo(coords[0].x, coords[0].y, coords[0].x + (xD ? radius:-radius), coords[0].y);

//ctx.fillStyle="rgba(255,0,0,.4)";

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

//        this.drawCheckPoint(ctx, coords[0].x + (xD ? radius:-radius), coords[0].y, '1');
//        this.drawCheckPoint(ctx, coords[0].x, coords[1].y - (yD ? radius:-radius), '2');
//        this.drawCheckPoint(ctx, coords[0].x, coords[0].y + (yD ? radius:-radius), '3');
//        this.drawCheckPoint(ctx, coords[0].x + (xD ? radius:-radius), coords[1].y, '4');
//        this.drawCheckPoint(ctx, coords[1].x - (xD ? radius:-radius), coords[1].y, '5');
//        this.drawCheckPoint(ctx, coords[1].x, coords[1].y - (yD ? radius:-radius), '6');
//        this.drawCheckPoint(ctx, coords[1].x - (xD ? radius:-radius), coords[0].y, '7');
//        this.drawCheckPoint(ctx, coords[1].x, coords[0].y + (yD ? radius:-radius), '8');

        this.drawText(ctx, coords, radius, '');

        ctx.restore();


    }

    iChart.Charting.ChartText.prototype.drawText = function (ctx, coords, radius, text) {

        var
            padding = 5,
            width = Math.abs(coords[0].x - coords[1].x) - parseInt(radius*2/3) - padding*2,
            height = Math.abs(coords[0].y - coords[1].y) - parseInt(radius*2/3) - padding*2,
            x = Math.min(coords[0].x, coords[1].x) + parseInt(radius/3) + padding,
            y = Math.min(coords[0].y, coords[1].y) + parseInt(radius/3) + padding;

        var settings = this.settings;
//console.log(settings);

        if(!this.selected) {

            text = settings.text;

            ctx.save();

            ctx.beginPath();

            ctx.fillStyle = this.settings.fontColor;
            ctx.font = 'normal ' + this.settings.fontSize + 'px ' + this.settings.fontFamaly;
            ctx.textAlign = "left";
            ctx.textBaseline="top";

//console.log(x, y, width, height);
            ctx.rect(x, y, width, height);
            //ctx.stroke();
            ctx.clip();
            ctx.translate(x, y);

            //ctx.fillText(text, 0, 0);
//console.log(text);
            text = text.replace(/\n/g, ' [%br%] ');
//console.log(text);
            var words = text.split(/\s/);
            var countWords = words.length;
//console.log(words);

            var line = '';
            var textHeight = 0+Math.round(parseInt(this.settings.fontSize)/10);
            var lineHeight = parseInt(this.settings.fontSize) + Math.round(parseInt(this.settings.fontSize)/5);
            //var lineHeight = 16;

            for (var n = 0; n < countWords; n++) {
                var testLine = line + words[n] + " ";
                var testWidth = ctx.measureText(testLine).width;
                if (words[n] == "[%br%]") {
                    ctx.fillText(line, 0, textHeight);
                    line = '';
                    textHeight += lineHeight;
                } else if (testWidth > width) {
                    ctx.fillText(line, 0, textHeight);
                    line = words[n] + " ";
                    textHeight += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 0, textHeight);
            ctx.closePath();
            ctx.restore();

        } else {
            var top = y;
            var left = x + this.layer.area.innerOffset.left;

            if($('#chart-bubble-text').is(':visible')) {
                this.settings.text = $('#chart-bubble-text').val();
            } else {
                if($('#chart-element-bubble').length == 0) {
                    $(this.layer.chart.container).append('' +
                        '<div id="chart-element-bubble" style="z-index: 15002; position: absolute; ">' +
                        '<textarea id="chart-bubble-text"></textarea>' +
                        '</div>');
                }
                $('#chart-bubble-text').val('').focus().val(this.settings.text);
            }
            $('#chart-bubble-text').css({
                font: 'normal '+this.settings.fontSize+'px/'+(parseInt(this.settings.fontSize) + Math.round(parseInt(this.settings.fontSize)/5))+'px ' + this.settings.fontFamaly,
                background: "rgba(230,230,230,.0)",
                color: this.settings.fontColor,
                overflow: "hidden",
                border: "0px solid red",
                width: width +'px',
                height: height + 'px'
            });

            $('#chart-element-bubble').css({top: top -0 +'px', left: left -1 + 'px'}).show();
            $('#chart-bubble-text').width(width-2).height(height-2);

            $('#chart-element-bubble').off('click mousedown drag dragstart').on('click mousedown drag dragstart', function(e) {
                e.stopPropagation();
            });
        }

    };

    iChart.Charting.ChartText.prototype.drawPopupSettings = function (ctx, coord) {

        var data = {
            options: {
                sizes: [
                    {name: 8, value: 8},
                    {name: 9, value: 9},
                    {name: 10, value: 10},
                    {name: 11, value: 11},
                    {name: 12, value: 12},
                    {name: 14, value: 14},
                    {name: 16, value: 16},
                    {name: 20, value: 20},
                    {name: 24, value: 24},
                    {name: 28, value: 28},
                    {name: 32, value: 32},
                    {name: 40, value: 40}
                ],
                fonts: [
                    {name: 'Verdana', value: 'Verdana,Tahoma,Geneva,Arial,Sans-serif'},
                    {name: 'Courier New', value: 'Courier New,Monospace'},
                    {name: 'Times New Roman', value: 'TimesNewRoman,Times,Baskerville,Georgia,serif'},
                    {name: 'Arial', value: 'Arial,Helvetica,sans-serif'}
                ]
            },
            values: {
                fontSize: this.settings.fontSize,
                fontColor: this.settings.fontColor,
                fontFamaly: this.settings.fontFamaly,
                text: this.settings.text
            }
        };

        var $textPopupSettingsHtml = $($.render.iChart_textPopupSettingsTmpl(data));

        var _this = this;

        var onMinicolorsChange = function(value, opacity){
            var color = $(this).val(),
                colorRGBA = color,
                option = $(this).attr('data-option');

            if(!color.match(/^rgb.*/)) {
                colorRGBA = iChart.hexToRGB(color, opacity)
            }

            $textPopupSettingsHtml.find('.js-colorSelector[data-option="' + option + '"]').css('background-color', colorRGBA);
            $textPopupSettingsHtml.find('input[data-option="' + option + '"]').val(colorRGBA);

            $(this).minicolors('value', colorRGBA);
        };

        var onPaletteChange = function(){
            var color = this.value;
            var option = this.element.attr('data-option');
            var colorRGBA = color;

            if(!color.match(/^rgb.*/)) {
                colorRGBA = iChart.hexToRGB(color, 1);
            }

            $textPopupSettingsHtml.find('.js-colorSelector[data-option="' + option + '"]').css('background-color', colorRGBA);
            $textPopupSettingsHtml.find('input[data-option="' + option + '"]').val(colorRGBA);
            this.element.parent().find('.js-colorPicker').minicolors('value', colorRGBA);
        };

        $textPopupSettingsHtml.find('.js-colorSelector').each(function(){

            var $this = $(this),
                menu = $this.find('.menuHolder').html();

            $this.qtip({
                style: {
                    classes: 'qtip-light'
                },
                position: {
                    at: 'center right',
                    my: 'left center',
                    effect: false,
                    viewport: $(window),
                    adjust: {
                        method: 'shift none'
                    }
                },
                content: {
                    text: menu
                },
                hide: {
                    fixed: true,
                    delay: 300
                },
                show: {
                    solo: true
                },
                events: {
                    show: function(event, api) {
                        $(event.currentTarget).find('.js-colorPicker').each(function(){
                            _this.layer.chart.env.ui.addMinicolors(this, event.currentTarget, onMinicolorsChange, onPaletteChange);
                        });
                    }
                }
            });
        });

        $textPopupSettingsHtml.on('click', '.js-textPopupSettings', {popupWindow:$textPopupSettingsHtml, element: _this}, function(e){
            if($(this).data('value') == "ok") {
                e.data.element.settings.fontSize = e.data.popupWindow.find("[name='fontSize']").val();
                e.data.element.settings.fontFamaly = e.data.popupWindow.find("[name='fontFamaly']").val();
                e.data.element.settings.text = e.data.popupWindow.find("[name='text']").val();
                $('#chart-bubble-text').val(e.data.element.settings.text);
                e.data.element.settings.fontColor = e.data.popupWindow.find("input[data-option='fontColor']").val();
                e.data.element.layer.render();
            }

            if($.modal.impl.d.data) {
                $.modal.impl.close();
            }
        });

        this.layer.chart.env.wrapper.append($textPopupSettingsHtml);
        $textPopupSettingsHtml.modal(
            {modal: false, minWidth: 500, zIndex: 1500, position: [coord.y + 'px', coord.x + 'px'], title: _t('17599', 'Настройки текста')})
        ;
    };

    iChart.Charting.ChartText.prototype.onSelect = function (ctx) {
        iChart.Charting.ChartElement.prototype.onSelect.call(this, ctx);
        if($('#chart-element-bubble').length == 0) {
            $(this.layer.chart.container).append('' +
                '<div id="chart-element-bubble" style="z-index: 15002; position: absolute; ">' +
                '<textarea id="chart-bubble-text"></textarea>' +
                '</div>');
            $('#chart-bubble-text').css({
                font: 'normal '+this.settings.fontSize+'px/'+(parseInt(this.settings.fontSize) + Math.round(parseInt(this.settings.fontSize)/5))+'px ' + this.settings.fontFamaly,
                background: "rgba(230,230,230,.0)",
                color: this.settings.fontColor,
                overflow: "hidden",
                border: "0px solid red"
            });
        }
        $('#chart-bubble-text').val('').focus().val(this.settings.text);
        //$('#chart-bubble-text').get(0).setSelectionRange(0, $('#chart-bubble-text').val().length);

    }

    iChart.Charting.ChartText.prototype.onBlur = function (ctx) {
        var settings = this.settings;
        settings.text = $('#chart-bubble-text').val();
        this.setSettings(settings);
        $('#chart-element-bubble').css({top: '-12000px', left: '-12000px'}).remove();
    }

    iChart.Charting.ChartText.prototype.onHover = function (ctx) {
        if(this.selected) {
            this.settings.text = $('#chart-bubble-text').val();
        }
    }

    iChart.Charting.ChartText.prototype.onOut = function (ctx) {
        if(this.selected) {
            this.settings.text = $('#chart-bubble-text').val();
        }
    }

    iChart.Charting.ChartText.prototype.onRemove = function () {
        $('#chart-element-bubble').css({top: '-12000px', left: '-12000px'}).hide();
    }

    iChart.Charting.ChartText.prototype.drawCheckPoint = function (ctx, x, y, text) {
        ctx.strokeText(text,x,y);
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle="rgba(50,50,50,.4)";
        ctx.arc(x, y, 40, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.restore();
    }


    iChart.Charting.ChartText.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[1].y}],
            [{ "x": this.testContext.points[0].x, "y": this.testContext.points[1].y }, this.testContext.points[1]],
            [this.testContext.points[1], { "x": this.testContext.points[1].x, "y": this.testContext.points[0].y}],
            [{ "x": this.testContext.points[1].x, "y": this.testContext.points[0].y }, this.testContext.points[0]]
        ];
    };

})();