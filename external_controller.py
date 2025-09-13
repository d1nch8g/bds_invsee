#!/usr/bin/env python3
"""
BDS InvSee External Controller

This script demonstrates how to communicate with the Minecraft Bedrock server
to read and modify player ender chest contents programmatically.

Usage:
1. Start your BDS server
2. Run: python3 external_controller.py
3. Use the interactive commands to manage player inventories

The script communicates via the server console and parses log output.
"""

import json
import subprocess
import threading
import time
import sys
import re
from datetime import datetime

class BDSInvSeeController:
    def __init__(self, server_path="/home/d1nch8g/bds_invsee/server"):
        self.server_path = server_path
        self.server_process = None
        self.log_thread = None
        self.running = False
        self.player_inventories = {}
        
    def start_server(self):
        """Start the Bedrock Dedicated Server"""
        print("[BDS InvSee] Starting Bedrock Dedicated Server...")
        try:
            self.server_process = subprocess.Popen(
                ["./bedrock_server"],
                cwd=self.server_path,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            
            self.running = True
            self.log_thread = threading.Thread(target=self._monitor_logs)
            self.log_thread.daemon = True
            self.log_thread.start()
            
            print("[BDS InvSee] Server started! Monitoring logs...")
            return True
            
        except Exception as e:
            print(f"[BDS InvSee] Failed to start server: {e}")
            return False
    
    def stop_server(self):
        """Stop the Bedrock Dedicated Server"""
        if self.server_process:
            print("[BDS InvSee] Stopping server...")
            self.send_command("stop")
            self.server_process.wait()
            self.running = False
        
    def send_command(self, command):
        """Send a command to the server console"""
        if self.server_process and self.server_process.stdin:
            try:
                self.server_process.stdin.write(command + "\n")
                self.server_process.stdin.flush()
                print(f"[BDS InvSee] Sent command: {command}")
            except Exception as e:
                print(f"[BDS InvSee] Error sending command: {e}")
    
    def send_chat_command(self, player_name, message):
        """Send a chat command as a specific player"""
        # Use tellraw to inject the message as if it came from the player
        command = f'tellraw @a {{"rawtext":[{{"text":"<{player_name}> {message}"}}]}}'
        self.send_command(command)
        
        # Also try to execute it via say command with special formatting
        say_command = f'say [SYSTEM_COMMAND:{player_name}] {message}'
        self.send_command(say_command)
    
    def export_player_inventory(self, player_name):
        """Request export of a player's ender chest inventory"""
        print(f"[BDS InvSee] Requesting inventory export for {player_name}...")
        self.send_chat_command(player_name, "!export")
    
    def set_player_inventory(self, player_name, inventory_data):
        """Set a player's ender chest inventory"""
        try:
            json_data = json.dumps(inventory_data, separators=(',', ':'))
            command_message = f"[ENDER_CHEST_SET]{json_data}"
            
            print(f"[BDS InvSee] Setting inventory for {player_name}...")
            self.send_chat_command(player_name, command_message)
            
        except Exception as e:
            print(f"[BDS InvSee] Error setting inventory: {e}")
    
    def clear_player_inventory(self, player_name):
        """Clear a player's inventory"""
        print(f"[BDS InvSee] Clearing inventory for {player_name}...")
        self.send_chat_command(player_name, "!clear")
    
    def display_player_inventory(self, player_name):
        """Display a player's inventory in chat"""
        print(f"[BDS InvSee] Displaying inventory for {player_name}...")
        self.send_chat_command(player_name, "!invsee")
    
    def _monitor_logs(self):
        """Monitor server logs for inventory data"""
        while self.running and self.server_process:
            try:
                line = self.server_process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                print(f"[SERVER] {line}")
                
                # Parse ender chest export data
                if "[ENDER_CHEST_EXPORT]" in line:
                    self._parse_inventory_export(line)
                elif "[ENDER_CHEST_INTERACT]" in line:
                    self._parse_interaction(line)
                elif "[ENDER_CHEST_RESTORED]" in line:
                    self._parse_restore_complete(line)
                    
            except Exception as e:
                print(f"[BDS InvSee] Log monitoring error: {e}")
                break
    
    def _parse_inventory_export(self, line):
        """Parse inventory export data from server log"""
        try:
            # Extract JSON from log line
            json_start = line.find("{")
            if json_start >= 0:
                json_data = line[json_start:]
                inventory_data = json.loads(json_data)
                
                player_name = inventory_data.get("player_name", "unknown")
                self.player_inventories[player_name] = inventory_data
                
                print(f"\n[BDS InvSee] ✓ Exported inventory for {player_name}")
                print(f"Items in inventory: {len(inventory_data.get('inventory', []))}")
                print(f"Equipment pieces: {len([k for k, v in inventory_data.get('equipment', {}).items() if v])}")
                print()
                
        except Exception as e:
            print(f"[BDS InvSee] Error parsing inventory export: {e}")
    
    def _parse_interaction(self, line):
        """Parse ender chest interaction data"""
        try:
            json_start = line.find("{")
            if json_start >= 0:
                json_data = line[json_start:]
                interaction_data = json.loads(json_data)
                
                player_name = interaction_data.get("name", "unknown")
                location = interaction_data.get("location", {})
                
                print(f"[BDS InvSee] 📦 {player_name} interacted with ender chest at {location}")
                
        except Exception as e:
            print(f"[BDS InvSee] Error parsing interaction: {e}")
    
    def _parse_restore_complete(self, line):
        """Parse restore completion notification"""
        try:
            json_start = line.find("{")
            if json_start >= 0:
                json_data = line[json_start:]
                restore_data = json.loads(json_data)
                
                player_name = restore_data.get("player", "unknown")
                print(f"[BDS InvSee] ✓ Ender chest restored for {player_name}")
                
        except Exception as e:
            print(f"[BDS InvSee] Error parsing restore: {e}")
    
    def interactive_mode(self):
        """Run interactive command mode"""
        print("\n=== BDS InvSee Interactive Controller ===")
        print("Commands:")
        print("  export <player>     - Export player's ender chest")
        print("  clear <player>      - Clear player's inventory")
        print("  display <player>    - Display player's inventory in chat")
        print("  list               - List cached player inventories")
        print("  copy <from> <to>   - Copy inventory from one player to another")
        print("  server <command>   - Send raw server command")
        print("  quit               - Exit controller")
        print()
        
        while self.running:
            try:
                cmd = input("[BDS InvSee] > ").strip().split()
                if not cmd:
                    continue
                
                action = cmd[0].lower()
                
                if action == "quit":
                    break
                elif action == "export" and len(cmd) > 1:
                    self.export_player_inventory(cmd[1])
                elif action == "clear" and len(cmd) > 1:
                    self.clear_player_inventory(cmd[1])
                elif action == "display" and len(cmd) > 1:
                    self.display_player_inventory(cmd[1])
                elif action == "list":
                    self._list_cached_inventories()
                elif action == "copy" and len(cmd) > 2:
                    self._copy_inventory(cmd[1], cmd[2])
                elif action == "server" and len(cmd) > 1:
                    self.send_command(" ".join(cmd[1:]))
                else:
                    print("Unknown command or missing arguments")
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")
    
    def _list_cached_inventories(self):
        """List all cached player inventories"""
        if not self.player_inventories:
            print("No cached inventories")
            return
            
        print(f"\nCached inventories ({len(self.player_inventories)}):")
        for player, data in self.player_inventories.items():
            timestamp = datetime.fromtimestamp(data.get("timestamp", 0) / 1000)
            item_count = len(data.get("inventory", []))
            equip_count = len([v for v in data.get("equipment", {}).values() if v])
            print(f"  {player}: {item_count} items, {equip_count} equipment - {timestamp}")
    
    def _copy_inventory(self, from_player, to_player):
        """Copy inventory from one player to another"""
        if from_player not in self.player_inventories:
            print(f"No cached inventory for {from_player}. Run 'export {from_player}' first.")
            return
        
        source_data = self.player_inventories[from_player].copy()
        source_data["player_name"] = to_player  # Update target player
        
        self.set_player_inventory(to_player, source_data)
        print(f"Copied inventory from {from_player} to {to_player}")


def main():
    controller = BDSInvSeeController()
    
    print("BDS InvSee External Controller")
    print("=" * 40)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--no-server":
        print("Running in no-server mode (external server required)")
        controller.running = True
    else:
        if not controller.start_server():
            print("Failed to start server")
            return 1
        
        # Wait for server to start
        time.sleep(3)
    
    try:
        controller.interactive_mode()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        controller.stop_server()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
