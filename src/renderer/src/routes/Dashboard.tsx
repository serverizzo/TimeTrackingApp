import Sidebar from '@renderer/components/general/Sidebar'
import MainRoute from '@renderer/components/mainroute/mainroute'

function Dashboard(): React.JSX.Element {
  return (
    <div style={{ flexDirection: 'row', display: 'flex' }}>
      <Sidebar />
      <MainRoute />
    </div>
  )
}

export default Dashboard
