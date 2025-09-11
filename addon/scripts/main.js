import { world, system, ItemStack } from "@minecraft/server";

class EnderChestManager {
  constructor() {
    console.warn("[BDS InvSee] Starting Ender Chest Manager v1.0");
    this.initializeEventHandlers();
  }

  initializeEventHandlers() {
    console.warn("[BDS InvSee] Setting up event handlers...");
    
    try {
      // Track player interactions with ender chests
      if (world.afterEvents && world.afterEvents.playerInteractWithBlock) {
        world.afterEvents.playerInteractWithBlock.subscribe((eventData) => {
          const block = eventData.block;
          const player = eventData.player;
          
          // Check if player interacted with our custom ender chest or vanilla ender chest
          if (block.typeId === "bds_invsee:ender_chest" || block.typeId === "minecraft:ender_chest") {
            this.handleEnderChestInteraction(player, block, eventData);
          }
        });
        console.warn("[BDS InvSee] ✓ Block interaction tracking enabled");
      } else {
        console.warn("[BDS InvSee] ✗ Block interaction tracking not available");
      }

      // Track block interactions for inventory flow  
      if (world.afterEvents && world.afterEvents.playerPlaceBlock) {
        world.afterEvents.playerPlaceBlock.subscribe((eventData) => {
          this.logBlockPlace(eventData);
        });
        console.warn("[BDS InvSee] ✓ Block place tracking enabled");
      }
      
      if (world.afterEvents && world.afterEvents.playerBreakBlock) {
        world.afterEvents.playerBreakBlock.subscribe((eventData) => {
          this.logBlockBreak(eventData);
        });
        console.warn("[BDS InvSee] ✓ Block break tracking enabled");
      }

      // Track when players join/leave for logging
      if (world.afterEvents && world.afterEvents.playerJoin) {
        world.afterEvents.playerJoin.subscribe((eventData) => {
          console.warn(`[BDS InvSee] Player joined: ${eventData.playerName}`);
        });
        console.warn("[BDS InvSee] ✓ Player join tracking enabled");
      }

      if (world.afterEvents && world.afterEvents.playerLeave) {
        world.afterEvents.playerLeave.subscribe((eventData) => {
          console.warn(`[BDS InvSee] Player left: ${eventData.playerName}`);
        });
        console.warn("[BDS InvSee] ✓ Player leave tracking enabled");
      }

      // Use a simpler approach for chat - just basic commands
      system.runInterval(() => {
        this.checkForCommands();
      }, 20);

      console.warn("[BDS InvSee] Event handlers initialized successfully");
    } catch (error) {
      console.warn(`[BDS InvSee] Error setting up event handlers: ${error}`);
    }
  }

  checkForCommands() {
    // This will be called periodically to check for any pending operations
    // For now, just ensure the system is running
  }

  handleEnderChestInteraction(player, block, eventData) {
    const playerData = {
      name: player.name,
      xuid: this.getPlayerXUID(player),
      location: {
        x: Math.floor(block.location.x),
        y: Math.floor(block.location.y), 
        z: Math.floor(block.location.z)
      },
      dimension: block.dimension.id,
      timestamp: Date.now()
    };

    console.warn(`[ENDER_CHEST_INTERACT] ${JSON.stringify(playerData)}`);
    
    // Export current inventory when opening ender chest
    system.runTimeout(() => {
      this.exportPlayerEnderChest(player);
    }, 2); // Small delay to ensure chest is opened
  }

  exportPlayerEnderChest(player) {
    try {
      const inventoryData = this.exportPlayerInventory(player);
      console.warn(`[ENDER_CHEST_EXPORT] ${JSON.stringify(inventoryData)}`);
    } catch (error) {
      console.warn(`[BDS InvSee] Error exporting ender chest: ${error}`);
    }
  }

  logBlockPlace(eventData) {
    try {
      const placeData = {
        player: eventData.player.name,
        player_xuid: this.getPlayerXUID(eventData.player),
        block_type: eventData.block.typeId,
        location: {
          x: eventData.block.location.x,
          y: eventData.block.location.y,
          z: eventData.block.location.z
        },
        dimension: eventData.dimension.id,
        timestamp: Date.now()
      };

      console.warn(`[BLOCK_PLACED] ${JSON.stringify(placeData)}`);
    } catch (error) {
      console.warn(`[BDS InvSee] Error logging block place: ${error}`);
    }
  }

  logBlockBreak(eventData) {
    try {
      const breakData = {
        player: eventData.player.name,
        player_xuid: this.getPlayerXUID(eventData.player),
        block_type: eventData.block.typeId,
        location: {
          x: eventData.block.location.x,
          y: eventData.block.location.y,
          z: eventData.block.location.z
        },
        dimension: eventData.dimension.id,
        timestamp: Date.now()
      };

      console.warn(`[BLOCK_BROKEN] ${JSON.stringify(breakData)}`);
    } catch (error) {
      console.warn(`[BDS InvSee] Error logging block break: ${error}`);
    }
  }

  handleChatMessage(eventData) {
    const message = eventData.message.trim();
    const player = eventData.sender;

    // Handle restore commands
    if (message.startsWith("[ENDER_CHEST_RESTORE]")) {
      try {
        const jsonStr = message.substring("[ENDER_CHEST_RESTORE]".length);
        const restoreData = JSON.parse(jsonStr);
        this.restorePlayerEnderChest(restoreData);
      } catch (error) {
        console.warn(`[BDS InvSee] Failed to parse restore data: ${error}`);
      }
    }
    // Handle manual commands
    else if (message === "!export") {
      this.exportPlayerEnderChest(player);
      player.sendMessage("§a✓ Ender chest data exported to server log");
    }
    else if (message === "!clear") {
      this.clearPlayerInventory(player);
      player.sendMessage("§e⚠ Inventory cleared");
    }
  }

