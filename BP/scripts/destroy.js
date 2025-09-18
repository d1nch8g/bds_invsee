import { system, world, ItemStack } from "@minecraft/server";

// Destroy
world.beforeEvents.worldInitialize.subscribe(initEvent => {
      const registry = initEvent.blockComponentRegistry;
  registry.registerCustomComponent("iron_chests:block_destroy", {
    onPlayerDestroy(event) {
      const block = event.block;
      const dimension = event.dimension;
      const center = block.center();

      const entities = dimension.getEntities({
        location: block.center(),
        type: "iron_chests:iron_chest",
        maxDistance: 0.75
      });

      const iron_chest = entities[0];
      if (!iron_chest) return;

      const inventoryComponent = iron_chest.getComponent("minecraft:inventory");
      if (!inventoryComponent) return;

      const inventory = inventoryComponent.container;
      if (!inventory) return;

      for (let i = 0; i <= 54; i++) {
        const item = inventory.getItem(i);
        if (item) {
          dimension.spawnItem(item, block.center());
        }
      }
      iron_chest.remove();
    }
});
registry.registerCustomComponent("iron_chests:crystal_chest_destroy", {
    onPlayerDestroy(event) {
      const block = event.block;
      const dimension = event.dimension;
      const center = block.center();

      const entities = dimension.getEntities({
        location: center,
        maxDistance: 0.75,
        families: ["chest"]
      });
      const entity1 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_1",maxDistance: 0.75
      });
      const entityItems = entity1[0];
        
      const entity2 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_2",maxDistance: 0.75
      });
      const entityItems2 = entity2[0];
        
      const entity3 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_3",maxDistance: 0.75
      });
      const entityItems3 = entity3[0];

      const crystalChest = entities[0];
      if (!crystalChest) return;

      const inventoryComponent = crystalChest.getComponent("minecraft:inventory");
      const inventory = inventoryComponent?.container;
      if (!inventory) return;

      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item) {
          dimension.spawnItem(item, center);
        }
      }
      crystalChest.remove();
      entityItems.remove();
      entityItems2.remove();
      entityItems3.remove();
    }
  });
});
