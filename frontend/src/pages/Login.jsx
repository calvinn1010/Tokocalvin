import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { login as loginApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const response = await loginApi(formData);
      const payload = response.data.data ?? response.data;
      const { token, user } = payload;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}
    >
      <Container className="w-100" style={{ maxWidth: '450px' }}>
        <div className="slide-in">
          <Card className="border-0 shadow-lg" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-5">
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
                  Music Rental
                </h2>
                <p className="text-muted mb-0">Sistem Peminjaman Alat Musik</p>
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
                    <i className="bi bi-lock-fill me-2"></i>Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan password"
                    size="lg"
                    style={{ borderRadius: '12px' }}
                  />
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
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </>
                  )}
                </Button>
              </Form>

              {/* Divider */}
              <div className="d-flex align-items-center my-4" style={{ gap: '12px' }}>
                <hr className="flex-grow-1 m-0" />
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>atau</span>
                <hr className="flex-grow-1 m-0" />
              </div>

              {/* Register Link */}
              <div className="text-center mb-4">
                <small className="text-muted">
                  Belum punya akun? {' '}
                  <Link 
                    to="/register"
                    style={{
                      color: '#667eea',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Daftar di sini
                  </Link>
                </small>
              </div>

              {/* Demo Credentials */}
              <Card 
                className="border-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderLeft: '4px solid #667eea',
                  borderRadius: '12px'
                }}
              >
                <Card.Body className="p-3">
                  <small className="fw-semibold d-block text-muted mb-2">
                    <i className="bi bi-info-circle me-2"></i>Demo Akun
                  </small>
                  <small className="d-block text-muted">
                    <strong>Admin:</strong> admin / admin123
                  </small>
                  <small className="d-block text-muted">
                    <strong>Petugas:</strong> petugas / petugas123
                  </small>
                  <small className="d-block text-muted">
                    <strong>User:</strong> user / user123
                  </small>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Login;
