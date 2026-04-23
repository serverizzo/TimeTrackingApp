import { ipcRenderer } from 'electron'

export const notesApi = {
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNotes: (content: string) => ipcRenderer.invoke('save-notes', content),
  saveDraft: (content: string) => ipcRenderer.invoke('save-draft', content),
  getDraft: () => ipcRenderer.invoke('get-draft'),
  deleteDraft: () => ipcRenderer.invoke('delete-draft')
}