  exportPlayerInventory(player) {
    const data = {
      player_xuid: this.getPlayerXUID(player),
      player_name: player.name,
      timestamp: Date.now(),
      inventory: [],
      equipment: {},
      location: player.location,
      dimension: player.dimension.id
    };

    // Export main inventory
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
            nbt: this.getItemNBT(item)
          });
        }
      }
    }

    // Export equipment
    const equipment = player.getComponent("equippable");
    if (equipment) {
      const slots = ["Head", "Chest", "Legs", "Feet", "Offhand"];
      slots.forEach((slot) => {
        try {
          const item = equipment.getEquipment(slot);
          if (item) {
            data.equipment[slot.toLowerCase()] = {
              type: item.typeId,
              amount: item.amount,
              enchantments: this.getItemEnchantments(item),
              nbt: this.getItemNBT(item)
            };
          }
        } catch (error) {
          // Slot might not be available
        }
      });
    }

    return data;
  }

  restorePlayerEnderChest(restoreData) {
    try {
      // Find player by XUID
      const player = world.getPlayers().find(p => 
        this.getPlayerXUID(p) === restoreData.player_xuid
      );
      
      if (!player) {
        console.warn(`[BDS InvSee] Player not found for restore: ${restoreData.player_xuid}`);
        return;
      }

      console.warn(`[BDS InvSee] Restoring ender chest for ${player.name}`);
      
      // Restore main inventory
      const inventory = player.getComponent("inventory");
      if (inventory && inventory.container && restoreData.inventory) {
        // Clear inventory first
        for (let i = 0; i < inventory.container.size; i++) {
          inventory.container.setItem(i, undefined);
        }
        
        // Restore items
        restoreData.inventory.forEach((itemData) => {
          if (itemData.slot < inventory.container.size) {
            const itemStack = this.createItemStack(itemData);
            if (itemStack) {
              inventory.container.setItem(itemData.slot, itemStack);
            }
          }
        });
      }

      // Restore equipment
      const equipment = player.getComponent("equippable");
      if (equipment && restoreData.equipment) {
        Object.entries(restoreData.equipment).forEach(([slot, itemData]) => {
          try {
            const equipmentSlot = slot.charAt(0).toUpperCase() + slot.slice(1);
            const itemStack = this.createItemStack(itemData);
            if (itemStack) {
              equipment.setEquipment(equipmentSlot, itemStack);
            }
          } catch (error) {
            console.warn(`[BDS InvSee] Error restoring equipment slot ${slot}: ${error}`);
          }
        });
      }

      player.sendMessage("§a✓ Ender chest restored!");
      console.warn(`[ENDER_CHEST_RESTORED] ${JSON.stringify({
        player: player.name,
        player_xuid: this.getPlayerXUID(player),
        timestamp: Date.now()
      })}`);
      
    } catch (error) {
      console.warn(`[BDS InvSee] Error restoring ender chest: ${error}`);
    }
  }

  clearPlayerInventory(player) {
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
        const slots = ["Head", "Chest", "Legs", "Feet", "Offhand"];
        slots.forEach((slot) => {
          try {
            equipment.setEquipment(slot, undefined);
          } catch (error) {
            // Slot might not be available
          }
        });
      }

      console.warn(`[INVENTORY_CLEARED] ${JSON.stringify({
        player: player.name,
        player_xuid: this.getPlayerXUID(player),
        timestamp: Date.now()
      })}`);
      
    } catch (error) {
      console.warn(`[BDS InvSee] Error clearing inventory: ${error}`);
    }
  }

  createItemStack(itemData) {
    try {
      const itemStack = new ItemStack(itemData.type, itemData.amount);
      
      // Apply enchantments if any
      if (itemData.enchantments && itemData.enchantments.length > 0) {
        const enchantmentComponent = itemStack.getComponent("enchantable");
        if (enchantmentComponent) {
          itemData.enchantments.forEach((ench) => {
            try {
              enchantmentComponent.addEnchantment({
                type: ench.type,
                level: ench.level,
              });
            } catch (error) {
              console.warn(`[BDS InvSee] Error adding enchantment: ${error}`);
            }
          });
        }
      }

      return itemStack;
    } catch (error) {
      console.warn(`[BDS InvSee] Failed to create item stack: ${error}`);
      return undefined;
    }
  }

  getItemEnchantments(item) {
    try {
      const enchantmentComponent = item.getComponent("enchantable");
      if (enchantmentComponent && enchantmentComponent.getEnchantments) {
        return enchantmentComponent.getEnchantments().map(ench => ({
          type: ench.type.id,
          level: ench.level
        }));
      }
    } catch (error) {
      // Enchantments not available or error getting them
    }
    return [];
  }

  getItemNBT(item) {
    try {
      // Get basic item properties
      return {
        nameTag: item.nameTag || null,
        lore: item.getLore ? item.getLore() : [],
        keepOnDeath: item.keepOnDeath || false
      };
    } catch (error) {
      return {};
    }
  }

  getPlayerXUID(player) {
    try {
      return player.id || "unknown";
    } catch (error) {
      return "unknown";
    }
  }
}

// Initialize the ender chest manager
system.runInterval(() => {
  if (!world.enderChestManager) {
    console.warn("[BDS InvSee] Initializing Ender Chest Manager...");
    world.enderChestManager = new EnderChestManager();
    world.sendMessage("§b[BDS InvSee] §fEnder Chest Manager loaded - Use !export or !clear in chat");
    console.warn("[BDS InvSee] Ender Chest Manager fully initialized!");
  }
}, 20);
