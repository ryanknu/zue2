function PriorityQueue(comparator) {
    this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
    this._elements = [];
}

PriorityQueue.DEFAULT_COMPARATOR = function(a, b) {
    if (a instanceof Number && b instanceof Number) {
        return a - b;
    } else {
        a = a.toString();
        b = b.toString();
        if (a == b) return 0;
        return a > b ? 1 : -1;
    }
};

PriorityQueue.prototype.isEmpty = function() {
    return this.size() === 0;
};

PriorityQueue.prototype.peek = function() {
    if (this.isEmpty()) throw new Error("PriorityQueue is empty");
    return this._elements[0];
};

PriorityQueue.prototype.deq = function() {
    var first = this.peek();
    var last = this._elements.pop();
    var size = this.size();
    if (size === 0) return first;
    this._elements[0] = last;
    var current = 0;
    while (current < size) {
        var largest = current;
        var left = 2 * current + 1;
        var right = 2 * current + 2;
        if (left < size && this._compare(left, largest) > 0) {
            largest = left;
        }
        if (right < size && this._compare(right, largest) > 0) {
            largest = right;
        }
        if (largest === current) break;
        this._swap(largest, current);
        current = largest;
    }
    return first;
};

PriorityQueue.prototype.enq = function(element) {
    var size = this._elements.push(element);
    var current = size - 1;
    while (current > 0) {
        var parent = Math.floor((current - 1) / 2);
        if (this._compare(current, parent) < 0) break;
        this._swap(parent, current);
        current = parent;
    }
    return size;
};

PriorityQueue.prototype.size = function() {
    return this._elements.length;
};

PriorityQueue.prototype.forEach = function(fn) {
    return this._elements.forEach(fn);
};

PriorityQueue.prototype._compare = function(a, b) {
    return this._comparator(this._elements[a], this._elements[b]);
};

PriorityQueue.prototype._swap = function(a, b) {
    var aux = this._elements[a];
    this._elements[a] = this._elements[b];
    this._elements[b] = aux;
};

function ZueAjax() {
    this.eventManager = undefined;
    this.defaults = {
        method: "get",
        data: "",
        url: undefined,
        model: undefined,
        success: function() {},
        failure: function() {},
        trap: false,
        bridge: undefined
    };
    this.$ = jQuery;
}

ZueAjax.prototype.setEventManager = function(em) {
    this.eventManager = em;
};

