/**
 * Created by gti on 28.06.16.
 */

$.views.settings.allowCode(true);

$.templates("iChart_mainTmpl", '' +
    '<div class="iChart-control-form" style="min-height: 200px">' +
        '<div class="js-chartContainerWrapper">' +
            '<div class="iChartToolsContainer"><div class="iChartToolsTop" style="display: none;">' +
            '</div></div>' +
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

$.templates("iChart_topToolBarTmpl", '' +

    '<div class="tm-tool-bar uk-flex uk-flex-space-between">' +
        '<div class="uk-flex uk-flex-left uk-position-relative">' +

            '<div data-uk-dropdown="" class="uk-position-relative">' +
                '<div class="tm-graph-button active uk-flex uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="">' +
                    '<i class="sprite sprite-icon-line js-chart-ui-control-state" data-property="chartType"></i>' +
                '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow">' +

                        '<div class="tm-graph-button uk-flex uk-flex-column uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17371', 'Line chart') + '">' +
                            '<i class="sprite sprite-icon-line js-chart-ui-control" data-property="chartType" data-value="Line"></i>' +
                        '</div>' +

                        '<div class="tm-graph-button uk-flex uk-flex-column uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17372', 'Candlestick chart') + '">' +
                            '<i class="sprite sprite-icon-candle js-chart-ui-control" data-property="chartType" data-value="Candlestick"></i>' +
                        '</div>' +

                        '<div class="tm-graph-button uk-flex uk-flex-column uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17373', 'Bar chart') + '">' +
                            '<i class="sprite sprite-icon-bars js-chart-ui-control" data-property="chartType" data-value="Stock"></i>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="showVolumeByPrice" data-value="false" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17374', 'Display volume horizontally') + '">' +
                '<i class="sprite sprite-icon-h-volume"></i>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="showVolume" data-value="false" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17375', 'Display volume vertically') + '">' +
                '<i class="sprite sprite-icon-v-volume"></i>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-column uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="percentMode" data-value="false" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17376', 'Relative price') + '">' +
                '<i class="sprite sprite-icon-price"></i>' +
            '</div>' +

            '<i class="sprite sprite-icon-divider"></i>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="themeConfig" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17377', 'Visual Settings') + '">' +
                '<i class="sprite sprite-icon-palette"></i>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="instrumentText" data-value="Text" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17378', 'Add Text') + '">' +
                '<i class="sprite sprite-icon-font"></i>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control js-chart-ui-control-state" data-property="instrumentText" data-value="Bubble" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17379', 'Add Tooltip') + '">' +
                '<i class="sprite sprite-icon-f-comment"></i>' +
            '</div>' +

            '<div data-uk-dropdown="" class="uk-position-relative">' +
                '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control-state" data-property="instrumentLine" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17380', 'Draw Line') + '">' +
                    '<i class="sprite sprite-icon-arrow-line"></i>' +
                '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow">' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="Arrow" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17386', 'Arrow') + '">' +
                            '<i class="sprite sprite-icon-arrow-line"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="Line" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17381', 'Free Line') + '">' +
                            '<i class="sprite sprite-icon-free-line"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="HorizontalLine" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17382', 'Horizontal line') + '">' +
                            '<i class="sprite sprite-icon-h-line"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="VerticalLine" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17383', 'Vertical line') + '">' +
                            '<i class="sprite sprite-icon-v-line"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="Channel" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17384', 'Channel') + '">' +
                            '<i class="sprite sprite-icon-channel"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentLine" data-value="Trend" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17385', 'Corner Trend') + '">' +
                            '<i class="sprite sprite-icon-angle-trend"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div data-uk-dropdown="" class="uk-position-relative">' +
                '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control-state" data-property="instrumentForm" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17387', 'Draw Form') + '">' +
                    '<i class="sprite sprite sprite-icon-f-square"></i>' +
                '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow">' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="Polygon" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17388', 'Poligon') + '">' +
                            '<i class="sprite sprite-icon-f-poligon"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="Rectangle" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17389', 'Rectangle') + '">' +
                            '<i class="sprite sprite-icon-f-square"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="Triangle" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17390', 'Triangle') + '">' +
                            '<i class="sprite sprite-icon-f-triangle"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="Ellipse" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17391', 'Ellipse') + '">' +
                            '<i class="sprite sprite-icon-f-ellipse"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="FibonacciArc" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17392', 'Fibonacci Archs') + '">' +
                            '<i class="sprite sprite-icon-f-fibonacci-arcs"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="FibonacciFan" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17393', 'Fibonacci Fan') + '">' +
                            '<i class="sprite sprite-icon-f-fibonacci-fan"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="FibonacciCorrection" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17394', 'Fibonacci Retracement') + '">' +
                            '<i class="sprite sprite-icon-f-fibonacci-correction"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="instrumentForm" data-value="HorizontalRange" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17912', 'Горизонтальный диапазон') + '">' +
                            '<i class="sprite sprite-icon-h-line-double"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div data-uk-dropdown="" class="uk-position-relative">' +
                '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="">' +
                    '<i class="sprite sprite-icon-1px js-chart-ui-control-state" data-property="lineWidthSelector"></i>' +
                '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow">' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="1" data-uk-tooltip="{pos:\'top\'}" title="Line 1px">' +
                            '<i class="sprite sprite-icon-1px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="2" data-uk-tooltip="{pos:\'top\'}" title="Line 2px">' +
                            '<i class="sprite sprite-icon-2px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="3" data-uk-tooltip="{pos:\'top\'}" title="Line 3px">' +
                            '<i class="sprite sprite-icon-3px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="4" data-uk-tooltip="{pos:\'top\'}" title="Line 4px">' +
                            '<i class="sprite sprite-icon-4px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="5" data-uk-tooltip="{pos:\'top\'}" title="Line 5px">' +
                            '<i class="sprite sprite-icon-5px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="8" data-uk-tooltip="{pos:\'top\'}" title="Line 8px">' +
                            '<i class="sprite sprite-icon-8px"></i>' +
                        '</div>' +
                        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="lineWidthSelector" data-value="10" data-uk-tooltip="{pos:\'top\'}" title="Line 10px">' +
                            '<i class="sprite sprite-icon-10px"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div data-uk-dropdown="" class="uk-position-relative js-chart-ui-control" data-property="fillStyle">' +
                '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="Fill Color">' +
                    '<div class="tm-fill-color js-chart-ui-control-state" data-property="fillStyle" style="background-color: rgba(82, 175, 201, 0.5);"></div>' +
                    '<i class="sprite sprite-icon-fill-color"></i>' +
                 '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow js-chart-ui-control-holder">' +
                        '<div class="js-colorPalette" data-option="fillStyle"></div>' +
                        '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="fillStyle" data-element="canvas" value="" size="10"/>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div data-uk-dropdown="" class="uk-position-relative js-chart-ui-control" data-property="strokeStyle">' +
                '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="Line Color">' +
                    '<div class="tm-line-color js-chart-ui-control-state" data-property="strokeStyle" style="background-color: rgb(82, 175, 201);"></div>' +
                    '<i class="sprite sprite-icon-line-color"></i>' +
                '</div>' +
                '<div class="uk-dropdown-blank" style="width: auto">' +
                    '<div class="uk-flex uk-flex-left tm-shadow js-chart-ui-control-holder">' +
                        '<div class="js-colorPalette" data-option="strokeStyle"></div>' +
                        '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="strokeStyle" data-element="canvas" value="" size="10"/>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="captureImage" data-value="" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17493', 'Screenshot') + '">' +
                '<i class="sprite sprite-icon-camera"></i>' +
            '</div>' +

            '<i class="sprite sprite-icon-divider"></i>' +

            '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="clearInstruments" data-value="" data-uk-tooltip="{pos:\'top\'}" title="' + _t('17395', 'Clear Chart') + '">' +
                '<i class="sprite sprite-icon-trash"></i>' +
            '</div>' +

        '</div>' +

        '<div class="uk-flex uk-flex-left">' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="I1" data-uk-tooltip="{pos:\'top\'}" title="1 minute > day">' +
            '<i class="sprite sprite-icon-1m"></i>' +
        '</div>' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="I5" data-uk-tooltip="{pos:\'top\'}" title="5 minutes > 3 days">' +
            '<i class="sprite sprite-icon-5m"></i>' +
        '</div>' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="I15" data-uk-tooltip="{pos:\'top\'}" title="15 minutes > week">' +
            '<i class="sprite sprite-icon-15m"></i>' +
        '</div>' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="H1" data-uk-tooltip="{pos:\'top\'}" title="Hour">' +
            '<i class="sprite sprite-icon-h"></i>' +
        '</div>' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="D1" data-uk-tooltip="{pos:\'top\'}" title="Day">' +
            '<i class="sprite sprite-icon-d"></i>' +
        '</div>' +

        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle js-chart-ui-control" data-property="dataInterval" data-value="D7" data-uk-tooltip="{pos:\'top\'}" title="Week">' +
            '<i class="sprite sprite-icon-w"></i>' +
        '</div>' +

        '<i class="sprite sprite-icon-divider"></i>' +

        '<div class="js-chart-ui-indicators"></div>' +
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
    '<ul class="uk-list uk-list-line">' +
        '{{for indicators}}' +
            '<li><a href="javascript:void(0);" onclick="return false;" class="js-add-indicator" data-value="{{:value}}">{{:value}}</a></li>' +
        '{{/for}}' +
    '</ul>'
);

