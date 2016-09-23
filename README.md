# iguanaChart
IguanaCharts is HTML5 jQuery Stock Charts library

You can download our open source library and setup powerful stock chart just in minutes.

## Demo and docs

http://iguanacharts.com/

### Examples

```html
<div class="iChart" style="height: 550px; width: 1000px"></div>

<script type="text/javascript">
    iChartDataSource.host = "https://beta.tradernet.ru";

    $('.iChart').iguanaChart(
        {
            ticker: "AAPL.US",
            date_from: "01.01.2015",
            date_to: "01.01.2016",
            lib_path: "/scripts/iguanachart/",
            chartOptions: {
                minHeight: 500,
                uiTools: {top: true}
            },
            dataSource: $.extend(true, {}, iChartDataSource)
        }
    );
</script>
```

## Installation

Download from 

> https://github.com/iguanaChart/iguanacharts/archive/master.zip

Or  

> git clone https://github.com/iguanaChart/iguanacharts.git

 
```html
    <link rel="stylesheet" href="/iguanachart/iguanachart.min.css" media="all">
    <script type="text/javascript" src="/iguanachart/iguanachart.min.js"></script>
```

### Dependencies

- jquery ^1.0.0 -
https://code.jquery.com/jquery-3.1.0.min.js
- uikit -
https://github.com/uikit/uikit/releases/download/v2.26.4/uikit-2.26.4.zip
- jquery.event.move - https://github.com/stephband/jquery.event.move
- jquery-mousewheel - https://github.com/jquery/jquery-mousewheel
- hammerjs - http://hammerjs.github.io/dist/hammer.min.js
- jquery.hammer.js -https://github.com/hammerjs/jquery.hammer.js
- jsrender - https://www.jsviews.com/download/jsrender.min.js
- jquery-minicolors - https://github.com/claviska/jquery-minicolors


You can download all needed dependence from https://github.com/iguanaChart/dependencies/archive/master.zip

####Including dependencies example

```html
    <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.min.js"></script>

    <link rel="stylesheet" href="/dependencies/uikit/css/uikit.min.css" media="all">
    <script type="text/javascript" src="/dependencies/uikit/js/uikit.min.js"></script>

    <script type="text/javascript" src="/dependencies/jquery.event.move.js"></script>
    <script type="text/javascript" src="/dependencies/jquery.mousewheel.min.js"></script>
    <script type="text/javascript" src="/dependencies/hammer.min.js"></script>
    <script type="text/javascript" src="/dependencies/jquery.hammer.js"></script>
    <script type="text/javascript" src="/dependencies/jsrender.min.js"></script>

    <link rel="stylesheet" href="/dependencies/jquery.qtip.min.css" media="all">
    <script type="text/javascript" src="/dependencies/jquery.qtip.min.js"></script>

    <link rel="stylesheet" href="/dependencies/jquery-minicolors/jquery.minicolors.css" media="all">
    <script type="text/javascript" src="/dependencies/jquery-minicolors/jquery.minicolors.min.js"></script>


```

#### require config
```javascript
        require.config({
            paths: {
                jquery: 'https://code.jquery.com/jquery-1.12.4.min',
                uikit: '/dependencies/uikit/js/uikit.min',
                'jquery.eventmove': '/dependencies/jquery.event.move',
                'jquery.hammer': '/dependencies/jquery.hammer',
                'jsrender': "/dependencies/jsrender.min",
                'jquery.minicolors': '/dependencies/jquery-minicolors/jquery.minicolors.min',
                'jquery.qtip': '/dependencies/jquery.qtip.min',
                'iguanachart': '/dist/iguanachart',
                'hammerjs': '/dependencies/hammer.min'
            },
            shim: {
                'uikit': {
                    deps: [
                        'jquery'
                    ]
                },
                jsrender: {
                    deps: [
                        'jquery'
                    ]
                },
                iguanachart: {
                    deps: [
                        'jquery',
                        'uikit',
                        'jquery.eventmove',
                        'jquery.hammer',
                        'jsrender',
                        'jquery.minicolors',
                        'jquery.qtip'
                    ]
                }
            }
        })
```

## License

<a href ="./LICENSE">License</a>