import { system, world, ItemStack, EquipmentSlot, ItemComponentTypes } from "@minecraft/server";
const chests = [
    "obsidian_chest",
    "crystal_chest",
    "diamond_chest",
    "gold_chest",
    "iron_chest",
    "copper_chest",
    "dirt_chest"
    ];
world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent("iron_chests:crystal_chest", {
    onTick(event) {
        
        const block = event.block;
        const dimension = event.dimension;


        const findChest = chests.find(chest => block.typeId === `iron_chests:${chest}`)
        const top = dimension.getEntities({
            location: block.center(),
            type: `iron_chests:${findChest}`,
            maxDistance: 0.75
        });
        const chestEntity = top[0];

        const direction = block.permutation.getState('minecraft:cardinal_direction');
        if (direction){
        switch (direction) {
            case "north":
                chestEntity.addTag("north");
                break;
            case "south":
                chestEntity.addTag("south");
                break;
            case "west":
                chestEntity.addTag("west");
                break;
            case "east":
                chestEntity.addTag("east");
                break;
            }
        }
    
        const entities = dimension.getEntities({
            location: block.center(),
            type: "iron_chests:crystal_chest",
            maxDistance: 0.75
        });
        const crystal_chest = entities[0];
        if (!crystal_chest) return;
        const inventoryComponent = crystal_chest.getComponent("minecraft:inventory");
        const inventory = inventoryComponent?.container;
        if (!inventory) return;
        const slots = [];
        for(let i = 0; i <= 7; i++){
            slots.push(inventory.getItem(i));
        }
    
        const item0 = slots[0];
        const pos = crystal_chest.location;

        const equippable = crystal_chest.getComponent("minecraft:equippable");
        
    
    
function ItemsClear(SlotId, EntityId) {
    const slot_part = SlotId;
    block.dimension.runCommand(`execute positioned ${pos.x} ${pos.y} ${pos.z} run replaceitem entity @e[type=iron_chests:${EntityId},r=0,c=1] slot.weapon.${slot_part} 1 air 1`);
}

function ChestItems(SlotId, SlotItem, EntityId) {
    const slot_part = SlotId;
    const item = SlotItem.typeId;
    
    block.dimension.runCommand(`execute positioned ${pos.x} ${pos.y} ${pos.z} run replaceitem entity @e[type=iron_chests:${EntityId},r=0,c=1] slot.weapon.${slot_part} 1 ${item} 1`);
}
        const entity1 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_1",maxDistance: 0.75
        });
        const entityItems = entity1[0];
        
        const entity2 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_2",maxDistance: 0.75
        });
        const entityItems2 = entity2[0];
        
        const entity3 = dimension.getEntities({location: block.center(),type: "iron_chests:chest_items_3",maxDistance: 0.75
        });
        const entityItems3 = entity3[0];
        const sincro = () => {
            block.dimension.runCommandAsync(`execute positioned ${pos.x} ${pos.y} ${pos.z} run playanimation @e[family=chest,r=0,c=4] animation.crystal_chest.itemtest`);
        };
        if ((slots[2] || slots[3]) && !entityItems) {
          block.dimension.spawnEntity("iron_chests:chest_items_1", block.center());
        }
        if ((slots[4] || slots[5]) && !entityItems2) {
          block.dimension.spawnEntity("iron_chests:chest_items_2", block.center());
        }
        if ((slots[6] || slots[7]) && !entityItems3) {
          block.dimension.spawnEntity("iron_chests:chest_items_3", block.center());
        }

        if (item0){
          ChestItems("offhand", slots[0], "crystal_chest");
        } else {
          ItemsClear("offhand", "crystal_chest");
        }
        if (slots[1]){
          ChestItems("mainhand", slots[1], "crystal_chest");
        } else {
          ItemsClear("mainhand", "crystal_chest");
        }
//BLOCK ONE
        if (slots[2]) {
          ChestItems("offhand", slots[2], "chest_items_1");
        } else {
          ItemsClear("offhand", "chest_items_1");
        }
        if (slots[3]) {
          ChestItems("mainhand", slots[3], "chest_items_1");
        } else {
          ItemsClear("mainhand", "chest_items_1");
        }
        if(!slots[2] && !slots[3]){
            entityItems?.remove();
        }
        
