'use strict';
/**
 * Protección local de datos (sin servidor).
 * Web Crypto: PBKDF2-SHA256 (250 000 iteraciones) + AES-GCM.
 * IMPORTANTE: esto NO crea usuarios online ni sincroniza dispositivos.
 */
const security = (() => {
  const VAULT_KEY = 'saldo-claro-mobile-v2:vault';
  const ONBOARD_KEY = 'saldo-claro-onboarding-v3';
  const ITERATIONS = 250000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let activeKey = null;
  let writeQueue = Promise.resolve();

  function available() { return Boolean(window.crypto?.subtle && window.crypto?.getRandomValues); }
  function hasVault() { return localStorage.getItem(VAULT_KEY) !== null; }
  function isUnlocked() { return hasVault() && activeKey !== null; }
  function b64(bytes) {
    let str = '';
    for (let i = 0; i < bytes.length; i += 8192) str += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(str);
  }
  function bytes(value) { return Uint8Array.from(atob(value), x => x.charCodeAt(0)); }
  async function createKey(password, salt, iterations = ITERATIONS) {
    if (!available()) throw Error('Tu navegador necesita HTTPS o localhost para usar contraseña.');
    const raw = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      {name:'PBKDF2', salt, iterations, hash:'SHA-256'}, raw,
      {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
    );
  }
  async function encrypt(value, key, salt) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = encoder.encode(JSON.stringify(value));
    const cipher = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, plain);
    return JSON.stringify({version:1,iterations:ITERATIONS,salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(cipher))});
  }
  async function decrypt(record,key) {
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(record.iv)},key,bytes(record.data));
    const result = JSON.parse(decoder.decode(plain));
    if (result?.schema !== 2 || !Array.isArray(result.transactions) || !Array.isArray(result.goals)) throw Error('Datos incompatibles.');
    return result;
  }
  function record() {
    try { return JSON.parse(localStorage.getItem(VAULT_KEY)); }
    catch { throw Error('No se pudo leer el archivo protegido.'); }
  }
  async function unlock(password) {
    if (!hasVault()) throw Error('No hay contraseña configurada.');
    const v = record();
    const key = await createKey(password, bytes(v.salt),v.iterations);
    const value = await decrypt(v,key);
    activeKey = key;
    return value;
  }
  async function verify(password) {
    const v = record();
    const key = await createKey(password, bytes(v.salt),v.iterations);
    await decrypt(v,key); // Contraseña correcta si autentica el archivo
    return true;
  }
  async function flush(){ await writeQueue; }
  async function enable(password, data) {
    if (password.length < 8) throw Error('Usa una contraseña de al menos 8 caracteres.');
    await flush();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await createKey(password,salt);
    const content = await encrypt(data,key,salt);
    localStorage.setItem(VAULT_KEY, content); // primero guardar cifrado
    localStorage.removeItem('saldo-claro-mobile-v2'); // y después borrar copia sin cifrar
    activeKey = key;
  }
  function persist(data) {
    if (!isUnlocked()) return Promise.reject(Error('El archivo está bloqueado.'));
    const snapshot = JSON.parse(JSON.stringify(data));
    writeQueue = writeQueue.catch(()=>{}).then(async () => {
      const stored = record();
      const content = await encrypt(snapshot,activeKey,bytes(stored.salt));
      localStorage.setItem(VAULT_KEY,content);
      localStorage.removeItem('saldo-claro-mobile-v2');
    });
    return writeQueue;
  }
  async function disable(data){
    await flush();
    localStorage.setItem('saldo-claro-mobile-v2', JSON.stringify(data));
    localStorage.removeItem(VAULT_KEY);
    activeKey=null;
  }
  async function lock(){ await flush(); activeKey=null; }
  async function eraseAll(){
    await flush();
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem('saldo-claro-mobile-v2');
    localStorage.removeItem(ONBOARD_KEY);
    activeKey=null;
  }
  function hasOnboarded(){return localStorage.getItem(ONBOARD_KEY)==='1';}
  function finishOnboarding(){localStorage.setItem(ONBOARD_KEY,'1');}
  return {available,hasVault,isUnlocked,unlock,verify,flush,enable,persist,disable,lock,eraseAll,hasOnboarded,finishOnboarding};
})();
