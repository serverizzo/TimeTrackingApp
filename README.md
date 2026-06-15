# timetrackingapp

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## VM Testing Environment

This project uses two local VMs for manual debugging/testing:

- **Windows 11 VM** (VirtualBox) — clean snapshot with Git + Node.js
- **Ubuntu 24.04 VM** (virt-manager/KVM) — clean snapshot with SSH + Node.js

### Switching Between VMs

VirtualBox and KVM cannot run at the same time on this machine — they conflict
over hardware virtualization (VMX root mode).

**To use the Windows VM (VirtualBox):**

```bash
sudo modprobe -r kvm_intel
sudo modprobe -r kvm
```

Then open VirtualBox normally.

**To use the Ubuntu VM (virt-manager):**

```
bash
sudo modprobe kvm_intel
```

Then open Virtual Machine Manager normally.

### Workflow

1. Restore the relevant VM to its `clean-baseline` snapshot
2. For Ubuntu: run `./testDesktopLinux.sh` from the project root to deploy and test
3. For Windows: clone the repo fresh, `npm install`, and run/debug manually

### Transferring Builds to VMs

**Ubuntu VM — SCP (from host)**

```bash
cd ..
./testDesktopLinux.sh
```

This script builds, transfers the `.deb` via `scp`, installs it, and runs E2E tests automatically.

**Windows VM — Local HTTP server (from host)**

VirtualBox shared folders and drag-and-drop were unreliable, so use a temporary
HTTP server on the host instead:

```bash
cd ~/ProgrammingWorkspace/Desktop/TimeTrackerVisualizer/TimeTrackingApp/dist
python3 -m http.server 8000
```

Then in the Windows VM, open Edge and navigate to:

```
http://10.0.2.2:8000
```

(`10.0.2.2` is VirtualBox's NAT address for the host machine.) Download the
`-setup.exe` file directly from the directory listing and run it.

> Note: Make sure "Cable Connected" is checked in the VM's Network settings
> (Settings → Network → Adapter 1) or the VM won't have network access.
