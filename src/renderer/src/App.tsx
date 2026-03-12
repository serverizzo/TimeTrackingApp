import { Routes, Route } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import { StopwatchProvider } from './context/stopwatchcontext'
import { Toaster } from 'react-hot-toast'

function App(): React.JSX.Element {
  return (
    <StopwatchProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </StopwatchProvider>
  )
}

export default App
