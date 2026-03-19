import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { register as registerApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await registerApi(formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center p-4">
      <div className="auth-bg">
        <span className="music-note icon-1">♪</span>
        <span className="music-note icon-2">♫</span>
        <span className="music-note icon-3">♬</span>
        <span className="music-note icon-4">🎸</span>
        <span className="music-note icon-5">🎹</span>
        <span className="music-note icon-6">🥁</span>
        <span className="music-note icon-7">🎷</span>
        <span className="music-note icon-8">🎺</span>
      </div>
      <div className="auth-content">
      <Container className="w-100" style={{ maxWidth: '450px' }}>
        <div className="slide-in auth-card-wrap">
          <Card className="border-0 shadow-lg" style={{ borderRadius: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,246,255,0.85) 100%)', border: '1px solid rgba(255,255,255,0.45)' }}>
            <Card.Body className="p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-5">
                <div 
                  style={{ 
                    fontSize: '3.5rem',
                    marginBottom: '16px',
                    animation: 'bounce 2s infinite'
                  }}
                >
                  🎵
                </div>
                <h2 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>
                  Buat Akun Baru
                </h2>
                <p className="text-muted mb-0">Mulai meminjam alat musik favorit Anda</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert 
                  variant="danger" 
                  dismissible 
                  onClose={() => setError('')}
                  className="mb-4"
                >
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit} className="form-modern">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person-fill me-2"></i>Nama Lengkap
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama lengkap"
                    size="lg"
                    style={{ borderRadius: '12px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person-circle me-2"></i>Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan username"
                    size="lg"
                    style={{ borderRadius: '12px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-envelope-fill me-2"></i>Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan email"
                    size="lg"
                    style={{ borderRadius: '12px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-lock-fill me-2"></i>Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan password (min. 6 karakter)"
                    minLength="6"
                    size="lg"
                    style={{ borderRadius: '12px' }}
                  />
                  <small className="text-muted">Minimal 6 karakter untuk keamanan</small>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 btn-modern"
                  disabled={loading}
                  size="lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Daftar
                    </>
                  )}
                </Button>
              </Form>

              {/* Divider */}
              <div className="d-flex align-items-center my-4" style={{ gap: '12px' }}>
                <hr className="flex-grow-1 m-0" />
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>sudah punya akun?</span>
                <hr className="flex-grow-1 m-0" />
              </div>

              {/* Login Link */}
              <div className="text-center">
                <small className="text-muted">
                  Sudah punya akun? {' '}
                  <Link 
                    to="/login"
                    style={{
                      color: '#667eea',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Login di sini
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
      </div>
    </div>
  );
};

export default Register;
