
ADDON_NAME = bds_invsee_bp
SERVER_PATH = ~/consensuscraft/data
BEHAVIOR_PACKS_PATH = $(SERVER_PATH)/behavior_packs

.PHONY: install clean pack

pack:
	@echo "Packaging addon..."
	@rm -f $(ADDON_NAME).mcpack
	@zip -r $(ADDON_NAME).mcpack manifest.json scripts/ pack_icon.png
	@echo "✓ Created $(ADDON_NAME).mcpack"

install: pack
	@echo "Installing addon to server..."
	@mkdir -p $(BEHAVIOR_PACKS_PATH)
	@rm -rf $(BEHAVIOR_PACKS_PATH)/$(ADDON_NAME)
	@cd $(BEHAVIOR_PACKS_PATH) && unzip -q $(PWD)/$(ADDON_NAME).mcpack -d $(ADDON_NAME)/
	@echo "✓ Installed to $(BEHAVIOR_PACKS_PATH)/$(ADDON_NAME)/"
	@echo ""
	@echo "Don't forget to:"
	@echo "1. Add pack to worlds/Bedrock\\ level/world_behavior_packs.json"
	@echo "2. Restart server"

clean:
	@rm -f $(ADDON_NAME).mcpack
	@rm -rf $(BEHAVIOR_PACKS_PATH)/$(ADDON_NAME)
	@echo "✓ Cleaned up addon files"