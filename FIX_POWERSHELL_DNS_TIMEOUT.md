# Fix DNS Timeout in PowerShell (ETIMEOUT)

## Problem
```
Test connection failed: Error: queryTxt ETIMEOUT cluster0.xsuxqaq.mongodb.net
```

This DNS timeout error occurs when PowerShell/Windows can't resolve the MongoDB Atlas hostname.

## Quick Fixes

### Solution 1: Flush DNS Cache (Try This First)

**Run in PowerShell as Administrator:**
```powershell
ipconfig /flushdns
```

Then try again:
```powershell
cd "C:\Kokan Mart VP\backend"
node callTestConnection.js
```

### Solution 2: Change DNS Servers

**Use Google DNS (8.8.8.8):**

1. **Open Network Settings:**
   - Press `Win + I` → Network & Internet → Change adapter options
   - Right-click your network adapter → Properties
   - Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties

2. **Set DNS:**
   - Select "Use the following DNS server addresses"
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`
   - Click OK

3. **Flush DNS:**
   ```powershell
   ipconfig /flushdns
   ```

4. **Test again:**
   ```powershell
   node callTestConnection.js
   ```

### Solution 3: Test DNS Resolution

**Check if DNS is working:**
```powershell
# Test DNS resolution
nslookup cluster0.xsuxqaq.mongodb.net

# If this fails, DNS is the problem
# If this works, the issue might be with MongoDB driver
```

### Solution 4: Use Local MongoDB (Recommended for Development)

**Avoid network issues entirely:**

1. **Install MongoDB locally:**
   - Download: https://www.mongodb.com/try/download/community
   - Install and start as Windows service

2. **Update `testconnection.js`:**
   ```javascript
   const uri = "mongodb://localhost:27017/";
   ```

3. **Start MongoDB:**
   ```powershell
   net start MongoDB
   ```

4. **Test:**
   ```powershell
   node callTestConnection.js
   ```

### Solution 5: Check Windows Firewall

**Allow Node.js through firewall:**

1. Press `Win + R` → Type `wf.msc` → Enter
2. Click "Inbound Rules" → "New Rule"
3. Select "Program" → Browse to Node.js executable
4. Allow the connection
5. Repeat for "Outbound Rules"

### Solution 6: Disable VPN/Proxy Temporarily

If you're using VPN or proxy, try disabling it temporarily to test if it's blocking the connection.

### Solution 7: Use Command Prompt Instead

Sometimes PowerShell has different network behavior. Try CMD:

1. Press `Win + R` → Type `cmd` → Enter
2. Navigate to project:
   ```cmd
   cd "C:\Kokan Mart VP\backend"
   ```
3. Run:
   ```cmd
   node callTestConnection.js
   ```

## Verify Fix

**Test DNS resolution:**
```powershell
nslookup cluster0.xsuxqaq.mongodb.net
```

**Expected output:**
```
Name:    cluster0-shard-00-00.xsuxqaq.mongodb.net
Address: [IP address]
```

If you see an IP address, DNS is working. If you see "Non-existent domain" or timeout, DNS is the issue.

## Updated Code

The `testconnection.js` file has been updated with:
- Increased timeouts (30 seconds)
- IPv4 forcing (`family: 4`) to help with DNS issues
- Better error messages
- Retry options

## Still Having Issues?

1. **Check MongoDB Atlas:**
   - Log into MongoDB Atlas dashboard
   - Verify cluster is running (not paused)
   - Check Network Access (add 0.0.0.0/0 for testing)

2. **Try different network:**
   - Mobile hotspot
   - Different WiFi network

3. **Use local MongoDB:**
   - Most reliable for development
   - No network/DNS issues
   - Faster connection

---

**Recommended:** Use local MongoDB for development to avoid all network issues.
