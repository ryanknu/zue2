JS_FILES := src/zue_core/ajax.js src/zue_core/events.js src/zue_core/core.js src/zue_core/bridge.js src/zue_core/config.js src/zue_core/lights.js src/zue_core/groups.js src/zue_core/plugins/name_pgroup.js
OUTPUT ?= www/assets/js/zue.js

all: concat min

min: $(OUTPUT:.js=.min.js)

%.min.js: %.js
	uglifyjs -m --output $@ $<
	uglifyjs -b --output $< $<

concat: $(JS_FILES)
	cat $^ > $(OUTPUT)
	cat $^ > $(OUTPUT)
