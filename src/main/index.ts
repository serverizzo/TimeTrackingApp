import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { initializeDatabase, getDb } from './database'
import { LapRow } from '../shared/databasetypes/LapRow'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initializeDatabase()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Save CSV
  ipcMain.handle('save-csv', async (_, csvContent: string, dateStr: string) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Time Tracker CSV',
      defaultPath: `${dateStr}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
    if (filePath) {
      fs.writeFileSync(filePath, csvContent)
    }
  })

  ipcMain.handle('insert-laps', (_, laps: LapRow[]) => {
    try {
      const db = getDb()

      const insertCommand = db.prepare(`
        INSERT OR IGNORE INTO laps (timestarted, date, lap_time, note)
        VALUES (@timestarted, @date, @lapTime, @note)
        `)

      const insertMany = db.transaction((laps) => {
        for (const lap of laps) {
          insertCommand.run(lap)
        }
      })

      insertMany(laps)
      return { success: true }
    } catch {
      throw new Error('failed to save laps')
    }
  })

  // Heatmap — aggregated daily totals for the past year
  ipcMain.handle('get-heatmap-data', () => {
    const db = getDb()
    return db
      .prepare(
        `
    SELECT date, SUM(lap_time) as total
    FROM laps
    WHERE date >= date('now', '-1 year')
    GROUP BY date
    ORDER BY date
  `
      )
      .all()
  })

  // Gantt — all laps for a 7 day window
  ipcMain.handle('get-laps-by-range', (_, startDate: string, endDate: string) => {
    const db = getDb()
    return db
      .prepare(
        `
    SELECT timestarted, date, lap_time, note
    FROM laps
    WHERE date BETWEEN ? AND ?
    ORDER BY date, timestarted
  `
      )
      .all(startDate, endDate)
  })

  ipcMain.handle('get-activities', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
    SELECT id, name
    FROM activities
    ORDER BY name
  `
      )
      .all()
  })

  ipcMain.handle(
    'update-checkins',
    (_, date: string, checkList: { id: number; isChecked: boolean }[]) => {
      const db = getDb()

      const insert = db.prepare(`
        INSERT OR IGNORE INTO daily_activities (date, activity_id)
        VALUES (?, ?)
      `)

      const deleteFunc = db.prepare(`
        DELETE FROM daily_activities 
        WHERE date = ? AND activity_id = ?
      `)

      const insertOrDelete = db.transaction((listToRun: { id: number; isChecked: boolean }[]) => {
        for (const ele of listToRun) {
          // if checked, add to db
          if (ele.isChecked) insert.run(date, ele.id)
          // otherwise remove from db
          else deleteFunc.run(date, ele.id)
        }
      })

      insertOrDelete(checkList)
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
