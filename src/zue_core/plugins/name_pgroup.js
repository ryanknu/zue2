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

function GroupNameImplementation()
{
    this.all_groups = [];
    this.zue_core = undefined;
}

GroupNameImplementation.prototype.start = function(zue_core)
{
    this.zue_core = zue_core;
    this.zue_core.listenFor(LIGHT_ADDED, this.lightAdded, this);
}

GroupNameImplementation.prototype.getAGroup = function(group_name)
{
    for ( var i = 0; i < this.all_groups.length; i++ ) {
        if ( this.all_groups[i].name == group_name ) {
            return this.all_groups[i];
        }
    }
    var g = new Group();
    g.name = group_name;
    this.all_groups.push(g);
    zue.groups.addGroup(g);
    return g;
}

GroupNameImplementation.prototype.lightAdded = function(light)
{
    var name = light.name;
    var group_name = 'default';
    var parts = name.split('/');
    if ( parts.length > 1 ) {
        group_name = parts[0];
    }
    var group = this.getAGroup(group_name);
    group.addLight(light);
    zue.groups.addLightToGroup(group);
}

zue.registerPlugin('SimulateGroupsByNames', new GroupNameImplementation());
