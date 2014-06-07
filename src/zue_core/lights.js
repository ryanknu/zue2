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

function Light()
{
    this.id = '';
    this.name = '';
    this.simple = true;
    this.state = {
        on: false,
        bri: 0,
        hue: 0,
        sat: 0,
        xy: [ 0, 0 ],
        alert: 'none',
        effect: 'none',
        colormode: 'hs',
        reachable: true
    };
    this.type = '';
    this.modelid = '';
    this.swversion = '';
    this.pointsymbol = {};
    this.bridge = undefined;
}

Light.prototype.exchangeData = function(data) {
    if ( '_i' in data && !this.id ) this.id = data._i;
    this.name = data.name || '';
    this.simple = !('state' in data);
    if ( !this.simple ) {
        this.state = data.state;
        this.type = data.type;
        this.modelid = data.modelid;
        this.swversion = data.swversion;
        this.pointsymbol = data.pointsymbol;
    }
}

Light.prototype.toggle = function() {
    zue.lights.updateLightState(this, {on: !this.state.on});
}

Light.prototype.setHue = function(hue) {
    zue.lights.updateLightState(this, {hue: hue });
}

Light.prototype.setBri = function(bri) {
    zue.lights.updateLightState(this, { bri: bri });
}

Light.prototype.setSat = function(sat) {
    zue.lights.updateLightState(this, { sat: sat });
}

Light.prototype.getId = function() {
    return 'light-' + this.id;
}

function LightUpdateResponse()
{
    this.light = '';
    this.status = 'failure';
}

LightUpdateResponse.prototype.exchangeData = function(data) {
    if ( 'success' in data ) {
        this.status = 'success';
    }
};

var _lightsZueModule = function(zue_core) {
    'use strict';
    
    var LIGHTS_URL_PART = '/lights';
    var STATE_URL_PART = '/state';
    
    var _lights = function(light) {
        zue_core.triggerEvent(LIGHT_ADDED, light);
    }
    
    var lightUpdated = function(light_update_status) {
        if ( light_update_status.status == 'success' ) {
            var light = light_update_status.light;
            var url = light.bridge.assembleUrl(LIGHTS_URL_PART + '/' + light.id);
            zue_core.ajaxExec({
                url: url,
                model: light,
                success: _lightUpdated
            });
        }
    };
    
    var _lightUpdated = function(light)
    {
        zue_core.triggerEvent(LIGHT_UPDATED, light);
    }
    
    var getAllLights = function(bridge) {
        var url = bridge.assembleUrl(LIGHTS_URL_PART);
        var model = new Light();
        model.bridge = bridge;
        zue_core.ajaxExec({
            url: url,
            model: model,
            success: _lights,
            bridge: bridge
        });
    }
    
    var getLightDetails = function(light) {
        var url = light.bridge.assembleUrl(LIGHTS_URL_PART + '/' + light.id);
        zue_core.ajaxExec({
            url: url,
            model: light,
            success: _lights
        });
    }
    
    var updateLightState = function(light, state) {
        var url = light.bridge.assembleUrl(LIGHTS_URL_PART + '/' + light.id + STATE_URL_PART );
        var model = new LightUpdateResponse();
        model.light = light;
        zue_core.triggerEvent(LIGHT_UPDATING, light);
        zue_core.ajaxExec({
            url: url,
            model: model,
            method: 'put',
            data: state,
            success: lightUpdated
        });
    }
    
    return {
        getAllLights: getAllLights,
        getLightDetails: getLightDetails,
        updateLightState: updateLightState,
    }
};

zue.attach('lights', _lightsZueModule);
