import { Routes, Route } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import { StopwatchProvider } from './context/stopwatchcontext'

function App(): React.JSX.Element {
  return (
    <StopwatchProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </StopwatchProvider>
  )
}

export default App
