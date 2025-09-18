import { system, world } from "@minecraft/server";

const chests = [
    "obsidian_chest",
    "diamond_chest",
    "gold_chest",
    "iron_chest",
    "copper_chest",
    "dirt_chest"
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
      if (block.typeId === 'iron_chests:crystal_chest') {
          system.run(() => {
              let entity = block.dimension.spawnEntity('iron_chests:crystal_chest',block.center());
entity.nameTag = "§o§e§d";
        });
      }
    }
  });
});