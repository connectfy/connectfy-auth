import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { BROWSER_TYPE, DEVICE_TYPE, OS_TYPE } from 'connectfy-shared';
import {
  IDeviceInfo,
  IDeviceInfoWithLocation,
  IGeoLocation,
  IParsedUserAgent,
  IRequestData,
} from './interfaces/request.interface';
import { Request } from 'express';
import countries from 'i18n-iso-countries';

@Injectable()
export class RequestHelperService {
  // ==========================================
  // Parse user agent string and return structured data with enums
  // ==========================================
  parseUserAgent(userAgent: string | undefined): IParsedUserAgent {
    if (!userAgent) {
      return {
        browser: BROWSER_TYPE.UNKNOWN,
        browserVersion: null,
        os: OS_TYPE.UNKNOWN,
        osVersion: null,
        platform: DEVICE_TYPE.UNKNOWN,
      };
    }

    try {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      return {
        browser: this.mapBrowser(result.browser.name),
        browserVersion: result.browser.version || null,
        os: this.mapOS(result.os.name),
        osVersion: result.os.version || null,
        platform: this.mapPlatform(result.device.type),
      };
    } catch (error) {
      return {
        browser: BROWSER_TYPE.UNKNOWN,
        browserVersion: null,
        os: OS_TYPE.UNKNOWN,
        osVersion: null,
        platform: DEVICE_TYPE.UNKNOWN,
      };
    }
  }

  // ==========================================
  // Map browser name to BROWSER_TYPE enum
  // ==========================================
  private mapBrowser(browserName: string | undefined): BROWSER_TYPE {
    if (!browserName) return BROWSER_TYPE.UNKNOWN;

    const browser = browserName.toLowerCase();

    if (browser.includes('chrome') || browser.includes('chromium')) {
      return BROWSER_TYPE.CHROME;
    }
    if (browser.includes('firefox')) {
      return BROWSER_TYPE.FIREFOX;
    }
    if (browser.includes('safari') && !browser.includes('chrome')) {
      return BROWSER_TYPE.SAFARI;
    }
    if (browser.includes('edge') || browser.includes('edg')) {
      return BROWSER_TYPE.EDGE;
    }
    if (browser.includes('opera') || browser.includes('opr')) {
      return BROWSER_TYPE.OPERA;
    }
    if (browser.includes('brave')) {
      return BROWSER_TYPE.BRAVE;
    }
    if (browser.includes('samsung')) {
      return BROWSER_TYPE.SAMSUNG;
    }

    return BROWSER_TYPE.UNKNOWN;
  }

  // ==========================================
  // Map OS name to OS_TYPE enum
  // ==========================================
  private mapOS(osName: string | undefined): OS_TYPE {
    if (!osName) return OS_TYPE.UNKNOWN;

    const os = osName.toLowerCase();

    if (os.includes('windows')) {
      return OS_TYPE.WINDOWS;
    }
    if (os.includes('mac') || os.includes('darwin')) {
      return OS_TYPE.MACOS;
    }
    if (os.includes('linux') && !os.includes('android')) {
      return OS_TYPE.LINUX;
    }
    if (os.includes('android')) {
      return OS_TYPE.ANDROID;
    }
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) {
      return OS_TYPE.IOS;
    }

