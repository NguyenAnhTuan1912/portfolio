const TOKEN_NAME = "_tda";

const CookiesCoefficient = {
  SESSION: 1000 * 60 * 60 * 24,
  PERSISTENT: null,
};

function writePersistentCookie(name: string, value: string) {
  document.cookie = `${name}=${value}`;
}

function writeSessionCookie(name: string, value: string, expireTime: number) {
  expireTime = expireTime < 1 ? 1 : expireTime;
  let expires = "; expires=";
  let expireAt = new Date(
    CookiesCoefficient.SESSION * expireTime! + Date.now()
  );
  expires += expireAt.toUTCString();
  let cookieString = `${name}=${value}` + expires + "; path=/";
  document.cookie = cookieString;
}

function readCookie(name: string) {
  let reg = new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`);
  return document.cookie.replace(reg, "$1");
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const CookieUtils = {
  TOKEN_NAME,
  writeSessionCookie,
  writePersistentCookie,
  readCookie,
  removeCookie,
};
