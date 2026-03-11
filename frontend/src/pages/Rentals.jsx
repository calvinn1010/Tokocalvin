import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getRentals, createRental, updateRentalStatus, deleteRental, getInstruments } from '../utils/api';
import Footer from '../components/Footer';

const Rentals = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    instrumentId: '',
    startDate: '',
    endDate: '',
    notes: '',
    paymentMethod: 'cash',
    paymentAmount: 0,
    paymentReceipt: ''
  });

  useEffect(() => {
    loadRentals();
    loadInstruments();
  }, []);

  const loadRentals = async () => {
    try {
      const response = await getRentals();
      const payload = response.data && response.data.data ? response.data.data : response.data;

      const normalized = (payload || []).map(r => ({
        id: r.id,
        userId: r.user_id ?? r.userId ?? r.user?.id,
        user: {
          fullName: r.full_name ?? r.user?.fullName ?? r.user?.full_name ?? r.user?.fullName,
          username: r.username ?? r.user?.username ?? r.user?.username
        },
        instrumentId: r.instrument_id ?? r.instrumentId ?? r.instrument?.id,
        instrument: {
          name: r.instrument_name ?? r.instrument?.name ?? r.instrument?.instrument_name,
          category: r.category_name ?? r.instrument?.category ?? r.instrument?.category_name
        },
        startDate: r.start_date ?? r.startDate ?? r.start_date,
        endDate: r.end_date ?? r.endDate ?? r.end_date,
        totalPrice: r.total_price ?? r.totalPrice ?? r.totalPrice,
        totalDays: r.total_days ?? r.totalDays ?? r.totalDays,
        paymentStatus: r.payment_status ?? r.paymentStatus ?? r.payment_status,
        paymentMethod: r.payment_method ?? r.paymentMethod ?? r.payment_method,
        status: r.status,
        notes: r.notes
      }));

      setRentals(normalized);
    } catch (error) {
      setError('Gagal memuat data peminjaman');
    }
  };

  const loadInstruments = async () => {
    try {
      const response = await getInstruments();
      setInstruments(response.data.filter(i => i.stock > 0));
    } catch (error) {
      console.error('Gagal memuat data alat musik');
    }
  };

  const handleShowModal = () => {
    setFormData({
      instrumentId: '',
      startDate: '',
      endDate: '',
      notes: '',
      paymentMethod: 'cash',
      paymentAmount: 0,
      paymentReceipt: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if ((name === 'instrumentId' || name === 'startDate' || name === 'endDate') && newFormData.instrumentId && newFormData.startDate && newFormData.endDate) {
      const selectedInstrument = instruments.find(i => i.id === parseInt(newFormData.instrumentId));
      if (selectedInstrument) {
        const start = new Date(newFormData.startDate);
        const end = new Date(newFormData.endDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          const price = selectedInstrument.price_per_day || selectedInstrument.price || 0;
          const amount = days * price;
          newFormData.paymentAmount = parseFloat(amount.toFixed(2));
        } else {
          newFormData.paymentAmount = 0;
        }
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createRental(formData);
      setSuccess('Pengajuan peminjaman berhasil dibuat');
      handleCloseModal();
      loadRentals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateRentalStatus(id, status);
      setSuccess(`Status berhasil diubah menjadi ${status}`);
      loadRentals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus peminjaman ini?')) {
      try {
        await deleteRental(id);
        setSuccess('Peminjaman berhasil dihapus');
        loadRentals();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus peminjaman');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', icon: 'clock', text: 'Menunggu' },
      approved: { bg: 'success', icon: 'check-circle', text: 'Disetujui' },
      rejected: { bg: 'danger', icon: 'x-circle', text: 'Ditolak' },
      returned: { bg: 'secondary', icon: 'check-all', text: 'Dikembalikan' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', icon: 'info', text: status };
    return (
      <Badge bg={statusInfo.bg} className="badge-modern">
        <i className={`bi bi-${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
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

  const canApprove = user.role === 'admin' || user.role === 'petugas';
  const pendingCount = rentals.filter(r => r.status === 'pending').length;
  const approvedCount = rentals.filter(r => r.status === 'approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              {canApprove ? '📋 Persetujuan Peminjaman' : '🎵 Daftar Peminjaman'}
            </h1>
            <p className="text-muted mb-0">
              {canApprove ? 'Kelola dan persetujui peminjaman alat musik' : 'Kelola peminjaman alat musik Anda'}
            </p>
          </div>
          {user.role === 'user' && (
            <Button 
              variant="primary" 
              onClick={handleShowModal}
              className="btn-modern shadow"
              size="lg"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajukan Peminjaman
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

        {/* Stats Cards for Admin/Petugas */}
        {canApprove && (
          <Row className="g-4 mb-5">
            <Col md={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #fff093 0%, #ffc107 100%)' }}>
                <Card.Body className="text-dark">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Menunggu Persetujuan</p>
                      <h2 className="fw-bold mb-0">{pendingCount}</h2>
                    </div>
                    <div className="bg-dark bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-hourglass-split fs-3"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <Card.Body className="text-dark">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Disetujui</p>
                      <h2 className="fw-bold mb-0">{approvedCount}</h2>
                    </div>
                    <div className="bg-dark bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-circle fs-3"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Card.Body className="text-dark">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Total Peminjaman</p>
                      <h2 className="fw-bold mb-0">{rentals.length}</h2>
                    </div>
                    <div className="bg-dark bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-list-check fs-3"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #fa709a  0%, #fee140 100%)' }}>
                <Card.Body className="text-dark">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Selesai</p>
                      <h2 className="fw-bold mb-0">{rentals.filter(r => r.status === 'returned').length}</h2>
                    </div>
                    <div className="bg-dark bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-all fs-3"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-transparent border-bottom">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-table me-2 text-primary"></i>
              Daftar {canApprove ? 'Persetujuan' : ''} Peminjaman
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-modern">
                  <tr>
                    <th>Peminjam</th>
                    <th>Alat Musik</th>
                    <th>Periode</th>
                    {user.role === 'user' && (
                      <>
                        <th>Biaya</th>
                        <th>Pembayaran</th>
                      </>
                    )}
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.length === 0 ? (
                    <tr>
                      <td colSpan={user.role === 'user' ? '7' : '5'} className="text-center py-5">
                        <div style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
                        <p className="text-muted mb-0 mt-2">Tidak ada data peminjaman</p>
                      </td>
                    </tr>
                  ) : (
                    rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td>
                          {rental.user ? (
                            <div>
                              <div className="fw-semibold">{rental.user.fullName}</div>
                              <small className="text-muted">{rental.user.username}</small>
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          {rental.instrument ? (
                            <div>
                              <div className="fw-semibold">{rental.instrument.name}</div>
                              <small className="text-muted">{rental.instrument.category}</small>
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          <div>
                            <small className="text-muted">Mulai: {formatDate(rental.startDate)}</small>
                            <br />
                            <small className="text-muted">Selesai: {formatDate(rental.endDate)}</small>
                          </div>
                        </td>
                        {user.role === 'user' && (
                          <>
                            <td>
                              {rental.totalPrice ? (
                                <div>
                                  <div className="fw-semibold text-primary">Rp {parseFloat(rental.totalPrice).toLocaleString('id-ID')}</div>
                                  <small className="text-muted">{rental.totalDays} hari</small>
                                </div>
                              ) : '-'}
                            </td>
                            <td>
                              {rental.paymentStatus ? (
                                <div>
                                  <Badge bg={rental.paymentStatus === 'completed' ? 'success' : rental.paymentStatus === 'pending' ? 'warning' : 'danger'} className="badge-modern">
                                    <i className={`bi bi-${rental.paymentStatus === 'completed' ? 'check-circle' : rental.paymentStatus === 'pending' ? 'clock' : 'x-circle'} me-1`}></i>
                                    {rental.paymentStatus === 'completed' ? 'Terbayar' : rental.paymentStatus === 'pending' ? 'Menunggu' : 'Gagal'}
                                  </Badge>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                          </>
                        )}
                        <td>{getStatusBadge(rental.status)}</td>
                        <td className="text-center">
                          {canApprove && rental.status === 'pending' && (
                            <div className="btn-group btn-group-sm" role="group">
                              <Button
                                variant="outline-success"
                                className="btn-modern"
                                onClick={() => handleUpdateStatus(rental.id, 'approved')}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Setujui
                              </Button>
                              <Button
                                variant="outline-danger"
                                className="btn-modern"
                                onClick={() => handleUpdateStatus(rental.id, 'rejected')}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Tolak
                              </Button>
                            </div>
                          )}
                          {canApprove && rental.status === 'approved' && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="btn-modern"
                              onClick={() => handleUpdateStatus(rental.id, 'returned')}
                            >
                              <i className="bi bi-check-all me-1"></i>
                              Kembali
                            </Button>
                          )}
                          {((user.role === 'user' && rental.userId === user.id && rental.status === 'pending') ||
                            user.role === 'admin') && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="btn-modern"
                                onClick={() => handleDelete(rental.id)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Hapus
                              </Button>
                            )}
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
              <i className="bi bi-plus-circle me-2"></i>
              Ajukan Peminjaman Baru
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit} className="form-modern">
            <Modal.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-music-note-list me-2"></i>
                  Alat Musik *
                </Form.Label>
                <Form.Select
                  name="instrumentId"
                  value={formData.instrumentId}
                  onChange={handleChange}
                  required
                  size="lg"
                >
                  <option value="">Pilih alat musik...</option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name} - {instrument.category} (Stok: {instrument.stock})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-calendar-event me-2"></i>
                      Tanggal Mulai *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      size="lg"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-calendar-check me-2"></i>
                      Tanggal Selesai *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      size="lg"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-list-check me-2"></i>
                  Catatan
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Keperluan peminjaman..."
                />
              </Form.Group>

              <hr className="my-4" />
              <h6 className="mb-4 fw-bold">
                <i className="bi bi-credit-card me-2"></i>
                Informasi Pembayaran
              </h6>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-wallet2 me-2"></i>
                      Metode Pembayaran *
                    </Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      required
                      size="lg"
                    >
                      <option value="cash">💵 Tunai (Cash)</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Pembayaran dilakukan saat pengambilan
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-cash-coin me-2"></i>
                      Jumlah Pembayaran *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="paymentAmount"
                      value={formData.paymentAmount}
                      onChange={handleChange}
                      className="fw-bold"
                      required
                      step="0.01"
                      min="0"
                      size="lg"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-file-text me-2"></i>
                  Catatan Pembayaran
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="paymentReceipt"
                  value={formData.paymentReceipt}
                  onChange={handleChange}
                  placeholder="Contoh: Sudah siapkan uang cash..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" type="submit" className="btn-modern">
                <i className="bi bi-check-circle me-2"></i>
                Ajukan Peminjaman
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

export default Rentals;
