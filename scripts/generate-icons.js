/**
 * generate-icons.js
 *
 * Генерирует иконки приложения для Windows (.ico) и macOS (.icns)
 * из базового PNG файла public/icon.png
 *
 * Запуск: node scripts/generate-icons.js
 * Требует: sharp  →  npm install -g sharp-cli
 *       или: pnpm add -D sharp
 */

const fs   = require('fs')
const path = require('path')

const sizes = {
  win:  [16, 32, 48, 64, 128, 256],
  mac:  [16, 32, 64, 128, 256, 512, 1024],
}

async function main() {
  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.log(`
  ⚠️  Пакет 'sharp' не найден.
  Установи его: pnpm add -D sharp
  Или создай иконки вручную (см. ниже).
    `)
    printManualInstructions()
    return
  }

  const src = path.join(__dirname, '../public/icon.png')
  if (!fs.existsSync(src)) {
    console.error('❌ Файл public/icon.png не найден. Создай его (минимум 1024×1024 px).')
    return
  }

  const outDir = path.join(__dirname, '../public')

  // Генерируем PNG разных размеров
  for (const size of [...new Set([...sizes.win, ...sizes.mac])]) {
    const out = path.join(outDir, `icon-${size}.png`)
    await sharp(src).resize(size, size).toFile(out)
    console.log(`✅ icon-${size}.png`)
  }

  console.log(`
  ✅ PNG иконки сгенерированы.

  Следующий шаг — конвертировать их в .ico и .icns:

  Windows (.ico):
    Онлайн: https://convertico.com  (загрузи icon.png 256×256)
    Или CLI: magick convert icon-16.png icon-32.png icon-48.png icon-256.png public/icon.ico

  macOS (.icns):
    macOS: iconutil -c icns icon.iconset
    Или онлайн: https://cloudconvert.com/png-to-icns
  `)
}

function printManualInstructions() {
  console.log(`
  ── СОЗДАНИЕ ИКОНОК ВРУЧНУЮ ──────────────────────────────────────────────

  1. Подготовь PNG-файл 1024×1024 px с логотипом (прозрачный фон).
     Сохрани как: public/icon.png

  2. Windows (.ico):
     - Зайди на https://convertico.com
     - Загрузи icon.png → скачай icon.ico
     - Положи в public/icon.ico

  3. macOS (.icns):
     - Зайди на https://cloudconvert.com/png-to-icns
     - Загрузи icon.png → скачай icon.icns
     - Положи в public/icon.icns

  4. Продолжай сборку: pnpm dist:all
  ────────────────────────────────────────────────────────────────────────
  `)
}

main().catch(console.error)
