import Sidebar from '@renderer/components/general/Sidebar'

function Dashboard(): React.JSX.Element {
  return (
    <div style={{ flexDirection: 'row', display: 'flex' }}>
      <Sidebar />
      <h1>Time Tracker</h1>
    </div>
  )
}

export default Dashboard
