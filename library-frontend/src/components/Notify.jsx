const Notify = ({ notification }) => {
  if (!notification) {
    return null
  }
  const color = notification.type === 'error' ? 'red' : 'green'
  return (
    <div className="notification" style={{ color, margin: '10px 0' }}>
      {notification.message}
    </div>
  )
}

export default Notify
