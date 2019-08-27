/**
 * @company  Tradernet
 * @package  iguanaChart
 */

if(typeof tzOffsetMoscow == "undefined") {
    tzOffsetMoscow = 10800;
}

if(typeof LANG_NAME == "undefined") {
    LANG_NAME = 'en';
}

if(typeof TEXT_TRANSLATOR_MODE == "undefined") {
//    TEXT_TRANSLATOR_MODE = 'ru';
}

if(typeof IGUANACHART_THEME == "undefined") {
    IGUANACHART_THEME = "White";
}

if(typeof MOBILE_BROWSER_DETECTED == "undefined") {
    MOBILE_BROWSER_DETECTED = false;
}

function formatDate(offset, time) {
    var date = new Date();
    var time = date.getTime();
    var changedDate = new Date(time + (+(offset) * 86400000/*24 * 60 * 60 * 1000*/));
    date.setTime(changedDate.getTime());
    return iChart.formatDateTime(date, "dd.MM.yyyy") + ((time)?' 23:59':'');
}

Date.parse = function(input) {

    if (!input)
    {
        return null;
    }

    if (input instanceof Date)
    {
        return input.getTime();
    }

    var matches = input.match(/^\s*([0-9]{4})-([0-9]{2})-([0-9]{2})[\s|T]{0,1}(?:\s*(\d\d{0,1}):?(\d\d{0,1})(?::?(\d\d{0,1}))?(?:\.([0-9]{0,3}))?)?\s*$/);

    if (matches)
    {
        var result = new Date(matches[1], matches[2] - 1, matches[3]);
        if (typeof matches[4] !== "undefined" && typeof matches[5] !== "undefined")
        {
            result.setHours(matches[4], matches[5], matches[6] || 0, matches[7] || 0);
        }
        return result.getTime();
    }

    var matches = input.match(new RegExp("^\\s*([0-9]{1,2})(?:\.|-|/|\\s)([0-9]{1,2})(?:\.|-|/|\\s)([0-9]{4})(?:\\s*([0-9]{1,2}):?([0-9]{1,2})(?::?([0-9]{1,2}))?)?\\s*$"));
    if (matches)
    {
        var result = new Date(matches[3], matches[2] - 1, matches[1]);
        if (typeof matches[4] !== "undefined" && typeof matches[5] !== "undefined")
        {
            result.setHours(matches[4], matches[5], matches[6] || 0);
        }
        return result.getTime();
    }

    return new Date(input).getTime();
}

