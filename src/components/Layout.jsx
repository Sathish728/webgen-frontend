
import Sidebar from './Sidebar'
import NavBar from './NavBar'

const LayOut = ({ children, showSidebar=false }) => {

  return (
    <div className="min-h-screen bg-base-300">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <NavBar/>

          <main className="flex-1 overflow-y-auto bg-base-100 rounded-tl-[30px]">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default LayOut