ZueAjax.prototype.exec = function(in_options) {
    var $ = this.$;
    var options = $.extend({}, this.defaults, in_options);
    var em = this.eventManager;
    var ajaxOptions = {
        type: options.method,
        url: options.url,
        async: false,
        success: function(data) {
            if (detectArray(data)) {
                if (data.length == 0) {
                    if (!options.trap) {
                        em.trigger(HUE_ERROR, {
                            brige: options.bridge,
                            type: 10001,
                            description: "empty result set"
                        });
                    }
                    options.failure();
                }
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        data[i]._i = i;
                        if ("error" in data[i]) {
                            if (!options.trap) {
                                var e = data[i].error;
                                e.bridge = options.bridge;
                                em.trigger(HUE_ERROR, e);
                            }
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
                    if (!options.trap) {
                        var e = data.error;
                        e.bridge = options.bridge;
                        em.trigger(HUE_ERROR, e);
                    }
                    options.failure();
                } else {
                    options.model.exchangeData(data);
                    options.success(options.model);
                }
            } else {
                throw "`data` is not something I can work with";
            }
        },
        error: function() {
            if (!options.trap) {
                em.trigger(HUE_ERROR, {
                    bridge: options.bridge,
                    type: 1e4,
                    description: "no/bad response from server"
                });
            }
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
    var comparator = function(a, b) {
        return a.priority > b.priority ? 1 : -1;
    };
    if (this.o[event] === undefined) {
        this.o[event] = new PriorityQueue(comparator);
    }
    var n = {};
    n.callback = callback;
    n.object = object;
    n.priority = 1;
    this.o[event].enq(n);
};

ZueEventManager.prototype.trigger = function(event, argument) {
    if (this.o[event] !== undefined) {
        this.o[event].forEach(function(callback) {
            callback.callback.call(callback.object, argument);
        });
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

var SCHEDULE_ADDED = "schedules.schedule_added";

var BRIDGE_FOUND = "bridge.bridge_found";

var NO_BRIDGE_FOUND = "bridge.no_bridge_found";

var LINK_SUCCESS = "config.link_success";

var LINK_FAILURE = "config.link_failure";

var LINK_BEGIN = "config.link_begin";

var LINKED = "config.linked";

String.prototype.pad = function(len, chr) {
    var pad_len = len - this.length + 1;
    if (pad_len > 0) {
        return Array(pad_len).join(chr) + this;
    }
};

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
    this.start = 0;
}

ZueCore.prototype.log = function(msg) {
    if (!this.start) {
        this.start = Date.now();
    }
    if ($(this.log_target).length) {
        $(this.log_target).prepend($("<div/>").text((this.triggers++).toString().pad(3, "0") + " (T+" + (Date.now() - this.start).toString().pad(6, "0") + ") " + msg));
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
    this.log("ajax:  " + (options.method || "get") + " " + options.url);
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
    this.linking = false;
}

Bridge.prototype.exchangeData = function(data) {
    if ("id" in data) this.id = data.id;
    if ("internalipaddress" in data) this.internalipaddress = data.internalipaddress;
    if ("macaddress" in data) this.macaddress = data.macaddress;
    if ("hue_username" in data) this.hue_username = data.hue_username;
    if ("error" in data) this.error = data.error.type;
    if ("success" in data) this.hue_username = data.success.username;
};

Bridge.prototype.assembleUrl = function(url_part) {
    return this.protocol + "://" + this.internalipaddress + this.URL_API_PART + "/" + this.hue_username + url_part;
};

Bridge.prototype.assembleRootUrl = function() {
    return this.protocol + "://" + this.internalipaddress + this.URL_API_PART;
};

Bridge.prototype.getSafeMacAddress = function() {
    return this.macaddress.replace(/:/g, "");
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
            failure: noBridgeFound,
            trap: true
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
        zue_core.triggerEvent(LINKED, bridge);
    };
    var _createUser = function(bridge, request) {
        zue_core.triggerEvent(LINK_BEGIN, bridge);
        zue_core.ajaxExec({
            url: bridge.assembleRootUrl(),
            method: "post",
            data: request,
            model: bridge,
            success: userCreated,
            bridge: bridge
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

Light.prototype.getId = function() {
    return "light-" + this.bridge.getSafeMacAddress() + "-" + this.id;
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
            success: _lights,
            bridge: bridge
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
    this.type = "group";
}

Group.prototype.addLight = function(light) {
    this.lights.push(light);
};

Group.prototype.toggle = function() {
    for (var i = 0; i < this.lights.length; i++) {
        this.lights[i].toggle();
    }
};

Group.prototype.getId = function() {
    return "group-" + this.bridge.getSafeMacAddress() + "-" + this.id;
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
    var getAllGroups;
    var addGroup = function(group) {
        zue_core.triggerEvent(GROUP_ADDED, group);
    };
    var addLightToGroup = function(group) {
        zue_core.triggerEvent(GROUP_LIGHT_ADDED, group);
    };
    return {
        getAllGroups: getAllGroups,
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

GroupNameImplementation.prototype.getAGroup = function(group_name, bridge) {
    for (var i = 0; i < this.all_groups.length; i++) {
        if (this.all_groups[i].name == group_name) {
            return this.all_groups[i];
        }
    }
    var g = new Group();
    g.impl = "impl_name";
    g.name = group_name;
    g.id = group_name;
    g.bridge = bridge;
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
    var group = this.getAGroup(group_name, light.bridge);
    group.addLight(light);
    zue.groups.addLightToGroup(group);
};

zue.registerPlugin("SimulateGroupsByNames", new GroupNameImplementation());

var HUE_MAX = 65535;

function Color(light) {
    this.light = light;
}

Color.prototype.supportsMode = function(mode) {
    if (mode == "ct") {} else if (mode == "hs") {} else if (mode == "xy") {}
    return false;
};

var hueToCss = function(hue) {
    var V = 1;
    var S = 1;
    var C = V * S;
    var X = C * (1 - Math.abs(hue / (HUE_MAX / 6) % 2 - 1));
    var m = V - C;
    var q = Math.floor(hue / (HUE_MAX / 6));
    var r = {
        r: 0,
        g: 0,
        b: 0
    };
    switch (q) {
      case 0:
        r = {
            r: C + m,
            g: X + m,
            b: 0
        };
        break;

      case 1:
        r = {
            g: C + m,
            r: X + m,
            b: 0
        };
        break;

      case 2:
        r = {
            g: C + m,
            b: X + m,
            r: 0
        };
        break;

      case 3:
        r = {
            b: C + m,
            g: X + m,
            r: 0
        };
        break;

      case 4:
        r = {
            b: C + m,
            r: X + m,
            g: 0
        };
        break;

      case 5:
        r = {
            r: C + m,
            b: X + m,
            g: 0
        };
        break;
    }
    var _r = [ Math.floor(r.r * 255), Math.floor(r.g * 255), Math.floor(r.b * 255) ];
    return "rgb(" + _r.join(",") + ")";
};

var convertKToCt = function(ct) {
    return -347 / 4500 * ct + 5888 / 9;
};

var convertCtToK = function(k) {
    return (k - 5888 / 9) / (-347 / 4500);
};

var tempToCss = function(tempInK) {
    var temp = tempInK / 100;
    r = {
        r: 0,
        g: 0,
        b: 0
    };
    if (temp < 66) {
        r.r = 255;
    } else {
        r.r = temp - 60;
        r.r = 329.698727446 * (r.r ^ -.1332047592);
        r.r = Math.max(0, r.r);
        r.r = Math.min(255, r.r);
    }
    if (temp < 66) {
        r.g = temp;
        r.g = 99.4708025861 * Math.log(r.g) - 161.1195681661;
    } else {
        r.g = temp - 60;
        r.g = 288.1221695283 * (r.g ^ -.0755148492);
    }
    r.g = Math.max(0, r.g);
    r.g = Math.min(255, r.g);
    if (temp >= 66) {
        r.b = 255;
    } else {
        if (temp <= 19) {
            r.b = 0;
        } else {
            r.b = temp - 10;
            r.b = 138.5177312231 * Math.log(r.b) - 305.0447927307;
            r.b = Math.max(0, r.b);
            r.b = Math.min(255, r.b);
        }
    }
    var _r = [ Math.floor(r.r), Math.floor(r.g), Math.floor(r.b) ];
    return "rgb(" + _r.join(",") + ")";
};

Color.prototype.getCss = function() {
    if (this.light.state.colormode == "hs") {
        return hueToCss(this.light.state.hue);
    } else if (this.light.state.colormode == "ct") {
        return tempToCss(convertCtToK(this.light.state.ct));
    }
    return "yellow";
};

Color.prototype.getTempInK = function() {
    return convertCtToK(this.light.state.ct);
};

Color.prototype.getHueInDegrees = function() {
    return this.light.state.hue / (HUE_MAX / 360);
};

Color.prototype.toString = function() {
    if (this.light.state.colormode == "hs") {
        return this.getHueInDegrees().toFixed(2) + "°";
    } else if (this.light.state.colormode == "ct") {
        return Math.floor(this.getTempInK()) + "K";
    }
    return "XY";
};

(function() {
    var _color = {
        HUE_RED: 0,
        HUE_SALMON: 6609,
        HUE_GREEN: 32107,
        HUE_BLUE: 44298,
        HUE_PURPLE: 53333,
        HUE_AQUAMARINE: 39242,
        HUE_YELLOW: 18833,
        HUE_ORANGE: 12879
    };
    if (window.zue === undefined) {
        window.zue = {
            color: _color
        };
    } else {
        window.zue.color = _color;
    }
})();

function Schedule() {
    this.id = "";
    this.name = "";
    this.description = "";
    this.command = {};
    this.time = "";
    this.simple = true;
}

Schedule.prototype.exchangeData = function(data) {
    this.id = data._i;
    this.name = data.name;
    this.description = data.description || "";
    this.simple = this.description.length < 1;
    this.command = data.command || {};
    this.time = data.time || "";
};

var _schedZueModule = function(zue_core) {
    "use strict";
    var SCHEDULES_URL_PART = "/schedules";
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
        var url = light.bridge.assembleUrl(SCHEDULES_URL_PART + "/" + light.id + STATE_URL_PART);
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
    var _schedule = function(sched) {
        zue_core.triggerEvent(SCHEDULE_ADDED, sched);
    };
    var getAllSchedules = function(bridge) {
        zue_core.ajaxExec({
            url: bridge.assembleUrl(SCHEDULES_URL_PART),
            model: new Schedule(),
            success: _schedule
        });
    };
    return {
        getAllSchedules: getAllSchedules,
        getLightDetails: getLightDetails,
        updateLightState: updateLightState
    };
};

zue.attach("schedules", _schedZueModule);