import { app, ipcMain, net } from 'electron'

export function registerUpdates(): void {
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('check-for-updates', async () => {
    const currentVersion = app.getVersion()
    try {
      const res = await net.fetch(
        'https://api.github.com/repos/serverizzo/TimeTrackingApp-releases/releases/latest'
      )
      const release = await res.json()
      const latestVersion = release.tag_name?.replace(/^v/, '') || null

      return {
        currentVersion,
        latestVersion,
        updateAvailable: latestVersion ? isNewer(latestVersion, currentVersion) : false,
        releaseUrl: release.html_url
      }
    } catch (err) {
      return {
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        releaseUrl: null,
        error: String(err)
      }
    }

    function isNewer(latest: string, current: string): boolean {
      const l = latest.split('.').map(Number)
      const c = current.split('.').map(Number)
      for (let i = 0; i < 3; i++) {
        if ((l[i] || 0) > (c[i] || 0)) return true
        if ((l[i] || 0) < (c[i] || 0)) return false
      }
      return false
    }
  })
}
