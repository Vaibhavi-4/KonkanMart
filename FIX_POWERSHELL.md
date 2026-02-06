# Fix PowerShell Execution Policy Error

## Problem
```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## Solutions

### Solution 1: Change Execution Policy (Recommended)

**Run PowerShell as Administrator:**

1. Right-click on PowerShell → "Run as Administrator"
2. Run this command:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Type `Y` when prompted
4. Now you can run `npm run seed`

**To check current policy:**
```powershell
Get-ExecutionPolicy
```

### Solution 2: Bypass for Current Session (Temporary)

**In your current PowerShell window:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```
Then run:
```bash
npm run seed
```

**Note:** This only works for the current PowerShell session.

### Solution 3: Use Command Prompt (CMD) Instead

**Switch to CMD:**
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project:
```bash
cd "C:\Kokan Mart VP\backend"
```
4. Run:
```bash
npm run seed
```

CMD doesn't have execution policy restrictions.

### Solution 4: Use Node Directly

**Instead of `npm run seed`, run:**
```bash
node seed.js
```

Make sure you're in the `backend` directory:
```bash
cd backend
node seed.js
```

## Quick Fix (Copy & Paste)

**Open PowerShell as Administrator and run:**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then in your project directory:
```bash
cd "C:\Kokan Mart VP\backend"
npm run seed
```

## Verification

After fixing, verify it works:
```powershell
npm --version
```

If you see the npm version, the fix worked!

---

**Recommended:** Use Solution 1 (Set-ExecutionPolicy) for a permanent fix.
