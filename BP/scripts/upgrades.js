import { system, world, ItemStack, EquipmentSlot } from "@minecraft/server";
const chests1 = [
    "obsidian_chest",
    "crystal_chest",
    "diamond_chest",
    "gold_chest",
    "iron_chest",
    "copper_chest",
    "dirt_chest"
    ];
world.afterEvents.entityHitBlock.subscribe((event) => {
    const { damagingEntity, hitBlock } = event;
    const equippable = damagingEntity.getComponent("minecraft:equippable");
    const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
    const direction = hitBlock.permutation.getState('minecraft:cardinal_direction');
    const loc = hitBlock.location;
    
    const block = hitBlock.dimension.getBlock({
        x: loc.x,
        y: loc.y,
        z: loc.z
    });
function upNormalChest(upgradeItem, NewChest){
    if (item.typeId === `iron_chests:${upgradeItem}` && hitBlock.typeId === 'minecraft:chest'){
        block.setType(`iron_chests:${NewChest}`);
        equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
        system.runTimeout(() => {
            block.setPermutation(block.permutation.withState('minecraft:cardinal_direction', direction));
        },1 );
    }
}
    upNormalChest("wood_iron_upgrade", "iron_chest");
    upNormalChest("wood_copper_upgrade", "copper_chest");
    
    
    const findChest = chests1.find(chest => block.typeId === `iron_chests:${chest}`);
    const entities = hitBlock.dimension.getEntities({
        location: block.center(),
        type: `iron_chests:${findChest}`,
        maxDistance: 0.75,
    });
    const chests = entities[0];
      if (!chests) return;
    const inventoryComponent = chests.getComponent("minecraft:inventory");
    const inventory = inventoryComponent?.container;
      if (!inventory) return;
function upgradesTypes(upgradeItem, ChestHit, NewChest){
    if (item.typeId === `iron_chests:${upgradeItem}` && hitBlock.typeId === `${ChestHit}`){
        block.setType(`iron_chests:${NewChest}`);
        block.dimension.runCommand(`execute positioned ${loc.x} ${loc.y} ${loc.z} run event entity @e[type=${ChestHit},r=1,c=1] iron_chests:despawn_chest`);
        equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
        
        for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);
          if (!item) continue;
          
          block.dimension.runCommandAsync(`execute positioned ${loc.x} ${loc.y} ${loc.z} run replaceitem entity @e[type=iron_chests:${NewChest},r=1] slot.inventory ${i} ${item.typeId} ${item.amount}`);
        }
        system.runTimeout(() => {
            block.setPermutation(block.permutation.withState('minecraft:cardinal_direction', direction));
        },1 );
    }
}
    upgradesTypes("copper_iron_upgrade", "iron_chests:copper_chest", "iron_chest");
    upgradesTypes("iron_gold_upgrade", "iron_chests:iron_chest", "gold_chest");
    upgradesTypes("gold_diamond_upgrade", "iron_chests:gold_chest", "diamond_chest");
    upgradesTypes("diamond_crystal_upgrade", "iron_chests:diamond_chest", "crystal_chest");
    upgradesTypes("diamond_obsidian_upgrade", "iron_chests:diamond_chest", "obsidian_chest");
});