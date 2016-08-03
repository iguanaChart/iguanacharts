/**
 * Created by gti on 28.06.16.
 */

$.views.settings.allowCode(true);

$.templates("iChart_mainTmpl", '' +
    '<div class="iChart-control-form" style="min-height: 200px">' +
        '<div class="js-chartContainerWrapper">' +
            '<div class="iChartToolsContainer" style="margin-bottom: 5px"><div class="iChartToolsTop" style="display: none;"></div></div>' +
            '<div id="{{:id}}" class="m-chart-container" style="height: 100%;">' +
            '</div>' +
        '</div>' +
        '<div data-uk-modal="{center:true}" class="uk-modal iChart-form-simple-v js-chartTADialog uk-padding-remove {{:name}}" id="iChart-tech-analysis-dialog" style="display: none;">' +
            '<div class="uk-modal-dialog">' +
                '<a class="uk-modal-close uk-close"></a>' +
                '<div class="uk-modal-header">' + _t('3101', "Индикаторы") + '</div>' +
                '<div class="js-chartTADialogContainer"></div>' +
                '<div class="uk-modal-footer">' +
                    '<div class="uk-flex uk-flex-middle uk-flex-space-between tm-pad-large">' +
                        '<div class="js-indicator-add md-btn md-btn-small md-btn-success">' +
                            _t('15460', 'Добавить индикатор') +
                        '</div>' +
                    '<div class="md-btn-group"><a class="md-btn md-btn-small md-btn-primary indicators-set" href="#">' + _t('532', 'Применить') + '</a>' +
                        '<a class="md-btn md-btn-small indicators-default" href="#">' + _t('15461', 'Для всех') + '</a>' +
                        '<a class="md-btn md-btn-small indicators-close" href="#">' + _t('1403', "Отмена") + '</a></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="chart-loader-wrapper" style="top: 0; width: 100%; height: 100%;"><div class="chart-loader"></div></div>' +
    '</div>'
);

$.templates("indicatorsCurrentTmpl", '' +
    '{{for userData}}' +
    '<div>' +
        '<span>{{:name}}</span> ' +
        '<span>' +
            '{{if params}}' +
            '{{* window.i=0;}}' +
            '(' +
            '{{props params}}' +
                '{{* if (i>0) { }}, {{* } }}{{>prop}}' +
                '{{* i++;}}' +
            '{{/props}}' +
            ')' +
            '{{/if}}' +
        '</span>' +
        '<span>' +
            '<a href="javascript:void(0);" onclick="return false;" data-index="{{:#index}}" class="js-edit-indicator uk-icon-cog uk-margin-left"></a>' +
            '<a href="javascript:void(0);" onclick="return false;" data-index="{{:#index}}" class="js-remove-indicator uk-icon-close uk-margin-left"></a>' +
        '</span>' +
    '</div>' +
    '{{/for}}'
);

$.templates("indicatorsListTmpl", '' +
    '<ul class="uk-nav uk-nav-dropdown">' +
        '<li class="uk-nav-divider"></li>' +
        '{{for indicators}}' +
            '<li><a href="javascript:void(0);" onclick="return false;" class="js-add-indicator" data-value="{{:value}}">{{:value}}</a></li>' +
        '{{/for}}' +
    '</ul>'
);

$.templates("indicatorsDropdownTmpl",
    '<div class="js-iChartTools-indicators uk-button-dropdown" data-uk-dropdown="{mode:\'click\'}">' +
        '<button class="uk-button uk-margin-small-left">' + _t('3101', 'Индикаторы') + '<i class="uk-icon-caret-down uk-margin-small-left"></i></button>' +
        '<div class="uk-dropdown uk-dropdown-bottom uk-dropdown-scrollable" style="top: 30px; left: 0px;">' +
            '<div class="uk-grid uk-dropdown-grid">' +
                '<div class="uk-width-1-1">' +
                    '<div class="uk-panel js-iChartTools-indicators-current">' +
                        '{{include tmpl="indicatorsCurrentTmpl"/}}' +
                    '</div>' +
                    '<div class="js-iChartTools-indicators-list">' +
                        '{{include tmpl="indicatorsListTmpl"/}}' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>'
);

