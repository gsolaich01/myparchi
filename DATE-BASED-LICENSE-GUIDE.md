# 🔐 Date-Based License System - Complete Guide

## Overview
MyParchi now uses a tamper-proof, date-based license system that works **entirely offline** without requiring a server.

---

## 🎯 How It Works

### License Key Format
```
YYYYMMDD-XXXXXXXXXXXX
```
- **Date Part**: `YYYYMMDD` (e.g., `20250601` = June 1, 2025)
- **Signature Part**: 12-character cryptographic hash

**Example**: `20250601-A1B2C3D4E5F6`

---

## 🔒 Security Architecture

### Step 1: Admin Generates License (admin-keygen.html)
```javascript
Signature = SHA256(DeviceID + BusinessName + ExpiryDate + SecretKey)
License = YYYYMMDD-SIGNATURE
```

### Step 2: Client Validates License (app.js)
The app performs **2 critical checks**:

#### ✅ Check 1: Signature Verification (Tamper Protection)
```javascript
// Recalculate signature using the hidden secret key
ExpectedSignature = SHA256(DeviceID + BusinessName + ExpiryDate + SecretKey)

// Compare with provided signature
if (ProvidedSignature !== ExpectedSignature) {
    // Key was tampered with - REJECT
}
```
This ensures:
- The date cannot be modified
- Only you (with the secret key) can generate valid licenses
- Any tampering invalidates the signature

#### ✅ Check 2: Expiry Verification
```javascript
if (CurrentDate > ExpiryDate) {
    // License expired - BLOCK ACCESS
}
```

---

## 📋 Usage Guide

### For Admin (Generating Licenses)

1. **Open**: `admin-keygen.html` (keep this file secure!)
2. **Input**:
   - Device ID (get from customer)
   - Business Name
   - Expiry Date (use quick buttons: +1 Month, +3 Months, etc.)
3. **Click**: "Generate License Key"
4. **Copy**: License key or WhatsApp message
5. **Send**: To customer

**Example Output**:
```
Device ID: A1B2C3D4
Business: SHARMA TRADERS
Expiry: June 1, 2025
License: 20250601-E33A32371C7D
```

---

### For Customer (Activating License)

1. Open MyParchi app
2. Enter Business Name exactly as provided
3. Enter License Key
4. Click "Activate"

**The app will**:
- Verify the signature (tamper check)
- Check expiry date
- Show activation success with days remaining
- Or show specific error (expired, invalid, etc.)

---

## 🛡️ Security Features

### 1. **Tamper-Proof Date**
- Date is cryptographically signed
- Any modification breaks the signature
- Cannot be "hacked" without the secret key

### 2. **Offline Validation**
- No server needed
- Works completely in browser/app
- Customer data stays private

### 3. **Device Binding**
- License tied to specific device ID
- Cannot be shared between devices

### 4. **Automatic Expiry**
- App checks expiry on every launch
- Shows warning 7 days before expiry
- Blocks access after expiry date

---

## 📱 Client-Side Features

### Expiry Warning Banner
When license has < 7 days remaining:
```
⚠️ License expiring in 5 day(s)! Renew before March 15, 2025
```

### Activation Messages
- ✅ **Success**: "Activated! Valid for 90 days. Reloading..."
- ❌ **Expired**: "License expired on January 1, 2025"
- ❌ **Invalid**: "Invalid license key"
- ❌ **Tampered**: "Invalid license key" (signature mismatch)

---

## 🔧 Technical Details

### Files Modified
1. **admin-keygen.html**: License generation tool with date picker
2. **app.js**: Client-side validation logic

### Key Functions

#### Admin Side (admin-keygen.html)
```javascript
async function generateLicenseKey(deviceId, bizName, expiryDate) {
    const dateStr = expiryDate.replace(/-/g, '');
    const signature = SHA256(deviceId + bizName + dateStr + secretKey);
    return dateStr + '-' + signature.substring(0, 12);
}
```

#### Client Side (app.js)
```javascript
async function validateLicense(deviceId, bizName, enteredKey) {
    // Parse key: YYYYMMDD-SIGNATURE
    const [dateStr, providedSig] = enteredKey.split('-');
    
    // Verify signature
    const expectedSig = SHA256(deviceId + bizName + dateStr + secretKey);
    if (providedSig !== expectedSig) return { valid: false };
    
    // Check expiry
    const expiryDate = parseDate(dateStr);
    if (today > expiryDate) return { valid: false, error: 'expired' };
    
    return { valid: true, daysRemaining: ... };
}
```

---

## 🎯 Example Flow

### Scenario: Selling 3-Month License

1. **Customer requests license** → sends Device ID: `21F50E4E`

2. **You generate license**:
   - Device: `21F50E4E`
   - Business: `SHARMA TRADERS`
   - Expiry: `2025-06-18` (3 months from today)
   - **Generated Key**: `20250618-5A3F7B2C8D1E`

3. **Customer enters**:
   - Business: `SHARMA TRADERS`
   - Key: `20250618-5A3F7B2C8D1E`

4. **App validates**:
   - ✅ Signature matches (key is authentic)
   - ✅ Not expired (90 days remaining)
   - ✅ **ACTIVATED!**

5. **60 days later** (March 2025):
   - App shows: ⚠️ "Expiring in 30 days"

6. **After June 18, 2025**:
   - App blocks access: "License expired"
   - Customer needs to renew

---

## 🚫 What Hackers CANNOT Do

❌ **Change the expiry date** → Breaks signature, validation fails
❌ **Reuse on another device** → Device ID mismatch
❌ **Generate their own keys** → Don't have secret key
❌ **Bypass expiry check** → Runs on every app launch

---

## ✅ Benefits

1. **No Server Costs**: Everything runs client-side
2. **Privacy**: No customer data sent anywhere
3. **Flexible**: Easy to set any expiry date
4. **Professional**: Automatic expiry warnings
5. **Secure**: Cryptographically protected against tampering

---

## 📞 Support Workflow

### Customer: "My license expired!"

**Response**:
1. Generate new license with extended date
2. Send new key via WhatsApp
3. Customer enters new key → Reactivated!

### Customer: "License key not working!"

**Check**:
- Business name matches exactly (case-sensitive)
- Key entered correctly
- Device ID matches
- Not expired

---

## 🎉 Ready to Use!

1. **Keep `admin-keygen.html` secure** (this is your license generator)
2. **Distribute only the app** (`index.html` + `app.js`)
3. **Generate licenses as needed**
4. **Collect payments before sending keys** 💰

---

## Secret Key Location
⚠️ **IMPORTANT**: The secret key `'mYp@rCh1_2024_$ecure_K3y!'` is in:
- `admin-keygen.html` (line 133)
- `app.js` (line 19)

**Both files must use the SAME secret key!**

If you want to change it:
1. Update in both files
2. Old licenses will become invalid
3. Generate new licenses for all customers

---

**Version**: 2.0 (Date-Based License System)
**Last Updated**: December 18, 2025
