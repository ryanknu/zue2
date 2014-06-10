var hoodie = new Hoodie();

var sortGroups = function() {
    var d = "#lights";
    $(d + " > div").sort(function(a, b) {
        return $(a).data("model").type === "group" ? -1 : 1;
    }).appendTo($(d));
};

function saveLight(light) {
    var c = new Color(light);
    var quick_state = light.state.reachable && light.state.on ? c : "OFF";
    $("#" + light.getId()).show().data("model", light).find(".name").text(light.name).end().find(".state_hue").text(quick_state).css("color", c.getCss()).end();
    if (!light.state.reachable) {
        $("#" + light.getId()).hide();
    }
    showNoLightsAvailable();
}

function showNoLightsAvailable() {
    $("#all-off").hide();
    if ($("#lights > :visible").length < 1) {
        $("#all-off").show();
    }
}

function getLight(element) {
    return $(element).closest(".ILightControl").data("model");
}

function safeMacAddress(mac_address) {
    return mac_address.replace(/:/g, "");
}

function getAllLights(bridge) {
    poopulate("#IBridgeControl", "#bridges", bridge).attr("mac-safe", safeMacAddress(bridge.macaddress)).addClass("working").find("a.configure").on("click", function() {
        var bridge = $(this).closest(".IBridgeControl").data("model");
        poopulate("#bridge-config", "body", bridge).modal();
    }).end();
    zue.lights.getAllLights(bridge);
}

function stopWorking(bridge) {
    $(".IBridgeControl[mac-safe=" + safeMacAddress(bridge.macaddress) + "]").removeClass("working");
}

function hoodieStore(bridge) {
    console.log(JSON.stringify(bridge));
    hoodie.store.add("bridge", JSON.parse(JSON.stringify(bridge))).done(function(o) {
        zue.log("added: " + JSON.stringify(o));
    });
}

function poopulate(template, bucket, model) {
    var cl = $(template).clone();
    cl.attr("id", "").data("model", model);
    for (i in model) {
        if (typeof model[i] === "function") {
            continue;
        }
        var o = cl.find("." + i);
        o.each(function() {
            if ($(this).is("input")) {
                $(this).val(model[i]);
            } else {
                $(this).text(model[i]);
            }
        });
    }
    $(bucket).append(cl);
    return cl;
}

zue.enablePlugin("SimulateGroupsByNames");

zue.on(HUE_ERROR, function(err) {
    if (err.type == ERR_UNAUTHORIZED) {
        createLinkButton(err.bridge);
    } else if (err.type != ERR_LINK_BUTTON_NOT_PRESSED) {
        $("#hue-exception").modal();
    }
});

zue.on(BRIDGE_FOUND, function(bridge) {
    hoodieStore(bridge);
    getAllLights(bridge);
});

zue.on(LIGHT_ADDED, function(light) {
    stopWorking(light.bridge);
    if ($("#" + light.getId()).length < 1) {
        poopulate("#ILightControl", "#lights", light).attr("id", light.getId()).find(".toggle").on("click", function() {
            getLight(this).toggle();
        }).end().find(".setHue").on("click", function() {
            getLight(this).setHue(parseInt(prompt("hue"), 10));
        }).end().find(".name").wrap($("<a zue/>").attr("href", "light/" + light.getId())).end();
        poopulate("#light-control-pallete", "#content-zone", light).attr("id", "light_" + light.getId());
        zueLinks();
        if (light.simple) {
            zue.lights.getLightDetails(light);
        }
    } else {
        saveLight(light);
    }
});

zue.on(LIGHT_UPDATING, function(light) {
    $("#" + light.getId()).addClass("working");
});

zue.on(LIGHT_UPDATED, function(light) {
    $("#" + light.getId()).removeClass("working");
    saveLight(light);
});

zue.on(GROUP_ADDED, function(group) {
    poopulate("#ILightControl", "#groups", group).attr("id", group.getId()).find("no-group").hide();
});

zue.on(HUE_ERROR, function(err) {
    if (err.type == ERR_LINK_BUTTON_NOT_PRESSED) {
        if (err.bridge.linking) {
            setTimeout(function() {
                createUser(err.bridge);
            }, 5e3);
        }
    }
});

zue.on(LINKED, function(bridge) {
    $("input[type=button]").each(function() {
        if ($(this).attr("mac") == bridge.macaddress) {
            $(this).parent().remove();
        }
    });
    hoodieStore(bridge);
    getAllLights(bridge);
});

zue.on(NO_BRIDGE_FOUND, function() {
    $("#no-bridge").modal();
});

var createUser = function(bridge) {
    zue.config.createAnonUser(bridge, "web application");
};

function createLinkButton(bridge) {
    var s = $("#link-section").clone();
    s.find("input[type=button]").attr("mac", bridge.macaddress).data("bridge", bridge).val("Link " + bridge.macaddress).on("click", function() {
        var b = $(this).data("bridge");
        if (!b.linking) {
            b.linking = true;
            $(this).val("Cancel " + b.macaddress);
            createUser(b);
        } else {
            b.linking = false;
            $(this).val("Link " + b.macaddress);
        }
    });
    $(".content").prepend(s);
    s.fadeIn();
}

function zueLinks() {
    var zueLinkClick = function() {
        mainContentArea($(this).data("tag"));
    };
    $("a[zue][href]").each(function() {
        var href = $(this).attr("href");
        $(this).css("cursor", "pointer");
        $(this).removeAttr("href");
        $(this).data("tag", href);
        $(this).on("click", zueLinkClick);
    });
}

function mainContentArea(pane) {
    $("#content-zone > div").hide();
    $z = $("#" + pane.replace("/", "_"));
    if ($z.length > 0 && pane != "nothing-selected") {
        $z.show();
        location.hash = "/" + pane;
    } else {
        $("#nothing-selected").show();
        location.hash = "/";
    }
}

(function() {
    "use strict";
    hoodie.store.findAll("bridge").then(function(bridges) {
        console.log(JSON.stringify(bridges));
        if (bridges.length < 1) {
            zue.bridge.locate();
            return;
        }
        for (var i = 0; i < bridges.length; i++) {
            var b = new Bridge();
            b.exchangeData(bridges[i]);
            getAllLights(b);
        }
    });
    var h = $("#nothing-selected").parent().height();
    $("#nothing-selected").css("height", h + "px");
    zueLinks();
    if (location.hash.length > 2) {
        mainContentArea(location.hash.replace(/[\#\/]/g, ""));
    } else {
        mainContentArea("nothing-selected");
    }
})();