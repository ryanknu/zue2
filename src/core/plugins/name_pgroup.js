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

_Z(['core', 'groups'], function(zue_core, groups) {
// /*

var all_groups = [];

var lightAdded = function(light) {
    var name = light.name,
        group_name = 'default'.
        parts = name.split('/'),
        group;

    if ( parts.length > 1 ) {
        group_name = parts[0];
    }
    group = getAGroup(group_name, light.bridge);
    group.addLight(light);
    groups.addLightToGroup(group);
}

var getAGroup = function(group_name, bridge)
{
    var i = 0, g;
    for ( ; i < all_groups.length; i++ ) {
        if ( all_groups[i].name == group_name ) {
            return all_groups[i];
        }
    }
    var g = new Group();
    g.impl = 'impl_name';
    g.name = group_name;
    g.id = group_name;
    g.bridge = bridge;
    all_groups.push(g);
    groups.addGroup(g);
    return g;
}

zue_core.registerPlugin('SimulateGroupsByNames', function() {
    zue_core.listenFor(LIGHT_ADDED, lightAdded);
});

// */
});
