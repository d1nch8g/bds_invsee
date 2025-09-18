import { system, world, ItemStack } from "@minecraft/server";

// Destroy
world.beforeEvents.worldInitialize.subscribe(initEvent => {
      const registry = initEvent.blockComponentRegistry;
  registry.registerCustomComponent("x_ender_chest:block_destroy", {
    onPlayerDestroy(event) {
      const block = event.block;
      const dimension = event.dimension;
      const center = block.center();

      const entities = dimension.getEntities({
        location: block.center(),
        type: "x_ender_chest:x_ender_chest",
        maxDistance: 0.75
      });

      const x_ender_chest = entities[0];
      if (!x_ender_chest) return;

      const inventoryComponent = x_ender_chest.getComponent("minecraft:inventory");
      if (!inventoryComponent) return;

      const inventory = inventoryComponent.container;
      if (!inventory) return;

      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item) {
          dimension.spawnItem(item, block.center());
        }
      }
      x_ender_chest.remove();
    }
});
});
