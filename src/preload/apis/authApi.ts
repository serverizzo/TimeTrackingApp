import { ipcRenderer } from 'electron'

export const authApi = {
  getToken: () => ipcRenderer.invoke('get-token'),
  saveToken: (token: string) => ipcRenderer.invoke('save-token', token),
  deleteToken: () => ipcRenderer.invoke('delete-token')
}
