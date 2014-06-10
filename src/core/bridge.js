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
    this.linking = false;
}

/**
 * @test: #b05
 */
Bridge.prototype.exchangeData = function(data) {
    if( 'id' in data ) this.id = data.id;
    if( 'internalipaddress' in data ) this.internalipaddress = data.internalipaddress;
    if( 'macaddress' in data ) this.macaddress = data.macaddress;
    if( 'hue_username' in data ) this.hue_username = data.hue_username;
    if( 'error' in data ) this.error = data.error.type;
    if( 'success' in data ) this.hue_username = data.success.username;
};

/**
 * @test: #b06
 */
Bridge.prototype.assembleUrl = function(url_part) {
    return this.protocol + '://' + this.internalipaddress + this.URL_API_PART + '/' + this.hue_username + url_part;
};

/**
 * @test: #b07
 */
Bridge.prototype.assembleRootUrl = function() {
    return this.protocol + '://' + this.internalipaddress + this.URL_API_PART;
};

Bridge.prototype.getSafeMacAddress = function() {
    return this.macaddress.replace(/:/g, '');
}

var _bridgeZueModule = function(zue_core) {
    'use strict';
    var PORTAL_LOCAL_DISCOVERY_URL = 'https://www.meethue.com/api/nupnp';
    
    /**
     * @test: #b03
     */
    var foundBridge = function(bridge) {
        zue_core.triggerEvent(BRIDGE_FOUND, bridge);
        return '_bridgeZueModule.foundBridge';
    };
    
    /**
     * @test: #b04
     */
    var noBridgeFound = function() {
        zue_core.triggerEvent(NO_BRIDGE_FOUND);
        return '_bridgeZueModule.noBridgeFound';
    }
    
    /**
     * @test: #b02
     */
    var locate = function()
    {
        var bridge = new Bridge();
        bridge = zue_core.ajaxExec({
            url: PORTAL_LOCAL_DISCOVERY_URL,
            model: bridge,
            success: foundBridge,
            failure: noBridgeFound,
            trap: true
        });
    }
    
    return {
        locate: locate,
        
        /* Private members here for testing */
        _foundBridge: foundBridge,
        _noBridgeFound: noBridgeFound
    };
}

/**
 * @test: #b01
 */
zue.attach('bridge', _bridgeZueModule);
