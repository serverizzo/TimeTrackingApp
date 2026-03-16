import Sidebar from '@renderer/components/general/Sidebar'
import MainRoute from '@renderer/components/mainroute/mainroute'

function Dashboard(): React.JSX.Element {
  return (
    <div style={{ flexDirection: 'row', display: 'flex' }}>
      <MainRoute />
    </div>
  )
}

export default Dashboard
