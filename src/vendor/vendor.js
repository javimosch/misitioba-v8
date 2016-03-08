
window.$ = window.jQuery = require('jquery');
window.angular = require('angular');
window.Ractive = require('./micro/reactive');
window.reqwest = require('./micro/reqwest');
window.$ = window.jQuery = require('jquery');
window._ = require('lodash');
require('./utils/snippets')(window._);
require('bootstrap');
require('angular-resource');
require('angular-messages');
require('angular-ui-router');
require('angular-ui-bootstrap');
require('api-check');
require('angular-formly');
require('angular-formly-templates-bootstrap');

//window.Parse =  require('parse');