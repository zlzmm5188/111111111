import { Injectable, Module, Global } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { value: any; expiry: number }>();

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && cached.expiry > now) {
      return cached.value;
    }
    
    const value = await factory();
    this.cache.set(key, { value, expiry: now + ttl });
    return value;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
