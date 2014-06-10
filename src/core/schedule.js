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

function Schedule()
{
    this.id = '';
    this.name = '';
    this.description = '';
    this.command = {};
    this.time = '';
    this.simple = true;
}

Schedule.prototype.exchangeData = function(data)
{
    this.id = data._i;
    this.name = data.name
    this.description = data.description || '';
    this.simple = this.description.length < 1;
    this.command = data.command || {};
    this.time = data.time || '';
}

var _schedZueModule = function(zue_core) {
    'use strict';
    
    var SCHEDULES_URL_PART = '/schedules';
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
            success: _lights
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
        var url = light.bridge.assembleUrl(SCHEDULES_URL_PART + '/' + light.id + STATE_URL_PART );
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
    
    var _schedule = function(sched)
    {
        zue_core.triggerEvent(SCHEDULE_ADDED, sched);
    }
    
    var getAllSchedules = function(bridge)
    {
        zue_core.ajaxExec({
            url: bridge.assembleUrl(SCHEDULES_URL_PART),
            model: new Schedule(),
            success: _schedule
        });
    }
    
    return {
        getAllSchedules: getAllSchedules,
        getLightDetails: getLightDetails,
        updateLightState: updateLightState,
    }
};

zue.attach('schedules', _schedZueModule);
