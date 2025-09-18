
# UUID variables - regenerated on each install
BP_HEADER_UUID := $(shell uuidgen)
BP_MODULE_DATA_UUID := $(shell uuidgen)
BP_MODULE_SCRIPT_UUID := $(shell uuidgen)
RP_HEADER_UUID := $(shell uuidgen)
RP_MODULE_UUID := $(shell uuidgen)

install:
	rm -rf server/behavior_packs/ender_chest_bp
	rm -rf server/resource_packs/ender_chest_rp
	cp -r BP server/behavior_packs/ender_chest_bp
	cp -r RP server/resource_packs/ender_chest_rp
	
	# Update BP manifest.json with new UUIDs using pattern replacement
	sed -i '24s/"uuid": "[^"]*"/"uuid": "$(BP_HEADER_UUID)"/' server/behavior_packs/ender_chest_bp/manifest.json
	sed -i '34s/"uuid": "[^"]*"/"uuid": "$(BP_MODULE_DATA_UUID)"/' server/behavior_packs/ender_chest_bp/manifest.json
	sed -i '44s/"uuid": "[^"]*"/"uuid": "$(BP_MODULE_SCRIPT_UUID)"/' server/behavior_packs/ender_chest_bp/manifest.json
	
	# Update RP manifest.json with new UUIDs using pattern replacement
	sed -i '24s/"uuid": "[^"]*"/"uuid": "$(RP_HEADER_UUID)"/' server/resource_packs/ender_chest_rp/manifest.json
	sed -i '34s/"uuid": "[^"]*"/"uuid": "$(RP_MODULE_UUID)"/' server/resource_packs/ender_chest_rp/manifest.json
	
	# Update world configuration files using pattern replacement
	sed -i '3s/"pack_id": "[^"]*"/"pack_id": "$(BP_HEADER_UUID)"/' "server/worlds/Bedrock level/world_behavior_packs.json"
	sed -i '3s/"pack_id": "[^"]*"/"pack_id": "$(RP_HEADER_UUID)"/' "server/worlds/Bedrock level/world_resource_packs.json"
