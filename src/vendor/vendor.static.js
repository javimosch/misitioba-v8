
window.$ = window.jQuery = require('jquery');
//window.Parse =  require('parse');
window._ = require('lodash');
require('./utils/snippets')(window._);

window.Ractive = require('./micro/reactive');

//require('bootstrap');

console.info('vendor.static');