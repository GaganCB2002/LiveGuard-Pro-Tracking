import subprocess
import os
import time
import webbrowser
import sys

def launch_guardian():
    print("============================================================")
    print("          SYSTEM GUARDIAN - AI ONBOARDING BOT")
    print("============================================================")
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.join(root_dir, "system_guardian")
    
    if not os.path.exists(project_dir):
        print(f"Error: Project folder not found at {project_dir}")
        return

    print(f"\n[*] Target Path: {project_dir}")
    print("[*] Status: Initializing Intelligence Core...")
    
    # Open browser slightly after start
    time.sleep(1)
    webbrowser.open("http://localhost:5006")
    
    # Launch main process
    try:
        os.chdir(project_dir)
        subprocess.run(["python", "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n[!] System Guardian Shutdown Sequence Initiated.")
    except Exception as e:
        print(f"\n[X] Critical Launch Error: {e}")

if __name__ == "__main__":
    launch_guardian()
