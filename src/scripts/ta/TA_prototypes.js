TA = {
    TICKER: 0,
    PER: 1,
    DATE: 2,
    TIME: 3,
    OPEN: 4,
    HIGH: 5,
    LOW: 6,
    CLOSE: 7,
    VOL: 8,
    FULLDATE: 9,
    FULLTIME: 10,
    DATESTRING: 11
};

TA.TA_COMPATIBILITY_DEFAULT = 0x0000;
TA.TA_GLOBALS_COMPATIBILITY = TA.TA_COMPATIBILITY_DEFAULT;


/**
 * Типы скользящей средней
 */
TA.MATypes = {
	SMA: 0x000,
	EMA: 0x001,
	WMA: 0x002,
	DEMA: 0x003,
	TEMA: 0x004,
	TRIMA: 0x005,
	KAMA: 0x006,
	MAMA: 0x007,
	T3: 0x008
};

TA.TA_IS_ZERO = function (v) { return (((-0.00000001)<v)&&(v<0.00000001))};

/* Convert a period into the equivalent k:
 *
 *    k = 2 / (period + 1)
 *
 * Useful to calculate the 'k' for TA_INT_EMA().
 */
TA.PER_TO_K = function (per) {
	return (2.0 / ((per + 1)));
};

TA.TA_FUNC_UNST_EMA = 0x0000;
TA.TA_FUNC_UNST_ADX = 0x0001;

TA.TA_Globals = {
	unstablePeriod: [0, 0]
};

TA.TA_GLOBALS_UNSTABLE_PERIOD = function (x, y) {
	return TA.TA_Globals.unstablePeriod[x]
};

/**
 * Базовый класс. Содержит функции управления значениями и индивидуальными настройками.
 */
TA.BASE_TEMPLATE = {

	__TICKER__: undefined,

	/**
	 * Настройки по умолчанию. Используются когда устанавливаются индивидуальные настройки тикера и при этом некоторые значения не указаны.
	 * Используются при инициализации индикатора.
	 */
	DefaultSettings: {

	},

	/**
	 * Проверяет заполнено ли переданное значение, если нет - возвращает установленное значение
	 * @param   {Object}	value            Любое значение
	 * @param   {String}	standartVariable Имя переменной по умолчанию
	 * @returns {Object}	Получаемое значение
	 */
	CheckStandartValue: function (value, standartVariable) {
		if (!value) {
			if (!this.Settings[standartVariable]) {
				return this.Settings[standartVariable];
			} else {
				return this.DefaultSettings[standartVariable];
			}
		} else {
			return value;
		}
	},

	/**
	 * Устанавливает индикатору переданные значения из параметра settings
	 * @param {Object} settings набор настроек индикатора
	 * @return {Object} Индикатор
	 */
	SetSettings: function (settings) {
		var name;

		if (!!settings) {
			if (settings != this.DefaultSettings) {
				this.SetSettings(this.DefaultSettings);
			}

			for (name in settings) {
				this.Settings[name] = +(settings[name]);
			}
		}

		return this;
	},

	/**
	 * Получает текущие настройки индикатора
	 * @returns {Object} Возвращает коллекцию текущих настроек
	 */
	GetSettings: function () {
		var i,
			answer = this.DefaultSettings;

		for (i in answer) {
			answer[i] = this.Settings[i];
		}
		return answer;
	},

	IndividualSettings: {

	},

	/**
	 * Устанавливает индивидуальные настройки для тикера
	 * @param {String} ticker тикер, для которого требуется установить индивидуальные настройки
	 * @return {Object} Этот объект
	 */
	SetIndividualSettings: function (ticker) {
		ticker = MainController.RatesController.getTicker(ticker);

		this.SetSettings(this.DefaultSettings);

		if (!!this.IndividualSettings[ticker]) {
			this.SetSettings(this.IndividualSettings[ticker]);
		}

		return this;
	},

	/**
	 * Проверяет - равен ли переданный тикер тому, по которому объект хранит индивидуальные настройки. Если тикер - другой, перезаполняет его новыми значениями.
	 * @param   {String}	ticker тикер, который требуется проверить
	 * @returns {Boolean}  	TRUE - перезаполнение не требуется.
	 *                      FALSE - потребовалось перезаполнение настроек.
	 */
	checkTicker: function (ticker) {
		ticker = MainController.RatesController.getTicker(ticker);
		if (this.__TICKER__ != ticker) {
			this.__TICKER__ = ticker;
			this.SetIndividualSettings(ticker);

			return false;
		}

		return true;
	},

	/**
	 * Возвращает настройки для автоматического подбора параметров. Если настройка - число возвращается значение вида '<НачальноеЗначение>-<КонечноеЗначение>:<ШагПодбора>', иначе - массив вида [Значение1, Значение2, ...]
	 * @param {Array} Массив имен свойств, по которым надо получить настройки. Если не заполнен - возвращаются все.
	 * @returns {Array} Массив объектов для автоматического подбора объектов
	 */
	getSettingsParameters: function (settingsNames) {
		var answer = [],
			totalItems = 0;

		for (var i in this.Settings) {
			if (!!settingsNames && !(settingsNames.indexOf(i) + 1)) {
				continue;
			}

			if (typeof this.Settings[i] == 'number') {
				answer.push({
					name: i,
					values: '' + this.Settings[i] + '-' + this.Settings[i] + ':1'
				});
			} else if (typeof this.Settings[i] == 'boolean') {
				answer.push({
					name: i,
					values: [true, false]
				});
			} else {
				answer.push({
					name: i,
					values: [this.Settings[i]]
				});
			}
		}

		return answer;
	},

	/**
	 * Возвращает новый объект класса. Важно! Использовать для всех не базовых экземпляров классов: индикаторы, контроллеры, интерфейсы и прочее
	 * @returns {[[Type]]} [[Description]]
	 */
	Create: function () {
		var newObject = $.extend(true, {}, this);

		function extendGetterSetter(target, owner) {
			for (var i in owner) {
				if (typeof owner[i] === 'object' && !!owner[i] && owner[i] != {}) {
					extendGetterSetter(target[i], owner[i]);
				}
				var setter = owner.__lookupSetter__(i);
				var getter = owner.__lookupGetter__(i);

				if (!!setter || !!getter) {
					if (!target[i])
						delete target[i];

					if (!!setter) {
						target.__defineSetter__(i, setter);
					}

					if (!!getter) {
						target.__defineGetter__(i, getter);
					}
				}
			}
		};

		extendGetterSetter(newObject, this);

		return newObject;
	}
};

