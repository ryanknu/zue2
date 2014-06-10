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

String.prototype.pad = function(len, chr)
{
    var pad_len = len - this.length + 1;
    if ( pad_len > 0 ) {
        return Array(pad_len).join(chr) + this;
    }
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

ZueCore.prototype.log = function(msg)
{
    if ( !this.start ) {
        this.start = Date.now();
    }
    
    if ( $(this.log_target).length ) {
        $(this.log_target).prepend($('<div/>').text(
            (this.triggers++).toString().pad(3, '0') +
            ' (T+' +
            (Date.now() - this.start).toString().pad(6, '0') + 
            ') ' + 
            msg)
        );
    }
}

ZueCore.prototype.attach = function(module, o)
{
    this.modules[module] = o(this);
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

ZueCore.prototype.triggerEvent = function(event, argument, object)
{
    this.log('event: ' + event + ' Arg: ' + JSON.stringify(argument));
    this.IEventManager.trigger(event, argument, object);
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

window.zue = new ZueCore(new ZueAjax(), new ZueEventManager());
