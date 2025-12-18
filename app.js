/**
 * MyParchi Pro - Enhanced Security PWA
 * Version: 2.0
 * 
 * SECURITY FEATURES:
 * 1. Device fingerprinting (hardware + browser based)
 * 2. Hash-based license validation (not reversible)
 * 3. Integrity checks for code tampering
 * 4. Encrypted local storage for sensitive data
 * 5. Time-based license expiry support
 */

// ==========================================
// 🔐 SECURITY MODULE (Obfuscated)
// ==========================================
const _0xSec = (function() {
    // Private security constants (obfuscated)
    const _k = [0x4D, 0x59, 0x50, 0x41, 0x52, 0x43, 0x48, 0x49]; // MYPARCHI in hex
    const _s = 'mYp@rCh1_2024_$ecure_K3y!';
    const _v = 'v2.0.0';
    const _salt = 'mP_sAlt_2024_x!9@';
    
    // Storage keys (obfuscated names with random suffix)
    const KEYS = {
        license: '_mp_lv2_' + btoa(_v).slice(0, 8),
        device: '_mp_did_' + btoa(_s).slice(0, 6),
        bizName: '_mp_bn_secure',
        expiry: '_mp_exp_ts',
        installDate: '_mp_inst_d',
        integrity: '_mp_int_chk',      // Integrity hash
        encrypted: '_mp_enc_data',     // Encrypted license bundle
        deviceBound: '_mp_dev_bnd'     // Device-bound encrypted data
    };

    // Generate device fingerprint
    async function generateFingerprint() {
        const components = [];
        
        // Screen properties
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth);
        components.push(window.devicePixelRatio || 1);
        
        // Timezone
        components.push(new Date().getTimezoneOffset());
        
        // Language
        components.push(navigator.language || 'en');
        
        // Hardware concurrency
        components.push(navigator.hardwareConcurrency || 4);
        
        // Platform
        components.push(navigator.platform || 'unknown');
        
        // Touch support
        components.push('ontouchstart' in window ? 1 : 0);
        
        // Canvas fingerprint
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('MyParchi@2024', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('MyParchi@2024', 4, 17);
            components.push(canvas.toDataURL().slice(-50));
        } catch(e) {
            components.push('no-canvas');
        }
        
        // WebGL renderer
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown');
                }
            }
        } catch(e) {
            components.push('no-webgl');
        }
        
        // Create hash from components
        const fingerprint = components.join('|||');
        return await hashString(fingerprint);
    }

    // SHA-256 hash function
    async function hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str + _s);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Advanced AES-like encryption for local storage
    // This makes it MUCH harder to modify stored data
    async function encryptStorage(data, deviceFingerprint) {
        try {
            // Step 1: Create encryption key from device fingerprint + secret
            const keyMaterial = deviceFingerprint + _s + _salt;
            const keyHash = await hashString(keyMaterial);
            
            // Step 2: Convert data to string and encode
            const jsonStr = JSON.stringify(data);
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(jsonStr);
            
            // Step 3: XOR encryption with key-derived bytes
            const encrypted = new Uint8Array(dataBytes.length);
            for (let i = 0; i < dataBytes.length; i++) {
                const keyByte = parseInt(keyHash[(i * 2) % keyHash.length] + keyHash[(i * 2 + 1) % keyHash.length], 16);
                encrypted[i] = dataBytes[i] ^ keyByte;
            }
            
            // Step 4: Add integrity checksum
            const checksum = await hashString(jsonStr + deviceFingerprint);
            
            // Step 5: Combine and encode
            const result = {
                d: btoa(String.fromCharCode(...encrypted)),
                c: checksum.substring(0, 16),
                t: Date.now()
            };
            
            return btoa(JSON.stringify(result));
        } catch (e) {
            console.error('Encryption error');
            return null;
        }
    }

    // Decrypt storage data
    async function decryptStorage(encryptedData, deviceFingerprint) {
        try {
            // Step 1: Decode
            const parsed = JSON.parse(atob(encryptedData));
            const encryptedBytes = Uint8Array.from(atob(parsed.d), c => c.charCodeAt(0));
            
            // Step 2: Recreate encryption key
            const keyMaterial = deviceFingerprint + _s + _salt;
            const keyHash = await hashString(keyMaterial);
            
            // Step 3: XOR decryption
            const decrypted = new Uint8Array(encryptedBytes.length);
            for (let i = 0; i < encryptedBytes.length; i++) {
                const keyByte = parseInt(keyHash[(i * 2) % keyHash.length] + keyHash[(i * 2 + 1) % keyHash.length], 16);
                decrypted[i] = encryptedBytes[i] ^ keyByte;
            }
            
            // Step 4: Decode to string
            const decoder = new TextDecoder();
            const jsonStr = decoder.decode(decrypted);
            const data = JSON.parse(jsonStr);
            
            // Step 5: Verify integrity checksum
            const expectedChecksum = await hashString(jsonStr + deviceFingerprint);
            if (parsed.c !== expectedChecksum.substring(0, 16)) {
                console.error('Data integrity check failed - possible tampering');
                return null;
            }
            
            return data;
        } catch (e) {
            console.error('Decryption error');
            return null;
        }
    }

    // Generate integrity hash for all license data
    async function generateIntegrityHash(licenseData, deviceFingerprint) {
        const combined = JSON.stringify(licenseData) + deviceFingerprint + _s + Date.now().toString().substring(0, 10);
        return await hashString(combined);
    }

    // Verify integrity of stored license data
    async function verifyIntegrity() {
        try {
            const deviceFingerprint = await generateFingerprint();
            const encryptedData = localStorage.getItem(KEYS.encrypted);
            const storedHash = localStorage.getItem(KEYS.integrity);
            
            if (!encryptedData || !storedHash) {
                return false;
            }
            
            // Decrypt and verify
            const decrypted = await decryptStorage(encryptedData, deviceFingerprint);
            if (!decrypted) {
                console.error('Failed to decrypt license data');
                return false;
            }
            
            // Verify device binding
            if (decrypted.deviceFingerprint !== deviceFingerprint) {
                console.error('Device fingerprint mismatch - license copied from another device');
                return false;
            }
            
            // Verify expiry hasn't been tampered
            const now = Date.now();
            if (decrypted.expiry && now > decrypted.expiry) {
                console.error('License expired');
                return false;
            }
            
            return true;
        } catch (e) {
            console.error('Integrity verification failed:', e);
            return false;
        }
    }

    // Generate short device ID (8 chars) for display
    async function getDisplayDeviceId() {
        let storedId = localStorage.getItem(KEYS.device);
        if (storedId) return storedId;
        
        const fullHash = await generateFingerprint();
        // Take first 8 chars and make uppercase for easy reading
        const shortId = fullHash.substring(0, 8).toUpperCase();
        localStorage.setItem(KEYS.device, shortId);
        return shortId;
    }

    // Get full fingerprint for validation
    async function getFullFingerprint() {
        return await generateFingerprint();
    }

    // NEW DATE-BASED LICENSE VALIDATION
    // License Format: YYYYMMDD-SIGNATURE (e.g., 20250601-A1B2C3D4E5F6)
    // Signature = Hash(DeviceID + BusinessName + ExpiryDate + SecretKey)
    
    // Generate license key with expiry date (used by admin tool)
    async function generateLicenseKey(deviceId, bizName, expiryDate) {
        const dateStr = expiryDate.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
        const combined = deviceId.toUpperCase() + '|' + bizName.toUpperCase().replace(/\s/g, '') + '|' + dateStr + '|' + _s;
        const hash = await hashString(combined);
        const signature = hash.substring(0, 12).toUpperCase();
        return dateStr + '-' + signature;
    }

    // Validate entered license key (CLIENT-SIDE VALIDATION)
    async function validateLicense(deviceId, bizName, enteredKey) {
        try {
            // Step 1: Parse the license key format YYYYMMDD-SIGNATURE
            const parts = enteredKey.toUpperCase().split('-');
            
            // Check format
            if (parts.length !== 2) {
                console.error('Invalid key format');
                return { valid: false, error: 'Invalid key format' };
            }
            
            const dateStr = parts[0];
            const providedSignature = parts[1];
            
            // Validate date part (8 digits)
            if (dateStr.length !== 8 || !/^\d{8}$/.test(dateStr)) {
                console.error('Invalid date format');
                return { valid: false, error: 'Invalid date format' };
            }
            
            // Step 2: Security Check - Recalculate signature to verify authenticity
            const combined = deviceId.toUpperCase() + '|' + bizName.toUpperCase().replace(/\s/g, '') + '|' + dateStr + '|' + _s;
            const hash = await hashString(combined);
            const expectedSignature = hash.substring(0, 12).toUpperCase();
            
            if (providedSignature !== expectedSignature) {
                console.error('Signature mismatch - tampered key');
                return { valid: false, error: 'Invalid license key' };
            }
            
            // Step 3: Time Check - Verify not expired
            const expiryDate = new Date(
                parseInt(dateStr.substring(0, 4)),  // Year
                parseInt(dateStr.substring(4, 6)) - 1, // Month (0-indexed)
                parseInt(dateStr.substring(6, 8))   // Day
            );
            expiryDate.setHours(23, 59, 59, 999); // End of expiry day
            
            const today = new Date();
            
            if (today > expiryDate) {
                const expiredDays = Math.floor((today - expiryDate) / (1000 * 60 * 60 * 24));
                console.error(`License expired ${expiredDays} days ago`);
                return { 
                    valid: false, 
                    error: 'License expired', 
                    expiryDate: expiryDate.toLocaleDateString(),
                    expiredDays 
                };
            }
            
            // Success! License is valid and not expired
            return { 
                valid: true, 
                expiryDate: expiryDate.toLocaleDateString(),
                daysRemaining: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
            };
            
        } catch (error) {
            console.error('License validation error:', error);
            return { valid: false, error: 'Validation failed' };
        }
    }

    // Check if license is valid and not expired (with tamper protection)
    async function isLicenseActive() {
        try {
            // Step 1: Check for encrypted license data
            const encryptedData = localStorage.getItem(KEYS.encrypted);
            if (!encryptedData) {
                // Fallback: Check old unencrypted format
                const license = localStorage.getItem(KEYS.license);
                if (!license) return false;
                
                // Migrate to encrypted format
                const expiry = localStorage.getItem(KEYS.expiry);
                const bizName = localStorage.getItem(KEYS.bizName);
                if (expiry && bizName) {
                    await activateLicense(bizName, parseInt(expiry));
                }
                return license === 'active_v2';
            }
            
            // Step 2: Verify integrity
            const integrityOk = await verifyIntegrity();
            if (!integrityOk) {
                console.error('License integrity check failed - possible tampering detected');
                clearLicense();
                return false;
            }
            
            // Step 3: Decrypt and validate
            const deviceFingerprint = await generateFingerprint();
            const decrypted = await decryptStorage(encryptedData, deviceFingerprint);
            
            if (!decrypted || !decrypted.active) {
                clearLicense();
                return false;
            }
            
            // Step 4: Check expiry
            if (decrypted.expiry) {
                const now = Date.now();
                if (now > decrypted.expiry) {
                    console.error('License expired');
                    clearLicense();
                    return false;
                }
            }
            
            // Step 5: Verify device binding
            if (decrypted.deviceFingerprint !== deviceFingerprint) {
                console.error('Device mismatch - license was copied from another device');
                clearLicense();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('License check error:', error);
            return false;
        }
    }

    // Activate license with encrypted storage and device binding
    async function activateLicense(bizName, expiryTimestamp) {
        try {
            const deviceFingerprint = await generateFingerprint();
            
            // Create license data bundle
            const licenseData = {
                active: true,
                bizName: bizName.toUpperCase(),
                expiry: expiryTimestamp,
                activatedAt: Date.now(),
                deviceFingerprint: deviceFingerprint,
                version: _v
            };
            
            // Encrypt and store
            const encrypted = await encryptStorage(licenseData, deviceFingerprint);
            if (!encrypted) {
                throw new Error('Encryption failed');
            }
            
            // Generate integrity hash
            const integrityHash = await generateIntegrityHash(licenseData, deviceFingerprint);
            
            // Store encrypted data
            localStorage.setItem(KEYS.encrypted, encrypted);
            localStorage.setItem(KEYS.integrity, integrityHash);
            
            // Store legacy format for backward compatibility (but these alone won't work)
            localStorage.setItem(KEYS.license, 'active_v2');
            localStorage.setItem(KEYS.bizName, bizName.toUpperCase());
            localStorage.setItem(KEYS.expiry, expiryTimestamp.toString());
            localStorage.setItem(KEYS.installDate, Date.now().toString());
            
            return true;
        } catch (error) {
            console.error('License activation error:', error);
            return false;
        }
    }
    
    // Clear all license data
    function clearLicense() {
        localStorage.removeItem(KEYS.encrypted);
        localStorage.removeItem(KEYS.integrity);
        localStorage.removeItem(KEYS.license);
        localStorage.removeItem(KEYS.expiry);
        localStorage.removeItem(KEYS.bizName);
    }
    
    // Get license expiry info (from encrypted data)
    async function getLicenseInfo() {
        try {
            const encryptedData = localStorage.getItem(KEYS.encrypted);
            if (!encryptedData) {
                // Fallback to old format
                const expiry = localStorage.getItem(KEYS.expiry);
                if (!expiry) return null;
                
                const expiryDate = new Date(parseInt(expiry));
                const today = new Date();
                const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                return {
                    expiryDate: expiryDate.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    daysRemaining,
                    isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0
                };
            }
            
            // Decrypt license data
            const deviceFingerprint = await generateFingerprint();
            const decrypted = await decryptStorage(encryptedData, deviceFingerprint);
            
            if (!decrypted || !decrypted.expiry) return null;
            
            const expiryDate = new Date(decrypted.expiry);
            const today = new Date();
            const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            return {
                expiryDate: expiryDate.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                daysRemaining,
                isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
                activatedAt: new Date(decrypted.activatedAt).toLocaleDateString('en-IN')
            };
        } catch (error) {
            console.error('Error getting license info:', error);
            return null;
        }
    }

    // Get stored business name (from encrypted data)
    async function getBusinessName() {
        try {
            const encryptedData = localStorage.getItem(KEYS.encrypted);
            if (encryptedData) {
                const deviceFingerprint = await generateFingerprint();
                const decrypted = await decryptStorage(encryptedData, deviceFingerprint);
                if (decrypted && decrypted.bizName) {
                    return decrypted.bizName;
                }
            }
            // Fallback
            return localStorage.getItem(KEYS.bizName) || 'MY PARCHI';
        } catch (e) {
            return localStorage.getItem(KEYS.bizName) || 'MY PARCHI';
        }
    }

    // Integrity check - detect if code was tampered
    function checkIntegrity() {
        // Check if critical functions exist and haven't been replaced
        const criticalFunctions = [
            'saveTransaction',
            'renderLedgerList',
            'attemptActivation'
        ];
        
        for (const fn of criticalFunctions) {
            if (typeof window[fn] === 'undefined') {
                console.warn(`Critical function missing: ${fn}`);
                return false;
            }
        }
        
        return true;
    }

    // Simple encryption for local data (not for secrets, just obfuscation)
    function encryptData(data) {
        const str = JSON.stringify(data);
        return btoa(encodeURIComponent(str).split('').reverse().join(''));
    }

    function decryptData(encrypted) {
        try {
            const str = decodeURIComponent(atob(encrypted).split('').reverse().join(''));
            return JSON.parse(str);
        } catch(e) {
            return null;
        }
    }

    // Public API
    return {
        getDisplayDeviceId,
        getFullFingerprint,
        generateLicenseKey,
        validateLicense,
        isLicenseActive,
        activateLicense,
        getBusinessName,
        getLicenseInfo,
        checkIntegrity,
        verifyIntegrity,  // New: Check license tampering
        encryptData,
        decryptData,
        KEYS
    };
})();

