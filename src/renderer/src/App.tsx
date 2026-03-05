import { Routes, Route } from 'react-router-dom'
import Dashboard from './routes/Dashboard'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  )
}

export default App