if(typeof _t == "undefined") {

    /**
     *
     * @type {{}}
     */
    _.data = {};

    /**
     * Получить перевод по хэш ключу
     * @param hash srting  хэш перевода
     * @param str srting текст по умолчанию
     * @return srting
     */
    function _(hash, str) {

        if(typeof _.data !== "undefined") {

            if (!_.data[hash]) {

                if (!!i18n[hash]) {

                    _.data[hash] = i18n[hash];

                    return _.data[hash]
                }

            } else {

                return _.data[hash];
            }

            return str;
        }
    }

    /**
     * Вырезать из строки перевода нужную форму ед/мнж числа
     * @see \My_Translate::getPluralForm  /!\ изменяя этот метод меняйте php копию
     *
     * 1                   2,3,4               5,6...
     * Вася купил N булку||Вася купил N булки||Валя купил N булок
     *
     * В зависимости от $num будет выбрана необходимая форма. Также определение идет от выбранного языка, т.к. ед и мн числа разные
     *
     * @param text           Строка перевода вида "Вася купил %QTY% булку||Вася купил %QTY% булки||Валя купил %QTY% булок"
     * @param num            кол-во из фразы
     * @param langShortName  язык
     *
     * @return int  фраза в нужном мнж числе
     */
    function translateGetPluralForm (text, num, langShortName)
    {
        // сперва узнаем - целое ли?
        var isInt   = parseInt(num) == num;
        var form    = 2;

        // --- RU и UK - разбор русского и украинского языков, правила одинаковые ---
        if (langShortName == 'ru' || langShortName == 'uk') {

            // все дробные как форма 2.
            if (!isInt) {
                form = 2;
            } else {

                var endTwo = ("" + num + "").length > 1 ? ("" + num + "").substr(-2, 1) : false;
                if (endTwo == '1') {
                    form = 3;
                } else {
                    var end = ("" + num + "").substr(-1);

                    switch (end) {
                        case '1':
                            form = 1;
                            break;

                        case '2':     case '3':     case '4':
                        form = 2;
                        break;

                        default:
                        case '0':     case '5':     case '6':     case '7':     case '8':     case '9':
                        form = 3;
                        break;
                    }
                }
            }
        }

        // --- EN - разбор англ. языка ---
        else if (langShortName == 'en') {

            // все просто: > 1 - мнж, <= 1 - ед, видимо программисты придумывали язык
            if (num > 1) {
                form = 2;
            } else {
                form = 1;
            }
        }

        // --- Все остальные, пока аналог EN ---
        else {

            if (num > 1) {
                form = 2;
            } else {
                form = 1;
            }
        }

        var strings = text.split('||');

        if (typeof strings[form - 1] === 'undefined') {
            return strings[0];
        } else {
            return strings[form - 1];
        }
    }

    _t = function (id, txtOrig, variables)
    {
        var translate  = '';
        var itsOrig    = false;
        var pluralMode = (((typeof variables == 'object')) && (typeof variables.QTY !== 'undefined') && (txtOrig.indexOf("||") != -1));

        translate = _(id, txtOrig);

        if (typeof translate === 'undefined' || translate == txtOrig) {
            translate   = txtOrig;
            itsOrig = true;
        }

        if (pluralMode) {
            translate = translateGetPluralForm(translate, variables.QTY, itsOrig ? 'ru' : LANG_NAME);
        }

        if (typeof variables == 'object') {
            $.each(variables, function(index, value) {
                translate = translate.replace(new RegExp('%'+index+'%','g'), value);
            });
        }

        return ' '+translate+' ';
    }
}

