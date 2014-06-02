function ZueAjax() {
    this.eventManager = undefined;
    this.defaults = {
        method: "get",
        data: "",
        url: undefined,
        model: undefined,
        success: function() {},
        failure: function() {}
    };
    this.$ = jQuery;
}

ZueAjax.prototype.setEventManager = function(em) {
    this.eventManager = em;
};

ZueAjax.prototype.exec = function(in_options) {
    var $ = this.$;
    var options = $.extend({}, this._defaults, in_options);
    var ajaxOptions = {
        type: options.method,
        url: options.url,
        success: function(data) {
            if (detectArray(data)) {
                if (data.length == 0) {
                    this.eventManager.trigger(HUE_ERROR, {
                        type: 10001,
                        description: "empty result set"
                    });
                }
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        data[i]._i = i;
                        if ("error" in data[i]) {
                            this.eventManager.trigger(HUE_ERROR, data[i].error);
                            options.failure();
                        } else {
                            var _o = $.extend(true, {}, options.model);
                            _o.exchangeData(data[i]);
                            options.success(_o);
                        }
                    }
                }
            } else if (typeof data === "object") {
                if ("error" in data) {
                    this.eventManager.trigger(HUE_ERROR, data.error);
                } else {
                    options.model.exchangeData(data);
                    options.success(options.model);
                }
            } else {
                throw "`data` is not something I can work with";
            }
        },
        error: function() {
            this.eventManager.trigger(HUE_ERROR, {
                type: 1e4,
                description: "no/bad response from server"
            });
            options.failure();
        }
    };
    if (options.method == "post" || options.method == "put") {
        ajaxOptions.data = JSON.stringify(options.data);
    }
    $.ajax(ajaxOptions);
};

function ZueEventManager() {
    this.o = {};
}

ZueEventManager.prototype.attach = function(event, callback, object) {
    if (this.o[event] === undefined) {
        this.o[event] = [];
    }
    var n = {};
    n.callback = callback;
    n.object = object;
    this.o[event].push(n);
};

ZueEventManager.prototype.trigger = function(event, argument) {
    if (detectArray(this.o[event])) {
        for (var i = 0; i < this.o[event].length; i++) {
            var n = this.o[event][i];
            if (n.object === undefined) {
                n.callback(argument);
            } else {
                n.callback.call(n.object, argument);
            }
        }
    }
};

var HUE_ERROR = "core.hue_error";

var ERR_UNAUTHORIZED = 1;

var ERR_LINK_BUTTON_NOT_PRESSED = 101;

var LIGHT_ADDED = "lights.light_added";

var LIGHT_UPDATING = "lights.light_updating";

var LIGHT_UPDATED = "lights.light_updated";

var GROUP_ADDED = "groups.group_added";

var GROUP_LIGHT_ADDED = "groups.light_added";

var GROUP_UPDATING = "groups.group_updating";

var GROUP_UPDATED = "groups.group_updated";

var BRIDGE_FOUND = "bridge.bridge_found";

var NO_BRIDGE_FOUND = "bridge.no_bridge_found";

var LINK_SUCCESS = "config.link_success";

var LINK_FAILURE = "config.link_failure";

var LINK_BEGIN = "config.link_begin";

var LINKED = "config.linked";

var detectArray = function(o) {
    if (o !== undefined && !!o.shift) {
        return true;
    }
    if (typeof o !== "object") {
        return false;
    }
    var any_keys = false;
    for (var y in o) {
        if (o.hasOwnProperty(y)) {
            any_keys = true;
            if (isNaN(parseInt(y, 10))) {
                return false;
            }
        }
    }
    return any_keys;
};

function ZueCore(IAjax, IEventManager) {
    this.modules = {};
    this.plugins = {};
    this.IAjax = IAjax;
    this.IAjax.setEventManager(IEventManager);
    this.IEventManager = IEventManager;
    this.log_target = "#zue-debug";
    this.triggers = 0;
}

ZueCore.prototype.log = function(msg) {
    if ($(this.log_target).length) {
        $(this.log_target).prepend($("<div/>").text(this.triggers++ + " " + msg));
    }
};

ZueCore.prototype.attach = function(module, o) {
    this.modules[module] = o(this);
    this[module] = this.modules[module];
};

ZueCore.prototype.enablePlugin = function(name) {
    this.plugins[name].start(this);
};

ZueCore.prototype.registerPlugin = function(name, plugin) {
    this.plugins[name] = plugin;
};

ZueCore.prototype.triggerEvent = function(event, argument, object) {
    this.log("event: " + event + " Arg: " + JSON.stringify(argument));
    this.IEventManager.trigger(event, argument, object);
};

ZueCore.prototype.listenFor = function(event, listener, object) {
    this.IEventManager.attach(event, listener, object);
};

ZueCore.prototype.on = function(event, listener, object) {
    this.listenFor(event, listener, object);
};

ZueCore.prototype.ajaxExec = function(options) {
    this.log("ajax:  " + options.method + " " + options.url);
    this.IAjax.exec(options);
};

