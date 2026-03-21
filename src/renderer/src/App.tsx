import { Routes, Route } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import { StopwatchProvider } from './context/stopwatchcontext'
import { Toaster } from 'react-hot-toast'
import VisualizationsRoute from './routes/visualizationsRoute'
import Sidebar from './components/general/Sidebar'

function App(): React.JSX.Element {
  return (
    <StopwatchProvider>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visualizations" element={<VisualizationsRoute />} />
        </Routes>
      </div>
      <Toaster />
    </StopwatchProvider>
  )
}

export default App
