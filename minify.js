/**
 * Created by gti on 29.07.16.
 */

var compressor = require('node-minify');

new compressor.minify({
    type: 'yui-css',
    fileIn: './dist/iguanachart.css',
    fileOut: './dist/iguanachart.min.css',
    callback: function(err, min){
        if(err) {
            console.log(err);
        } else {
            console.log("Minify css completed");
        }
    }
});

new compressor.minify({
    type: 'uglifyjs',
    fileIn: './dist/iguanachart.js',
    fileOut: './dist/iguanachart.min.js',
    callback: function(err, min){
        if(err) {
            console.log(err);
        } else {
            console.log("Minify js completed");
        }
    }
});
