import { Buffer } from 'node:buffer';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-xxxx';
async function getCryptoKey() {
    const rawKey = new TextEncoder().encode(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    return await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
export async function encrypt(text) {
    if (!text)
        return text;
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const ivHex = Buffer.from(iv).toString('hex');
    const encryptedHex = Buffer.from(encrypted).toString('hex');
    return `${ivHex}:${encryptedHex}`;
}
export async function decrypt(text) {
    if (!text)
        return text;
    try {
        const [ivHex, encryptedHex] = text.split(':');
        if (!ivHex || !encryptedHex)
            return text;
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const key = await getCryptoKey();
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
        return new TextDecoder().decode(decrypted);
    }
    catch (e) {
        console.error('Failed to decrypt data', e);
        return text;
    }
}
