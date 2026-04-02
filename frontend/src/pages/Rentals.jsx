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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Baik');
  const [damageNotes, setDamageNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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


  const handleUpdateStatus = async (id, status, extraData = {}) => {
    try {
      setSubmitting(true);
      await updateRentalStatus(id, status, extraData);
      setSuccess(`Status berhasil diubah menjadi ${status}`);
      loadRentals();
      setShowReturnModal(false);
      setReturnCondition('Baik');
      setDamageNotes('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowReturnModal = (rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
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
                        <th>Biaya</th>
                        <th>Pembayaran</th>
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
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
                                  <Badge bg={rental.paymentStatus === 'completed' ? 'success' : rental.paymentStatus === 'pending' ? 'warning' : 'danger'} className="badge-modern mb-1">
                                    <i className={`bi bi-${rental.paymentStatus === 'completed' ? 'check-circle' : rental.paymentStatus === 'pending' ? 'clock' : 'x-circle'} me-1`}></i>
                                    {rental.paymentStatus === 'completed' ? 'Terbayar' : rental.paymentStatus === 'pending' ? 'Menunggu' : 'Gagal'}
                                  </Badge>
                                  <br/>
                                  <small className="text-muted">
                                    {rental.paymentMethod && rental.paymentMethod.startsWith('transfer') ? 'Transfer (Midtrans)' : 'Tunai'}
                                  </small>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
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
                              onClick={() => handleShowReturnModal(rental)}
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

        {/* Return Modal */}
        <Modal show={showReturnModal} onHide={() => !submitting && setShowReturnModal(false)} centered>
          <Modal.Header closeButton={!submitting}>
            <Modal.Title className="fw-bold fs-5">
              <i className="bi bi-box-arrow-in-left me-2 text-primary"></i>
              Proses Pengembalian
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            {selectedRental && (
              <div className="mb-4 p-3 bg-light rounded border-start border-4 border-primary">
                <div className="fw-bold">{selectedRental.instrument.name}</div>
                <div className="small text-muted">Dipinjam oleh: {selectedRental.user.fullName}</div>
              </div>
            )}
            
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-uppercase text-muted">Kondisi Alat Musik Saat Kembali</Form.Label>
                <div className="d-flex gap-2">
                  {['Baik', 'Cukup', 'Rusak'].map((cond) => (
                    <Button
                      key={cond}
                      variant={returnCondition === cond ? (cond === 'Baik' ? 'success' : cond === 'Cukup' ? 'warning' : 'danger') : 'outline-secondary'}
                      className="flex-grow-1 py-2 btn-modern border-2"
                      onClick={() => setReturnCondition(cond)}
                    >
                      {cond === 'Baik' && <i className="bi bi-shield-check me-1"></i>}
                      {cond === 'Cukup' && <i className="bi bi-shield-exclamation me-1"></i>}
                      {cond === 'Rusak' && <i className="bi bi-shield-slash me-1"></i>}
                      {cond}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold small text-uppercase text-muted">Catatan Kerusakan (Opsional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={returnCondition === 'Baik' ? "Opsional..." : "Jelaskan detail kerusakan..."}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  className="bg-light border-0"
                  required={returnCondition !== 'Baik'}
                />
                {returnCondition !== 'Baik' && !damageNotes && (
                  <Form.Text className="text-danger small">
                    Mohon jelaskan kondisi kerusakan.
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 px-4">
            <Button variant="light" onClick={() => setShowReturnModal(false)} disabled={submitting} className="btn-modern px-4">
              Batal
            </Button>
            <Button 
              variant="primary" 
              className="btn-modern px-4"
              disabled={submitting || (returnCondition !== 'Baik' && !damageNotes)}
              onClick={() => handleUpdateStatus(selectedRental.id, 'returned', { returnCondition, damageNotes })}
            >
              {submitting ? 'Memproses...' : 'Konfirmasi Kembali'}
            </Button>
          </Modal.Footer>
        </Modal>

        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Rentals;