/**
 * Базовый класс индикатора. Добавлены настройки вывода на график и функции получения сигналов.
 */
TA.INDICATOR_TEMPLATE = TA.BASE_TEMPLATE.Create();

TA.INDICATOR_TEMPLATE.Create = function(settings) {
	var newObject = TA.BASE_TEMPLATE.Create.apply(this);

    newObject.justifyCalculate = function() {
        var result = this.calculate.apply(this, arguments);

        if ($.isArray(result)) {
            var _lookback = this._lookback(this.Settings.TimePeriod);
            for(var i = 0; i < _lookback; i++) {
                result.unshift(0);
            }
        } else {
            var _lookback = this._lookback(this.Settings.TimePeriod);
            for(var key in result) {
                for(var i = 0; i < _lookback; i++) {
                    result[key].unshift(0);
                }
            }
        }
        return result;
    };
	
	if(!!settings)
		this.SetSettings(settings);
	
	return newObject;
};

/**
 * Шаблон для переопределяемой функции инициации вывода графика
 * @param   {Array} 	dataShape Массив свечей котировки
 * @param   {Object} 	options   Массив настроек вывода графика
 * @param   {string} 	ticker    Тикер для которого выводится график
 * @returns {Object} ссылка на объект индикатора
 */
TA.INDICATOR_TEMPLATE.initChart = function (dataShape, options, ticker) {
	this.checkTicker(ticker);
	return this;
};

/**
 * Шаблон переопределяемой функции фильтрации переданных сигналов.
 * @param   {Array} 	dataShape    Массив свечей котировки
 * @param   {Array} 	signalsArray Массив сигналов, которые надо отфильтровать
 * @returns {Array} Массив отфильтрованных сигналов
 */
TA.INDICATOR_TEMPLATE.filterSignalsArray = function (dataShape, signalsArray) {
	return [];
};

/**
 * Фильтрует сигнал на определенную дату
 * @param   {Array} 	dataShape       Массив котировок свечей
 * @param   {Date} 		dateSignal      Дата, на которую надо отфильтровать сигнал
 * @param   {Array} 	signalArray 	Массив сигналов
 * @returns {Object} Объект вида: {clear: {Boolean}}
 */
