import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { cartItemsTotalQuantity } = useCart();
  const { nightMode, setNightMode } = useTheme();
  const navigate = useNavigate();

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
              <Nav.Link as={Link} to="/fines" className="mx-2 fw-medium">
                <i className="bi bi-cash me-2"></i>Denda
              </Nav.Link>
            )}
            {user.role === 'admin' && (
              <Nav.Link as={Link} to="/users" className="mx-2 fw-medium">
                <i className="bi bi-people me-2"></i>Kelola User
              </Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/cart" className="mx-2 fw-medium position-relative" style={{ marginRight: '20px' }}>
              <i className="bi bi-cart-fill me-2" style={{ fontSize: '1.3rem' }}></i>
              Keranjang
              {cartItemsTotalQuantity > 0 && (
                <Badge bg="danger" className="position-absolute" style={{ top: '-5px', right: '5px', padding: '4px 8px', fontSize: '0.8rem' }}>
                  {cartItemsTotalQuantity}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
          <Nav>
            <Button
              variant={nightMode ? 'outline-light' : 'outline-dark'}
              size="sm"
              className="me-2"
              onClick={() => setNightMode((prev) => !prev)}
            >
              <i className={`bi ${nightMode ? 'bi-sun-fill' : 'bi-moon-fill'} me-1`}></i>
              {nightMode ? 'Day' : 'Night'}
            </Button>
            <NavDropdown 
              title={
                <span>
                  <span className="badge bg-primary me-2">{user?.role?.toUpperCase()}</span>
                  {user.fullName}
                </span>
              } 
              id="user-dropdown" 
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <i className="bi bi-person me-2"></i>Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