$.templates("indicatorsDropdownTmpl",

    '<div class="js-iChartTools-indicators uk-button-dropdown" data-uk-dropdown="{mode:\'click\', pos:\'bottom-right\'}" class="uk-position-relative">' +
        '<div class="tm-graph-button uk-flex uk-flex-center uk-flex-middle" data-uk-tooltip="{pos:\'top\'}" title="Add Indicator" style="min-width: 100px">' +
            '<i class="sprite sprite-icon-text-indicators"></i>' +
        '</div>' +
        '<div class="uk-dropdown uk-dropdown-bottom uk-dropdown-scrollable" style="top: 30px; left: 0px;">' +
            '<div class="tm-shadow">' +
                '<div class="uk-panel js-iChartTools-indicators-current">' +
                    '{{include tmpl="indicatorsCurrentTmpl"/}}' +
                '</div>' +
                '<div class="js-iChartTools-indicators-list">' +
                    '{{include tmpl="indicatorsListTmpl"/}}' +
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

$.templates("captureDialogTmpl", '' +
    '<div class="iChartDialog" style="display: none;">' +
        '<img class="js-iChartTools-capture"/>' +
        '<div class="uk-flex uk-flex-right">' +
            '<a  href="javascript:void(0);" onclick="$.modal.impl.close(); return false;" class="uk-button js-set-params-indicator">Ok</a>' +
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

$.templates("iChart_intervalsTmpl", '' +
    '<div class="uk-margin-small-left js-iChartTools-intervals" style="display: inline-block">' +
        '{{for intervals}}' +
        '<a class="uk-button js-chart-interval" href="javascript:void(0);" onclick="return false;" data-value="{{:value}}">{{:name}}</a>' +
        '{{/for}}' +
    '</div>'
);

$.templates("iChart_textPopupSettingsTmpl", '' +
    '<div class="uk-margin-small-left js-iChartTools-textPopupSettings" style="display: none;">' +
        '<div style="">' +
            '<div class="uk-grid uk-grid-small">' +

                '<div class="uk-width-1-5">' +
                    '<div class="uk-form-select" data-uk-form-select>' +
                        '<span>' + _t('17600', 'Size') + '</span>' +
                        '<select name="fontSize">' +
                            '{{for options.sizes}}' +
                            '<option value="{{:value}}" {{if value == ~root.values.fontSize}} selected {{/if}}>{{:name}}</option>' +
                            '{{/for}}' +
                        '</select>' +
                    '</div>' +
                '</div>' +

                '<div class="uk-width-2-5">' +
                    '<div class="uk-form-select" data-uk-form-select>' +
                        '<span>' + _t('17601', 'Font') + '</span>' +
                        '<select name="fontFamaly">' +
                            '{{for options.fonts}}' +
                            '<option value="{{:value}}" {{if value == ~root.values.fontFamaly}} selected {{/if}}>{{:name}}</option>' +
                            '{{/for}}' +
                        '</select>' +
                    '</div>' +
                '</div>' +

                '<div class="uk-width-2-5">' +
                    '<div class="js-colorSelector" data-option="fontColor" style="background-color: {{: values.fontColor }}">' +
                        '<div class="menuHolder" style="display: none; padding: 10px;">' +
                            '<div class="js-colorPalette" data-option="backgroundColor"></div>' +
                            '<input type="hidden" class="js-colorPicker" data-opacity="1.0" data-option="fontColor" data-element="canvas" value="{{: values.fontColor }}" size="10"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="uk-width-1-1">' +
                    '<textarea name="text" style="width: 100%; height: 150px;">{{:values.text}}</textarea>' +
                '</div>' +

                '<div class="uk-width-1-1 uk-text-right">' +
                    '<button class="uk-button  uk-button-primary js-textPopupSettings" data-value="ok">' + _t('3920', "OK") + '</button>' +
                    '<button class="uk-button js-textPopupSettings" data-value="cancel">' + _t('1403', 'Отмена') + '</button> ' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>'
);

