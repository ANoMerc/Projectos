# ProjectOS — Desktop App

Система управления проектами с SEMATIC, PERT, Kanban и Gantt.
Собирается в нативное десктопное приложение через **Electron**.

---

## Структура проекта

```
projectos/
├── electron/               ← Electron main process
│   ├── main.ts             ← Главный процесс (окно, меню, IPC)
│   ├── preload.ts          ← Безопасный мост renderer ↔ main
│   └── tsconfig.json       ← TS-конфиг для electron/
│
├── src/                    ← React-приложение (Vite)
│   ├── App.tsx             ← Auth gate + AppProvider
│   ├── main.tsx            ← Точка входа React
│   ├── electron.d.ts       ← Типы для window.electronAPI
│   ├── constants/theme.ts  ← Дизайн-токены, RBAC, планы
│   ├── store/              ← AppBus (глобальная шина данных)
│   │   ├── types.ts
│   │   ├── initialState.ts
│   │   ├── reducer.ts
│   │   ├── AppContext.tsx
│   │   └── helpers.ts
│   ├── components/
│   │   ├── AppShell.tsx    ← Sidebar + Topbar + Router
│   │   └── ui/index.tsx    ← Shared UI примитивы
│   └── services/           ← 10 микросервисов
│       ├── AuthService.tsx
│       └── index.tsx
│
├── build/
│   └── entitlements.mac.plist  ← macOS подпись
├── public/
│   ├── icon.png            ← Иконка приложения (1024×1024)
│   ├── icon.svg            ← Исходник иконки
│   └── favicon.svg
├── scripts/
│   └── generate-icons.js   ← Генератор иконок .ico/.icns
│
├── docker-compose.yml      ← PostgreSQL + Redis + MinIO + MailDev
├── package.json
├── vite.config.ts
└── .env.example
```

---

## Требования

| Инструмент    | Версия       | Скачать                                    |
|---------------|--------------|--------------------------------------------|
| Node.js       | 20 LTS / 22  | https://nodejs.org                         |
| pnpm          | последняя    | `npm i -g pnpm`                            |
| Git           | любая        | https://git-scm.com                        |
| Windows SDK   | (только Win) | Входит в VS Build Tools                    |
| Xcode CLI     | (только Mac) | `xcode-select --install`                   |

> **Docker** нужен только если хочешь запустить бэкенд (PostgreSQL, Redis).
> Для сборки `.exe` и `.dmg` Docker **не нужен**.

---

## Быстрый старт (браузер)

```bash
# 1. Распакуй архив
unzip projectos.zip
cd projectos

# 2. Установить зависимости
pnpm install

# 3. Запустить в браузере
pnpm dev
# → http://localhost:3000
```

---

## Запуск как десктопное приложение (dev)

```bash
# Запускает Vite dev-сервер + Electron окно одновременно
pnpm electron:dev
```

Откроется нативное окно приложения. При изменении кода — горячая перезагрузка.

---

## Сборка .exe (Windows)

### На Windows-машине:

```bash
# 1. Установить зависимости
pnpm install

# 2. Собрать
pnpm dist:win
```

Готовые файлы появятся в папке `release/`:
```
release/
├── ProjectOS-Setup-1.0.0.exe   ← Установщик (NSIS)
└── ProjectOS-1.0.0-win.exe     ← Portable (без установки)
```

### На macOS / Linux (кросс-компиляция для Windows):

```bash
# Нужен Wine для cross-компиляции NSIS-установщика
brew install --cask wine-stable   # macOS
# или
sudo apt install wine             # Ubuntu

pnpm dist:win
```

---

## Сборка .dmg (macOS)

### На macOS-машине:

```bash
pnpm dist:mac
```

Готовые файлы в `release/`:
```
release/
├── ProjectOS-1.0.0-mac.dmg         ← Для Intel Mac (x64)
├── ProjectOS-1.0.0-mac-arm64.dmg   ← Для Apple Silicon (M1/M2/M3)
└── ProjectOS-1.0.0-mac.zip         ← Архив (для обновлений)
```

> **Для подписи и нотаризации** (чтобы macOS не блокировал):
> нужен платный Apple Developer аккаунт ($99/год).
> Без него пользователь видит предупреждение —
> решается через «Настройки → Конфиденциальность → Разрешить».

---

## Сборка под обе платформы

```bash
pnpm dist:all
```

> ⚠️ Собирать `.dmg` можно **только на macOS**.
> Сборка `.exe` работает на Windows, macOS и Linux.
> Рекомендуется использовать CI/CD (см. ниже).

---

## Иконки приложения

Electron нужны иконки в трёх форматах:

| Файл              | Платформа | Размер    |
|-------------------|-----------|-----------|
| `public/icon.png` | Общий     | 1024×1024 |
| `public/icon.ico` | Windows   | Multi-res |
| `public/icon.icns`| macOS     | Multi-res |

### Автоматическая генерация:

```bash
# Установить sharp
pnpm add -D sharp

# Запустить генератор
node scripts/generate-icons.js
```

### Вручную (онлайн):

1. Подготовь PNG 1024×1024 — сохрани как `public/icon.png`
2. **Windows .ico** → https://convertico.com → сохрани как `public/icon.ico`
3. **macOS .icns** → https://cloudconvert.com/png-to-icns → сохрани как `public/icon.icns`

---

## CI/CD через GitHub Actions

Создай файл `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # Запускается при git tag v1.0.0 && git push --tags

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -g pnpm
      - run: pnpm install
      - run: pnpm dist:win
      - uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: release/*.exe

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -g pnpm
      - run: pnpm install
      - run: pnpm dist:mac
      - uses: actions/upload-artifact@v4
        with:
          name: macos-build
          path: release/*.dmg
```

При `git push --tags` GitHub сам соберёт `.exe` на Windows-runner
и `.dmg` на macOS-runner, а готовые файлы появятся в Artifacts.

---

## Команды — шпаргалка

```bash
pnpm dev              # Запуск в браузере (http://localhost:3000)
pnpm electron:dev     # Запуск в Electron окне (dev-режим)
pnpm build            # Сборка React → dist/
pnpm electron:compile # Компиляция Electron TS → dist-electron/
pnpm dist:win         # Сборка .exe для Windows
pnpm dist:mac         # Сборка .dmg для macOS
pnpm dist:all         # Сборка для обеих платформ
```

---

## Демо-логин

Нажми «Войти» с любым email/паролем.
Email `demo@projectos.io` — покажет экран MFA.

---

## Лицензия

MIT © 2025 ProjectOS Team
