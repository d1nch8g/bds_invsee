import { world, system } from "@minecraft/server";

class InventoryManager {
  constructor() {
    this.initializeEventHandlers();
  }

  initializeEventHandlers() {
    // Handle player commands
    world.beforeEvents.chatSend.subscribe((eventData) => {
      this.handlePlayerCommand(eventData);
    });

    // Handle server restoration messages
    world.afterEvents.chatSend.subscribe((eventData) => {
      this.handleServerMessage(eventData);
    });
  }

  handlePlayerCommand(eventData) {
    const message = eventData.message.trim();
    const player = eventData.sender;

    if (message === "!upload") {
      eventData.cancel = true;
      this.uploadInventory(player);
    } else if (message === "!download") {
      eventData.cancel = true;
      this.requestInventoryDownload(player);
    }
  }

  handleServerMessage(eventData) {
    // Only process server-generated messages (sender is undefined for server messages)
    if (
      eventData.sender === undefined &&
      eventData.message.startsWith("[INVENTORY_RESTORE]")
    ) {
      try {
        const jsonData = eventData.message.substring(18); // Remove prefix
        const inventoryData = JSON.parse(jsonData);
        this.restorePlayerInventory(inventoryData);
      } catch (error) {
        console.warn("Failed to parse inventory restore data:", error);
      }
    }
  }

  uploadInventory(player) {
    try {
      const inventoryData = this.exportPlayerInventory(player);

      // Clear player's inventory and equipment
      this.clearInventory(player);

      // Send inventory data via chat for external capture
      world.sendMessage(`[INVENTORY_EXPORT]${JSON.stringify(inventoryData)}`);

      player.sendMessage("§a✓ Inventory uploaded and cleared!");
    } catch (error) {
      player.sendMessage("§c✗ Failed to upload inventory");
      console.error("Upload inventory error:", error);
    }
  }

  requestInventoryDownload(player) {
    try {
      const requestData = {
        player_xuid: this.getPlayerXUID(player),
        player_name: player.name,
        timestamp: Date.now()
      };

      // Send download request via chat for external capture
      world.sendMessage(`[INVENTORY_REQUEST]${JSON.stringify(requestData)}`);
      
      player.sendMessage("§e⏳ Download request sent to external system...");
    } catch (error) {
      player.sendMessage("§c✗ Failed to request inventory download");
      console.error("Request download error:", error);
    }
  }

  clearInventory(player) {
    try {
      // Clear main inventory
      const inventory = player.getComponent("inventory");
      if (inventory && inventory.container) {
        for (let i = 0; i < inventory.container.size; i++) {
          inventory.container.setItem(i, undefined);
        }
      }

      // Clear equipment slots
      const equipment = player.getComponent("equippable");
      if (equipment) {
        equipment.setEquipment("Head", undefined);
        equipment.setEquipment("Chest", undefined);
        equipment.setEquipment("Legs", undefined);
        equipment.setEquipment("Feet", undefined);
        equipment.setEquipment("Offhand", undefined);
      }

      player.sendMessage("§e⚠ Inventory cleared");
    } catch (error) {
      player.sendMessage("§c✗ Failed to clear inventory");
      console.error("Clear inventory error:", error);
    }
  }

  exportPlayerInventory(player) {
    const data = {
      player_xuid: this.getPlayerXUID(player),
      player_name: player.name,
      timestamp: Date.now(),
      inventory: [],
      equipment: {},
    };

    // Export main inventory (36 slots)
    const inventory = player.getComponent("inventory");
    if (inventory && inventory.container) {
      for (let i = 0; i < inventory.container.size; i++) {
        const item = inventory.container.getItem(i);
        if (item) {
          data.inventory.push({
            slot: i,
            type: item.typeId,
            amount: item.amount,
            enchantments: this.getItemEnchantments(item),
            container_contents: this.getItemContainerContents(item)
          });
        }
      }
    }

    // Export equipment
    const equipment = player.getComponent("equippable");
    if (equipment) {
      const slots = ["Head", "Chest", "Legs", "Feet", "Offhand"];
      slots.forEach((slot) => {
        const item = equipment.getEquipment(slot);
        if (item) {
          data.equipment[slot.toLowerCase()] = {
            type: item.typeId,
            amount: item.amount,
            enchantments: this.getItemEnchantments(item),
            container_contents: this.getItemContainerContents(item)
          };
        }
      });
    }

    return data;
  }