window.zue = new ZueCore(new ZueAjax(), new ZueEventManager());

function Bridge() {
    this.id = "";
    this.internalipaddress = "";
    this.macaddress = "";
    this.hue_username = undefined;
    this.protocol = "http";
    this.URL_API_PART = "/api";
    this.error = "";
}

Bridge.prototype.exchangeData = function(data) {
    if ("id" in data) this.id = data.id;
    if ("internalipaddress" in data) this.internalipaddress = data.internalipaddress;
    if ("macaddress" in data) this.macaddress = data.macaddress;
    if ("error" in data) this.error = data.error.type;
    if ("success" in data) this.hue_username = data.success.username;
};

Bridge.prototype.assembleUrl = function(url_part) {
    return this.protocol + "://" + this.internalipaddress + this.URL_API_PART + "/" + this.hue_username + url_part;
};

Bridge.prototype.assembleRootUrl = function() {
    return this.protocol + "://" + this.internalipaddress + this.URL_API_PART;
};

var _bridgeZueModule = function(zue_core) {
    "use strict";
    var PORTAL_LOCAL_DISCOVERY_URL = "https://www.meethue.com/api/nupnp";
    var foundBridge = function(bridge) {
        zue_core.triggerEvent(BRIDGE_FOUND, bridge);
        return "_bridgeZueModule.foundBridge";
    };
    var noBridgeFound = function() {
        zue_core.triggerEvent(NO_BRIDGE_FOUND);
        return "_bridgeZueModule.noBridgeFound";
    };
    var locate = function() {
        var bridge = new Bridge();
        bridge = zue_core.ajaxExec({
            url: PORTAL_LOCAL_DISCOVERY_URL,
            model: bridge,
            success: foundBridge,
            failure: noBridgeFound
        });
    };
    return {
        locate: locate,
        _foundBridge: foundBridge,
        _noBridgeFound: noBridgeFound
    };
};

zue.attach("bridge", _bridgeZueModule);

var _configZueModule = function(zue_core) {
    "use strict";
    var ZUE_DEVICE_TYPE = ";zue-powered";
    var MAX_DEVICE_TYPE_LEN = 40;
    var LINK_TIMEOUT = 6e4;
    var LINK_INTERVAL = 5e3;
    var settings = {};
    var userCreated = function(bridge) {
        event_manager.trigger(LINKED, bridge);
    };
    var _createUser = function(bridge, request) {
        event_manager.trigger(LINK_BEGIN, bridge);
        ajax.exec({
            url: bridge.assembleRootUrl(),
            type: "post",
            data: request,
            model: bridge,
            success: userCreated
        });
    };
    var getDeviceType = function(user_devicetype) {
        return {
            devicetype: user_devicetype.substr(0, MAX_DEVICE_TYPE_LEN - ZUE_DEVICE_TYPE.length) + ZUE_DEVICE_TYPE
        };
    };
    var createAnonUser = function(bridge, devicetype) {
        _createUser(bridge, getDeviceType(devicetype));
    };
    var createUser = function(bridge, devicetype, username) {
        var request = getDeviceType(devicetype);
        request.username = username;
        _createUser(bridge, request);
    };
    return {
        createUser: createUser,
        createAnonUser: createAnonUser,
        _createUser: _createUser
    };
};

zue.attach("config", _configZueModule);

function Light() {
    this.id = "";
    this.name = "";
    this.simple = true;
    this.state = {
        on: false,
        bri: 0,
        hue: 0,
        sat: 0,
        xy: [ 0, 0 ],
        alert: "none",
        effect: "none",
        colormode: "hs",
        reachable: true
    };
    this.type = "";
    this.modelid = "";
    this.swversion = "";
    this.pointsymbol = {};
    this.bridge = undefined;
}

Light.prototype.exchangeData = function(data) {
    if ("_i" in data && !this.id) this.id = data._i;
    this.name = data.name || "";
    this.simple = !("state" in data);
    if (!this.simple) {
        this.state = data.state;
        this.type = data.type;
        this.modelid = data.modelid;
        this.swversion = data.swversion;
        this.pointsymbol = data.pointsymbol;
    }
};

Light.prototype.toggle = function() {
    zue.lights.updateLightState(this, {
        on: !this.state.on
    });
};

Light.prototype.setHue = function(hue) {
    zue.lights.updateLightState(this, {
        hue: hue
    });
};

Light.prototype.setBri = function(bri) {
    zue.lights.updateLightState(this, {
        bri: bri
    });
};

Light.prototype.setSat = function(sat) {
    zue.lights.updateLightState(this, {
        sat: sat
    });
};

function LightUpdateResponse() {
    this.light = "";
    this.status = "failure";
}

LightUpdateResponse.prototype.exchangeData = function(data) {
    if ("success" in data) {
        this.status = "success";
    }
};