if(typeof String.prototype.hashCode == "undefined") {
    String.prototype.hashCode = function () {
        var hash = 0, i, chr, len;
        if (this.length == 0) return hash;
        for (i = 0, len = this.length; i < len; i++) {
            chr = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
}

if(typeof getTimeOffsetServer == "undefined") {
    /**
     * Получить разницу локального и серверного времени
     * @param serverOffset в секундах
     * @returns {number}  в милисекундах
     */
    getTimeOffsetServer = function (serverOffset) {
        serverOffset = serverOffset || 0;
        var d = new Date()
        var tzLocalOffset = d.getTimezoneOffset();
        return (serverOffset) + (tzLocalOffset * 60);
    }
}

function intervalNames(interval) {
    switch (interval) {
        case "S30":
            return _t('2072', "30 секундный");
        case "I1":
            return _t('2073', "минутный");
        case "I5":
            return _t('2074', "5 минутный");
        case "I15":
            return _t('2075', "15 минутный");
        case "H1":
            return _t('2076', "Часовик");
        case "D1":
            return _t('2077', "Дневной");
        case "D7":
            return _t('2078', 'Недельный');
        default:
            return "";
    }
}

function intervalShortNames(interval) {
    switch (interval) {
        case "S30":
            return _t('1176', "30c");
        case "I1":
            return _t('1370', "М");
        case "I5":
            return _t('3331', "5М");
        case "I15":
            return _t('3332', "15М");
        case "H1":
            return _t('3333', "Ч");
        case "D1":
            return _t('1368', "Д");
        case "D3":
            return _t('15824', "3Д");
        case "D7":
            return _t('1369', 'Н');
        case "M1":
            return _t('1370', 'М');
        case "M3":
            return _t('1371', '3М');
        default:
            return "";
    }
}

(function (w)
{
    "use strict";

    // IE8 (initial release) bugfix for '' becoming 'null'. See http://support.microsoft.com/kb/976662 for details.
    if (typeof JSON !== "undefined" && JSON.stringify(document.createElement("input").value) !== "")
    {
        (function ()
        {
            var _replacer = function (k, v) { return v === "" ? "" : v; };
            var _stringify = JSON.stringify;
            JSON.stringify = function (v, r, s)
            {
                return _stringify(v, _replacer, s);
            };
        })();
    }

    // Array indexOf shim for IE8.
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function (searchElement, fromIndex)
        {
            /// <summary>
            /// Returns the first index at which a given element can be found in the array, or -1 if it is not present.
            /// </summary>
            /// <returns type="Number" />

            if (typeof fromIndex === "undefined")
            {
                fromIndex = 0;
            }
            else
            {
                fromIndex = parseInt(fromIndex, 10);
            }

            if (fromIndex >= this.length)
            {
                return -1;
            }

            if (fromIndex < 0)
            {
                fromIndex = Math.max(0, this.length + fromIndex);
            }

            for (var i = fromIndex; i < this.length; ++i)
            {
                if (this[i] === searchElement)
                {
                    return i;
                }
            }

            return -1;
        };
    }

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/string/expand-exponential [rev. #1]
    String.prototype.expandExponential = function ()
    {
        /// <summary>
        /// Expands a number in the exponential form to the decimal form.
        /// </summary>
        /// <returns type="String" />

        return this.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function (x, s, n, f, c)
        {
            var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
            c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
            z = (new Array(c + 1)).join("0"), r = n + f;
            return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
        });
    };

    w.inheritPrototype = function (subtype, supertype)
    {
        /// <summary>
        /// Inherits the specifed subtype from the specified supertype.
        /// </summary>
        /// <param name="subtype">Subtype that should inherit fields and methods from supertype.</param>
        /// <param name="supertype">Supertype that provides fields and methods to inherit.</param>

        var dummy = function () { };
        dummy.prototype = supertype.prototype;
        subtype.prototype = new dummy();
        subtype.prototype.constructor = subtype;
    };

    var padLeft = function (input)
    {
        return (input < 10 ? "0" + input : input);
    };

    if (typeof w.iChart === "undefined")
    {
        w.iChart = {};
    }

    w.iChart.dayShortNames = [_t('2129', 'Пн'), _t('2130', 'Вт'), _t('2131', 'Ср'), _t('2132', 'Чт'), _t('2133', 'Пт'), _t('2134', 'Сб'), _t('2135', 'Вс')];
    w.iChart.monthNames = [_t('3280', 'Январь'), _t('3281', 'Февраль'), _t('3282', 'Март'), _t('3283', 'Апрель'), _t('3284', 'Май'), _t('3285', 'Июнь'), _t('3286', 'Июль'), _t('3287', 'Август'), _t('3288', 'Сентябрь'), _t('3289', 'Октябрь'), _t('3290', 'Ноябрь'), _t('3291', 'Декабрь')];
    w.iChart.monthRNames = [_t('1889', "января"), _t('1890', "февраля"), _t('1891', "марта"), _t('1892', "апреля"), _t('1893', "мая"), _t('1894', "июня"), _t('1895', "июля"), _t('1896', "августа"), _t('1897', "сентября"), _t('1898', "октября"), _t('1899', "ноября"), _t('1900', "декабря")];
    w.iChart.monthShortNames = [_t('3502', 'янв'), _t('3503', 'фев'), _t('3504', 'мар'), _t('3505', 'апр'), _t('4939', "май"), _t('3507', 'июн'), _t('3508', 'июл'), _t('3509', 'авг'), _t('3510', 'сен'), _t('3511', 'окт'), _t('3512', 'ноя'), _t('3513', 'дек')];

    w.iChart.declineNoun = function (n, singular, dual, plural)
    {
        /// <summary>
        /// Declines the specified russian noun based on its singular, dual and plural forms.
        /// </summary>
        /// <returns type="String" />

        n = Math.abs(n);
        n %= 100;
        if (n >= 5 && n <= 20)
        {
            return plural;
        }

        n %= 10;
        if (n == 1)
        {
            return singular;
        }

        if (n >= 2 && n <= 4)
        {
            return dual;
        }

        return plural;
    };

    w.iChart.formatDateTime = function (input, format)
    {
        /// <summary>
        /// Provides some basic formatting capabilities for the date/time objects.
        /// </summary>
        /// <param name="input" type="Date">Date to format.</param>
        /// <param name="format" type="String">Format string (optional). Understands d, dd, M, MM, MMM, yy, yyyy, H, HH, m, mm, s, ss.</param>
        /// <returns type="String" />

        if (!input)
        {
            return "";
        }

        if (!format)
        {
            if (input.getHours() === 0 && input.getMinutes() === 0)
            {
                format = "dd.MM.yyyy";
            }
            else if (input.getSeconds() === 0)
            {
                format = "dd.MM.yyyy HH:mm";
            }
            else
            {
                format = "dd.MM.yyyy HH:mm:ss";
            }
        }

        var token = "";
        var tokens = [];
        for (var i = 0; i < format.length; ++i)
        {
            var c = format.charAt(i);
            if (token.length === 0)
            {
                token = c;
                continue;
            }

            var p = token.charAt(token.length - 1);
            if (c !== 'd' && c !== 'M' && c !== 'y' && c !== 'H' && c !== "m" && c !== "s")
            {
                if (p !== 'd' && p !== 'M' && p !== 'y' && p !== 'H' && p !== "m" && p !== "s")
                {
                    token += c;
                    continue;
                }
            }
            else if (c === p)
            {
                token += c;
                continue;
            }

            tokens.push(token);
            token = c;
        }

        if (token.length !== 0)
        {
            tokens.push(token);
        }

        var result = "";
        for (var i = 0; i < tokens.length; ++i)
        {
            var token = tokens[i];
            switch (token)
            {
                case "d":
                    result += input.getDate();
                    break;
                case "dd":
                    result += padLeft(input.getDate());
                    break;
                case "M":
                    result += input.getMonth() + 1;
                    break;
                case "MM":
                    result += padLeft(input.getMonth() + 1);
                    break;
                case "MMM":
                    result += w.iChart.monthShortNames[input.getMonth()];
                    break;
                case "MMMM":
                    result += w.iChart.monthRNames[input.getMonth()];
                    break;
                case "yy":
                    result += input.getFullYear().toString().substr(2, 2);
                    break;
                case "yyyy":
                    result += input.getFullYear();
                    break;
                case "H":
                    result += input.getHours();
                    break;
                case "HH":
                    result += padLeft(input.getHours());
                    break;
                case "m":
                    result += input.getMinutes();
                    break;
                case "mm":
                    result += padLeft(input.getMinutes());
                    break;
                case "s":
                    result += input.getSeconds();
                    break;
                case "ss":
                    result += padLeft(input.getSeconds());
                    break;
                default:
                    result += token;
                    break;
            }
        }

        return result;
    };

    w.iChart.formatNumber = function (number, formatProvider)
    {
        /// <summary>
        /// Converts the numeric value to its equivalent string representation using the specified format information.
        /// </summary>
        /// <returns type="String" />

        if (typeof number === "undefined" || number === null)
        {
            return "";
        }

        formatProvider = $.extend(
            {
                "decimalPlaces": null,
                "decimalPrecision": null,
                "decimalSeparator": ".",
                "scale": 0,
                "thousandsSeparator": " "
            },
            formatProvider);

        if (formatProvider.scale !== 0)
        {
            number = number / Math.pow(10, 3 * formatProvider.scale);
        }

        var fixedDecimalPlaces = formatProvider.decimalPlaces !== null;
        var roundedNumber;
        if (fixedDecimalPlaces)
        {
            roundedNumber = parseFloat(w.iChart.toFixed(number, formatProvider.decimalPlaces));
        }
        else if (formatProvider.decimalPrecision !== null)
        {
            roundedNumber = parseFloat(number.toPrecision(formatProvider.decimalPrecision));
        }
        else
        {
            roundedNumber = number;
        }

        var numberParts = roundedNumber.toString().expandExponential().split(".");
        if (numberParts[0].length > 3)
        {
            numberParts[0] = numberParts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, formatProvider.thousandsSeparator);
        }

        if (fixedDecimalPlaces && (numberParts[1] || "").length < formatProvider.decimalPlaces)
        {
            numberParts[1] = numberParts[1] || "";
            numberParts[1] += new Array(formatProvider.decimalPlaces - numberParts[1].length + 1).join("0");
        }

        var result = numberParts.join(formatProvider.decimalSeparator).replace("-", "−");
        switch (formatProvider.scale)
        {
            case 0:
                break;
            case 1:
                result += _t('3496', "тыс.");
                break;
            case 2:
                result += _t('2137', "млн");
                break;
            case 3:
                result += _t('4708', "млрд");
                break;
            case 4:
                result += _t('2139', "трлн");
                break;
            default:
                throw new Error("Number scale '" + formatProvider.scale + "' is invalid.");
        }

        return result;
    };

    w.iChart.parseDateTime = function (input, format)
    {
        /// <summary>
        /// Tries to parse the specified string as a date/time in d.M.yyyy H:m:s format (hours/minutes/seconds are optional). Returns null if parsing fails.
        /// </summary>
        /// <param name="input" type="String">Input string.</param>
        /// <param name="format" type="String">Format string.</param>
        /// <returns type="Date" />

        if (!input)
        {
            return null;
        }

        if (input instanceof Date)
        {
            return input;
        }

        if (format === "yyyyMMddHHmm")
        {
            var matches = input.match(new RegExp("^([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})$"));
            if (!matches)
            {
                return null;
            }

            var result = new Date(matches[1], matches[2] - 1, matches[3], matches[4], matches[5], 0, 0);
            return result;
        }

        if (format === "yyyy-MM-dd HH:mm:ss")
        {
            var matches = input.match(new RegExp("^([0-9]{4})-([0-9]{2})-([0-9]{2})\\s([0-9]{2}):([0-9]{2}):([0-9]{2})"));
            if (!matches)
            {
                return null;
            }

            var result = new Date(matches[1], matches[2] - 1, matches[3], matches[4], matches[5], matches[6], 0);
            return result;
        }

        var matches = input.match(new RegExp("^\\s*([0-9]{1,2})(?:\.|-|/|\\s)([0-9]{1,2})(?:\.|-|/|\\s)([0-9]{4})(?:\\s*([0-9]{1,2}):?([0-9]{1,2})(?::?([0-9]{1,2}))?)?\\s*$"));
        if (!matches)
        {
            return null;
        }

        var result = new Date(matches[3], matches[2] - 1, matches[1]);
        if (typeof matches[4] !== "undefined" && typeof matches[5] !== "undefined")
        {
            result.setHours(matches[4], matches[5], matches[6] || 0);
        }

        return result;
    };

    w.iChart.parseQueryString = function (queryString)
    {
        /// <summary>
        /// Parses a query string into an associative array.
        /// </summary>
        /// <returns type="String" />

        if(typeof queryString != "string") {
            return {};
        }
        var questionMarkIndex = queryString.indexOf("?");
        if (questionMarkIndex !== -1)
        {
            queryString = queryString.substr(questionMarkIndex + 1);
        }

        var chunks = queryString.split("&");
        var params = {};
        for (var i = 0; i < chunks.length; ++i)
        {
            var kvp = chunks[i].split("=");
            if (kvp.length !== 2)
            {
                continue;
            }

            var paramKey = decodeURIComponent(kvp[0]);
            var paramValue = decodeURIComponent(kvp[1]);
            switch (typeof params[paramKey])
            {
                case "object":
                    params[paramKey].push(paramValue);
                    break;
                case "string":
                    params[paramKey] = [params[paramKey], paramValue];
                    break;
                case "undefined":
                    params[paramKey] = paramValue;
                    break;
                default:
                    break;
            }
        }

        return params;
    };
/*
    w.iChart.setHashValue = function (key, value)
    {
        /// <summary>
        /// Sets value at the specified key in the location hash.
        /// </summary>
        /// <param name="key">A key at which the value should be stored.</param>
        /// <param name="value">A value to set.</param>

        if (userSettings.dataSettings.useHash == false) {
            var currentHash = userSettings.dataSettings.hash;
        } else {
            var currentHash = document.location.hash;
        }
        var values = w.iChart.parseQueryString(currentHash.substr(1));
        values[key] = value;
        var hash = "#" + w.iChart.toQueryString(values);
        if (hash !== currentHash)
        {
            if (userSettings.dataSettings.useHash == false) {
                userSettings.dataSettings.hash = hash;
            } else {
                document.location.hash = hash;
            }
        }
    };

    w.iChart.setHashValues = function (valuesNew)
    {
        /// <summary>
        /// Sets values at the specified keys in the location hash.
        /// </summary>
        /// <param name="valuesNew" type="Object">A dictionary of values to set.</param>

        if (userSettings.dataSettings.useHash == false) {
            var currentHash = userSettings.dataSettings.hash;
        } else {
            var currentHash = document.location.hash;
        }

        var values = w.iChart.parseQueryString(currentHash.substr(1));
        for (var key in valuesNew)
        {
            if (valuesNew.hasOwnProperty(key))
            {
                values[key] = valuesNew[key];
            }
        }
        var hash = "#" + w.iChart.toQueryString(values);
        if (hash !== currentHash && !$.isEmptyObject(values))
        {
            if (userSettings.dataSettings.useHash == false) {
                userSettings.dataSettings.hash = hash;
            } else {
                document.location.hash = hash;
            }
        }
    };
*/
    w.iChart.toFixed = function (number, decimalPlaces)
    {
        /// <remarks>
        /// IE6-8 bugfix: X.toFixed(0) wrongly rounds towards zero when |X| is in the range [0.50, 0.95).
        /// </remarks>
        /// <returns type="Number" />

        var scale = Math.pow(10, decimalPlaces);
        return Math.round(number * scale) / scale;
    };

    /**
     *
     * @param number
     * @param precision 0.01|0.5|0.025
     * @returns {float}
     */
    w.iChart.roundToPrecision = function (number, precision)
    {
        precision = parseFloat(precision)
        if (precision < 1) {
            var scale = parseFloat(precision).toString().length-2;
            return +((Math.round(number * (1/precision)) / (1/precision)).toFixed(scale));
        } else {
            return +((Math.round(number * (1/precision)) / (1/precision)).toFixed(0));
        }

    }

    w.iChart.toQueryString = function (params, questionMark)
    {
        /// <summary>
        /// Converts the specified associative array to HTTP query string (starting '?' is omitted by default).
        /// </summary>
        /// <returns type="String" />

        var paramStrings = [];
        for (var key in params)
        {
            if (!params.hasOwnProperty(key))
            {
                continue;
            }

            var value = params[key];
            if (typeof value === "undefined" || value === null || value === "")
            {
                continue;
            }

            if ($.isArray(value))
            {
                for (var i = 0; i < value.length; ++i)
                {
                    paramStrings.push(encodeURIComponent(key) + "=" + encodeURIComponent(value[i]));
                }
            }
            else
            {
                if (value instanceof Date)
                {
                    value = iChart.formatDateTime(value);
                }

                paramStrings.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            }
        }

        var result = "";
        if (questionMark && paramStrings.length !== 0)
        {
            result += "?";
        }

        result += paramStrings.join("&");
        return result;
    };

    w.iChart.rgbToHex = function (rgb)
    {
        if(/^#[a-fA-F0-9]{3,6}$/.test(rgb)){
            if(rgb.length< 7){
                var A= rgb.split('');
                rgb= A[0]+A[1]+A[1]+A[2]+A[2]+A[3]+A[3];
            }
            return rgb;
        }

        rgb = [].slice.call(arguments).join(",").match(/\d+/g);
        var hex,l;l=( hex = ( (rgb[0] << 16 ) + ( rgb[1] << 8 ) + +rgb[2] ).toString(16) ).length;
        while( l++ < 6 )
            hex="0"+hex
        return '#' + hex;
    };

    w.iChart.rgbaGetAlfa = function (rgba)
    {
        var a = rgba.match(/\((.*),(.*),(.*),(.*)\)/);
        if(a && a[4]) {
            return +a[4];
        }
        return 1;
    };

    w.iChart.hexToRGB = function (hex, a)
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            'rgba(' +
                parseInt(result[1], 16)+ ',' +
                parseInt(result[2], 16)+ ',' +
                parseInt(result[3], 16)+ ',' +
                a + ')'
            : null;
    };

    w.iChart.invertColor = function (rgb) {
        rgb = [].slice.call(arguments).join(",").replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
        for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
        return rgb.join(", ");
    };

    w.iChart.getIntersection = function (p1, p2, p3, p4)
    {
        if(((p1.y-p2.y)*(p4.x-p3.x)-(p3.y-p4.y)*(p2.x-p1.x)) != 0 && (p4.x-p3.x) != 0) {
            var x=-((p1.x*p2.y-p2.x*p1.y)*(p4.x-p3.x)-(p3.x*p4.y-p4.x*p3.y)*(p2.x-p1.x))/((p1.y-p2.y)*(p4.x-p3.x)-(p3.y-p4.y)*(p2.x-p1.x));
            var y=((p3.y-p4.y)*(-x)-(p3.x*p4.y-p4.x*p3.y))/(p4.x-p3.x);
            return {x: x, y: y};
        } else {
            return false;
        }
    }

    w.iChart.getThirdPoint = function (point1, point2, x)
    {
        var y = (((parseFloat(x)-parseFloat(point1.x))*(parseFloat(point2.y)-parseFloat(point1.y)))/(parseFloat(point2.x)-parseFloat(point1.x)))+parseFloat(point1.y);
        return {x: parseFloat(x), y: y};
    }

    w.iChart.getLineEquation = function (point1, point2, x)
    {
        var k = (+(point2.y) - +(point1.y)) / (+(point2.x) - +(point1.x)),
            b = +(point1.y) - k * (point1.x);
        var y = k * +(x) + b;
        return {x: +(x), y: y, k: k, b: b};
    }

    w.iChart.getChartTimeframe = function (timeframe) {
        switch (timeframe) {
            case "I1":
                return 1;
            case "I5":
                return 5;
            case "I15":
                return 15;
            case "H1":
                return 60;
            case "D1":
                return 1440;
            case "D7":
                return 10080;
            default:
                return 1440;
        }
    };
    /**
     *
     * @param canvas
     * @returns {CanvasRenderingContext2D | WebGLRenderingContext}
     */
    w.iChart.getContext = function (canvas) {
        var ctx = canvas.getContext('2d');
        if(!ctx.scaled) {
            var dpr = Math.max(window.devicePixelRatio || 1, 1);
            ctx.scale(dpr, dpr);
            ctx.scaled = 1;
        }
        return ctx;
    };

})(window);
