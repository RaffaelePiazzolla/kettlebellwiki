import * as database from './database';
import ServiceError from '../model/ServiceError';
import Product from '../model/Product';

export async function getProduct(product: string | number): Promise<Product> {
  try {
    const column = typeof product == 'string' ? 'name' : 'id';
    const products = await database.query(`
      SELECT *
      FROM "Products"
      WHERE "${column}" LIKE ? `,
      [product],
    );
    if (products.length === 1) {
      return new Product(products[0]);
    }
    throw new ServiceError(404, `no product with ${column} ${product}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get product: ${error.message}`);
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await database.query(`
      SELECT *
      FROM "Products"
    `);
    return products.map(product => new Product(product));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get products: ${error.message}`);
  }
}

export async function addPayment(userId: number, productId: number, duration: Date = new Date(Date.now() + 2592000)): Promise<boolean> {
  try {
    await database.query(`
      INSERT INTO "Payments" ("expiration", "user", "product")
      VALUES (?, ?, ?) `,
      [duration, userId, productId],
    );
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot add payment: ${error.message}`);
  }
}

export async function checkPayment(userId: number, productId: number): Promise<boolean> {
  try {
    const payments = await database.query(`
      SELECT 1
      FROM "Payments"
      WHERE "user" = ?
      AND "product" = ?
      AND "expiration" <= CURRENT_TIMESTAMP `,
      [userId, productId],
    );
    return payments.length > 0;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot check payment: ${error.message}`);
  }
}