//BLOCK TWO
        if (slots[4]) {
          ChestItems("offhand", slots[4], "chest_items_2");
        } else {
          ItemsClear("offhand", "chest_items_2");
        }
        if (slots[5]) {
          ChestItems("mainhand", slots[5], "chest_items_2");
        } else {
          ItemsClear("mainhand", "chest_items_2");
        }
        if(!slots[4] && !slots[5]){
            entityItems2?.remove();
        }
        
//BLOCK THREE
        if (slots[6]) {
          ChestItems("offhand", slots[6], "chest_items_3");
        } else {
          ItemsClear("offhand", "chest_items_3");
        }
        if (slots[7]) {
          ChestItems("mainhand", slots[7], "chest_items_3");
        } else {
          ItemsClear("mainhand", "chest_items_3");
        }
        if(!slots[6] && !slots[7]){
            entityItems3?.remove();
      }
    }
  });
});
const dimensions = [
    "overworld",
    "the_end",
    "nether"
    ];
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;
    for(const d of dimensions) {
    const dim = world.getDimension(d);
    const block = sourceEntity.dimension.getBlock({
        x: Math.floor(sourceEntity.location.x),
        y: Math.floor(sourceEntity.location.y),
        z: Math.floor(sourceEntity.location.z)
    });
    const findChest = chests.find(chest => block.typeId === `iron_chests:${chest}`);
    if (!findChest) return;
  
  
    if (id == "iron_chests:open" && findChest) {
        sourceEntity.setProperty("iron_chests:opened", true);
    }
    
    
    if (id == "iron_chests:close" && sourceEntity.hasTag("chestOpened")) {
        sourceEntity.removeTag("chestOpened");
        sourceEntity.dimension.playSound("random.chestclosed", sourceEntity.location);

        sourceEntity.setProperty("iron_chests:opened", false);
        sourceEntity.addTag("closed");
        
        sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run tag @e[tag=top,r=7] remove interacted`);
        sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run playanimation @e[family=top,r=1,c=1] animation.chest.close`);
        system.runTimeout(() => {
        sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run event entity @e[family=top,r=0,c=1] iron_chests:despawn_chest`);
        block.setPermutation(block.permutation.withState('iron_chests:top', 0));
    },9);
    }
  }
});
//Unnecessary part that could be done above
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const player = event.player;
  const dimension = event.dimension;
  const target = event.target;
  
  const findChest = chests.find(chest => target.typeId === `iron_chests:${chest}`);
  if (!findChest) return;
  
  
  const pos2 = target.location;

  const block = target.dimension.getBlock({
      x: Math.floor(pos2.x),
      y: Math.floor(pos2.y),
      z: Math.floor(pos2.z)
  });

  const tags = target.getTags();
  const directions = {
    north: "180",
    south: "0",
    west: "90",
    east: "-90"
  };
  const directionKeys = Object.keys(directions);
  const chestTag = tags.find(tag =>
  directionKeys.some(dir => tag.startsWith(dir))
);
 const chestRot = directions[chestTag] ?? 0;

function SpawnEntity() {
    target.dimension.runCommand(
      `execute positioned ${pos2.x} ${pos2.y} ${pos2.z} run summon iron_chests:${findChest}_top ~ ~ ~ ${chestRot}`);
  }

  if (target.typeId === `iron_chests:${findChest}`) {
    target.addTag("chestOpened");
    player.addTag("interacted");
    if(player.hasTag("interacted")){
        console.warn(player.typeId);
    }
    target.dimension.playSound("random.chestopen", pos2);
    
    block.setPermutation(block.permutation.withState('iron_chests:top', 1));
    SpawnEntity();
    target.dimension.runCommandAsync(
      `execute positioned ${pos2.x} ${pos2.y} ${pos2.z} run playanimation @e[family=top,r=0,c=1] animation.chest.open`);
  }
});