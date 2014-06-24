/**
 *  zzzzzzzzzzuuu    uuueeeeeeeeee
 *  ZZZZZZZZZZUUU    UUUEEEEEEEEEE
 *       ZZZ  UUU    UUUEEE
 *      ZZZ   UUU    UUUEEEeeeeeee
 *     ZZZ    UUU    UUUEEEEEEEEEE
 *    ZZZ     UUU    UUUEEE
 *  ZZZZzzzzzzUUUuuuuUUUEEEeeeeeee
 *  ZZZZZZZZZZ UUUUUUUU EEEEEEEEEE
 *
 *  Zue Core -- Ryan Knuesel -- 2014
 *
 */

var HUE_ERROR = 'core.hue_error';
var ERR_UNAUTHORIZED = 1;
var ERR_LINK_BUTTON_NOT_PRESSED = 101;

var LIGHT_ADDED = 'lights.light_added';
var LIGHT_UPDATING = 'lights.light_updating';
var LIGHT_UPDATED = 'lights.light_updated';
var GROUP_ADDED = 'groups.group_added';
var GROUP_LIGHT_ADDED = 'groups.light_added';
var GROUP_UPDATING = 'groups.group_updating';
var GROUP_UPDATED = 'groups.group_updated';
var SCHEDULE_ADDED = 'schedules.schedule_added';
var BRIDGE_FOUND = 'bridge.bridge_found';
var NO_BRIDGE_FOUND = 'bridge.no_bridge_found';
var LINK_SUCCESS = 'config.link_success';
var LINK_FAILURE = 'config.link_failure';
var LINK_BEGIN = 'config.link_begin';
var LINKED = 'config.linked';

function _Z(deps, cb) {
    var args = [];
    for ( var i = 0; i < deps.length; i++ ) {
        args.push(zue.di[deps[i]]);
    }
    cb.apply(null, args);
}

var detectArray = function(o) {
    if ( o !== undefined && !!o.shift ) {
        return true;
    }

    // RK: we now need to try to detect 1-based arrays, which is irritating.
    if ( typeof o !== 'object' ) {
        return false;
    }

    var any_keys = false;
    for( var y in o) {
        if ( o.hasOwnProperty(y) ) {
            any_keys = true;
            if ( isNaN(parseInt(y, 10)) ) {
                return false;
            }
        }
    }
    return any_keys;
}

;(function() {
    'use strict';

String.prototype.pad = function(len, chr)
{
    var pad_len = len - this.length + 1;
    if ( pad_len > 0 ) {
        return Array(pad_len).join(chr) + this;
    }
}
/*
Function.prototype.method = function(name, func)
{
    this.prototype[name] = func;
    return this;
}

Function.method('curry', function() {
    var slice = Array.prototype.slice,
        args = arguments,
        that = this;
    return function() {
        that.apply(null, args.concat(slice.apply(arguments)));
    };
});
*/


function ZueCore(IAjax, IEventManager)
{
    this.modules = {};
    this.plugins = {};
    this.IAjax = IAjax;
    this.IAjax.setEventManager(IEventManager);
    this.IEventManager = IEventManager;
    this.log_target = '#zue-debug';
    this.triggers = 0;
    this.start = 0;
}

var log = function(msg)
{
    if ( !start ) {
        start = Date.now();
    }

    if ( $(log_target).length ) {
        $(log_target).prepend($('<div/>').text(
            (triggers++).toString().pad(3, '0') +
            ' (T+' +
            (Date.now() - start).toString().pad(6, '0') +
            ') ' +
            msg)
        );
    }
}

ZueCore.prototype.attach = function(module, o)
{
    this.modules[module] = o;
    this[module] = this.modules[module];
}

ZueCore.prototype.enablePlugin = function(name)
{
    this.plugins[name].start(this);
}

ZueCore.prototype.registerPlugin = function(name, plugin)
{
    this.plugins[name] = plugin;
}

var triggerEvent = function(event, argument, object) {
    log('event: ' + event + ' Arg: ' + JSON.stringify(argument));
    ieventmanager.trigger(event, argument, object);
}

ZueCore.prototype.listenFor = function(event, listener, object)
{
    this.IEventManager.attach(event, listener, object);
}

ZueCore.prototype.on = function(event, listener, object)
{
    this.listenFor(event, listener, object);
}

ZueCore.prototype.ajaxExec = function(options)
{
    this.log('ajax:  ' + (options.method || 'get') + ' ' + options.url);
    this.IAjax.exec(options);
}

var iajax = new ZueAjax(),
    ieventmanager = new ZueEventManager(),
    log_target = '#zue-debug',
    triggers = 0,
    start = 0,
    modules = [],
    plugins = {};

var register = function(module, o) {
    modules.push(module);
    zue.di[module] = o;
//    zue[module] = o; // legacy!
}

var registerPlugin = function(name, cb) {
    plugins[name] = cb;
}

var enablePlugin = function(name) {
    plugins[name]();
}

var listenFor = function(event, listener, object) {
    ieventmanager.attach(event, listener, object);
}

var ajaxExec = function(options) {
    log('ajax:  ' + (options.method || 'get') + ' ' + options.url);
    iajax.exec(options);
}

iajax.setEventManager(ieventmanager);

var _core = {
    di: {},

    // methods (?)
    register: register,
    triggerEvent: triggerEvent,
    listenFor: listenFor,
    on: listenFor,
    ajaxExec: ajaxExec,
    registerPlugin: registerPlugin,
    enablePlugin: enablePlugin
}//new ZueCore(new ZueAjax(), new ZueEventManager());

_core.di.core = window.zue = _core;

})();