TA.INDICATOR_TEMPLATE.filterSignal = function (dataShape, dateSignal, signalArray) {
	return {
		clear: true
	};
};

/**
 * Функция возвращает сигнал - надо ли открывать позицию для торговли.
 * @param {Date} 		dateSignal Дата, на которую надо расчитать сигнал
 * @param {String} 		ticker     Тикер, для которого получается сигнал
 * @return {null|String} ORDER_BUY, ORDER_SELL, null сигнал - надо ли открывать позицию
 */
TA.INDICATOR_TEMPLATE.getOpenSignal = function (dateSignal, ticker) {
	this.checkTicker(ticker);

	return null;
};

/**
 * Функция возвращает - надо ли закрывать открытую позицию.
 * @param   {Date} 		dateSignal Дата, для которой расчитывается сигнал
 * @param   {String} 	ticker     Тикер, для которого расчитывается сигнал
 * @returns {Boolean}  	Признак, что позицию надо закрывать.
 */
TA.INDICATOR_TEMPLATE.getCloseSignal = function (dateSignal, ticker) {
	this.checkTicker(ticker);

	return false;
};

/**
 * Возвращает настройки для вывода индикатора на график
 * @param   {Array}		settingsNames Имена возможных параметров настройки
 * @returns {Array} Массив возможных настроек графика. Подробнее см. getSettingsParameters
 */
TA.INDICATOR_TEMPLATE.getGraphicSettingsParameters = function (settingsNames) {
	var answer = this.getSettingsParameters.apply(this, arguments);

	return answer;
};

/**
 * Возвращает настройки для сигналов индикатора
 * @param   {Array}		settingsNames Имена возможных параметров настройки
 * @returns {Array} Массив возможных настроек сигнала индикатора. Подробнее см. getSettingsParameters
 */
TA.INDICATOR_TEMPLATE.getTradeSettingsParameters = function (settingsNames) {
	var answer = this.getSettingsParameters.apply(this, arguments);

	return answer;
};

/**
 * Базовый класс контроллера.
 */
TA.CONTROLLER_TEMPLATE = TA.BASE_TEMPLATE.Create();

/**
 * Возвращает отобранные объекты по фильтру
 * @param   {Object}	filers - Объект вида {<ИмяПараметра>: <ИмяОтбора>}
 * @returns {Array}    Отобранные объекты контроллера.
 */
TA.CONTROLLER_TEMPLATE.getByFilter = function (filers) {
	return [];
};

/**
 * Выполняет инициализацию контроллера. Надо переопределять в объекте контроллера
 * @returns {Object} - Возвращает объект контроллера.
 */
TA.CONTROLLER_TEMPLATE.init = function () {
	this.checkTicker();
	return this;
};

/**
 * Шаблон для переопределяемой функции инициации вывода графика
 * @param   {Array} 	dataShape Массив свечей котировки
 * @param   {Object} 	options   Массив настроек вывода графика
 * @param   {string} 	ticker    Тикер для которого выводится график
 * @returns {Object} ссылка на объект контроллера
 */
TA.CONTROLLER_TEMPLATE.initChart = function (dataShape, options, ticker) {
	this.checkTicker(ticker);
	return this;
};

/**
 * Хранилище текущих значений контроллера. ОБЯЗАТЕЛЬНО ТРЕБУЕТ ПЕРЕОПРЕДЕЛЕНИЯ В КОНКРЕТНОМ КОНТРОЛЛЕРЕ.
 */
TA.CONTROLLER_TEMPLATE._data = null;

/**
 * Функция получения значения хранилища.
 */
TA.CONTROLLER_TEMPLATE.__defineGetter__('data', function () {
	return this._data;
});

/**
 * Функция установки значения хранилища.
 */
TA.CONTROLLER_TEMPLATE.__defineSetter__('data', function (data) {
	return this.update(data)
});

/**
 * Функция установки значения хранилища контроллера
 * @param   {Object}	data значение, которое надо установить контроллеру.
 * @returns {Object} Объект контроллера
 */
TA.CONTROLLER_TEMPLATE.update = function (data) {
	return this;
};

/**
 * Возвращает признак - есть ли данные в контроллере.
 * @returns {Boolean} Признак - есть ли данные в контроллере.
 */
TA.CONTROLLER_TEMPLATE.isEmpty = function () {
	return !this._data.length;
};