import { test, expect, _electron as electron } from '@playwright/test'

test('app launches and sidebar navigation has no console errors', async () => {
  const errors: string[] = []
  const warnings: string[] = []

  const executablePath =
    process.platform === 'win32'
      ? `${process.env.LOCALAPPDATA}\\Programs\\timetrackingapp\\timetrackingapp.exe`
      : '/opt/timetrackingapp/timetrackingapp'

  const args = process.platform === 'win32' ? [] : ['--ozone-platform=x11', '--no-sandbox']

  const app = await electron.launch({
    executablePath,
    args
  })

  // Capture main process errors
  app.process().stderr?.on('data', (data) => {
    const text = data.toString()
    if (text.includes('SqliteError') || text.includes('uncaughtException')) {
      errors.push(text)
    }
  })

  const window = await app.firstWindow()

  // Capture renderer console errorsAl
  window.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }

    if (msg.type() === 'warning') {
      warnings.push(msg.text())
    }
  })

  await window.waitForLoadState('domcontentloaded')

  // Click through each sidebar button
  await window.getByRole('button', { name: 'Lap Display' }).click()
  await window.waitForTimeout(500)

  await window.getByRole('button', { name: 'Visualizations' }).click()
  await window.waitForTimeout(500)

  await window.getByRole('button', { name: 'Journal' }).click()
  await window.waitForTimeout(500)

  await window.getByRole('button', { name: 'Activities' }).click()
  await window.waitForTimeout(500)

  // await window.getByRole('button', { name: 'Sync to cloud' }).click()
  // await window.waitForTimeout(500)

  if (warnings.length > 0) {
    console.log(`Warnings detected:\n${warnings.join('\n')}`)
  }

  // Fail if any console errors were detected
  expect(errors, `Console errors detected:\n${errors.join('\n')}`).toHaveLength(0)

  await app.close()
})