// ==========================================
// 🔒 LICENSE CHECK ON LOAD
// ==========================================
(async function initSecurity() {
    // Check license status with integrity verification
    const isActive = await _0xSec.isLicenseActive();
    
    if (!isActive) {
        await showActivationScreen();
    } else {
        // Update header with business name
        const bizName = await _0xSec.getBusinessName();
        document.getElementById('headerTitle').innerText = bizName;
        document.getElementById('headerSubtitle').innerText = 'Licensed';
        
        // Check for expiring license and show warning
        const licenseInfo = await _0xSec.getLicenseInfo();
        if (licenseInfo && licenseInfo.isExpiringSoon) {
            showExpiryWarning(licenseInfo);
        }
    }
    
    // Periodic integrity check (every 30 seconds)
    setInterval(async () => {
        // Check code integrity
        if (!_0xSec.checkIntegrity()) {
            console.warn('Code integrity check failed');
        }
        
        // Check license integrity
        const integrityOk = await _0xSec.verifyIntegrity();
        if (!integrityOk) {
            console.error('License tampering detected - reloading app');
            alert('⚠️ Security Error: License data was modified. Please restart the app.');
            localStorage.clear();
            setTimeout(() => location.reload(), 2000);
        }
    }, 30000); // Every 30 seconds
    
    // Additional check every time user interacts
    let lastCheck = Date.now();
    document.addEventListener('click', async () => {
        const now = Date.now();
        if (now - lastCheck > 60000) { // Check max once per minute
            lastCheck = now;
            const integrityOk = await _0xSec.verifyIntegrity();
            if (!integrityOk) {
                console.error('License tampering detected on user interaction');
                alert('⚠️ Security Error: Please restart the app.');
                localStorage.clear();
                setTimeout(() => location.reload(), 1000);
            }
        }
    });
})();