  restorePlayerInventory(data) {
    try {
      // Find player by XUID
      const player = world.getPlayers().find((p) => this.getPlayerXUID(p) === data.player_xuid);
      if (!player) {
        console.warn(
          "Player not found for inventory restore:",
          data.player_xuid
        );
        return;
      }

      // Restore main inventory
      const inventory = player.getComponent("inventory");
      if (inventory && inventory.container && data.inventory) {
        data.inventory.forEach((itemData) => {
          if (itemData.slot < inventory.container.size) {
            const itemStack = this.createItemStack(itemData);
            inventory.container.setItem(itemData.slot, itemStack);
          }
        });
      }

      // Restore equipment
      const equipment = player.getComponent("equippable");
      if (equipment && data.equipment) {
        Object.entries(data.equipment).forEach(([slot, itemData]) => {
          const equipmentSlot = slot.charAt(0).toUpperCase() + slot.slice(1);
          const itemStack = this.createItemStack(itemData);
          equipment.setEquipment(equipmentSlot, itemStack);
        });
      }

      player.sendMessage("§a✓ Inventory restored!");
    } catch (error) {
      console.error("Restore inventory error:", error);
    }
  }

  createItemStack(itemData) {
    try {
      const itemStack = new ItemStack(itemData.type, itemData.amount);

      // Apply enchantments if any
      if (itemData.enchantments && itemData.enchantments.length > 0) {
        const enchantmentComponent = itemStack.getComponent("enchantments");
        if (enchantmentComponent) {
          itemData.enchantments.forEach((ench) => {
            enchantmentComponent.enchantments.addEnchantment({
              type: ench.type,
              level: ench.level,
            });
          });
        }
      }

      // Restore container contents (shulker boxes, bundles, etc.)
      if (itemData.container_contents && itemData.container_contents.length > 0) {
        this.setItemContainerContents(itemStack, itemData.container_contents);
      }

      return itemStack;
    } catch (error) {
      console.error("Failed to create item stack:", error);
      return undefined;
    }
  }

  getItemEnchantments(item) {
    try {
      const enchantmentComponent = item.getComponent("enchantments");
      if (enchantmentComponent && enchantmentComponent.enchantments) {
        const enchantments = [];
        // Note: Actual enchantment iteration depends on API version
        // This is a simplified structure
        return enchantments;
      }
    } catch (error) {
      console.error("Failed to get enchantments:", error);
    }
    return [];
  }

  getItemContainerContents(item) {
    try {
      // Check if item has container component (shulker boxes, bundles, etc.)
      const containerComponent = item.getComponent("container");
      if (containerComponent && containerComponent.container) {
        const contents = [];
        for (let i = 0; i < containerComponent.container.size; i++) {
          const containerItem = containerComponent.container.getItem(i);
          if (containerItem) {
            contents.push({
              slot: i,
              type: containerItem.typeId,
              amount: containerItem.amount,
              enchantments: this.getItemEnchantments(containerItem),
              container_contents: this.getItemContainerContents(containerItem) // Recursive for nested containers
            });
          }
        }
        return contents;
      }
    } catch (error) {
      console.warn("Failed to get item container contents:", error);
    }
    return [];
  }

  setItemContainerContents(itemStack, contents) {
    try {
      // Set container contents for items like shulker boxes
      const containerComponent = itemStack.getComponent("container");
      if (containerComponent && containerComponent.container) {
        contents.forEach((itemData) => {
          if (itemData.slot < containerComponent.container.size) {
            const nestedItem = this.createItemStack(itemData);
            containerComponent.container.setItem(itemData.slot, nestedItem);
          }
        });
      }
    } catch (error) {
      console.warn("Failed to set item container contents:", error);
    }
  }

  getPlayerXUID(player) {
    // Try to get XUID from player properties
    // Note: XUID access may vary by API version
    try {
      // In newer versions, XUID might be available as player.xuid or similar
      return player.id || player.xuid || "unknown";
    } catch (error) {
      console.warn("Could not get player XUID:", error);
      return player.id || "unknown";
    }
  }
}

// Initialize the addon
system.runInterval(() => {
  // Initialize on first run
  if (!world.inventoryManager) {
    world.inventoryManager = new InventoryManager();
    world.sendMessage(
      "§b[BDS InvSee] §fAddon loaded - Use !upload or !download commands"
    );
  }
}, 20); // Run once per second
