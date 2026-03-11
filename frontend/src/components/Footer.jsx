import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer 
      className="bg-dark text-light mt-5 pt-5 pb-4"
      style={{ 
        marginTop: 'auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderTop: '2px solid rgba(102, 126, 234, 0.3)'
      }}
    >
      <Container>
        <Row className="g-4 mb-5">
          {/* Company Info */}
          <Col md={3}>
            <div className="mb-3">
              <h5 className="fw-bold mb-3" style={{ color: '#e0e0ff' }}>
                <i className="bi bi-music-note-beamed me-2" style={{ color: '#667eea' }}></i>
                Music Rental
              </h5>
              <p className="small mb-0" style={{ color: '#b0b0d4', lineHeight: '1.6' }}>
                Platform peminjaman alat musik terpercaya dengan koleksi lengkap dan harga terjangkau.
              </p>
            </div>
          </Col>

          {/* Quick Links */}
          <Col md={3}>
            <h6 className="fw-bold mb-3" style={{ color: '#e0e0ff' }}>Navigasi</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/dashboard'); }} className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-speedometer2 me-1"></i>Dashboard
                </a>
              </li>
              <li className="mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/instruments'); }} className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-music-note-list me-1"></i>Katalog Alat Musik
                </a>
              </li>
              <li className="mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/rentals'); }} className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-bag-check me-1"></i>Peminjaman
                </a>
              </li>
              <li className="mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/fines'); }} className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-exclamation-circle me-1"></i>Denda
                </a>
              </li>
            </ul>
          </Col>

          {/* Information */}
          <Col md={3}>
            <h6 className="fw-bold mb-3" style={{ color: '#e0e0ff' }}>Informasi</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="https://musicrental.com/faq" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-question-circle me-1"></i>FAQ
                </a>
              </li>
              <li className="mb-2">
                <a href="https://musicrental.com/terms" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-shield-check me-1"></i>Syarat & Ketentuan
                </a>
              </li>
              <li className="mb-2">
                <a href="https://musicrental.com/privacy" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-lock me-1"></i>Kebijakan Privasi
                </a>
              </li>
              <li className="mb-2">
                <a href="mailto:support@musicrental.com" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  <i className="bi bi-chat-dots me-1"></i>Support
                </a>
              </li>
            </ul>
          </Col>

          {/* Contact & Social */}
          <Col md={3}>
            <h6 className="fw-bold mb-3" style={{ color: '#e0e0ff' }}>Hubungi Kami</h6>
            <div className="small mb-3">
              <p className="mb-2" style={{ color: '#b0b0d4' }}>
                <i className="bi bi-telephone me-2" style={{ color: '#667eea' }}></i>
                <a href="tel:+6282141236977" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  +62 821-4123-6977
                </a>
              </p>
              <p className="mb-3" style={{ color: '#b0b0d4' }}>
                <i className="bi bi-envelope me-2" style={{ color: '#667eea' }}></i>
                <a href="mailto:info@musicrental.com" className="text-decoration-none" style={{ color: '#b0b0d4', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#b0b0d4'}>
                  info@musicrental.com
                </a>
              </p>
            </div>
            <div className="d-flex gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#b0b0d4', borderColor: '#b0b0d4' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea'; e.currentTarget.style.borderColor = '#667eea'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#b0b0d4'; e.currentTarget.style.borderColor = '#b0b0d4'; }} title="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#b0b0d4', borderColor: '#b0b0d4' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea'; e.currentTarget.style.borderColor = '#667eea'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#b0b0d4'; e.currentTarget.style.borderColor = '#b0b0d4'; }} title="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#b0b0d4', borderColor: '#b0b0d4' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea'; e.currentTarget.style.borderColor = '#667eea'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#b0b0d4'; e.currentTarget.style.borderColor = '#b0b0d4'; }} title="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#b0b0d4', borderColor: '#b0b0d4' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea'; e.currentTarget.style.borderColor = '#667eea'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#b0b0d4'; e.currentTarget.style.borderColor = '#b0b0d4'; }} title="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </Col>
        </Row>

        <hr className="my-4" style={{ borderColor: 'rgba(102, 126, 234, 0.3)' }} />

        {/* Bottom Section */}
        <Row>
          <Col md={6}>
            <small style={{ color: '#b0b0d4' }}>
              © {currentYear} Music Rental System. Hak cipta dilindungi. Semua hak tersedia.
            </small>
          </Col>
          <Col md={6} className="text-md-end">
            <small style={{ color: '#b0b0d4' }}>
              Dibuat dengan <i className="bi bi-heart-fill" style={{ color: '#f5576c' }}></i> oleh Tim Development
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
