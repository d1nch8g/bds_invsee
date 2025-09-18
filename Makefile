
install:
	rm -rf server/behavior_packs/ender_chest_bp
	rm -rf server/resource_packs/ender_chest_rp
	cp -r BP server/behavior_packs/ender_chest_bp
	cp -r RP server/resource_packs/ender_chest_rp
	
	# Generate new UUIDs
	$(eval BP_HEADER_UUID := $(shell uuidgen))
	$(eval BP_MODULE_DATA_UUID := $(shell uuidgen))
	$(eval BP_MODULE_SCRIPT_UUID := $(shell uuidgen))
	$(eval RP_HEADER_UUID := $(shell uuidgen))
	$(eval RP_MODULE_UUID := $(shell uuidgen))
	
	# Update BP manifest.json with new UUIDs
	sed -i 's/"uuid": "9e544ffa-b8ba-48a8-84f9-44caf23319cc"/"uuid": "$(BP_HEADER_UUID)"/g' server/behavior_packs/ender_chest_bp/manifest.json
	sed -i 's/"uuid": "5473108d-8fe9-4704-85dc-dfc80404e93a"/"uuid": "$(BP_MODULE_DATA_UUID)"/g' server/behavior_packs/ender_chest_bp/manifest.json
	sed -i 's/"uuid": "d10df7f1-a263-41bc-97a3-577ac4fef758"/"uuid": "$(BP_MODULE_SCRIPT_UUID)"/g' server/behavior_packs/ender_chest_bp/manifest.json
	
	# Update RP manifest.json with new UUIDs
	sed -i 's/"uuid": "72f5612b-feb7-4e15-9bd2-c5fb2a994bec"/"uuid": "$(RP_HEADER_UUID)"/g' server/resource_packs/ender_chest_rp/manifest.json
	sed -i 's/"uuid": "3ee2a5be-445d-4cd3-a04d-19a1ea3c1f5c"/"uuid": "$(RP_MODULE_UUID)"/g' server/resource_packs/ender_chest_rp/manifest.json
	
	# Update world configuration files
	sed -i 's/"pack_id": "9e544ffa-b8ba-48a8-84f9-44caf23319cc"/"pack_id": "$(BP_HEADER_UUID)"/g' "server/worlds/Bedrock level/world_behavior_packs.json"
	sed -i 's/"pack_id": "72f5612b-feb7-4e15-9bd2-c5fb2a994bec"/"pack_id": "$(RP_HEADER_UUID)"/g' "server/worlds/Bedrock level/world_resource_packs.json"
