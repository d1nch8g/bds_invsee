import { world, DynamicPropertiesDefinition } from "@minecraft/server";

const STORAGE_PROP = "ender_storage"; // per-player JSON string

// ---- Register persistent storage ----
world.afterEvents.worldInitialize.subscribe((ev) => {
  let def = new DynamicPropertiesDefinition();
  def.defineString(STORAGE_PROP, 32768);
  ev.propertyRegistry.registerEntityTypeDynamicProperties(
    def,
    "minecraft:player"
  );
  console.log("[bds_invsee] Ender chest storage registered.");
});

// ---- Helpers ----
function loadStorage(player) {
  try {
    return JSON.parse(player.getDynamicProperty(STORAGE_PROP) || "[]");
  } catch {
    return [];
  }
}

function saveStorage(player, storage) {
  player.setDynamicProperty(STORAGE_PROP, JSON.stringify(storage));
}

// ---- Listen for stdin commands via chat (/say) ----
world.afterEvents.chatSend.subscribe((ev) => {
  const msg = ev.message.trim();
  if (!msg.toLowerCase().startsWith("modify_ender_chest")) return;

  // Example: "modify_ender_chest Alice set minecraft:diamond 10"
  const [_, playerName, action, itemId, amountStr] = msg.split(/\s+/);
  const target = [...world.getPlayers()].find((p) => p.name === playerName);
  if (!target) {
    console.log(`[EnderChest] Player ${playerName} not found.`);
    return;
  }

  let storage = loadStorage(target);

  if (action === "set") {
    const amount = parseInt(amountStr);
    storage = [{ id: itemId, amount }];
    saveStorage(target, storage);
    console.log(
      `[EnderChest] Set ${playerName}'s chest to ${amount}x ${itemId}`
    );
  }

  if (action === "clear") {
    saveStorage(target, []);
    console.log(`[EnderChest] Cleared ${playerName}'s chest`);
  }
});

// ---- Player interacts with custom or vanilla chest ----
world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  if (
    ev.block.typeId !== "minecraft:ender_chest" &&
    ev.block.typeId !== "bds_invsee:ender_chest"
  )
    return;
  ev.cancel = true;

  if (ev.block.typeId === "minecraft:ender_chest") {
    ev.block.setType("bds_invsee:ender_chest");
  }

  const player = ev.player;
  let storage = loadStorage(player);

  // For now, just announce contents
  player.sendMessage(
    `§a[Chest] You opened your chest: ${JSON.stringify(storage)}`
  );
  console.log(
    `[EnderChest] ${player.name} opened chest with: ${JSON.stringify(storage)}`
  );
});

// ---- Log inventory changes ----
world.afterEvents.entityInventoryChanged.subscribe((ev) => {
  if (ev.entity.typeId !== "minecraft:player") return;
  console.log(`[Inventory] ${ev.entity.name} inventory changed`);
});
