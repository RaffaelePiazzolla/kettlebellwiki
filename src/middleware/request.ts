import { Request, Response, NextFunction } from 'express';
import ServiceError from '../model/ServiceError';
import * as database from '../services/database';
import env from '../config/env';
import iplocate from 'node-iplocate';
import print from '../utils/print';
import { isFileRoute } from '../utils';
import NodeCache from 'node-cache';
import * as IPLoggingService from '../services/ip_logging';
import * as UserService from '../services/user';

const ipCache = new NodeCache({ stdTTL: 24 * 60 * 60 }); // 1 day

export function noCaching(req: Request, res: Response, next: NextFunction) {
  res.header('Cache-Control', 'no-cache');
  next();
}

export async function ipInfoLogger(req: Request, res: Response, next: NextFunction) {
  try {
    next(); // Immediately call next() to prevent middleware chain blocking

    if (!isFileRoute(req.originalUrl)) {
      const date = new Date().toMySQLDateTime();
      let ipLogRecord: any = {};

      const userId = req.session?.user?.id;
      if (userId != null) {
        ipLogRecord.user_id = userId;
        ipLogRecord.user_email = (await UserService.getUser(userId)).email;
      } else {
        ipLogRecord.user_id = null;
        ipLogRecord.user_email = null;
      }

      if (ipCache.has(req.ip)) {
        ipLogRecord = {
          ...ipCache.get<IPLoggingService.IPLogRecord>(req.ip),
          ...ipLogRecord,
          datetime: date,
          ip: req.ip,
          url: req.originalUrl,
        };

        const ipLocation = `${ipLogRecord.country}, ${ipLogRecord.region}, ${ipLogRecord.city}`;
        print.log(`[${date}] host '${req.ip}' from '${ipLocation}' visited '${req.originalUrl}'`);
      } else {
        const ipInfo: Record<string, any> = await iplocate(req.ip);
        ipLogRecord = {
          ...ipLogRecord,
          datetime: date,
          ip: req.ip,
          country: ipInfo.country_code,
          region: ipInfo.subdivision,
          city: ipInfo.city,
          latitude: ipInfo.latitude,
          longitude: ipInfo.longitude,
          url: req.originalUrl,
        };

        if (ipInfo.country_code != null) {
          const ipLocation = `${ipLogRecord.country}, ${ipLogRecord.region}, ${ipLogRecord.city}`;
          print.log(`[${date}] host '${req.ip}' from '${ipLocation}' visited '${req.originalUrl}'`);
        } else {
          print.log(`[${date}] host '${req.ip}' visited '${req.originalUrl}' from unknown location`);
        }

        // Add to cache but without 'datetime', 'ip', 'user_id', 'user_email' and 'url'
        ipCache.set(req.ip, {
          country: ipLogRecord.country,
          region: ipLogRecord.region,
          city: ipLogRecord.city,
          latitude: ipLogRecord.latitude,
          longitude: ipLogRecord.longitude,
        });
      }

      if (!env.ipTracing.bannedIPs.includes(req.ip)) {
        await IPLoggingService.addLog(ipLogRecord);
      }
    }
  } catch (error) {
    print.error('cannot add new ip log to google spreadsheet:', error);
  }
}

export function ensureDatabaseConnection(req: Request, res: Response, next: NextFunction) {
  if (database.isConnected()) {
    next();
  } else {
    res.error(new ServiceError(500, 'the application is not connected to the database'));
  }
}

export function herokuRedirect(req: Request, res: Response, next: NextFunction) {
  if (req.get('host').includes('herokuapp.com')) {
    res.redirect(`${env.website.rootUrl}${req.originalUrl}`);
  } else {
    next();
  }
}

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (!req.secure) {
    res.redirect(`https://${req.get('host')}${req.originalUrl}`);
  } else {
    next();
  }
}