import { system, world } from "@minecraft/server";

const chests = ["x_ender_chest"];

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent("x_ender_chest:x_ender_chest", {
    onTick(event) {
        const block = event.block;
        const dimension = event.dimension;

        const findChest = chests.find(chest => block.typeId === `x_ender_chest:${chest}`)
        const entities = dimension.getEntities({
            location: block.center(),
            type: `x_ender_chest:${findChest}`,
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
    
    const findChest = chests.find(chest => block.typeId === `x_ender_chest:${chest}`);
    if (!findChest) return;

    if (id == "x_ender_chest:open" && findChest) {
        sourceEntity.setProperty("x_ender_chest:opened", true);
    }

    if (id == "x_ender_chest:close" && sourceEntity.hasTag("chestOpened")) {
        sourceEntity.removeTag("chestOpened");
        sourceEntity.dimension.playSound("random.enderchestclosed", sourceEntity.location);

        sourceEntity.addTag("closed");

        sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run tag @e[tag=top,r=7] remove interacted`);
        sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run playanimation @e[family=top,r=1,c=1] animation.chest.close`);
        
        system.runTimeout(() => {
            sourceEntity.dimension.runCommand(`execute positioned ${sourceEntity.location.x} ${sourceEntity.location.y} ${sourceEntity.location.z} run event entity @e[family=top,r=0,c=1] x_ender_chest:despawn_chest`);
            block.setPermutation(block.permutation.withState('x_ender_chest:top', 0));
        }, 8);
    }
});

// Handle player interaction with chest
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;

    const findChest = chests.find(chest => target.typeId === `x_ender_chest:${chest}`);
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
            `execute positioned ${pos.x} ${pos.y} ${pos.z} run summon x_ender_chest:${findChest}_top ~ ~ ~ ${chestRot}`);

    }

    if (target.typeId === `x_ender_chest:${findChest}`) {
        target.addTag("chestOpened");
        player.addTag("interacted");
        target.dimension.playSound("random.enderchestopen", pos);

        block.setPermutation(block.permutation.withState('x_ender_chest:top', 1));
        SpawnEntity();
        
        // Start closed immediately, then play open animation
        // First set to closed idle to override the default opened state
        target.dimension.runCommand(`execute positioned ${pos.x} ${pos.y} ${pos.z} run playanimation @e[family=top,r=2,c=1] closed_idle`);
        
        system.runTimeout(() => {
    
            // Play open animation
            target.dimension.runCommand(`execute positioned ${pos.x} ${pos.y} ${pos.z} run playanimation @e[family=top,r=2,c=1] animation.chest.open`);
        }, 2);
    }
});
