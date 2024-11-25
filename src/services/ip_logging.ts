import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import env from '../config/env';
import print from '../utils/print';

let doc: GoogleSpreadsheet;
let ipsSheet: GoogleSpreadsheetWorksheet;

export async function initSheet() {
  try {
    doc = new GoogleSpreadsheet('1zEVmGxp30JZm5weyCwAcuMbhvutAy_DJIFNu2uBCY_I');
    await doc.useServiceAccountAuth({
      client_email: env.ipTracing.googleSpreadsheet.serviceAccountEmail,
      private_key: env.ipTracing.googleSpreadsheet.privateKey,
    });
    await doc.loadInfo();
    ipsSheet = doc.sheetsByIndex[0];
  } catch (error) {
    print.error('Cannot init connection to Google spreadsheet', error);
  }
}

export async function addLog(record: IPLogRecord) {
  if (doc == null) await initSheet();
  for (const key in record) {
    record[key] = record[key] ?? 'unknown';
  }
  await ipsSheet.addRow(record as any);
}

export interface IPLogRecord {
  datetime: string,
  ip: string,
  user_id: string,
  user_email: string,
  country: string,
  region: string,
  city: string,
  latitude: number,
  longitude: number,
  url: string,
}

export interface IPCacheRecord {
  datetime: string,
  ip: string,
  user_id: string,
  user_email: string,
  country: string,
  region: string,
  city: string,
  latitude: number,
  longitude: number,
  url: string,
}