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

var _configZueModule = function(zue_core) {
    'use strict';
    var ZUE_DEVICE_TYPE = ';zue-powered';
    var MAX_DEVICE_TYPE_LEN = 40;
    
    var LINK_TIMEOUT = 60000;
    var LINK_INTERVAL = 5000;
    
    var settings = {};
    
    var userCreated = function(bridge) {
        zue_core.triggerEvent(LINKED, bridge);
    }
    
    var _createUser = function(bridge, request) {
        zue_core.triggerEvent(LINK_BEGIN, bridge);
        zue_core.ajaxExec({
            url: bridge.assembleRootUrl(),
            method: 'post',
            data: request,
            model: bridge,
            success: userCreated,
            bridge: bridge
        });
    }
    
    var getDeviceType = function(user_devicetype) {
        return {
            devicetype: user_devicetype.substr(0, MAX_DEVICE_TYPE_LEN - ZUE_DEVICE_TYPE.length) + ZUE_DEVICE_TYPE
        }
    }
    
    var createAnonUser = function(bridge, devicetype) {
        _createUser( bridge, getDeviceType(devicetype) );
    }
    
    var createUser = function(bridge, devicetype, username) {
        var request = getDeviceType(devicetype);
        request.username = username;
        _createUser(bridge, request);
    };
    
    return {
        createUser: createUser,
        createAnonUser: createAnonUser,
        
        /* testing only */
        _createUser: _createUser
    }
};

zue.attach('config', _configZueModule);
