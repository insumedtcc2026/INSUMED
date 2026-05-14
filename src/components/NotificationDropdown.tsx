import '../css/NotificationDropdown.css';

export default function NotificationDropdown() {
  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Avisos</h3>
      </div>

      <div className="notification-empty">
        <p>Nenhuma notificação disponível.</p>
      </div>
    </div>
  );
}