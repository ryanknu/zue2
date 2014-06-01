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

var _groupsZueModule = function(ajax, event_manager) {
    'use strict';
    var use_soft_groups = false;
    var all_groups = [];
    
    var GROUP_ADDED = 'group.added';
    var GROUP_LIGHT_ADDED = 'group.light_added';
    var GROUP_UPDATED = 'group.updated';
    var GROUP_UPDATING = 'group.updating';
    
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
        event_manager.trigger(GROUP_ADDED, g);
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
        event_manager.trigger(GROUP_LIGHT_ADDED, group);
    }

    var useSoftGroups = function(soft_groups) {
        use_soft_groups = soft_groups;
        if ( use_soft_groups ) {
            zue.core.listenFor(zue.lights.LIGHT_ADDED, softLightAdded);
        }
    };
    
    var getAllGroups = function(bridge) {
        var url = bridge.assembleUrl(LIGHTS_URL_PART);
        var model = new Light();
        model.bridge = bridge;
        ajax.exec({
            url: url,
            model: model,
            success: _lights
        });
    }
    
    return {
        useSoftGroups: useSoftGroups,
        getAllGroups: getAllGroups,
        
        GROUP_ADDED: GROUP_ADDED,
        GROUP_LIGHT_ADDED: GROUP_LIGHT_ADDED,
        GROUP_UPDATED: GROUP_UPDATED,
        GROUP_UPDATING: GROUP_UPDATING
    }
};

zue.core.attach('groups', _groupsZueModule);
