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
 

function Bridge() {
    this.id = '';
    this.internalipaddress = '';
    this.macaddress = '';
    this.hue_username = undefined;
    this.protocol = 'http';
    this.URL_API_PART = '/api';
    this.error = '';
}

Bridge.prototype.exchangeData = function(data) {
    if( 'id' in data ) this.id = data.id;
    if( 'internalipaddress' in data ) this.internalipaddress = data.internalipaddress;
    if( 'macaddress' in data ) this.macaddress = data.macaddress;
    if( 'error' in data ) this.error = data.error.type;
    if( 'success' in data ) this.hue_username = data.success.username;
};

Bridge.prototype.assembleUrl = function(url_part) {
    return this.protocol + '://' + this.internalipaddress + this.URL_API_PART + '/' + this.hue_username + url_part;
};

Bridge.prototype.assembleRootUrl = function() {
    return this.protocol + '://' + this.internalipaddress + this.URL_API_PART;
};

var _bridgeZueModule = function(ajax, event_manager) {
    'use strict';
    var PORTAL_LOCAL_DISCOVERY_URL = 'https://www.meethue.com/api/nupnp';
    var BRIDGE_FOUND = 'bridge.found';
    var NO_BRIDGE_FOUND = 'bridge.not_found';
    
    var foundBridge = function(bridge) {
        event_manager.trigger(BRIDGE_FOUND, bridge);
        return '_bridgeZueModule.foundBridge';
    };
    
    var noBridgeFound = function() {
        event_manager.trigger(NO_BRIDGE_FOUND);
        return '_bridgeZueModule.noBridgeFound';
    }
    
    var locate = function()
    {
        var bridge = new Bridge();
        bridge = ajax.exec({
            url: PORTAL_LOCAL_DISCOVERY_URL,
            model: bridge,
            success: foundBridge,
            failure: noBridgeFound
        });
    }
    
    var setCoreBridge = function(bridge) {
        zue.core.setBridge(bridge);
    }
    
    return {
        locate: locate,
        setCoreBridge: setCoreBridge,
        
        /* constants */
        BRIDGE_FOUND: BRIDGE_FOUND,
        NO_BRIDGE_FOUND: NO_BRIDGE_FOUND,
        
        /* Private members here for testing */
        _foundBridge: foundBridge,
        _noBridgeFound: noBridgeFound
    };
}

zue.core.attach('bridge', _bridgeZueModule);
zue.core.listenFor(zue.bridge.BRIDGE_FOUND, zue.bridge.setCoreBridge);