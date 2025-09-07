# BDS InvSee - Bedrock Server Inventory Management Addon

A Minecraft Bedrock Dedicated Server addon that enables secure inventory and equipment transfer to external systems via server's chat.

## Features

- **Inventory Export**: Transfer player inventory (36 slots) + armor equipment to ephemeral storage
- **Secure Restoration**: Restore items from storage using server-validated messages
- **External Integration**: Export inventory data via chat messages for external applications
- **Command Interface**: Simple chat commands for players to manage their stored inventories
- **Security**: Server-only restoration prevents player exploitation

## How It Works

1. **Upload**: Player uses `!upload` command → addon exports inventory JSON to chat → clears inventory → external app captures data
2. **Download**: Player uses `!download` command → addon sends request to chat → external app validates → server sends restore message → addon applies items
3. **Server Integration**: External application monitors chat and uses `/say [INVENTORY_RESTORE]{...}` to restore inventories

## Supported Data

✅ **Available:**

- Player inventory (27 storage + 9 hotbar slots)
- Armor equipment (helmet, chestplate, leggings, boots)
- Offhand slot
- **Container items** (shulker boxes, bundles with their contents)
- **Nested containers** (recursive support)

❌ **Not Available:**

- Ender chest contents (Script API limitation)

## Commands

- `!upload` - Export current inventory to JSON and clear it (for external storage)
- `!download` - Request inventory restoration from external system

## Installation

### For Server Administrators

1. **Download/Clone** this repository
2. **Package the addon:**
   ```bash
   # Create behavior pack (already done in repo)
   zip -r bds_invsee_bp.mcpack manifest.json scripts/ pack_icon.png
   ```
3. **Install on Bedrock Dedicated Server:**

   ```bash
   # Copy and extract to behavior packs directory
   cp bds_invsee_bp.mcpack /path/to/bedrock-server/behavior_packs/
   cd /path/to/bedrock-server/behavior_packs/
   unzip bds_invsee_bp.mcpack -d bds_invsee_bp/
   ```

4. **Configure world** - Create/edit `worlds/[world_name]/world_behavior_packs.json`:

   ```json
   [
     {
       "pack_id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
       "version": [1, 0, 0]
     }
   ]
   ```

5. **Optional server.properties tweaks:**

   ```properties
   # Optional: Disable script watchdog to prevent timeouts
   script-watchdog-enable=false
   script-watchdog-enable-exception-handling=false
   ```

   **Note:** Script API works automatically when behavior pack loads. These settings are optional.

6. **Restart server**

## Testing

1. **Join server** - Look for: `[BDS InvSee] Addon loaded - Use !upload or !download commands`

2. **Test upload:**

   - Fill inventory with items (try shulker boxes!)
   - Type `!upload`
   - Check console for `[INVENTORY_EXPORT]` message
   - Confirm inventory cleared

3. **Test download request:**

   - Type `!download`
   - Check console for `[INVENTORY_REQUEST]` message

4. **Test restoration** (via server console):
   ```bash
   say [INVENTORY_RESTORE]{"player_xuid":"<xuid>","inventory":[{"slot":0,"type":"minecraft:diamond","amount":64,"enchantments":[],"container_contents":[]}],"equipment":{}}
   ```

### Development Setup

1. **Install Node.js** (for optional TypeScript support)
2. **Clone repository:**
   ```bash
   git clone https://github.com/d1nch8g/bds_invsee.git
   cd bds_invsee
   ```
3. **Test locally** using Bedrock Dedicated Server

## Usage

### For Players

1. **Upload Inventory**: Type `!upload` to export and clear your inventory
2. **Download Inventory**: Type `!download` to request restoration from external system

### For External Applications

**Monitor chat logs for:**

- `[INVENTORY_EXPORT]` - Contains JSON inventory data to store
- `[INVENTORY_REQUEST]` - Player requesting inventory restoration

**Restore player inventory:**

```bash
# Via server console or RCON
say [INVENTORY_RESTORE]{"player_xuid":"1234567890","inventory":[...],"equipment":{...}}
```

### Complete Workflow Example

1. **Player uploads:** `!upload` → Chat: `[INVENTORY_EXPORT]{"player_xuid":"1234567890",...}`
2. **External app** captures and stores the JSON data
3. **Player requests:** `!download` → Chat: `[INVENTORY_REQUEST]{"player_xuid":"1234567890"}`
4. **External app** validates request and sends: `/say [INVENTORY_RESTORE]{...}`
5. **Addon** detects server message and restores player's items

## JSON Format

```json
{
  "player_xuid": "1234567890",
  "player_name": "PlayerName",
  "timestamp": 1693123456789,
  "inventory": [
    {
      "slot": 0,
      "type": "minecraft:diamond_sword",
      "amount": 1,
      "enchantments": [],
      "container_contents": []
    }
  ],
  "equipment": {
    "head": {
      "type": "minecraft:diamond_helmet",
      "amount": 1,
      "enchantments": [],
      "container_contents": []
    }
  }
}
```

## Security

- Players cannot fake restoration messages (server-only validation)
- XUID-based player identification prevents cross-player exploits
- JSON parsing with error handling prevents crashes
- External application must validate requests before restoration
