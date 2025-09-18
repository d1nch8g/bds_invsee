import { system, world } from "@minecraft/server";

const chests = [
    "copper_chest"
    ];
          
          
world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent("iron_chests:place", {
    onPlace(event) {
      
      const block = event.block;
      const dimension = event.dimension
      
      const findChest = chests.find(chest => block.typeId === `iron_chests:${chest}`)
      if (findChest) {
          system.run(() => {
              let entity = block.dimension.spawnEntity(`iron_chests:${findChest}`,block.center());
              entity.nameTag = `iron_chests.${findChest}`;
        });
      }

    }
  });
});