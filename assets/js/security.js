'use strict';
/**
 * Cifrado local, sin servidor ni recuperación por correo.
 * v1: compatibilidad con contraseñas creadas en Saldo Claro v3/v4.
 * v2: clave de datos aleatoria AES-GCM 256, protegida por contraseña y, por
 * separado, por un código de recuperación aleatorio generado en el dispositivo.
 * Nadie puede reconstruir contraseña ni código de recuperación desde GitHub.
 */
const security = (() => {
  const VAULT_KEY = 'saldo-claro-mobile-v2:vault';
  const PLAIN_KEY = 'saldo-claro-mobile-v2';
  const ONBOARD_KEY = 'saldo-claro-onboarding-v3';
  const ITERATIONS = 250000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let activeDataKey = null;
  let legacyKey = null;
  let rawDataKey = null;
  let queue = Promise.resolve();

  const available = () => !!(window.crypto?.subtle && window.crypto?.getRandomValues);
  const hasVault = () => localStorage.getItem(VAULT_KEY) !== null;
  const isUnlocked = () => hasVault() && (activeDataKey !== null || legacyKey !== null);
  const b64 = a => btoa(Array.from(a, b=>String.fromCharCode(b)).join(''));
  const bytes = s => Uint8Array.from(atob(s), c=>c.charCodeAt(0));
  const rand = n => crypto.getRandomValues(new Uint8Array(n));
  const record = () => {
    const r = JSON.parse(localStorage.getItem(VAULT_KEY) || 'null');
    if (!r || ![1,2].includes(r.version)) throw Error('Archivo cifrado inválido.');
    return r;
  };
  async function keyFrom(secret,salt,iterations=ITERATIONS){
    if (!available()) throw Error('Para proteger tus datos necesitas HTTPS o localhost.');
    const base = await crypto.subtle.importKey('raw',encoder.encode(secret),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function seal(raw,key){
    const iv=rand(12);
    const value=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,raw);
    return {iv:b64(iv),data:b64(new Uint8Array(value))};
  }
  async function unseal(blob,key){
    return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(blob.iv)},key,bytes(blob.data)));
  }
  function recoveryCode(){
    // 32 bytes from CSPRNG; hex groups are easier to transcribe and avoid ambiguous characters.
    const hex=Array.from(rand(32),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
    return hex.match(/.{1,8}/g).join('-');
  }
  function normalizeRecovery(code){return String(code||'').toUpperCase().replace(/[^A-F0-9]/g,'');}
  async function wrap(raw,secret){
    const salt=rand(16), key=await keyFrom(secret,salt);
    return {iterations:ITERATIONS,salt:b64(salt),...await seal(raw,key)};
  }
  async function unwrap(blob,secret){
    const key=await keyFrom(secret,bytes(blob.salt),blob.iterations);
    return unseal(blob,key);
  }
  function validData(data){
    if(data?.schema!==2||!Array.isArray(data.transactions)||!Array.isArray(data.goals))throw Error('Los datos son incompatibles.');
    return data;
  }
  async function decryptData(enc,key){return validData(JSON.parse(decoder.decode(await unseal(enc,key))));}
  async function setup(password,data){
    if(password.length<8)throw Error('La contraseña debe tener al menos 8 caracteres.');
    if(!available())throw Error('Abre la aplicación mediante HTTPS o Live Server.');
    const raw=rand(32), key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
    const code=recoveryCode();
    const newRecord={version:2,password:await wrap(raw,password),recovery:await wrap(raw,normalizeRecovery(code)),payload:await seal(encoder.encode(JSON.stringify(data)),key)};
    // LocalStorage es atómico para una única clave: primero escribir nuevo cifrado.
    localStorage.setItem(VAULT_KEY,JSON.stringify(newRecord));
    localStorage.removeItem(PLAIN_KEY);
    activeDataKey=key;rawDataKey=raw;legacyKey=null;
    return code; // NUNCA persistir el código sin cifrar
  }
  async function enable(password,data){await flush();return setup(password,data);}
  async function unlock(password){
    const v=record();
    if(v.version===1){
      const key=await keyFrom(password,bytes(v.salt),v.iterations);
      const data=await decryptData({iv:v.iv,data:v.data},key);
      legacyKey=key;activeDataKey=null;rawDataKey=null;
      return data;
    }
    const raw=await unwrap(v.password,password);
    const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
    const data=await decryptData(v.payload,key);
    activeDataKey=key;rawDataKey=raw;legacyKey=null;
    return data;
  }
  async function verify(password){
    const v=record();
    if(v.version===1){const key=await keyFrom(password,bytes(v.salt),v.iterations);await decryptData({iv:v.iv,data:v.data},key);}
    else{const raw=await unwrap(v.password,password);const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);await decryptData(v.payload,key);}
    return true;
  }
  function hasRecovery(){return hasVault()&&record().version===2&&!!record().recovery;}
  async function recover(code,newPassword){
    await flush();
    if(newPassword.length<8)throw Error('La nueva contraseña debe tener al menos 8 caracteres.');
    const old=record();
    if(old.version!==2||!old.recovery)throw Error('Este espacio antiguo todavía no tiene código de recuperación.');
    const raw=await unwrap(old.recovery,normalizeRecovery(code));
    const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
    const data=await decryptData(old.payload,key);
    // Rotación: invalidar el código usado y generar uno nuevo para el futuro.
    const newCode=recoveryCode();
    const updated={...old,password:await wrap(raw,newPassword),recovery:await wrap(raw,normalizeRecovery(newCode))};
    localStorage.setItem(VAULT_KEY,JSON.stringify(updated));
    activeDataKey=key;rawDataKey=raw;legacyKey=null;
    return {data,code:newCode};
  }
  async function flush(){await queue;}
  function persist(data){
    if(!isUnlocked())return Promise.reject(Error('Archivo bloqueado.'));
    const snapshot=JSON.stringify(data);
    queue=queue.catch(()=>{}).then(async()=>{
      const old=record();
      if(old.version===1){
        const iv=rand(12), cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},legacyKey,encoder.encode(snapshot));
        localStorage.setItem(VAULT_KEY,JSON.stringify({...old,iv:b64(iv),data:b64(new Uint8Array(cipher))}));
      }else{
        const payload=await seal(encoder.encode(snapshot),activeDataKey);
        localStorage.setItem(VAULT_KEY,JSON.stringify({...old,payload}));
      }
      localStorage.removeItem(PLAIN_KEY);
    });
    return queue;
  }
  async function rotateRecovery(password,data){
    await flush();
    await verify(password);
    const old=record();
    if(old.version===1)return setup(password,data); // migrar v4 a una bóveda recuperable
    if(!rawDataKey)throw Error('Desbloquea el espacio para cambiar el código.');
    const code=recoveryCode();
    localStorage.setItem(VAULT_KEY,JSON.stringify({...old,recovery:await wrap(rawDataKey,normalizeRecovery(code))}));
    return code;
  }
  async function disable(data){await flush();localStorage.setItem(PLAIN_KEY,JSON.stringify(data));localStorage.removeItem(VAULT_KEY);activeDataKey=null;rawDataKey=null;legacyKey=null;}
  async function lock(){await flush();activeDataKey=null;rawDataKey=null;legacyKey=null;}
  async function eraseAll(){await flush();localStorage.removeItem(VAULT_KEY);localStorage.removeItem(PLAIN_KEY);localStorage.removeItem(ONBOARD_KEY);activeDataKey=null;legacyKey=null;rawDataKey=null;}
  const hasOnboarded = () => localStorage.getItem(ONBOARD_KEY)==='1';
  const finishOnboarding = () => localStorage.setItem(ONBOARD_KEY,'1');
  return {available,hasVault,isUnlocked,unlock,verify,flush,enable,persist,disable,lock,eraseAll,hasOnboarded,finishOnboarding,hasRecovery,recover,rotateRecovery};
})();
