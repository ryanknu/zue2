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


(function() {
    'use strict';
    
    var bridge;
    var user;
    var HUE_ERROR = 'core.hue_error';
    var ERR_UNAUTHORIZED = 1;
    var ERR_LINK_BUTTON_NOT_PRESSED = 101;
    var triggers = 0;
    
    var log = function(msg) {
        if ( $('#zue-debug').length ) {
            $('#zue-debug').prepend($('<div/>').text( triggers++ + ' ' + msg));
        }
    };
    
    var em = {
        o: {},
        attach: function(event, callback) {
            if ( this.o[event] === undefined ) {
                this.o[event] = [];
            }
            this.o[event].push(callback);
        },
        trigger: function(event, argument) {
            log('event: ' + event + ' Arg: ' + JSON.stringify(argument));
            if ( detectArray(this.o[event]) ) {
                for ( var i = 0; i < this.o[event].length; i++ ) {
                    this.o[event][i](argument);
                }
            }
        }
    };
    
    var ajax = {
        _defaults: {
            method:'get',
            data: '',
            url: undefined,
            model: undefined,
            success: function() {},
            failure: function() {}
        },
        
        exec: function(_options) {
            var options = $.extend( {}, this._defaults, _options );
            log('ajax:  ' + options.method + ' ' + options.url);
            var ajaxOptions = {
                type: options.method,
                url: options.url,
                success: function(data) {
                    if ( detectArray(data) ) {
                        if ( data.length == 0 ) {
                            em.trigger(HUE_ERROR, { type: 10001, description: 'empty result set' });
                        }
                        for ( var i in data ) {
                            if ( data.hasOwnProperty(i) ) {
                                data[i]._i = i;
                                if ( 'error' in data[i] ) {
                                    em.trigger(HUE_ERROR, data[i].error);
                                    options.failure();
                                }
                                else {
                                    var _o = $.extend(true, {}, options.model);
                                    _o.exchangeData(data[i]);
                                    options.success(_o);
                                }
                            }
                        }
                    }
                    else if ( typeof data === 'object' ) {
                        if ( 'error' in data ) {
                            em.trigger(HUE_ERROR, data.error);
                        }
                        else {
                            options.model.exchangeData(data);
                            options.success(options.model);
                        }
                    }
                    else {
                        throw '`data` is not something I can work with';
                    }
                },
                error: function() {
                    em.trigger(HUE_ERROR, { type: 10000, description: 'no/bad response from server' });
                    options.failure();
                }
            };
            if ( options.method == 'post' || options.method == 'put' ) {
                ajaxOptions.data = JSON.stringify(options.data);
            }
            $.ajax(ajaxOptions);
        },
        
        post: function(url, data, obj, success, failure) {
            $.post(url, JSON.stringify(data), function(data) {
                if ( detectArray(data) ) {
                    if ( data.length == 0 ) {
                        em.trigger(HUE_ERROR, { type: 10001, description: 'empty result set' });
                    }
                    for ( var i in data ) {
                        if ( data.hasOwnProperty(i) ) {
                            data[i]._i = i;
                            if ( 'error' in data[i] ) {
                                em.trigger(HUE_ERROR, data[i].error);
                            }
                            else {
                                var _o = $.extend(true, {}, obj);
                                _o.exchangeData(data[i]);
                                success(_o);
                            }
                        }
                    }
                }
                else if ( typeof data === 'object' ) {
                    if ( 'error' in data ) {
                        em.trigger(HUE_ERROR, data.error);
                    }
                    else {
                        obj.exchangeData(data);
                        success(obj);
                    }
                }
                else {
                    throw '`data` is not something I can work with';
                }
            })
            .error(function() {
                em.trigger(HUE_ERROR, { type: 10000, description: 'no response from server' });
            });;
        },
        
        get: function(url, obj, success, failure) {
            $.get(url, function(data) {
                if ( detectArray(data) ) {
                    if ( data.length == 0 ) {
                        em.trigger(HUE_ERROR, { type: 10001, description: 'empty result set' });
                    }
                    for ( var i in data ) {
                        if ( data.hasOwnProperty(i) ) {
                            data[i]._i = i;
                            if ( 'error' in data[i] ) {
                                em.trigger(HUE_ERROR, data[i].error);
                            }
                            else {
                                var _o = $.extend(true, {}, obj);
                                _o.exchangeData(data[i]);
                                success(_o);
                            }
                        }
                    }
                }
                else if ( typeof data === 'object' ) {
                    if ( 'error' in data ) {
                        em.trigger(HUE_ERROR, data.error);
                    }
                    else {
                        obj.exchangeData(data);
                        success(obj);
                    }
                }
                else {
                    throw '`data` is not something I can work with';
                }
            })
            .error(function() {
                em.trigger(HUE_ERROR, { type: 10000, description: 'no response from server' });
            });
        }
    };
    
    var detectArray = function(o) {
        // return o !== undefined && !!o.shift;
        // RK: we need to detect 1-based arrays, which is irritating. 
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
    
    var attach = function(module, o) {
        if ( module === 'core' ) {
            throw 'Cannot extend or modify zue core';
        }
        window.zue[module] = o(ajax, em);
    }
    
    var getVersion = function() {
        return 'zue_0_2';
    }
    
    var getHueUser = function() {
        return user;
    }
    
    var setHueUser = function(_user) {
        user = _user;
    }
    
    var setBridge = function(_bridge) {
        bridge = _bridge;
    }
    
    var getBridge = function() {
        return bridge;
    }
    
    var listenFor = function(event, listener) {
        em.attach(event, listener);
    }
    
    window.zue = {
        core: {
            attach: attach,
            getVersion: getVersion,
            listenFor: listenFor,
            setBridge: setBridge,
            getBridge: getBridge,
            setHueUser: setHueUser,
            getHueUser: getHueUser,
            
            HUE_ERROR: HUE_ERROR,
            ERR_UNAUTHORIZED: ERR_UNAUTHORIZED,
            ERR_LINK_BUTTON_NOT_PRESSED: ERR_LINK_BUTTON_NOT_PRESSED
        }
    };
    
})();