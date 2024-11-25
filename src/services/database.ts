import mysql from 'mysql';
import env from '../config/env';
import ServiceError from '../model/ServiceError';
import print from '../utils/print';

const pool = mysql.createPool({
  host: env.database.host,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
});

export async function testConnection() {
  await query('SELECT 1');
}

export async function query(sql: string, args?: (string | Date | number)[]): Promise<Record<string, any>[]>
export async function query(sql: string, args: (string | Date | number)[], from: number, length: number): Promise<Record<string, any>[]>
export async function query(sql: string, args: (string | Date | number)[] = [], from?: number, length?: number): Promise<Record<string, any>[]> {

  if (env.mode == 'production') {
    if (sql.split('?').length - 1 > args.length) {
      throw new ServiceError(
        500,
        'error inside MySQL query: query arguments and number or \'?\' must be the same'
      );
    }
  } else if (sql.split('?').length - 1 != args.length) {
    throw new ServiceError(
      500,
      'error inside MySQL query: query arguments and number or \'?\' must be the same'
    );
  }

  sql = sql.replace(/"/g, '`');
  if (from != null && length != null) {
    sql = `${sql}\nLIMIT ?, ? `;
    args = [...args, from, length];
  }

  return await new Promise((resolve, reject) => {
    pool.query(sql, args, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

export async function close(): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    pool.end((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

export async function deleteAll(except = ['sessions']) {
  try {
    const tables = await query(`
      SELECT "TABLE_NAME" 
      FROM "INFORMATION_SCHEMA"."TABLES" 
      WHERE "TABLE_TYPE" = 'BASE TABLE'
      AND "table_schema" = '${env.database.name}'`
    );
    await query(`SET FOREIGN_KEY_CHECKS = 0`);
    tables.forEach(async ({ TABLE_NAME }) => {
      if (!except.includes(TABLE_NAME)) {
        await query(`DROP TABLE IF EXISTS "${TABLE_NAME}"`);
        print.warn(`table '${TABLE_NAME}' has been removed from database '${env.database.name}'`);
      }
    });
    await query(`SET FOREIGN_KEY_CHECKS = 1`);
  } catch (error) {
    print.error(`cannot delete all database tables:`, error.message);
  }
}

export async function isConnected(): Promise<boolean> {
  try {
    await testConnection();
    return true;
  } catch (error) {
    return false;
  }
}

export function isDisconnected(): boolean {
  return !isConnected();
}