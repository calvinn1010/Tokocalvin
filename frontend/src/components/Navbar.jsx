import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications, markNotificationRead, clearAllNotifications } from '../utils/api';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { cartItemsTotalQuantity } = useCart();
  const { nightMode, setNightMode } = useTheme();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'petugas')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const data = response.data.data || [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      fetchNotifications();
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar-modern shadow-sm mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold d-flex align-items-center">
          <span className="fs-3 me-2">🎵</span>
          <span className="gradient-text">Music Rental</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" className="mx-2 fw-medium">
              <i className="bi bi-house-door me-2"></i>Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/instruments" className="mx-2 fw-medium">
              <i className="bi bi-music-note-list me-2"></i>Alat Musik
            </Nav.Link>
            <Nav.Link as={Link} to="/rentals" className="mx-2 fw-medium">
              <i className="bi bi-calendar-check me-2"></i>Peminjaman
            </Nav.Link>
            {(user.role === 'admin' || user.role === 'petugas') && (
              <>
                <Nav.Link as={Link} to="/fines" className="mx-2 fw-medium">
                  <i className="bi bi-cash me-2"></i>Denda
                </Nav.Link>
                <Nav.Link as={Link} to="/reports" className="mx-2 fw-medium">
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>Laporan
                </Nav.Link>
                <Nav.Link as={Link} to="/damaged-items" className="mx-2 fw-medium text-warning">
                  <i className="bi bi-shield-exclamation me-2"></i>Barang Rusak
                </Nav.Link>
              </>
            )}
            {user.role === 'admin' && (
              <Nav.Link as={Link} to="/users" className="mx-2 fw-medium">
                <i className="bi bi-people me-2"></i>Kelola User
              </Nav.Link>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center gap-2">
            {user?.role === 'user' && (
              <Nav.Link as={Link} to="/cart" className="mx-2 fw-medium position-relative">
                <i className="bi bi-cart-fill me-1" style={{ fontSize: '1.2rem' }}></i>
                Keranjang
                {cartItemsTotalQuantity > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.7rem' }}>
                    {cartItemsTotalQuantity}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {(user.role === 'admin' || user.role === 'petugas') && (
              <NavDropdown
                title={
                  <div className="notification-bell-wrapper transition-all">
                    <i className="bi bi-bell-fill fs-5 text-warning"></i>
                    {unreadCount > 0 && (
                      <Badge bg="danger" pill className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                }
                id="notification-dropdown"
                align="end"
                className="notification-dropdown-menu"
              >
                <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center bg-light-soft" style={{ width: '320px' }}>
                  <span className="fw-bold small text-uppercase tracking-wider text-muted">Notifikasi</span>
                  {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="p-0 text-decoration-none x-small fw-600" onClick={handleClearAll}>
                      Bersihkan Semua
                    </Button>
                  )}
                </div>
                <div className="notification-scroll-area" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-5 text-center">
                      <i className="bi bi-bell-slash display-6 text-muted opacity-25 d-block mb-3"></i>
                      <p className="text-muted small mb-0">Tidak ada notifikasi baru</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <NavDropdown.Item 
                        key={n.id} 
                        className={`px-3 py-3 border-bottom notification-item transition-all ${!n.is_read ? 'bg-unread' : ''}`}
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <div className="d-flex gap-3">
                          <div className={`notification-icon-box rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${n.type === 'warning' ? 'bg-warning-soft text-warning' : 'bg-primary-soft text-primary'}`} style={{ width: '36px', height: '36px' }}>
                            <i className={`bi ${n.type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'} fs-6`}></i>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className={`small mb-1 ${!n.is_read ? 'fw-bold text-dark' : 'text-muted'}`}>{n.title}</div>
                            <div className="x-small text-muted text-wrap line-clamp-2">{n.message}</div>
                            <div className="xx-small text-primary mt-2 opacity-75 d-flex align-items-center">
                              <i className="bi bi-clock me-1"></i>
                              {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </NavDropdown.Item>
                    ))
                  )}
                </div>
                <NavDropdown.Divider className="m-0" />
                <NavDropdown.Item as={Link} to="/damaged-items" className="text-center small py-2 fw-bold text-primary hover-bg-primary-soft transition-all">
                  Lihat Semua Riwayat
                </NavDropdown.Item>
              </NavDropdown>
            )}

            <div className="vr mx-2 text-secondary opacity-25 d-none d-lg-block" style={{ height: '24px' }}></div>

            <Button
              variant={nightMode ? 'outline-light' : 'outline-dark'}
              size="sm"
              className="rounded-pill px-3 transition-all theme-toggle-btn"
              onClick={() => setNightMode((prev) => !prev)}
            >
              <i className={`bi ${nightMode ? 'bi-sun-fill' : 'bi-moon-fill'} me-2`}></i>
              {nightMode ? 'Day' : 'Night'}
            </Button>

            <NavDropdown 
              title={
                <div className="user-profile-trigger d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-all">
                  <div className="avatar-circle-sm bg-primary text-white">
                    {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="d-none d-xl-block text-start">
                    <div className="fw-600 small text-dark-mode-sensitive">{user.fullName || user.username}</div>
                    <div className="xx-small text-muted text-uppercase tracking-tighter">{user.role}</div>
                  </div>
                </div>
              } 
              id="user-dropdown" 
              align="end"
              className="user-nav-dropdown"
            >
              <NavDropdown.Header className="px-3 pt-2">
                <div className="fw-bold text-dark">{user.fullName || user.username}</div>
                <div className="text-muted small">{user.email || 'Staff Account'}</div>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/profile">
                <i className="bi bi-person-circle me-2"></i>Lihat Profil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Keluar
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
