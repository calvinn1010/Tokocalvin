import React, { useState } from 'react';
import { Container, Card, Row, Col, Badge, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavigationBar from '../components/Navbar';
import { updateUser } from '../utils/api';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const { nightMode } = useTheme();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleBadge = (role) => {
    const config = {
      admin:   { bg: 'danger',  label: 'Admin' },
      petugas: { bg: 'warning', label: 'Petugas' },
      user:    { bg: 'primary', label: 'User' },
    };
    return config[role] || { bg: 'secondary', label: role };
  };

  const badge = getRoleBadge(user?.role);

  const getInitial = () => (user?.fullName || user?.username || 'U').charAt(0).toUpperCase();

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!newPassword || !confirmPassword) {
      setPasswordError('Semua field wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.id, { password: newPassword });
      setPasswordSuccess('Password berhasil diubah!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={nightMode ? 'night-mode' : 'day-mode'} style={{ minHeight: '100vh' }}>
      <NavigationBar />

      <Container className="py-5">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>
            <i className="bi bi-person-circle me-3 text-primary"></i>Profil Saya
          </h1>
          <p className="text-muted">Informasi akun dan pengaturan keamanan Anda.</p>
        </div>

        <Row className="g-4 justify-content-center">
          {/* Avatar & Role Card */}
          <Col lg={4}>
            <Card
              className="border-0 shadow-lg text-center h-100"
              style={{
                borderRadius: '20px',
                background: nightMode
                  ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)'
                  : 'white',
              }}
            >
              <Card.Body className="py-5 px-4">
                {/* Avatar Circle */}
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'white',
                    boxShadow: '0 8px 30px rgba(102,126,234,0.4)',
                  }}
                >
                  {getInitial()}
                </div>

                <h4 className="fw-bold mb-1">{user?.fullName || user?.username}</h4>
                <p className="text-muted small mb-3">@{user?.username}</p>

                <Badge
                  bg={badge.bg}
                  className="px-3 py-2 rounded-pill text-uppercase"
                  style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}
                >
                  {badge.label}
                </Badge>

                <hr className="my-4" />

                <div className="text-start">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{ width: '36px', height: '36px', background: 'rgba(102,126,234,0.1)' }}
                    >
                      <i className="bi bi-shield-check text-primary"></i>
                    </div>
                    <div>
                      <div className="xx-small text-muted text-uppercase fw-bold">Status Akun</div>
                      <div className="small fw-medium text-success">Aktif</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{ width: '36px', height: '36px', background: 'rgba(102,126,234,0.1)' }}
                    >
                      <i className="bi bi-person-badge text-primary"></i>
                    </div>
                    <div>
                      <div className="xx-small text-muted text-uppercase fw-bold">ID Pengguna</div>
                      <div className="small fw-medium">#{user?.id}</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Info & Security Cards */}
          <Col lg={8}>
            <div className="d-flex flex-column gap-4">
              {/* Account Information Card */}
              <Card
                className="border-0 shadow-lg"
                style={{
                  borderRadius: '20px',
                  background: nightMode
                    ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.8) 100%)'
                    : 'white',
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      <i className="bi bi-info-circle text-white fs-5"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Informasi Akun</h5>
                      <p className="text-muted small mb-0">Detail informasi akun Anda</p>
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col sm={6}>
                      <div
                        className="p-3 rounded-3"
                        style={{ background: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.12)' }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-person me-2 text-primary"></i>
                          <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Nama Lengkap</small>
                        </div>
                        <div className="fw-600">{user?.fullName || '-'}</div>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div
                        className="p-3 rounded-3"
                        style={{ background: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.12)' }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-at me-2 text-primary"></i>
                          <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Username</small>
                        </div>
                        <div className="fw-600">{user?.username || '-'}</div>
                      </div>
                    </Col>

                    <Col sm={12}>
                      <div
                        className="p-3 rounded-3"
                        style={{ background: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.12)' }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-envelope me-2 text-primary"></i>
                          <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Email</small>
                        </div>
                        <div className="fw-600">{user?.email || '-'}</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Password/Security Card */}
              <Card
                className="border-0 shadow-lg"
                style={{
                  borderRadius: '20px',
                  background: nightMode
                    ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.8) 100%)'
                    : 'white',
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}
                      >
                        <i className="bi bi-lock text-white fs-5"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">Keamanan Password</h5>
                        <p className="text-muted small mb-0">Ubah password akun Anda</p>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      className="rounded-pill px-4"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>Ubah Password
                    </Button>
                  </div>

                  <div
                    className="p-3 rounded-3 d-flex align-items-center gap-3"
                    style={{ background: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.12)' }}
                  >
                    <i className="bi bi-key fs-4 text-warning"></i>
                    <div>
                      <div className="fw-600 small">Password</div>
                      <div className="text-muted" style={{ letterSpacing: '4px', fontSize: '1.1rem' }}>••••••••</div>
                    </div>
                    <div className="ms-auto">
                      <Badge bg="success" className="rounded-pill px-3">Aman</Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Change Password Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}
        centered
      >
        <Modal.Header closeButton className={nightMode ? 'bg-dark text-white border-secondary' : ''}>
          <Modal.Title>
            <i className="bi bi-lock me-2 text-primary"></i>Ubah Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={nightMode ? 'bg-dark text-white' : ''}>
          {passwordError && <Alert variant="danger" className="small">{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success" className="small">{passwordSuccess}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small">Password Baru</Form.Label>
            <Form.Control
              type="password"
              placeholder="Masukkan password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={nightMode ? 'bg-secondary text-white border-secondary' : ''}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small">Konfirmasi Password Baru</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={nightMode ? 'bg-secondary text-white border-secondary' : ''}
            />
          </Form.Group>
          <p className="text-muted small mb-0">
            <i className="bi bi-info-circle me-1"></i>Password minimal 6 karakter.
          </p>
        </Modal.Body>
        <Modal.Footer className={nightMode ? 'bg-dark border-secondary' : ''}>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4"
            onClick={handleChangePassword}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
          >
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</> : <><i className="bi bi-check-lg me-2"></i>Simpan</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
