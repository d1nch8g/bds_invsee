import { system, world } from "@minecraft/server";

const chests = ["copper_chest"];

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent("iron_chests:copper_chest", {
    onTick(event) {
        const block = event.block;
        const dimension = event.dimension;

        const findChest = chests.find(chest => block.typeId === `iron_chests:${chest}`)
        const entities = dimension.getEntities({
            location: block.center(),
            type: `iron_chests:${findChest}`,
            maxDistance: 0.75
        });
        const chestEntity = entities[0];
        if (!chestEntity) return;

        // Set directional tags for the chest entity
        const direction = block.permutation.getState('minecraft:cardinal_direction');
        if (direction) {
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
    }
  });
});

// Handle script events for chest opening/closing
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;
    
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
        }, 9);
    }
});

// Handle player interaction with chest
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;

    const findChest = chests.find(chest => target.typeId === `iron_chests:${chest}`);
    if (!findChest) return;

    const pos = target.location;
    const block = target.dimension.getBlock({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
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
            `execute positioned ${pos.x} ${pos.y} ${pos.z} run summon iron_chests:${findChest}_top ~ ~ ~ ${chestRot}`);
    }

    if (target.typeId === `iron_chests:${findChest}`) {
        target.addTag("chestOpened");
        player.addTag("interacted");
        target.dimension.playSound("random.chestopen", pos);

        block.setPermutation(block.permutation.withState('iron_chests:top', 1));
        SpawnEntity();
        target.dimension.runCommandAsync(
            `execute positioned ${pos.x} ${pos.y} ${pos.z} run playanimation @e[family=top,r=0,c=1] animation.chest.open`);
    }
});
