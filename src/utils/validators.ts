import * as PurchaseService from '../services/purchase';
import * as UserService from '../services/user';

const symbols = Object.freeze([
  '!', '"', '#', '$', '%', '&', '\'', '(',
  ')', '*', '+', ',', '-', '.', '/', ':',
  ';', '<', '=', '>', '?', '@', '[', '\\',
  ']', '^', '_', '`', '{', '|', '}', '~'
]);


export function password(value: string): boolean {
  const escaped = symbols.map(s => `\\${s}`).join('');
  const pattern = String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[${escaped}])[A-Za-z\d${escaped}]{8,}$`;
  return !!value.match(new RegExp(pattern));
}

password.errors = function (value: string) {
  const escaped = symbols.map(s => `\\${s}`).join('');
  return {
    lowercase: !value.match(/(?=.*[a-z])/),
    uppercase: !value.match(/(?=.*[A-Z])/),
    numbers: !value.match(/(?=.*\d)/),
    symbols: !value.match(new RegExp(`(?=.*[${escaped}])`)),
    length: value.length >= 8,
  };
}

export function humanName(value: string): boolean {
  return !!value.match(/.+/);
}

export function gender(value: string): boolean {
  return !!value.match(/^(male|female|other)$/);
}

//! This must be a Promise because express-validator evaluates this as false
//! only if the promis throws an error (with reject)
export async function product(value: string): Promise<boolean> {
  try {
    if (await PurchaseService.getProduct(value)) {
      return true;
    } else {
      return Promise.reject(false);
    }
  } catch (error) {
    return Promise.reject(false);
  }
}

export function redirectUrl(value: string): boolean {
  return !!value.match(/^((\/[a-z0-9\-\/\%\s]+)+(\?([a-z0-9\-]+=[a-z0-9\-\/\%\s]+\&?)*)?)$/i);
}

export function key(value: string): boolean {
  return !!value.match(/^([0-9A-F]{64})$/i);
}

export function phone(value: string): boolean {
  value = value.replace(/[\t\n\s]{2,}/g, ' ');
  const pattern = /^(\+\d{1,2}\s*)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return value == null || value == '' || !!value.match(pattern);
}

export function phoneSanitizer(value: string): string {
  return value.replace(/[^\d\+]/g, '');
}

// This must be a Promise because express-validator evaluates this as false
// only if the promis throws an error (with reject)
export async function existingEmail(email: string): Promise<boolean> {
  try {
    if (await UserService.emailExists(email)) {
      return true;
    } else {
      return Promise.reject(false);
    }
  } catch (error) {
    return Promise.reject(false);
  }
}