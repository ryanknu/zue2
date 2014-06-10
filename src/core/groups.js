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

function Group()
{
    this.id = '';
    this.name = '';
    this.lights = [];
    this.bridge = undefined;
    this.type = 'group';
}

Group.prototype.addLight = function(light)
{
    this.lights.push(light);
}

Group.prototype.toggle = function()
{
    for ( var i = 0; i < this.lights.length; i++ ) {
        this.lights[i].toggle();
    }
}

Group.prototype.getId = function()
{
    return 'group-' + this.bridge.getSafeMacAddress() + '-'  + this.id;
}

var _groupsZueModule = function(zue_core) {
    'use strict';
    var use_soft_groups = false;
    var all_groups = [];
    
    var GROUP_IMPL_HARDWARE = 'hardware';
    var GROUP_IMPL_NAME = 'name';
    var GROUP_IMPL_SCHEDULE = 'schedule';
    
    var getAGroup = function(group_name)
    {
        for ( var i = 0; i < all_groups.length; i++ ) {
            if ( all_groups[i].name == group_name ) {
                return all_groups[i];
            }
        }
        var g = new Group();
        g.name = group_name;
        all_groups.push(g);
        zue_core.triggerEvent(GROUP_ADDED, g);
        return g;
    }
    
    var softLightAdded = function(light)
    {
        var name = light.name;
        var group_name = 'default';
        var parts = name.split('/');
        if ( parts.length > 1 ) {
            group_name = parts[0];
        }
        var group = getAGroup(group_name);
        group.addLight(light);
        zue_core.triggerEvent(GROUP_LIGHT_ADDED, group);
    }
    
//     var getAllGroups = function(bridge) {
//         var url = bridge.assembleUrl(LIGHTS_URL_PART);
//         var model = new Light();
//         model.bridge = bridge;
//         zue_core.ajaxExec({
//             url: url,
//             model: model,
//             success: _lights
//         });
//     }

    var getAllGroups;
    
    var addGroup = function(group) {
        zue_core.triggerEvent(GROUP_ADDED, group);
    }
    
    var addLightToGroup = function(group) {
        zue_core.triggerEvent(GROUP_LIGHT_ADDED, group);
    }
    
    return {
        getAllGroups: getAllGroups,
        addGroup: addGroup,
        addLightToGroup: addLightToGroup,
    }
};

zue.attach('groups', _groupsZueModule);