$.templates("indicatorDialogTmpl", '' +
    '<div class="iChartDialog" style="display: none; width: 300px;">' +
        '<div> {{:name}} </div>' +
        '<div class="js-iChartTools-indicators-params">' +
            '{{for parameters}}' +
                '<div>{{:Name}} <input type="text" name="{{:Code}}" value="{{:Value}}" /></div>' +
            '{{/for}}' +
        '</div>' +
        '<div class="js-iChartTools-indicators-colorContainer"></div>' +
        '<div class="js-iChartTools-indicators-widthContainer"></div>' +
        '<div>' +
            '<a  href="javascript:void(0);" onclick="return false;" class="uk-button js-set-params-indicator">Ok</a>' +
            '<a  href="javascript:void(0);" onclick="$.modal.impl.close(); return false;" class="uk-button">Cancel</a>' +
        '</div>' +
    '</div>'
);

$.templates("themeConfigSelectorTmpl", '' +
    '<div class="uk-button-dropdown" data-uk-dropdown="{mode:\'click\'}" aria-haspopup="true" aria-expanded="false">' +
        '<button class="uk-button uk-button-success">' + _t('13663', 'Темы') + ' <i class="uk-icon-caret-down"></i></button>' +
        '<div class="uk-dropdown uk-dropdown-up uk-dropdown-small uk-dropdown-scrollable">' +
            '<ul class="uk-nav uk-nav-dropdown">' +
                '{{for themes}}' +
                '<li><a href="#" class="js-themeSelect" data-theme="{{: name }}">{{: name }}' +
                    '{{if custom}}' +
                    '<span class="js-themeDelete uk-icon-trash-o uk-margin-small-left uk-badge uk-badge-warning uk-panel-hover uk-float-right" data-name="{{: name }}" title="' + _t('4023', 'Удалить') + '"></span>' +
                    '{{/if}}' +
                    '</a>' +
                '</li>' +
                '{{/for}}' +
                '<li class="uk-nav-divider"></li>' +
                '<li><a href="#" class="js-themeSaveAs">' + _t('13664', 'Сохранить как') + '</a></li>' +
            '</ul>' +
        '</div>' +
    '</div>'
);

$.templates("themeConfigTmpl", '' +
    '<div class="js-themeConfig" style="display: none">' +
        '<div class="js-themeConfigOptions"></div>' +
        '<div class="uk-grid uk-grid-small">' +
            '<div class="uk-width-1-1">' +
                '<div class="js-themeConfigSelector"></div>' +
            '</div>' +
        '</div>' +
        '<hr class="uk-grid-divider" style="margin: 15px 0">' +
        '<div class="uk-grid uk-grid-small">' +
            '<div class="uk-width-7-10 js-themeAdditionButtons">' +
            '</div>' +
            '<div class="uk-width-3-10 uk-text-right">' +
                '<button class="uk-button js-chartOptions" data-value="cancel">' + _t('1403', 'Отмена') + '</button> ' +
                '<button class="uk-button  uk-button-primary js-chartOptions" data-value="ok">' + _t('3920', "OK") + '</button>' +
            '</div>' +
        '</div>' +
    '</div>'
);

