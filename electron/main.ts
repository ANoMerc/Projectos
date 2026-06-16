import { app, BrowserWindow, shell, ipcMain, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

// ── Константы ────────────────────────────────────────────────────────────────
const isDev  = process.env.NODE_ENV === 'development'
const DEV_URL = 'http://localhost:3000'

let mainWindow: BrowserWindow | null = null

// ── Создание окна ─────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 820,
    minWidth:  900,
    minHeight: 600,
    title: 'ProjectOS',
    // Иконка приложения
    icon: join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // Кастомный titlebar (выглядит нативно)
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0F1117',
    show: false, // Показываем только когда готово (no white flash)
  })

  // Показать окно когда страница загружена
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (isDev) mainWindow?.webContents.openDevTools({ mode: 'detach' })
  })

  // Загрузка: dev-сервер или собранный dist
  if (isDev) {
    mainWindow.loadURL(DEV_URL)
  } else {
    const indexPath = join(__dirname, '../dist/index.html')
    mainWindow.loadFile(indexPath)
  }

  // Внешние ссылки открывать в браузере, а не в Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ── Меню ──────────────────────────────────────────────────────────────────────
function createMenu() {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),

    // File
    {
      label: 'Файл',
      submenu: [
        isMac ? { role: 'close' as const } : { role: 'quit' as const, label: 'Выйти' },
      ],
    },

    // Edit
    {
      label: 'Правка',
      submenu: [
        { role: 'undo' as const, label: 'Отменить' },
        { role: 'redo' as const, label: 'Повторить' },
        { type: 'separator' as const },
        { role: 'cut' as const, label: 'Вырезать' },
        { role: 'copy' as const, label: 'Копировать' },
        { role: 'paste' as const, label: 'Вставить' },
        { role: 'selectAll' as const, label: 'Выбрать всё' },
      ],
    },

    // View
    {
      label: 'Вид',
      submenu: [
        { role: 'reload' as const, label: 'Обновить' },
        { role: 'forceReload' as const, label: 'Обновить (принудительно)' },
        { type: 'separator' as const },
        { role: 'resetZoom' as const, label: 'Исходный размер' },
        { role: 'zoomIn' as const,    label: 'Увеличить' },
        { role: 'zoomOut' as const,   label: 'Уменьшить' },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const, label: 'Полный экран' },
      ],
    },

    // Window
    {
      label: 'Окно',
      submenu: [
        { role: 'minimize' as const, label: 'Свернуть' },
        { role: 'zoom' as const,     label: 'Развернуть' },
        ...(isMac ? [
          { type: 'separator' as const },
          { role: 'front' as const },
        ] : [{ role: 'close' as const, label: 'Закрыть' }]),
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── IPC handlers (renderer → main) ──────────────────────────────────────────
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:platform', () => process.platform)
ipcMain.handle('dialog:openExternal', (_, url: string) => shell.openExternal(url))

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  createMenu()

  // macOS: пересоздать окно при клике на иконке в доке
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Закрыть приложение когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Безопасность: запретить создание новых окон
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!isDev && !url.startsWith('file://')) event.preventDefault()
  })
})
