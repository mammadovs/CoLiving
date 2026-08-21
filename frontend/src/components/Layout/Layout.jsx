import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      {children}
    </div>
  )
}

export default Layout