import { Routes, Route } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import { StopwatchProvider } from './context/stopwatchcontext'
import { Toaster } from 'react-hot-toast'
import VisualizationsRoute from './routes/visualizationsRoute'
import Sidebar from './components/general/Sidebar'
import Journal from './components/journal/journal'
import { DebugStyles } from './styles.ts/debugStyle'
import './styles.ts/scrollbar.css'
import Activities from './routes/activities'

function App(): React.JSX.Element {
  return (
    <StopwatchProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100vw',
          height: '100vh'
          // ...DebugStyles.divOutline
        }}
      >
        <Sidebar />
        <Routes>
          <Route
            path="/"
            element={
              <div // TODO: This div will keep the Laps display from flex expanding to it's expected limits.
              // if we want to make a more customized display later on, remove this
              // style={{ display: 'flex', flex: 1, alignContent: 'center', alignItems: 'center' }}
              >
                <Dashboard />
              </div>
            }
          />

          <Route path="/visualizations" element={<VisualizationsRoute />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
      </div>
      <Toaster />
    </StopwatchProvider>
  )
}

export default App