// Show license expiry warning banner
function showExpiryWarning(licenseInfo) {
    const warningBanner = document.createElement('div');
    warningBanner.className = 'fixed top-16 left-0 right-0 bg-amber-500 text-white px-4 py-3 z-50 shadow-lg';
    warningBanner.innerHTML = `
        <div class="max-w-2xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span class="text-sm font-bold">License expiring in ${licenseInfo.daysRemaining} day(s)! Renew before ${licenseInfo.expiryDate}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-amber-100">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;
    document.body.appendChild(warningBanner);
}

async function showActivationScreen() {
    const deviceId = await _0xSec.getDisplayDeviceId();
    
    const overlay = document.createElement('div');
    overlay.id = 'activationOverlay';
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-6';
    overlay.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)';
    
    overlay.innerHTML = `
        <div class="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
            <div class="text-center mb-6">
                <div class="bg-blue-100 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <i class="fa-solid fa-lock text-2xl text-blue-600"></i>
                </div>
                <h2 class="text-2xl font-black text-slate-800">Activate App</h2>
                <p class="text-slate-500 text-sm mt-2">Enter your license details</p>
            </div>
            
            <div class="mb-4">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Device ID</label>
                <div class="bg-slate-100 p-4 rounded-xl font-mono text-xl font-bold text-center text-slate-700 mt-1 select-all border-2 border-slate-200">
                    ${deviceId}
                </div>
                <p class="text-xs text-slate-400 mt-1 text-center">Share this ID with seller to get license key</p>
            </div>
            
            <div class="mb-4">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Business Name</label>
                <input type="text" id="activateBizName" placeholder="YOUR BUSINESS NAME" 
                    class="w-full border-2 border-slate-200 p-3 rounded-xl mt-1 text-center font-bold outline-none focus:border-blue-500 uppercase"
                    oninput="this.value = this.value.toUpperCase()">
            </div>
            
            <div class="mb-6">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">License Key</label>
                <input type="text" id="activateLicenseKey" placeholder="20250601-A1B2C3D4E5F6" 
                    class="w-full border-2 border-slate-200 p-3 rounded-xl mt-1 text-center font-mono text-sm outline-none focus:border-blue-500 uppercase"
                    oninput="formatLicenseInput(this)">
                <p class="text-xs text-slate-400 mt-1 text-center">Format: YYYYMMDD-XXXXXXXXXXXX</p>
            </div>
            
            <button onclick="attemptActivation('${deviceId}')" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                <i class="fa-solid fa-unlock mr-2"></i> Activate
            </button>
            
            <p id="activationError" class="text-rose-500 mt-4 text-sm font-bold text-center hidden">
                <i class="fa-solid fa-circle-exclamation mr-1"></i> Invalid license key
            </p>
            
            <div class="mt-6 pt-4 border-t border-slate-100 text-center">
                <p class="text-xs text-slate-400">Need a license? Contact seller</p>
                <p class="text-xs text-slate-400 mt-1">📞 WhatsApp: +91-XXXXXXXXXX</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('mainContainer').classList.add('hide');
    document.getElementById('bottom-nav').classList.add('hide');
    document.getElementById('mainHeader').classList.add('hide');
}