    return OS_TYPE.UNKNOWN;
  }

  // ==========================================
  // Map device type to DEVICE_TYPE enum
  // ==========================================
  private mapPlatform(deviceType: string | undefined): DEVICE_TYPE {
    if (!deviceType) return DEVICE_TYPE.WEB;

    const device = deviceType.toLowerCase();

    if (device === 'mobile') {
      return DEVICE_TYPE.MOBILE;
    }
    if (device === 'tablet') {
      return DEVICE_TYPE.TABLET;
    }
    if (device === 'desktop' || device === 'pc') {
      return DEVICE_TYPE.DESKTOP;
    }

    return DEVICE_TYPE.WEB;
  }

  // ==========================================
  // Get client IP address (handles proxies, load balancers, CDNs)
  // ==========================================
  getClientIp(request: Request): string {
    const ipHeaders = [
      'cf-connecting-ip', // Cloudflare
      'x-real-ip', // Nginx proxy
      'x-forwarded-for', // Standard proxy header
      'x-client-ip', // Apache
      'x-cluster-client-ip', // Rackspace LB
      'forwarded-for',
      'forwarded',
    ];

    for (const header of ipHeaders) {
      const value = request.headers[header];

      if (value) {
        const ip = Array.isArray(value) ? value[0] : value;
        const cleanIp = ip.split(',')[0].trim();

        if (cleanIp && cleanIp !== 'unknown') {
          return this.cleanIpAddress(cleanIp);
        }
      }
    }

    const socketIp = request.socket.remoteAddress;
    return this.cleanIpAddress(socketIp || 'unknown');
  }

  // ==========================================
  // Clean and normalize IP address
  // ==========================================
  cleanIpAddress(ip: string): string {
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }

    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      return '127.0.0.1';
    }

    const portIndex = ip.lastIndexOf(':');
    if (portIndex > 0 && !ip.includes('::')) {
      return ip.substring(0, portIndex);
    }

    return ip;
  }

  // ==========================================
  // Get full device info from request
  // ==========================================
  getDeviceInfo(request: Request): IDeviceInfo {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const parsedUA = this.parseUserAgent(userAgent);
    const ipAddress = this.getClientIp(request);

    return {
      userAgent,
      browser: parsedUA.browser,
      browserVersion: parsedUA.browserVersion,
      os: parsedUA.os,
      osVersion: parsedUA.osVersion,
      platform: parsedUA.platform,
      ipAddress,
      deviceName: `${parsedUA.os}-${parsedUA.browser}-${parsedUA.platform}`,
    };
  }

  // ==========================================
  // Get geolocation from IP address
  // ==========================================
  getGeoLocationFromIP(ipAddress: string): IGeoLocation {
    // Skip private/localhost IPs
    if (this.isPrivateIP(ipAddress)) {
      return {
        country: null,
        countryCode: null,
        city: null,
        region: null,
        timezone: null,
        latitude: null,
        longitude: null,
      };
    }

    try {
      const geo = geoip.lookup(ipAddress);

      if (!geo) {
        return {
          country: null,
          countryCode: null,
          city: null,
          region: null,
          timezone: null,
          latitude: null,
          longitude: null,
        };
      }

      return {
        country: this.getCountryName(geo.country),
        countryCode: geo.country || null,
        city: null, // geoip-lite doesn't provide city accurately
        region: geo.region || null,
        timezone: geo.timezone || null,
        latitude: geo.ll?.[0] || null, // ll = [latitude, longitude]
        longitude: geo.ll?.[1] || null,
      };
    } catch (error) {
      return {
        country: null,
        countryCode: null,
        city: null,
        region: null,
        timezone: null,
        latitude: null,
        longitude: null,
      };
    }
  }

  // ==========================================
  // Get device info WITH geolocation
  // ==========================================
  getDeviceInfoWithLocation(request: Request): IDeviceInfoWithLocation {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const parsedUA = this.parseUserAgent(userAgent);
    const ipAddress = this.getClientIp(request);
    const location = this.getGeoLocationFromIP(ipAddress);

    return {
      // Device info
      userAgent,
      browser: parsedUA.browser,
      browserVersion: parsedUA.browserVersion,
      os: parsedUA.os,
      osVersion: parsedUA.osVersion,
      platform: parsedUA.platform,
      deviceName: `${parsedUA.os}-${parsedUA.browser}-${parsedUA.platform}-${location.countryCode}`,
      ipAddress,

      // Geolocation
      country: location.country,
      countryCode: location.countryCode,
      city: location.city,
      region: location.region,
      timezone: location.timezone,
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  // ==========================================
  // Generate human-readable device name
  // ==========================================
  generateDeviceName(
    browser: BROWSER_TYPE,
    os: OS_TYPE,
    platform: DEVICE_TYPE,
  ): string {
    const browserName = this.getBrowserDisplayName(browser);
    const osName = this.getOSDisplayName(os);
    const platformName = this.getPlatformDisplayName(platform);

    if (browser === BROWSER_TYPE.UNKNOWN && os === OS_TYPE.UNKNOWN) {
      return `${platformName} Device`;
    }

    if (browser === BROWSER_TYPE.UNKNOWN) {
      return `${platformName} on ${osName}`;
    }

    return `${browserName} on ${osName}`;
  }

  // ==========================================
  // Get display name for browser enum
  // ==========================================
  private getBrowserDisplayName(browser: BROWSER_TYPE): string {
    const names: Record<BROWSER_TYPE, string> = {
      [BROWSER_TYPE.CHROME]: 'Chrome',
      [BROWSER_TYPE.FIREFOX]: 'Firefox',
      [BROWSER_TYPE.SAFARI]: 'Safari',
      [BROWSER_TYPE.EDGE]: 'Edge',
      [BROWSER_TYPE.OPERA]: 'Opera',
      [BROWSER_TYPE.BRAVE]: 'Brave',
      [BROWSER_TYPE.SAMSUNG]: 'Samsung Internet',
      [BROWSER_TYPE.UNKNOWN]: 'Browser',
    };

    return names[browser];
  }

  // ==========================================
  // Get display name for OS enum
  // ==========================================
  private getOSDisplayName(os: OS_TYPE): string {
    const names: Record<OS_TYPE, string> = {
      [OS_TYPE.WINDOWS]: 'Windows',
      [OS_TYPE.MACOS]: 'macOS',
      [OS_TYPE.LINUX]: 'Linux',
      [OS_TYPE.ANDROID]: 'Android',
      [OS_TYPE.IOS]: 'iOS',
      [OS_TYPE.UNKNOWN]: 'Unknown OS',
    };

    return names[os];
  }

  // ==========================================
  // Get display name for platform enum
  // ==========================================
  private getPlatformDisplayName(platform: DEVICE_TYPE): string {
    const names: Record<DEVICE_TYPE, string> = {
      [DEVICE_TYPE.WEB]: 'Web',
      [DEVICE_TYPE.MOBILE]: 'Mobile',
      [DEVICE_TYPE.TABLET]: 'Tablet',
      [DEVICE_TYPE.DESKTOP]: 'Desktop',
      [DEVICE_TYPE.UNKNOWN]: 'Unknown',
    };

    return names[platform];
  }

  // ==========================================
  // Get country name from country code
  // ==========================================
  private getCountryName(code?: string | null): string | null {
    if (!code) return null;
    return countries.getName(code, 'en') ?? code;
  }

  // ==========================================
  // Validate if IP is internal/private
  // ==========================================
  isPrivateIP(ip: string): boolean {
    const cleanIp = this.cleanIpAddress(ip);

    if (cleanIp === '127.0.0.1' || cleanIp === '::1') return true;

    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
    ];

    return privateRanges.some((range) => range.test(cleanIp));
  }

  // ==========================================
  // Parse device info WITH geolocation from request data
  // ==========================================
  parseDeviceInfoFromRequestData(
    requestData?: IRequestData,
  ): IDeviceInfoWithLocation {
    if (!requestData) {
      return {
        userAgent: 'Unknown',
        browser: BROWSER_TYPE.UNKNOWN,
        browserVersion: null,
        os: OS_TYPE.UNKNOWN,
        osVersion: null,
        platform: DEVICE_TYPE.UNKNOWN,
        ipAddress: 'unknown',
        deviceName: BROWSER_TYPE.UNKNOWN + OS_TYPE.UNKNOWN,
        country: null,
        countryCode: null,
        city: null,
        region: null,
        timezone: null,
        latitude: null,
        longitude: null,
      };
    }

    // Extract user agent
    const userAgent = Array.isArray(requestData.headers['user-agent'])
      ? requestData.headers['user-agent'][0]
      : requestData.headers['user-agent'] || 'Unknown';

    // Parse user agent
    const parsedUA = this.parseUserAgent(userAgent);

    // Extract IP address
    const ipAddress = this.extractIpFromRequestData(requestData);

    // Get geolocation
    const location = this.getGeoLocationFromIP(ipAddress);

    return {
      userAgent,
      browser: parsedUA.browser,
      browserVersion: parsedUA.browserVersion,
      os: parsedUA.os,
      osVersion: parsedUA.osVersion,
      platform: parsedUA.platform,
      deviceName: `${parsedUA.os}-${parsedUA.browser}-${parsedUA.platform}-${location.countryCode}`,
      ipAddress,
      country: location.country,
      countryCode: location.countryCode,
      city: location.city,
      region: location.region,
      timezone: location.timezone,
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  // ==========================================
  // Extract IP address from request data
  // ==========================================
  extractIpFromRequestData(requestData: IRequestData): string {
    const headers = requestData.headers;

    if (headers['cf-connecting-ip']) {
      const ip = Array.isArray(headers['cf-connecting-ip'])
        ? headers['cf-connecting-ip'][0]
        : headers['cf-connecting-ip'];
      return this.cleanIpAddress(ip);
    }

    if (headers['x-real-ip']) {
      const ip = Array.isArray(headers['x-real-ip'])
        ? headers['x-real-ip'][0]
        : headers['x-real-ip'];
      return this.cleanIpAddress(ip);
    }

    if (headers['x-forwarded-for']) {
      const forwarded = Array.isArray(headers['x-forwarded-for'])
        ? headers['x-forwarded-for'][0]
        : headers['x-forwarded-for'];
      const ip = forwarded.split(',')[0].trim();
      return this.cleanIpAddress(ip);
    }

    if (requestData.ip) {
      return this.cleanIpAddress(requestData.ip);
    }

    return 'unknown';
  }
}
