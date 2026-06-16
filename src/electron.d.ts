// Типы для window.electronAPI (инжектируется через preload.ts)
interface ElectronAPI {
  getVersion:   () => Promise<string>
  getPlatform:  () => Promise<'win32' | 'darwin' | 'linux'>
  openExternal: (url: string) => Promise<void>
}

declare global {
  interface Window {
    // undefined в браузере, ElectronAPI в десктопе
    electronAPI?: ElectronAPI
  }
}

export {}