function formatLicenseInput(input) {
    // Remove non-alphanumeric and convert to uppercase
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format: YYYYMMDD-XXXXXXXXXXXX
    // Add dash after 8 digits
    let formatted = '';
    for (let i = 0; i < value.length && i < 20; i++) {
        if (i === 8) formatted += '-';
        formatted += value[i];
    }
    input.value = formatted;
}

async function attemptActivation(deviceId) {
    const bizName = document.getElementById('activateBizName').value.trim();
    const licenseKey = document.getElementById('activateLicenseKey').value.trim().toUpperCase();
    const errorEl = document.getElementById('activationError');
    
    if (!bizName) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i> Enter business name';
        errorEl.classList.remove('hidden');
        return;
    }
    
    if (!licenseKey || licenseKey.length < 21) { // YYYYMMDD-XXXXXXXXXXXX with dash = 21 chars
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i> Enter valid license key';
        errorEl.classList.remove('hidden');
        return;
    }
    
    // Validate license with new date-based system
    const validation = await _0xSec.validateLicense(deviceId, bizName, licenseKey);
    
    if (validation.valid) {
        // Extract expiry timestamp from the license
        const dateStr = licenseKey.split('-')[0];
        const expiryDate = new Date(
            parseInt(dateStr.substring(0, 4)),
            parseInt(dateStr.substring(4, 6)) - 1,
            parseInt(dateStr.substring(6, 8))
        );
        expiryDate.setHours(23, 59, 59, 999);
        

        // Activate with expiry timestamp
        _0xSec.activateLicense(bizName, expiryDate.getTime());
       // Activate with expiry timestamp (await since it's async now)
        const activated = await _0xSec.activateLicense(bizName, expiryDate.getTime());
        
        if (!activated) {
            errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i> Activation failed. Please try again.';
            errorEl.classList.remove('hidden');
            return;
        }
 
        
        // Show success with expiry info
        const daysRemaining = validation.daysRemaining;
        errorEl.innerHTML = `<i class="fa-solid fa-check-circle mr-1 text-emerald-500"></i> 
            <span class="text-emerald-500">Activated! Valid for ${daysRemaining} days. Reloading...</span>`;
        errorEl.classList.remove('hidden');
        
        setTimeout(() => location.reload(), 2000);
    } else {
        // Show specific error message
        let errorMsg = validation.error || 'Invalid license key';
        if (validation.error === 'License expired') {
            errorMsg = `License expired on ${validation.expiryDate}`;
        }
        
        errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i> ${errorMsg}`;
        errorEl.classList.remove('hidden');
        
        // Shake animation
        document.getElementById('activateLicenseKey').style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.getElementById('activateLicenseKey').style.animation = '';
        }, 500);
    }
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);


// ==========================================
// 📦 DATABASE MODULE
// ==========================================
const db = new Dexie("MyParchiDB_v2_secure");
db.version(1).stores({ 
    transactions: '++id, type, date, party, amount', 
    parties: '++id, &name',
    items: '++id, &name'
});


// ==========================================
// 📱 APP STATE
// ==========================================
let currentMode = 'sale';
let editingTransactionId = null;
let cart = [];
let currentViewingParty = '';

// Init Date Pickers
const today = new Date().toISOString().split('T')[0];
document.getElementById('txnDate').value = today;
document.getElementById('ledEnd').value = today;
document.getElementById('cashEnd').value = today;

const past = new Date();
past.setDate(past.getDate() - 30);
document.getElementById('ledStart').value = past.toISOString().split('T')[0];
document.getElementById('cashStart').value = past.toISOString().split('T')[0];


// ==========================================
// 🎛️ MODE & NAVIGATION
// ==========================================
function setMode(mode) {
    editingTransactionId = null;
    const saveBtn = document.getElementById('saveBtn');
    if(saveBtn) saveBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> SAVE';

    document.getElementById('partyName').value = "";
    cart = []; 
    renderCart();
    document.getElementById('cashAmount').value = "";
    document.getElementById('cashRemarks').value = "";

    currentMode = mode;
    ['sale', 'purchase', 'receipt', 'payment'].forEach(m => {
        document.getElementById(`btn-${m}`).className = "flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap bg-white text-slate-400 border border-transparent hover:bg-slate-50 uppercase";
    });
    
    const activeBtn = document.getElementById(`btn-${mode}`);
    const itemSec = document.getElementById('item-section');
    const cashSec = document.getElementById('cash-section');

    const styles = {
        sale: "bg-brand-primary text-white shadow-lg shadow-blue-500/30",
        purchase: "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
        receipt: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
        payment: "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
    };
    
    activeBtn.className = `flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap uppercase ${styles[mode]}`;
    
    if(mode === 'sale' || mode === 'purchase') {
        itemSec.classList.remove('hide'); 
        cashSec.classList.add('hide');
    } else {
        itemSec.classList.add('hide'); 
        cashSec.classList.remove('hide');
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hide'));
    document.getElementById(`screen-${tabName}`).classList.remove('hide');
    
    const nav = document.getElementById('bottom-nav');
    if(nav) {
        if(tabName.includes('history')) nav.classList.add('hide'); 
        else nav.classList.remove('hide');
    }
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');

    if(tabName === 'ledger') renderLedgerList();
    if(tabName === 'cashbook') renderCashbook();
}

// Initialize with sale mode
setMode('sale');


// ==========================================
// 🛒 CART FUNCTIONS
// ==========================================
function addToCart() {
    const item = document.getElementById('itemName').value;
    const qty = Number(document.getElementById('itemQty').value);
    const rate = Number(document.getElementById('itemRate').value);
    
    if (!item || !qty || !rate) return;
    
    cart.push({ item, qty, rate, total: qty * rate });
    
    document.getElementById('itemName').value = ""; 
    document.getElementById('itemQty').value = ""; 
    document.getElementById('itemRate').value = ""; 
    document.getElementById('itemName').focus();
    
    renderCart();
}

function editCartItem(i) {
    const item = cart[i];
    document.getElementById('itemName').value = item.item;
    document.getElementById('itemQty').value = item.qty;
    document.getElementById('itemRate').value = item.rate;
    cart.splice(i, 1);
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cartList'); 
    list.innerHTML = ""; 
    let total = 0;
    
    cart.forEach((c, i) => {
        total += c.total;
        list.innerHTML += `
            <div onclick="editCartItem(${i})" class="flex justify-between items-center bg-white p-3 rounded-xl border border-brand-light/50 shadow-sm active:scale-95 transition-transform cursor-pointer">
                <div>
                    <div class="text-xs font-bold text-slate-800">${c.item}</div>
                    <div class="text-[10px] text-slate-500 font-bold">${c.qty} x ₹${c.rate}</div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="font-bold text-brand-dark">₹${c.total}</div>
                    <button onclick="event.stopPropagation();cart.splice(${i},1);renderCart()" class="text-rose-400 bg-rose-50 w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-100">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            </div>`;
    });
    
    document.getElementById('grandTotal').innerText = `₹${total}`;
}


// ==========================================
// 💾 TRANSACTION FUNCTIONS
// ==========================================
async function saveTransaction() {
    const party = document.getElementById('partyName').value;
    if (!party) return alert("ENTER PARTY NAME");
    
    let amount = 0, items = [], remarks = "";
    
    if(currentMode === 'sale' || currentMode === 'purchase') {
        if (cart.length === 0) return alert("CART EMPTY");
        amount = cart.reduce((s, i) => s + i.total, 0);
        items = JSON.parse(JSON.stringify(cart));
    } else {
        amount = Number(document.getElementById('cashAmount').value);
        remarks = document.getElementById('cashRemarks').value;
        if (!amount) return alert("ENTER AMOUNT");
    }

    let txnId;
    const txnData = { 
        type: currentMode, 
        date: new Date(document.getElementById('txnDate').value), 
        party, 
        amount, 
        items, 
        remarks 
    };

    if (editingTransactionId) {
        await db.transactions.put({ id: editingTransactionId, ...txnData });
        txnId = editingTransactionId;
        alert("UPDATED!");
        editingTransactionId = null;
        document.getElementById('saveBtn').innerHTML = '<i class="fa-regular fa-circle-check"></i> SAVE';
    } else {
        txnId = await db.transactions.add(txnData);
        alert("SAVED!");
    }
    
    // Auto-Save Party & Items for Autocomplete
    try { await db.parties.add({name: party}); } catch(e){}
    if(items.length > 0) {
        items.forEach(async i => { 
            try { await db.items.add({name: i.item}); } catch(e){} 
        });
    }
    
    // Clear form
    document.getElementById('partyName').value = ""; 
    cart = []; 
    renderCart(); 
    document.getElementById('cashAmount').value = ""; 
    document.getElementById('cashRemarks').value = "";
    
    // Generate PDF for sale/purchase
    if(currentMode === 'sale' || currentMode === 'purchase') {
        generateThermalPDF({id: txnId, party, items, amount, date: new Date(), type: currentMode});
    }
}

async function editTransaction(id) {
    const t = await db.transactions.get(id);
    if(!t) return;
    
    editingTransactionId = id;
    switchTab('entry');
    setMode(t.type);
    editingTransactionId = id; 
    document.getElementById('saveBtn').innerHTML = '<i class="fa-solid fa-rotate"></i> UPDATE';

    document.getElementById('txnDate').value = new Date(t.date).toISOString().split('T')[0];
    document.getElementById('partyName').value = t.party;
    
    if(t.type === 'sale' || t.type === 'purchase') {
        cart = t.items || [];
        renderCart();
    } else {
        document.getElementById('cashAmount').value = t.amount;
        document.getElementById('cashRemarks').value = t.remarks || "";
    }
}

async function deleteTransaction(id) {
    if(!confirm("Are you sure you want to DELETE this transaction?")) return;
    
    try {
        await db.transactions.delete(id);
        
        if(!document.getElementById('screen-party-history').classList.contains('hide')) {
            await showPartyHistory(currentViewingParty);
        } else if(!document.getElementById('screen-cashbook').classList.contains('hide')) {
            await renderCashbook();
        }
    } catch(e) {
        alert("Error deleting: " + e);
    }
}


// ==========================================
// 📊 LEDGER FUNCTIONS
// ==========================================
async function renderLedgerList(search = "") {
    const parties = await db.parties.toArray(); 
    const list = document.getElementById('ledgerList'); 
    list.innerHTML = "";
    
    const filtered = parties.filter(p => p.name.toUpperCase().includes(search.toUpperCase()));
    
    const start = new Date(document.getElementById('ledStart').value);
    const end = new Date(document.getElementById('ledEnd').value);
    end.setHours(23, 59, 59);

    for (const p of filtered) {
        const allTxns = await db.transactions.where('party').equals(p.name).toArray();
        const txns = allTxns.filter(t => t.date >= start && t.date <= end);
        
        if(txns.length === 0 && search === "") continue;

        let bal = 0;
        txns.forEach(t => {
            if (t.type === 'sale') bal += t.amount;       
            else if (t.type === 'purchase') bal -= t.amount;
            else if (t.type === 'receipt') bal -= t.amount;
            else if (t.type === 'payment') bal += t.amount;
        });
        
        const color = bal > 0 ? "text-rose-600" : (bal < 0 ? "text-emerald-600" : "text-slate-400");
        const bg = bal > 0 ? "bg-rose-50" : (bal < 0 ? "bg-emerald-50" : "bg-slate-50");
        const label = bal > 0 ? "TO RECEIVE" : (bal < 0 ? "ADVANCE" : "SETTLED");
        const initial = p.name.charAt(0);

        list.innerHTML += `
            <div onclick="showPartyHistory('${p.name}')" class="bg-white p-4 rounded-2xl border border-brand-light/30 flex justify-between items-center mb-3 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center font-bold text-brand-dark border border-slate-200 text-lg">${initial}</div>
                    <div class="font-bold text-brand-dark text-lg">${p.name}</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-black ${color}">₹${Math.abs(bal)}</div>
                    <div class="text-[10px] font-bold ${color} ${bg} px-2 py-0.5 rounded-full inline-block">${label}</div>
                </div>
            </div>`;
    }
}

async function showPartyHistory(partyName) {
    currentViewingParty = partyName;
    switchTab('party-history');
    document.getElementById('ph-name').innerText = partyName;
    document.getElementById('ph-avatar').innerText = partyName.charAt(0);

    const txns = await db.transactions.where('party').equals(partyName).toArray();
    txns.sort((a,b) => b.date - a.date);
    
    const list = document.getElementById('ph-list'); 
    list.innerHTML = "";
    
    let bal = 0;
    txns.forEach(t => {
        if (t.type === 'sale') bal += t.amount;
        else if (t.type === 'purchase') bal -= t.amount;
        else if (t.type === 'receipt') bal -= t.amount;
        else if (t.type === 'payment') bal += t.amount;
    });
    
    document.getElementById('ph-balance').innerText = `₹${Math.abs(bal)}`;
    document.getElementById('ph-balance').className = `text-3xl font-black mt-2 ${bal > 0 ? 'text-rose-500' : 'text-emerald-500'}`;

    txns.forEach(t => {
        const colors = {
            sale: 'text-blue-600',
            purchase: 'text-orange-500',
            receipt: 'text-emerald-600',
            payment: 'text-rose-600'
        };
        const icons = {
            sale: 'fa-file-invoice',
            purchase: 'fa-cart-shopping',
            receipt: 'fa-arrow-down',
            payment: 'fa-arrow-up'
        };
        
        const color = colors[t.type];
        const icon = icons[t.type];
        
        let actionBtn = '';
        if(t.type === 'sale' || t.type === 'purchase') {
            actionBtn = `<button onclick="downloadTxnPDF(${t.id}); event.stopPropagation();" class="ml-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shadow-sm"><i class="fa-solid fa-print text-xs"></i></button>`;
        }
        
        actionBtn += `
            <button onclick="deleteTransaction(${t.id}); event.stopPropagation();" class="ml-2 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 shadow-sm"><i class="fa-solid fa-trash text-xs"></i></button>
        `;

        list.innerHTML += `
            <div onclick="editTransaction(${t.id})" class="bg-white p-4 rounded-xl border border-brand-light/30 flex justify-between items-center shadow-sm mb-2 cursor-pointer active:scale-[0.98] transition-transform">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-sm ${color}"><i class="fa-solid ${icon}"></i></div>
                    <div>
                        <div class="font-bold text-xs uppercase text-slate-500">${t.type}</div>
                        <div class="text-sm font-bold text-slate-800">${new Date(t.date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="font-black text-lg ${color}">₹${t.amount}</div>
                    ${actionBtn}
                </div>
            </div>`;
    });
}


// ==========================================
// 💰 CASHBOOK FUNCTIONS
// ==========================================
async function renderCashbook() {
    const start = new Date(document.getElementById('cashStart').value);
    const end = new Date(document.getElementById('cashEnd').value);
    end.setHours(23, 59, 59);

    const allTxns = await db.transactions.toArray();
    const txns = allTxns.filter(t => t.date >= start && t.date <= end);
    
    let cash = 0;
    const list = document.getElementById('cashList'); 
    list.innerHTML = "";
    
    txns.sort((a,b) => b.date - a.date);
    
    txns.forEach(t => {
        if(t.type === 'receipt') cash += t.amount;
        if(t.type === 'payment') cash -= t.amount;
        
        if(t.type === 'receipt' || t.type === 'payment') {
            const color = t.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600';
            const icon = t.type === 'receipt' ? 'fa-arrow-down' : 'fa-arrow-up';
            
            let actionBtn = `
                <button onclick="deleteTransaction(${t.id}); event.stopPropagation();" class="ml-2 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 shadow-sm"><i class="fa-solid fa-trash text-xs"></i></button>
            `;

            list.innerHTML += `
                <div onclick="editTransaction(${t.id})" class="bg-white p-4 rounded-xl border border-brand-light/30 flex justify-between items-center shadow-sm mb-2 cursor-pointer active:scale-[0.98] transition-transform">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center ${color}"><i class="fa-solid ${icon}"></i></div>
                        <div>
                            <div class="font-bold text-sm text-brand-dark">${t.party}</div>
                            <div class="text-[10px] font-bold text-slate-400">${new Date(t.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="font-black ${color} text-lg">₹${t.amount}</div>
                        ${actionBtn}
                    </div>
                </div>`;
        }
    });
    
    document.getElementById('cashBalance').innerText = `₹${cash}`;
}


// ==========================================
// 🖨️ PDF GENERATION
// ==========================================
async function downloadTxnPDF(id) {
    const t = await db.transactions.get(id);
    if(t) generateThermalPDF(t);
}

function generateThermalPDF(t) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: [58, 200] }); 
    const bizName = _0xSec.getBusinessName();
    
    doc.setFont("courier", "bold"); 
    doc.setFontSize(10);
    doc.text(bizName, 29, 8, null, null, "center");
    
    doc.setFontSize(8); 
    doc.text("--------------------------------", 29, 12, null, null, "center");
    doc.text(t.type.toUpperCase() + " SLIP", 29, 16, null, null, "center");
    doc.text("--------------------------------", 29, 20, null, null, "center");
    
    doc.setFont("courier", "normal");
    const dateStr = t.date instanceof Date ? t.date.toLocaleDateString() : new Date(t.date).toLocaleDateString();
    doc.text(`Date: ${dateStr}`, 2, 25);
    doc.text(`Party: ${t.party}`, 2, 30);
    
    let y = 38;
    if(t.items && t.items.length > 0) {
        doc.text("Item          Qty    Price", 2, 35);
        doc.text("--------------------------------", 29, 36, null, null, "center");
        t.items.forEach(i => {
            let name = i.item.substring(0, 10);
            doc.text(`${name.padEnd(12)} ${String(i.qty).padEnd(4)}  ${i.rate}`, 2, y);
            y += 4;
        });
    }
    
    doc.text("--------------------------------", 29, y+2, null, null, "center");
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: Rs. ${t.amount}`, 29, y+8, null, null, "center");
    
    doc.setFontSize(7);
    doc.text("Thank You | Visit Again", 29, y+15, null, null, "center");
    
    doc.save(`${t.party}_${t.type}.pdf`);
}

async function printCurrentLedger() {
    if(!currentViewingParty) return;
    
    const txns = await db.transactions.where('party').equals(currentViewingParty).toArray();
    txns.sort((a,b) => a.date - b.date);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: [58, 2000] });
    const bizName = _0xSec.getBusinessName();
    
    let y = 10;
    doc.setFont("courier", "bold"); 
    doc.setFontSize(10);
    doc.text(bizName, 29, y, null, null, "center"); 
    y += 5;
    
    doc.setFontSize(8);
    doc.text("LEDGER REPORT", 29, y, null, null, "center"); 
    y += 5;
    doc.text(`Party: ${currentViewingParty}`, 29, y, null, null, "center"); 
    y += 5;
    doc.text("--------------------------------", 29, y, null, null, "center"); 
    y += 5;
    
    doc.text("Date      Type        Amount", 2, y); 
    y += 4;
    doc.text("--------------------------------", 29, y, null, null, "center"); 
    y += 4;
    
    let bal = 0;
    doc.setFont("courier", "normal");
    
    txns.forEach(t => {
        if (t.type === 'sale') bal += t.amount;
        else if (t.type === 'purchase') bal -= t.amount;
        else if (t.type === 'receipt') bal -= t.amount;
        else if (t.type === 'payment') bal += t.amount;
        
        const typeShort = t.type.substring(0, 4).toUpperCase();
        const dateShort = new Date(t.date).toLocaleDateString().substring(0, 5);
        
        doc.text(`${dateShort}     ${typeShort}      ${t.amount}`, 2, y);
        y += 4;
    });
    
    y += 2;
    doc.text("--------------------------------", 29, y, null, null, "center"); 
    y += 5;
    doc.setFont("courier", "bold"); 
    doc.setFontSize(10);
    doc.text(`NET BALANCE: ${bal}`, 29, y, null, null, "center"); 
    y += 5;
    doc.setFontSize(7);
    doc.text("(+ To Receive / - To Pay)", 29, y, null, null, "center");
    
    doc.save(`${currentViewingParty}_Ledger.pdf`);
}


// ==========================================
// 🔍 AUTOCOMPLETE SUGGESTIONS
// ==========================================
function closeAllSuggestions() { 
    document.getElementById('partySuggestions').classList.add('hide'); 
    document.getElementById('itemSuggestions').classList.add('hide'); 
}

async function showPartySuggestions(val) { 
    const box = document.getElementById('partySuggestions');
    if(val.length < 1) { box.classList.add('hide'); return; }
    
    const parties = await db.parties.filter(p => p.name.toUpperCase().startsWith(val.toUpperCase())).toArray();
    
    if(parties.length > 0) {
        box.innerHTML = parties.map(p => `
            <div class="p-3 border-b hover:bg-brand-bg cursor-pointer font-bold text-sm text-brand-dark uppercase" 
                onclick="document.getElementById('partyName').value='${p.name}';closeAllSuggestions();event.stopPropagation()">
                ${p.name}
            </div>
        `).join('');
        box.classList.remove('hide');
    } else {
        box.classList.add('hide');
    }
}

async function showItemSuggestions(val) { 
    const box = document.getElementById('itemSuggestions');
    if(val.length < 1) { box.classList.add('hide'); return; }
    
    const items = await db.items.filter(i => i.name.toUpperCase().startsWith(val.toUpperCase())).toArray();
    
    if(items.length > 0) {
        box.innerHTML = items.map(i => `
            <div class="p-2 border-b hover:bg-brand-bg cursor-pointer font-bold text-xs text-brand-dark uppercase" 
                onclick="document.getElementById('itemName').value='${i.name}';closeAllSuggestions();event.stopPropagation()">
                ${i.name}
            </div>
        `).join('');
        box.classList.remove('hide');
    } else {
        box.classList.add('hide');
    }
}


// ==========================================
// 💾 BACKUP & RESTORE
// ==========================================
async function downloadBackup() { 
    const transactions = await db.transactions.toArray(); 
    const parties = await db.parties.toArray();
    const items = await db.items.toArray();
    
    const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        bizName: _0xSec.getBusinessName(),
        data: { transactions, parties, items }
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {type: 'application/json'}); 
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(blob); 
    link.download = `MyParchi_Backup_${new Date().toISOString().split('T')[0]}.json`; 
    link.click(); 
}

