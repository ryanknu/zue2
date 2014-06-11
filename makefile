CORE_ZUE_FILES := src/core/priority_queue.js src/core/ajax.js src/core/events.js src/core/core.js src/core/bridge.js src/core/config.js src/core/lights.js src/core/groups.js src/core/plugins/name_pgroup.js src/core/color.js src/core/schedule.js
CORE_ZUE_OUTPUT ?= www/assets/js/zue.js

UI_FILES := src/ui/ui.js src/ui/linking.js src/ui/navigation.js src/ui/junction.js src/ui/landing.js
UI_OUTPUT ?= www/assets/js/main.js

all: concat_zue min_zue concat_ui min_ui

min_zue: $(CORE_ZUE_OUTPUT:.js=.min.js)

min_ui: $(UI_OUTPUT:.js=.min.js)

concat_zue: $(CORE_ZUE_FILES)
	cat $^ > $(CORE_ZUE_OUTPUT)

concat_ui: $(UI_FILES)
	cat $^ > $(UI_OUTPUT)

%.min.js: %.js
	uglifyjs -m --output $@ $<
	uglifyjs -b --output $< $<
