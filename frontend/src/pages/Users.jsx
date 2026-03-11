import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { getUsers, createUser, updateUser, deleteUser } from '../utils/api';
import Footer from '../components/Footer';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    fullName: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Gagal memuat data user');
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        fullName: user.fullName || user.full_name
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        fullName: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(editingId, updateData);
        setSuccess('User berhasil diupdate');
      } else {
        await createUser(formData);
        setSuccess('User berhasil ditambahkan');
      }

      handleCloseModal();
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await deleteUser(id);
        setSuccess('User berhasil dihapus');
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { bg: 'danger', icon: 'shield-check', text: 'Admin' },
      petugas: { bg: 'primary', icon: 'person-check', text: 'Petugas' },
      user: { bg: 'success', icon: 'person', text: 'User' }
    };
    const roleInfo = roleMap[role] || { bg: 'secondary', icon: 'person', text: role };
    return (
      <Badge bg={roleInfo.bg} className="badge-modern">
        <i className={`bi bi-${roleInfo.icon} me-1`}></i>
        {roleInfo.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">👥 Kelola User</h1>
            <p className="text-muted mb-0">Manajemen pengguna sistem</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => handleShowModal()} 
            className="btn-modern shadow"
            size="lg"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Tambah User
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

        {/* User Stats */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total User</p>
                    <h2 className="fw-bold mb-0">{users.length}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-people fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Admin</p>
                    <h2 className="fw-bold mb-0">{users.filter(u => u.role === 'admin').length}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-shield-check fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Reguler User</p>
                    <h2 className="fw-bold mb-0">{users.filter(u => u.role === 'user').length}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-person-check fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-transparent border-bottom">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-list-ul me-2 text-primary"></i>
              Daftar User
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-modern">
                  <tr>
                    <th>Nama Lengkap</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tanggal Daftar</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
                        <p className="text-muted mb-0 mt-2">Tidak ada data user</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-semibold">{user.fullName || user.full_name}</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-primary bg-opacity-10 p-2 me-2"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            <span className="fw-semibold">{user.username}</span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">{user.email}</small>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          <small className="text-muted">{formatDate(user.created_at || user.createdAt)}</small>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2 btn-modern"
                            onClick={() => handleShowModal(user)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-modern"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={handleCloseModal} className="modal-modern" size="lg">
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Modal.Title className="text-white">
              <i className={`bi bi-${editingId ? 'pencil' : 'plus-circle'} me-2`}></i>
              {editingId ? 'Edit' : 'Tambah'} User
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit} className="form-modern">
            <Modal.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-person-fill me-2"></i>
                  Nama Lengkap *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap"
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-person-circle me-2"></i>
                  Username *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan username"
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-envelope-fill me-2"></i>
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan email"
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-lock-fill me-2"></i>
                  Password {editingId && '(kosongkan jika tidak ingin mengubah)'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingId}
                  minLength="6"
                  placeholder="Masukkan password"
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-shield-check me-2"></i>
                  Role *
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  size="lg"
                >
                  <option value="user">👤 User</option>
                  <option value="petugas">📋 Petugas</option>
                  <option value="admin">🛡️ Admin</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" type="submit" className="btn-modern">
                <i className={`bi bi-${editingId ? 'arrow-repeat' : 'check-circle'} me-2`}></i>
                {editingId ? 'Update User' : 'Tambah User'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Users;