function triggerRestore() { 
    document.getElementById('restoreFile').click(); 
}

async function processRestore(input) {
    if (!input.files.length) return;
    
    if(!confirm("⚠️ WARNING: This will DELETE ALL existing data and replace it with the backup. This cannot be undone. Continue?")) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Handle both old format (array) and new format (object with version)
            let transactions, parties = [], items = [];
            
            if (Array.isArray(backup)) {
                // Old format - just transactions array
                transactions = backup;
            } else if (backup.data) {
                // New format
                transactions = backup.data.transactions || [];
                parties = backup.data.parties || [];
                items = backup.data.items || [];
            } else {
                throw new Error("Invalid backup format");
            }
            
            await db.transaction('rw', db.transactions, db.parties, db.items, async () => {
                await db.transactions.clear();
                await db.parties.clear();
                await db.items.clear();
                
                // Restore transactions (remove IDs to let Dexie assign new ones)
                const cleanTxns = transactions.map(({ id, ...rest }) => ({
                    ...rest,
                    date: new Date(rest.date) // Ensure date is Date object
                }));
                await db.transactions.bulkAdd(cleanTxns);
                
                // Restore parties
                if (parties.length > 0) {
                    const cleanParties = parties.map(({ id, ...rest }) => rest);
                    await db.parties.bulkAdd(cleanParties);
                } else {
                    // Rebuild from transactions
                    const uniqueParties = new Set(transactions.map(t => t.party));
                    for(const p of uniqueParties) {
                        try { await db.parties.add({name: p}); } catch(e) {}
                    }
                }
                
                // Restore items
                if (items.length > 0) {
                    const cleanItems = items.map(({ id, ...rest }) => rest);
                    await db.items.bulkAdd(cleanItems);
                } else {
                    // Rebuild from transactions
                    const uniqueItems = new Set();
                    transactions.forEach(t => { 
                        if(t.items) t.items.forEach(i => uniqueItems.add(i.item)); 
                    });
                    for(const i of uniqueItems) {
                        try { await db.items.add({name: i}); } catch(e) {}
                    }
                }
            });
            
            alert("✅ RESTORE COMPLETE! Page will reload.");
            location.reload();
            
        } catch(err) { 
            alert("Error restoring file: " + err.message); 
        }
    };
    
    reader.readAsText(file);
}


// ==========================================
// ℹ️ HELP
// ==========================================
function showHelp() { 
    document.getElementById('helpModal').classList.remove('hide'); 
}


// ==========================================
// 🔧 LICENSE KEY GENERATOR (FOR ADMIN USE)
// This function is for YOU to generate keys for customers
// Run this in browser console: generateKeyForCustomer('DEVICEID', 'BUSINESS NAME')
// ==========================================
window.generateKeyForCustomer = async function(deviceId, bizName) {
    const key = await _0xSec.generateLicenseKey(deviceId, bizName);
    console.log('=================================');
    console.log('Device ID:', deviceId);
    console.log('Business:', bizName);
    console.log('LICENSE KEY:', key.match(/.{1,4}/g).join('-'));
    console.log('=================================');
    return key;
};

// Debug function to show device info
window.showDeviceInfo = async function() {
    const deviceId = await _0xSec.getDisplayDeviceId();
    const fullFp = await _0xSec.getFullFingerprint();
    console.log('Device ID (short):', deviceId);
    console.log('Full Fingerprint:', fullFp);
};