var _lightsZueModule = function(zue_core) {
    "use strict";
    var LIGHTS_URL_PART = "/lights";
    var STATE_URL_PART = "/state";
    var _lights = function(light) {
        zue_core.triggerEvent(LIGHT_ADDED, light);
    };
    var lightUpdated = function(light_update_status) {
        if (light_update_status.status == "success") {
            var light = light_update_status.light;
            var url = light.bridge.assembleUrl(LIGHTS_URL_PART + "/" + light.id);
            zue_core.ajaxExec({
                url: url,
                model: light,
                success: _lightUpdated
            });
        }
    };
    var _lightUpdated = function(light) {
        zue_core.triggerEvent(LIGHT_UPDATED, light);
    };
    var getAllLights = function(bridge) {
        var url = bridge.assembleUrl(LIGHTS_URL_PART);
        var model = new Light();
        model.bridge = bridge;
        zue_core.ajaxExec({
            url: url,
            model: model,
            success: _lights
        });
    };
    var getLightDetails = function(light) {
        var url = light.bridge.assembleUrl(LIGHTS_URL_PART + "/" + light.id);
        zue_core.ajaxExec({
            url: url,
            model: light,
            success: _lights
        });
    };
    var updateLightState = function(light, state) {
        var url = light.bridge.assembleUrl(LIGHTS_URL_PART + "/" + light.id + STATE_URL_PART);
        var model = new LightUpdateResponse();
        model.light = light;
        zue_core.triggerEvent(LIGHT_UPDATING, light);
        zue_core.ajaxExec({
            url: url,
            model: model,
            method: "put",
            data: state,
            success: lightUpdated
        });
    };
    return {
        getAllLights: getAllLights,
        getLightDetails: getLightDetails,
        updateLightState: updateLightState
    };
};

zue.attach("lights", _lightsZueModule);

function Group() {
    this.id = "";
    this.name = "";
    this.lights = [];
    this.bridge = undefined;
}

Group.prototype.addLight = function(light) {
    this.lights.push(light);
};

Group.prototype.toggle = function() {
    for (var i = 0; i < this.lights.length; i++) {
        this.lights[i].toggle();
    }
};

var _groupsZueModule = function(zue_core) {
    "use strict";
    var use_soft_groups = false;
    var all_groups = [];
    var GROUP_IMPL_HARDWARE = "hardware";
    var GROUP_IMPL_NAME = "name";
    var GROUP_IMPL_SCHEDULE = "schedule";
    var getAGroup = function(group_name) {
        for (var i = 0; i < all_groups.length; i++) {
            if (all_groups[i].name == group_name) {
                return all_groups[i];
            }
        }
        var g = new Group();
        g.name = group_name;
        all_groups.push(g);
        zue_core.triggerEvent(GROUP_ADDED, g);
        return g;
    };
    var softLightAdded = function(light) {
        var name = light.name;
        var group_name = "default";
        var parts = name.split("/");
        if (parts.length > 1) {
            group_name = parts[0];
        }
        var group = getAGroup(group_name);
        group.addLight(light);
        zue_core.triggerEvent(GROUP_LIGHT_ADDED, group);
    };
    var enableGroupImplementation = function(group_impl) {
        if (group_impl === GROUP_IMPL_NAME) {
            new GroupNameImplementation();
        }
    };
    var useSoftGroups = function(soft_groups) {
        use_soft_groups = soft_groups;
        if (use_soft_groups) {
            zue_core.on(LIGHT_ADDED, softLightAdded);
        }
    };
    var getAllGroups;
    var addGroup = function(group) {
        zue_core.triggerEvent(GROUP_ADDED, group);
    };
    var addLightToGroup = function(group) {
        zue_core.triggerEvent(GROUP_LIGHT_ADDED, group);
    };
    return {
        useSoftGroups: useSoftGroups,
        getAllGroups: getAllGroups,
        enableGroupImplementation: enableGroupImplementation,
        addGroup: addGroup,
        addLightToGroup: addLightToGroup
    };
};

zue.attach("groups", _groupsZueModule);

function GroupNameImplementation() {
    this.all_groups = [];
    this.zue_core = undefined;
}

GroupNameImplementation.prototype.start = function(zue_core) {
    this.zue_core = zue_core;
    this.zue_core.listenFor(LIGHT_ADDED, this.lightAdded, this);
};

GroupNameImplementation.prototype.getAGroup = function(group_name) {
    for (var i = 0; i < this.all_groups.length; i++) {
        if (this.all_groups[i].name == group_name) {
            return this.all_groups[i];
        }
    }
    var g = new Group();
    g.name = group_name;
    this.all_groups.push(g);
    zue.groups.addGroup(g);
    return g;
};

GroupNameImplementation.prototype.lightAdded = function(light) {
    var name = light.name;
    var group_name = "default";
    var parts = name.split("/");
    if (parts.length > 1) {
        group_name = parts[0];
    }
    var group = this.getAGroup(group_name);
    group.addLight(light);
    zue.groups.addLightToGroup(group);
};

zue.registerPlugin("SimulateGroupsByNames", new GroupNameImplementation());