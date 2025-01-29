/**
 * Created by gti on 29.07.16.
 */

const minify = require('@node-minify/core');
const cssnano = require('@node-minify/cssnano');
const uglifyjs = require('@node-minify/uglify-js');

minify({
    compressor: cssnano,
    input: './dist/iguanachart.css',
    output: './dist/iguanachart.min.css',
    callback: function(err, min){
        if(err) {
            console.log(err);
        } else {
            console.log("Minify css completed");
        }
    }
});

minify({
    compressor: uglifyjs,
    input: './dist/iguanachart.js',
    output: './dist/iguanachart.min.js',
    callback: function(err, min){
        if(err) {
            console.log(err);
        } else {
            console.log("Minify js completed");
        }
    }
});
