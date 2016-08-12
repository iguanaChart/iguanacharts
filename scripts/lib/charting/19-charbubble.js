/**
 * @company  Tradernet
 * @package  iguanaChart
 */


(function ()
{
    "use strict";

    iChart.Charting.ChartBubble = function (layer)
    {
        iChart.Charting.ChartElement.prototype.constructor.call(this, layer);

        this.elementType = "Bubble";
        this.drawType = 'manually';
        this.maxPointCount = 3;
        this.hasSettings = true;
        this.settings = $.extend({}, layer.chart.env.userSettings.chartSettings.contextSettings, layer.chart.env.userSettings.chartSettings.fontSettings, {text: ''});
    };

    inheritPrototype(iChart.Charting.ChartBubble, iChart.Charting.ChartElement);

    iChart.Charting.ChartBubble.prototype.onInsert = function () {
        this.selected = true;

        var coords = this.getCoordinates(null, this.points);

        if (coords.length < 2)
        {
            return;
        }

        this.settings.width = coords[1].x - coords[0].x;
        this.settings.height = coords[1].y - coords[0].y;
    };

    iChart.Charting.ChartBubble.prototype.drawInternal = function (ctx, coords)
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

        this.drawBubble(ctx, coords);

    };

    iChart.Charting.ChartBubble.prototype.drawBubble = function (ctx, coords)
    {

        var radius = 30,
            radiusMax = 25,
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
        ctx.lineJoin='miter';
        ctx.beginPath();
//        ctx.strokeStyle="black";
//        ctx.lineWidth="1";

        //Есть точка указателя и пространство на боковой стороне с учетом вычета на повороты
        if(typeof coords[2] != 'undefined' && Math.abs(coords[0].x - coords[1].x) > 2*radius && Math.abs(coords[0].y - coords[1].y) > 2*radius) {
            //указатель находится не внутри бабла
            if(!(coords[2].x < Math.max(coords[0].x, coords[1].x) && coords[2].x > Math.min(coords[0].x, coords[1].x)
                && coords[2].y < Math.max(coords[0].y, coords[1].y) && coords[2].y > Math.min(coords[0].y, coords[1].y)))
            {
                //ближняя сторона по x
                if(Math.abs(coords[0].x - coords[2].x) < Math.abs(coords[1].x - coords[2].x)) {
                    handle[0].x = coords[0].x;
                } else {
                    handle[0].x = coords[1].x;
                }
                //ближняя сторона по y
                if(Math.abs(coords[0].y - coords[2].y) < Math.abs(coords[1].y - coords[2].y)) {
                    handle[0].y = coords[0].y;
                } else {
                    handle[0].y = coords[1].y;
                }
                //отределение стороны примыкания указателя
                if(coords[2].x > Math.min(coords[0].x, coords[1].x) && coords[2].x < Math.max(coords[0].x, coords[1].x)) {
                    xSide = true;
                } else if(coords[2].y > Math.min(coords[0].y, coords[1].y) && coords[2].y < Math.max(coords[0].y, coords[1].y)) {
                    ySide = true;
                } else {
                    if(Math.abs((handle[0].x - coords[2].x) * (xD? 1:-1)) >  Math.abs((handle[0].y - coords[2].y) * (yD? 1:-1))) {
                        ySide = true;
                    } else {
                        xSide = true;
                    }
                }

                if(xSide) {
                    //определение площабки косания указателя и бабла
                    var angelBase = Math.abs(handle[0].y - coords[2].y) * Math.sin(Math.PI/12);
                    handleBaseMax = parseInt(width / 6);
                    var enableBase = parseInt(width - 2*radius);
                    if(angelBase < handleBaseMax && angelBase < enableBase) {
                        handleBase = angelBase;
                    } else {
                        handleBase = Math.min(handleBaseMax, enableBase);
                    }

                    //определение координат точек касания
                    var x = (xD? Math.min(coords[1].x-radius, Math.max(coords[0].x+radius, coords[2].x)):Math.min(coords[0].x-radius, Math.max(coords[1].x+radius, coords[2].x)));
                    handle[1].x = x - handleBase/2;
                    handle[2].x = x + handleBase/2;
                    handle[1].y = handle[2].y = handle[0].y;

                    if(xD && (Math.min(handle[1].x, handle[2].x) < coords[0].x+radius) || !xD && (Math.min(handle[1].x, handle[2].x) < coords[1].x+radius )) {
                        handle[1].x = handle[0].x + (xD? radius:radius);
                        handle[2].x = handle[1].x + (xD? handleBase:handleBase);
                    } else if(xD && (Math.max(handle[1].x, handle[2].x) > coords[1].x-radius) || !xD && (Math.max(handle[1].x, handle[2].x) > coords[0].x-radius)) {
                        handle[1].x = handle[0].x - (xD? radius:radius);
                        handle[2].x = handle[1].x - (xD? handleBase:handleBase);
                    }
                } else if(ySide) {
                    var angelBase = Math.abs(handle[0].x - coords[2].x) * Math.sin(Math.PI/12);
                    handleBaseMax = parseInt(heigh / 6);
                    var enableBase = parseInt(heigh - 2*radius);
                    if(angelBase < handleBaseMax && angelBase < enableBase) {
                        handleBase = angelBase;
                    } else {
                        handleBase = Math.min(handleBaseMax, enableBase);
                    }

                    var y = (yD? Math.min(coords[1].y-radius, Math.max(coords[0].y+radius, coords[2].y)):Math.min(coords[0].y-radius, Math.max(coords[1].y+radius, coords[2].y)));
                    handle[1].y = y - handleBase/2;
                    handle[2].y = y + handleBase/2;
                    handle[1].x = handle[2].x = handle[0].x;

                    if(yD && (Math.min(handle[1].y, handle[2].y) < coords[0].y+radius) || !yD && (Math.min(handle[1].y, handle[2].y) < coords[1].y+radius )) {
                        handle[1].y = handle[0].y + (yD? radius:radius);
                        handle[2].y = handle[1].y + (yD? handleBase:handleBase);
                    } else if(yD && (Math.max(handle[1].y, handle[2].y) > coords[1].y-radius) || !yD && (Math.max(handle[1].y, handle[2].y) > coords[0].y-radius)) {
                        handle[1].y = handle[0].y - (yD? radius:radius);
                        handle[2].y = handle[1].y - (yD? handleBase:handleBase);
                    }
                }
            }
        }

        ctx.moveTo(coords[0].x + (xD ? radius:-radius), coords[0].y);
        if(xSide && handle[0].y == coords[0].y) {
            ctx.lineTo((xD ? Math.min(handle[1].x, handle[2].x):Math.max(handle[1].x, handle[2].x)), handle[1].y);
            ctx.lineTo(coords[2].x, coords[2].y);
            ctx.lineTo((xD ? Math.max(handle[1].x, handle[2].x):Math.min(handle[1].x, handle[2].x)), handle[2].y);
            ctx.lineTo(coords[1].x - (xD ? radius:-radius), coords[0].y);
        } else {
            ctx.lineTo(coords[1].x - (xD ? radius:-radius), coords[0].y);
        }
        ctx.quadraticCurveTo(coords[1].x, coords[0].y, coords[1].x, coords[0].y + (yD ? radius:-radius));
        if(ySide && handle[0].x == coords[1].x) {
            ctx.lineTo(handle[1].x, (yD ? Math.min(handle[1].y, handle[2].y):Math.max(handle[1].y, handle[2].y)));
            ctx.lineTo(coords[2].x, coords[2].y);
            ctx.lineTo(handle[1].x, (yD ? Math.max(handle[1].y, handle[2].y):Math.min(handle[1].y, handle[2].y)));
            ctx.lineTo(coords[1].x, coords[1].y - (yD ? radius:-radius));
        } else {
            ctx.lineTo(coords[1].x, coords[1].y - (yD ? radius:-radius));
        }
        ctx.quadraticCurveTo(coords[1].x, coords[1].y, coords[1].x - (xD ? radius:-radius), coords[1].y);
        if(xSide && handle[0].y == coords[1].y) {
            ctx.lineTo((xD ? Math.max(handle[1].x, handle[2].x):Math.min(handle[1].x, handle[2].x)), handle[2].y);
            ctx.lineTo(coords[2].x, coords[2].y);
            ctx.lineTo((xD ? Math.min(handle[1].x, handle[2].x):Math.max(handle[1].x, handle[2].x)), handle[1].y);
            ctx.lineTo(coords[0].x + (xD ? radius:-radius), coords[1].y);
        } else {
            ctx.lineTo(coords[0].x + (xD ? radius:-radius), coords[1].y);
        }
        ctx.quadraticCurveTo(coords[0].x, coords[1].y, coords[0].x, coords[1].y - (yD ? radius:-radius));
        if(ySide && handle[0].x == coords[0].x) {
            ctx.lineTo(handle[1].x, (yD ? Math.max(handle[1].y, handle[2].y):Math.min(handle[1].y, handle[2].y)));
            ctx.lineTo(coords[2].x, coords[2].y);
            ctx.lineTo(handle[1].x, (yD ? Math.min(handle[1].y, handle[2].y):Math.max(handle[1].y, handle[2].y)));
            ctx.lineTo(coords[0].x, coords[0].y + (yD ? radius:-radius));
        } else {
            ctx.lineTo(coords[0].x, coords[0].y + (yD ? radius:-radius));
        }
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

    iChart.Charting.ChartBubble.prototype.drawText = function (ctx, coords, radius, text) {

        var
            padding = 5,
            width = Math.abs(coords[0].x - coords[1].x) - parseInt(radius*2/3) - padding*2,
            height = Math.abs(coords[0].y - coords[1].y) - parseInt(radius*2/3) - padding*2,
            x = Math.min(coords[0].x, coords[1].x) + parseInt(radius/3) + padding,
            y = Math.min(coords[0].y, coords[1].y) + parseInt(radius/3) + padding;

        var settings = this.settings;

//console.log(this);

        if(!this.selected) {

            text = settings.text;

            ctx.save();

            ctx.beginPath();

            ctx.fillStyle = this.settings.color;
            ctx.font = 'normal ' + this.settings.size + 'px ' + this.settings.famaly;
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
            var textHeight = 0+Math.round(parseInt(this.settings.size)/10);
            var lineHeight = parseInt(this.settings.size) + Math.round(parseInt(this.settings.size)/5);
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
                font: 'normal '+this.settings.size+'px/'+ (parseInt(this.settings.size) + Math.round(parseInt(this.settings.size)/5)) +'px ' + this.settings.famaly,
                background: "rgba(230,230,230,.0)",
                color: this.settings.color,
                overflow: "hidden",
                border: "0px solid red",
                width: width +'px',
                height: height + 'px'
            });

            $('#chart-element-bubble').css({top: top +'px', left: left -2 + 'px'}).show();
            $('#chart-bubble-text').width(width-2).height(height-2);

            $('#chart-element-bubble').off('click mousedown drag dragstart').on('click mousedown drag dragstart', function(e) {
                e.stopPropagation();
            });
        }

    }

    iChart.Charting.ChartBubble.prototype.onSelect = function (ctx) {
        iChart.Charting.ChartElement.prototype.onSelect.call(this, ctx);
        if($('#chart-element-bubble').length == 0) {
            $(this.layer.chart.container).append('' +
                '<div id="chart-element-bubble" style="z-index: 15002; position: absolute; ">' +
                '<textarea id="chart-bubble-text"></textarea>' +
                '</div>');
            $('#chart-bubble-text').css({
                font: 'normal '+this.settings.size+'px/'+(parseInt(this.settings.size) + Math.round(parseInt(this.settings.size)/5))+'px ' + this.settings.famaly,
                background: "rgba(230,230,230,.0)",
                color: this.settings.color,
                overflow: "hidden",
                border: "0px solid red"
            });
        }
        $('#chart-bubble-text').val('').focus().val(this.settings.text);
    }

    iChart.Charting.ChartBubble.prototype.onBlur = function (ctx) {
        var settings = this.settings;
        settings.text = $('#chart-bubble-text').val();
        this.setSettings(settings);
        $('#chart-element-bubble').css({top: '-12000px', left: '-12000px'}).remove();
    }

    iChart.Charting.ChartBubble.prototype.onHover = function (ctx) {
        if(this.selected) {
            this.settings.text = $('#chart-bubble-text').val();
        }
    }

    iChart.Charting.ChartBubble.prototype.onOut = function (ctx) {
        if(this.selected) {
            this.settings.text = $('#chart-bubble-text').val();
        }
    }

    iChart.Charting.ChartBubble.prototype.onRemove = function () {
        $('#chart-element-bubble').css({top: '-12000px', left: '-12000px'}).hide();
    }

    iChart.Charting.ChartBubble.prototype.drawCheckPoint = function (ctx, x, y, text) {
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


    iChart.Charting.ChartBubble.prototype.setTestSegments = function ()
    {
        this.testContext.segments = [
            [this.testContext.points[0], { "x": this.testContext.points[0].x, "y": this.testContext.points[1].y}],
            [{ "x": this.testContext.points[0].x, "y": this.testContext.points[1].y }, this.testContext.points[1]],
            [this.testContext.points[1], { "x": this.testContext.points[1].x, "y": this.testContext.points[0].y}],
            [{ "x": this.testContext.points[1].x, "y": this.testContext.points[0].y }, this.testContext.points[0]]
        ];
    };

})();