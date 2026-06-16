import { contextBridge, ipcRenderer } from 'electron'

// Безопасно экспортируем только нужные API в renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Версия приложения
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke('app:version'),

  // Платформа (win32 / darwin / linux)
  getPlatform: (): Promise<string> =>
    ipcRenderer.invoke('app:platform'),

  // Открыть ссылку во внешнем браузере
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('dialog:openExternal', url),
})

// Тип для TypeScript в renderer (src/electron.d.ts)
export {}
