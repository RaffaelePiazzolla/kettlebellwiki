import crypto from 'crypto';
import { Request } from 'express';
import { validationResult, matchedData } from 'express-validator';
import { promises as fs } from 'fs';
const { routes } = require('../private/sitemap.json');

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateKey() {
  return sha256(Math.random().toString());
}

export function isFileRoute(url: string): boolean {
  for (const route of routes) {
    const pattern = RegExp(`^(${route.path}\\/?)$`, 'g');
    if (route.isFile && url.replace(/\?.*/g, '').trim().match(pattern)) {
      return true;
    }
  }
  return false;
}

export function isReqValid(req: Request): boolean {
  const errors = validationResult(req);
  const data = matchedData(req);
  return errors.isEmpty() && Object.keys(data).length > 0;
}

export function parseDatabaseUrl(url: string) {
  return {
    name: url.match(/\/[a-z0-9\_]+\?/i).toString().slice(1, -1),
    host: url.match(/@[a-z0-9\-\.]+\//i).toString().slice(1, -1),
    user: url.match(/\/[a-z0-9]+:/i).toString().slice(1, -1),
    password: url.match(/:[a-z0-9]+\@/i).toString().slice(1, -1),
  };
}

export async function fileExists(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.stat(path).then(() => {
      resolve(true);
    }).catch((error) => {
      resolve(false);
    });
  });
}