$.templates("themeConfigOptionsTmpl", '' +
    '<div class="uk-grid">' +
        '<div class="uk-width-1-2">' +
            '<div class="uk-grid">' +
                '<div class="uk-width-3-4">' +
                    _t('13643', 'Фон') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="backgroundColor" style="background-color: {{: chartOptions.backgroundColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="backgroundColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="backgroundColor" data-element="canvas" value="{{: chartOptions.backgroundColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13644', 'Линии осей') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-checkbox" data-option="showAxes">' +
                        '<input type="checkbox" class="js-flag" data-option="showAxes" {{if chartOptions.showAxes}}checked="checked"{{/if}}/>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13645', 'Цвет осей') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="axisColor" style="background-color: {{: chartOptions.axisColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="axisColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="axisColor" data-element="canvas" value="{{: chartOptions.axisColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13646', 'Цвет меток') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="labelColor" style="background-color: {{: chartOptions.labelColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="labelColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="labelColor" data-element="canvas" value="{{: chartOptions.labelColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13647', 'Цвет сетки') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="gridColor" style="background-color: {{: chartOptions.gridColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="gridColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="gridColor" data-element="canvas" value="{{: chartOptions.gridColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13648', 'Цвет текста подложки') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="watermarkColor" style="background-color: {{: chartOptions.watermarkColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="watermarkColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="watermarkColor" data-element="canvas" value="{{: chartOptions.watermarkColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13649', 'Цвет области') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="areaColor" style="background-color: {{: chartOptions.areaColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="areaColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="areaColor" data-element="canvas" value="{{: chartOptions.areaColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13650', 'Цвет границы области') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="areaLineColor" style="background-color: {{: chartOptions.areaLineColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="areaLineColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="areaLineColor" data-element="canvas" value="{{: chartOptions.areaLineColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13651', 'Цвет объемов') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="volumeStyle" style="background-color: {{: chartOptions.volumeStyle }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="volumeStyle"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="volumeStyle" data-element="canvas" value="{{: chartOptions.volumeStyle }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13652', 'Цвет фона скроллера') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="scrollerOverlayColor" style="background-color: {{: chartOptions.scrollerOverlayColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="scrollerOverlayColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="scrollerOverlayColor" data-element="canvas" value="{{: chartOptions.scrollerOverlayColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13653', 'Цвет скроллера') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="scrollerHandlerColor" style="background-color: {{: chartOptions.scrollerHandlerColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                        '<div class="js-colorPalette" data-option="scrollerHandlerColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="scrollerHandlerColor" data-element="canvas" value="{{: chartOptions.scrollerHandlerColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('15810', 'Цвет теней') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="shadowColor" style="background-color: {{: chartOptions.shadowColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="shadowColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="shadowColor" data-element="canvas" value="{{: chartOptions.shadowColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="uk-width-1-2">' +
            '<div class="uk-grid">' +
                '<div class="uk-width-3-4">' +
                    _t('3103', 'Свеча вверх') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="candleUp" style="background-color: {{: chartOptions.candleUp }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="candleUp"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="candleUp" data-element="canvas" value="{{: chartOptions.candleUp }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('3104', 'Свеча вниз') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="candleDown" style="background-color: {{: chartOptions.candleDown }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="candleDown"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="candleDown" data-element="canvas" value="{{: chartOptions.candleDown }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13654', 'Обводка свечи') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-checkbox" data-option="candleBorder">' +
                        '<input type="checkbox" class="js-flag" data-option="candleBorder" {{if chartOptions.candleBorder}}checked="checked"{{/if}}/>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13655', 'Обводка свечи вверх') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="candleBorderUp" style="background-color: {{: chartOptions.candleBorderUp }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="candleBorderUp"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="candleBorderUp" data-element="canvas" value="{{: chartOptions.candleBorderUp }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13656', 'Обводка свечи вниз') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="candleBorderDown" style="background-color: {{: chartOptions.candleBorderDown }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="candleBorderDown"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="candleBorderDown" data-element="canvas" value="{{: chartOptions.candleBorderDown }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13657', 'Тень свечи') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-checkbox" data-option="candleWick">' +
                        '<input type="checkbox" class="js-flag" data-option="candleWick" {{if chartOptions.candleWick}}checked="checked"{{/if}}/>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13658', 'Цвет тени свечи') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="candleWickStyle" style="background-color: {{: chartOptions.candleWickStyle }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="candleWickStyle"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="candleWickStyle" data-element="canvas" value="{{: chartOptions.candleWickStyle }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13659', 'Бар вверх') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="stockUp" style="background-color: {{: chartOptions.stockUp }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="stockUp"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="stockUp" data-element="canvas" value="{{: chartOptions.stockUp }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13660', 'Бар вниз') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="stockDown" style="background-color: {{: chartOptions.stockDown }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="stockDown"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="stockDown" data-element="canvas" value="{{: chartOptions.stockDown }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13661', 'Толщина бара') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-widthSlector" data-option="stockWidth">' +
                        '<div class="js-widthSlectorValue lineWidth" data-option="stockWidth" data-style="{{: chartOptions.stockWidth }}"></div>' +
                            '<div class="menuHolder" style="display: none; padding: 10px;">' +
                                '<div class="js-widthSlectorWrapper" data-option="stockWidth" value="{{: chartOptions.stockWidth }}">' +
                                    '<span class="lineWidth js-lineWidth" data-style="1"></span>' +
                                    '<span class="lineWidth js-lineWidth" data-style="2"></span>' +
                                    '<span class="lineWidth js-lineWidth" data-style="3"></span>' +
                                    '<span class="lineWidth js-lineWidth" data-style="4"></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('1365', 'Линия') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-colorSelector" data-option="lineColor" style="background-color: {{: chartOptions.lineColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="lineColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="lineColor" data-element="canvas" value="{{: chartOptions.lineColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="uk-width-3-4">' +
                    _t('13662', 'Толщина линии') +
                '</div>' +
                '<div class="uk-width-1-4">' +
                    '<div class="js-widthSlector" data-option="lineWidth">' +
                        '<div class="js-widthSlectorValue lineWidth" data-option="lineWidth" data-style="{{: chartOptions.lineWidth }}"></div>' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-widthSlectorWrapper" data-option="lineWidth" value="{{: chartOptions.lineWidth }}">' +
                                '<span class="lineWidth js-lineWidth" data-style="1"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="2"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="3"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="4"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="5"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="8"></span>' +
                                '<span class="lineWidth js-lineWidth" data-style="10"></span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>'
);

$.templates("iChart_optionsTmpl",
    '<div class="js-iChartTools-options uk-button-dropdown" data-uk-dropdown="{mode:\'click\'}">' +
        '<button class="uk-button uk-margin-small-left">' + _t('', 'Настройки') + '<i class="uk-icon-caret-down uk-margin-small-left"></i></button>' +
        '<div class="uk-dropdown uk-dropdown-bottom" style="top: 30px; left: 0px;">' +
            '<div class="js-iChartTools-optionsList">' +
                '<ul class="uk-nav uk-nav-dropdown">' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-chartType" data-value="Candlestick">' + _t('1366', 'Свечи') +' <i class="uk-float-right {{if chartType == "Candlestick"}}uk-icon-circle{{else}}uk-icon-circle-o{{/if}}"></i></a></li>' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-chartType" data-value="Line">' + _t('1365', 'Линия') + ' <i class="uk-float-right  {{if chartType == "Line"}}uk-icon-circle{{else}}uk-icon-circle-o{{/if}}"></i></a></li>' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-chartType" data-value="Stock">' + _t('1367', 'Бары') + ' <i class="uk-float-right  {{if chartType == "Stock"}}uk-icon-circle{{else}}uk-icon-circle-o{{/if}}"></i></a></li>' +
                    '<li class="uk-nav-divider"></li>' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-percentMode">' + _t('2995', 'Относительная цена') + ' <i class="uk-float-right  {{if percentMode}}uk-icon-toggle-on{{else}}uk-icon-toggle-off{{/if}}"></i></a></li>' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-volumeByPrice">' + _t('', 'V по горизонтали') + ' <i class="uk-float-right  {{if showVolumeByPrice}}uk-icon-toggle-on{{else}}uk-icon-toggle-off{{/if}}"></i></a></li>' +
                    '<li><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-volumeByDate">' + _t('', 'V по вертикали') + ' <i class="uk-float-right  {{if showVolume=="inside" || showVolume == "outside"}}uk-icon-toggle-on{{else}}uk-icon-toggle-off{{/if}}"></i></a></li>' +
                    '<li class="uk-nav-divider"></li>' +
                    '<li class="uk-dropdown-close"><a href="javascript:void(0);" onclick="return false;" class="js-iChartTools-themeDialog" data-value="">' + _t('', 'Визуальные настройки') + '</a></li>' +
                '</ul>' +
            '</div>' +
        '</div>' +
    '</div>'
);

$.templates("iChart_instrumentsTmpl",
    '<div class="js-iChartTools-instruments uk-button-dropdown" data-uk-dropdown="{mode:\'click\'}">' +
        '<button class="uk-button uk-margin-small-left">' + _t('', 'Рисование') + '<i class="uk-icon-caret-down uk-margin-small-left"></i></button>' +
        '<div class="uk-dropdown uk-dropdown-bottom" style="top: 30px; left: 0px;">' +
            '<div class="js-iChartTools-instrumentsList">' +
                '<div class="js-colorSelector" data-option="fillStyle" style="background-color: #778899" data-title="' + _t('3014', 'Цвет заливки') + '">' +
                    '<div class="menuHolder" style="display: none; padding: 10px;">' +
                        '<div class="js-colorPalette" data-option="fillStyle"></div>' +
                        '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="fillStyle" data-element="canvas" value="#778899" size="10"/>' +
                    '</div>' +
                '</div>' +
                ' ' +
                '<div class="js-colorSelector" data-option="strokeStyle" style="background-color: #778899" data-title="' + _t('3016', 'Цвет линий') + '">' +
                    '<div class="menuHolder" style="display: none; padding: 10px;">' +
                        '<div class="js-colorPalette" data-option="strokeStyle"></div>' +
                        '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="strokeStyle" data-element="canvas" value="#778899" size="10"/>' +
                    '</div>' +
                '</div>' +
                ' ' +
                '<div class="js-colorSelector" data-option="fontSettingsColor" style="background-color: #778899" data-title="' + _t('', 'Цвет текста') + '">' +
                    '<div class="menuHolder" style="display: none; padding: 10px;">' +
                        '<div class="js-colorPalette" data-option="fontSettingsColor"></div>' +
                        '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="fontSettingsColor" data-element="canvas" value="#778899" size="10"/>' +
                    '</div>' +
                '</div>' +
                ' ' +
                '<div class="js-lineWidthSelector" data-option="fontSettingsColor" data-title="' + _t('3017', 'Толщина линий') + '">' +
                    '<span class="lineWidth js-currentLineWidth" data-style="1"></span>' +
                    '<div class="menuHolder" style="display: none">' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="1" title="' + _t('3901', '1px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="2" title="' + _t('3902', '2px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="3" title="' + _t('3903', '3px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="4" title="' + _t('3904', '4px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="5" title="' + _t('3905', '5px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="8" title="' + _t('3906', '8px') + '"></span>' +
                        '<span class="lineWidth" data-option="fontSettingsColor" data-style="10" title="' + _t('3907', '10px') + '"></span>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<ul class="uk-nav uk-nav-dropdown">' +
                        '<li class="uk-nav-divider"></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Line">' + _t('51', 'Свободная линия') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="HorizontalLine">' + _t('52', 'Горизонтальная линия') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="VerticalLine">' + _t('53', 'Вертикальная линия') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Channel">' + _t('54', 'Канал') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Trend">' + _t('55', 'Угловой тренд') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Arrow">' + _t('62', 'Стрелка') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-nav-divider"></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Polygon">' + _t('3012', 'Полигон') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Rectangle">' + _t('3013', 'Прямоугольник') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Triangle">' + _t('56', 'Треугольник') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Ellipse">' + _t('58', 'Эллипс') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="FibonacciArc">' + _t('59', 'Арки Фибоначчи') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="FibonacciFan">' + _t('60', 'Веер Фибоначчи') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="FibonacciCorrection">' + _t('61', 'Коррекция Фибоначчи') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-nav-divider"></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Text">' + _t('64', 'Вставить текст') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-instrument" data-instrument="Bubble">' + _t('3008', 'Текст c указателем') +' <i class="uk-float-right"></i></a></li>' +
                        '<li class="uk-nav-divider"></li>' +
                        '<li class="uk-dropdown-close"><a href="javascript:void(0);" class="js-iChartTools-removeInstrument">' + _t('15227', 'Очистить график') +' <i class="uk-float-right"></i></a></li>' +
                    '</ul>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>'
);

$.templates("iChart_intervalsTmpl2", '' +
    '<div class="js-iChartTools-intervals uk-button-dropdown" data-uk-dropdown="{mode:\'click\'}">' +
        '<button class="uk-button">' + _t('5421', 'Интервал') + '<i class="uk-icon-caret-down"></i></button>' +
        '<div class="uk-dropdown uk-dropdown-bottom uk-dropdown-scrollable" style="top: 30px; left: 0px;">' +
            '<ul class="uk-nav uk-nav-dropdown js-chart-intervals">' +
                '{{for intervals}}' +
                '<li><a href="javascript:void(0);" onclick="return false;" data-value="{{:value}}">{{:name}}</a></li>' +
                '{{/for}}' +
            '</ul>' +
        '</div>' +
    '</div>'
);

$.templates("iChart_intervalsTmpl", '' +
    '<div class="uk-margin-small-left js-iChartTools-intervals" style="display: inline-block">' +
                '{{for intervals}}' +
                '<a class="uk-button js-chart-interval" href="javascript:void(0);" onclick="return false;" data-value="{{:value}}">{{:name}}</a>' +
                '{{/for}}' +
    '</div>'
);

