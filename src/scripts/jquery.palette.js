/**
 * Created by gti on 05.07.16.
 */
(function ($){


var methods = {
    palettes: {
        basic: [
            "#000000",
            "#7f7f7f",
            "#880015",
            "#ed1c24",
            "#ff7f27",
            "#fff200",
            "#22b14c",
            "#00a2e8",
            "#3f48cc",
            "#a349a4",
            "#ffffff",
            "#c3c3c3",
            "#b97a57",
            "#ffaec9",
            "#ffc90e",
            "#efe4b0",
            "#b5e61d",
            "#99d9ea",
            "#7092be",
            "#c8bfe7"
        ]
    },
    defaults: {
        palette: [],
        columns: 1,
        size: 20,
        value: '',
        change: function() {}
    },
    init: function (options) {
        var obj = $.extend({}, methods.defaults, options);

        if(typeof options.palette === "string" && methods.palettes[options.palette]) {
            obj.palette = methods.palettes[options.palette];
        }

        obj.element = this;

        var rows = Math.ceil(obj.palette.length / obj.columns);

        var $table = $('<table>').css({'border-collapse': 'collapse',
                                        'position': 'relative',
                                        'width': (+(obj.columns) * (+(obj.size) + 2)) + 'px',
                                        //'height': '100%',
                                        'margin': 0,
                                        'padding': 0,
                                        'border': 0,
                                        'outline': 0,
                                        'text-decoration': 'none',
                                        'font-size': '100%',
                                        'list-style': 'none'
                                    });

        for(var i=0; i<rows; i++) {
            var $tr = $('<tr>');
            for(var j=0; j<obj.columns; j++) {
                var $td = $('<td>', {class: 'palette-item'}).attr('data-color', obj.palette[i*obj.columns + j]).
                    css({width: obj.size, height: obj.size, 'background-color': obj.palette[i*obj.columns + j]});
                $tr.append($td);
            }
            $table.append($tr);
        }

        $table.on('click', 'td', function(){
            obj.value = $(this).data('color');
            obj.change.call(obj);
        });

        this.append($table).css({
            'position': 'relative',
            'line-height': 0,
            'border-width': 0,
            'display': 'inline-block'
        });

        this.data('palette', obj);
    }
};


$.fn.palette = function (options) {

    if(typeof options === "undefined" || typeof options === 'object') {

        return this.each(function(n){
            var selector = $(this);
            methods.init.call(selector, options, n);
            return selector;
        });

    } else if (typeof options === 'string') {

        var args = Array.prototype.slice.call(arguments, 1);

        if (methods[options] && typeof methods[options] == 'function') {

            if(args.length) {
                return this.each(function (n) {
                    var selector = $(this);
                    methods[options].call(selector, args);
                    return selector;
                });
            } else {
                var selector = $(this).eq(0);
                return methods[options].call(selector, args);
            }

        } else {
            return console.error('Method should be function');
        }
    } else {
        return console.error('Options should be object, string or undefined');
    }

};
})(jQuery);