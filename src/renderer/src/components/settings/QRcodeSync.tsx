import { JSX, useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeSync(): JSX.Element {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [localIp, setLocalIp] = useState<string>('')

  useEffect(() => {
    const generateQr = async (): Promise<void> => {
      const ip = await window.api.getLocalIP() // we'll need to add this
      if (!ip) return
      setLocalIp(ip)
      const dataUrl = await QRCode.toDataURL(ip)
      setQrDataUrl(dataUrl)
    }
    generateQr()
  }, [])

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h2>Pair with Mobile</h2>
      <p style={{ color: 'grey' }}>Scan this code with the TimeTracker mobile app</p>
      {qrDataUrl && <img src={qrDataUrl} alt="QR Code" style={{ width: 200, height: 200 }} />}
      <p style={{ color: 'grey', fontSize: 12 }}>{localIp}</p>
    </div>
  )
}
