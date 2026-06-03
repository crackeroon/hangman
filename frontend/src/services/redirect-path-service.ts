import { RouteLocationNamedRaw } from 'vue-router';

export class RedirectPathService {
  public static readonly REDIRECT_PATH_KEY: string = 'loginRedirectPath';
  public static readonly DEFAULT_URL: RouteLocationNamedRaw = { name: 'main' };

  static savePath(path: string): void {
    sessionStorage.setItem(RedirectPathService.REDIRECT_PATH_KEY, path);
  }

  static getPath(): string | null {
    return sessionStorage.getItem(RedirectPathService.REDIRECT_PATH_KEY);
  }

  static clearPath(): void {
    sessionStorage.removeItem(RedirectPathService.REDIRECT_PATH_KEY);
  }
}
