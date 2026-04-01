import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge, Table, ButtonGroup } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getFines, getFineSettings, updateFineSettings, calculateFine, markFinePaid, getFineStats } from '../utils/api';
import Footer from '../components/Footer';

const Fines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({ late_fee_per_day: 10000, grace_period_hours: 24 });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFines();
    loadStats();
    loadSettings();
  }, []);

  const loadFines = async () => {
    try {
      const response = await getFines();
      setFines(response.data.data || []);
    } catch (error) {
      setError('Gagal memuat data denda');
      console.error('Error loading fines:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getFineStats();
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Gagal memuat statistik denda:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await getFineSettings();
      setSettings(response.data.data || { late_fee_per_day: 10000, grace_period_hours: 24 });
    } catch (error) {
      console.error('Gagal memuat pengaturan denda:', error);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateFineSettings(settings);
      setSuccess('Pengaturan denda berhasil diupdate');
      setShowSettingsModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal mengupdate pengaturan denda');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFine = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;

    setLoading(true);
    try {
      await calculateFine(selectedFine.id, { late_fee_per_day: settings.late_fee_per_day });
      setSuccess('Denda berhasil dihitung');
      setShowCalculateModal(false);
      loadFines();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal menghitung denda');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menandai denda ini sebagai dibayar?')) {
      try {
        await markFinePaid(id);
        setSuccess('Denda berhasil ditandai sebagai dibayar');
        loadFines();
        loadStats();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Gagal menandai denda sebagai dibayar');
      }
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'pending': 'warning',
      'completed': 'success',
      'failed': 'danger'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status}</Badge>;
  };

  const canManageFines = user.role === 'admin' || user.role === 'petugas';

  if (!canManageFines) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-4">
          <Alert variant="danger">Akses ditolak. Hanya admin dan petugas yang dapat mengakses sistem denda.</Alert>
        </Container>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">💰 Sistem Denda</h1>
            <p className="text-muted mb-0">Kelola denda keterlambatan pengembalian alat musik</p>
          </div>
          {user.role === 'admin' && (
            <Button
              variant="primary"
              onClick={() => setShowSettingsModal(true)}
              className="btn-modern shadow"
            >
              <i className="bi bi-gear me-2"></i>
              Pengaturan Denda
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

        {/* Statistics Cards */}
        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Denda</p>
                    <h2 className="fw-bold mb-0">{stats.total_fines || 0}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="opacity-75">
                    <i className="bi bi-graph-up me-1"></i>
                    Kasus denda terdaftar
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Nominal</p>
                    <h4 className="fw-bold mb-0">Rp {(stats.total_amount || 0).toLocaleString('id-ID')}</h4>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-cash-coin fs-3"></i>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="opacity-75">
                    <i className="bi bi-currency-exchange me-1"></i>
                    Total nilai denda
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffa500 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Belum Dibayar</p>
                    <h2 className="fw-bold mb-0">{stats.unpaid_fines || 0}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-hourglass-end fs-3"></i>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="opacity-75">
                    <i className="bi bi-clock-history me-1"></i>
                    Menunggu pembayaran
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Sudah Dibayar</p>
                    <h2 className="fw-bold mb-0">{stats.paid_fines || 0}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <i className="bi bi-check-circle-fill fs-3"></i>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="opacity-75">
                    <i className="bi bi-check-all me-1"></i>
                    Denda terselesaikan
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Fines Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-transparent border-bottom">
            <div className="d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Daftar Denda
              </h5>
              {user.role === 'admin' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  className="btn-modern me-2"
                >
                  <i className="bi bi-gear me-2"></i>
                  Pengaturan
                </Button>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowCalculateModal(true)}
                className="btn-modern"
              >
                <i className="bi bi-calculator me-2"></i>
                Hitung Manual
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-modern">
                  <tr>
                    <th>Peminjam</th>
                    <th>Alat Musik</th>
                    <th>Tanggal Kembali</th>
                    <th>Keterlambatan</th>
                    <th>Denda/Hari</th>
                    <th>Total Denda</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div style={{ fontSize: '3rem', opacity: 0.3 }}>💰</div>
                        <p className="text-muted mb-0 mt-2">Belum ada data denda</p>
                      </td>
                    </tr>
                  ) : (
                    fines.map((fine) => (
                      <tr key={fine.id}>
                        <td>
                          <div>
                            <div className="fw-semibold">{fine.full_name}</div>
                            <small className="text-muted">{fine.username}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{fine.instrument_name}</div>
                            <small className="text-muted">{fine.category_name}</small>
                          </div>
                        </td>
                        <td>
                          <small>{new Date(fine.actual_return_date).toLocaleDateString('id-ID')}</small>
                        </td>
                        <td>
                          <Badge bg="danger" className="badge-modern">
                            <i className="bi bi-calendar-x me-1"></i>
                            {fine.late_days} hari
                          </Badge>
                        </td>
                        <td>
                          <small className="fw-semibold">Rp {parseInt(fine.late_fee_per_day).toLocaleString('id-ID')}</small>
                        </td>
                        <td>
                          <span className="fw-bold text-danger">
                            Rp {parseInt(fine.late_fee_total).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td>{getPaymentStatusBadge(fine.payment_status)}</td>
                        <td>
                          {fine.payment_status !== 'completed' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkPaid(fine.id)}
                              className="btn-modern"
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Bayar
                            </Button>
                          )}
                          {fine.payment_status === 'completed' && (
                            <Badge bg="success" className="badge-modern">
                              <i className="bi bi-check-all me-1"></i>
                              Selesai
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end fw-bold">Total Nilai Denda:</td>
                    <td colSpan="3" className="fw-bold text-danger">
                      Rp {fines.reduce((sum, fine) => sum + parseInt(fine.late_fee_total || 0), 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Settings Modal */}
        <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)} className="modal-modern" size="lg">
          <Modal.Header closeButton style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Modal.Title className="text-white">
              <i className="bi bi-gear me-2"></i>
              Pengaturan Denda
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSettings} className="form-modern">
            <Modal.Body>
              <Alert variant="info" className="mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Atur nilai denda dan grace period untuk sistem keterlambatan
              </Alert>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-cash-coin me-2"></i>
                  Denda per Hari (Rp)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={settings.late_fee_per_day}
                  onChange={(e) => setSettings({...settings, late_fee_per_day: parseFloat(e.target.value)})}
                  min="0"
                  step="1000"
                  required
                  size="lg"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-hourglass-end me-2"></i>
                  Grace Period (jam)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={settings.grace_period_hours}
                  onChange={(e) => setSettings({...settings, grace_period_hours: parseInt(e.target.value)})}
                  min="0"
                  required
                  size="lg"
                />
                <Form.Text className="text-muted">
                  Waktu toleransi sebelum denda dikenakan
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="btn-modern">
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Calculate Fine Modal */}
        <Modal show={showCalculateModal} onHide={() => setShowCalculateModal(false)} className="modal-modern" size="lg">
          <Modal.Header closeButton style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Modal.Title className="text-white">
              <i className="bi bi-calculator me-2"></i>
              Hitung Denda Manual
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCalculateFine} className="form-modern">
            <Modal.Body>
              <Alert variant="info" className="mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Pilih peminjaman yang sudah dikembalikan untuk menghitung denda keterlambatan.
              </Alert>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="bi bi-list-check me-2"></i>
                  Pilih Peminjaman
                </Form.Label>
                <Form.Select
                  value={selectedFine?.id || ''}
                  onChange={(e) => {
                    const fine = fines.find(f => f.id == e.target.value);
                    setSelectedFine(fine);
                  }}
                  required
                  size="lg"
                >
                  <option value="">Pilih peminjaman...</option>
                  {fines.map((fine) => (
                    <option key={fine.id} value={fine.id}>
                      {fine.full_name} - {fine.instrument_name} (Kembali: {new Date(fine.actual_return_date).toLocaleDateString('id-ID')})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedFine && (
                <Card className="border-0 card-gradient">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-info-circle me-2 text-primary"></i>
                      Detail Peminjaman
                    </h6>
                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                      <span className="text-muted">Peminjam:</span>
                      <span className="fw-semibold">{selectedFine.full_name}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                      <span className="text-muted">Alat Musik:</span>
                      <span className="fw-semibold">{selectedFine.instrument_name}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                      <span className="text-muted">Tanggal Kembali:</span>
                      <span className="fw-semibold">{new Date(selectedFine.actual_return_date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Denda/Hari:</span>
                      <span className="fw-bold text-primary">Rp {settings.late_fee_per_day.toLocaleString('id-ID')}</span>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCalculateModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={loading || !selectedFine} className="btn-modern">
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menghitung...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calculator me-2"></i>
                    Hitung Denda
                  </>
                )}
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

export default Fines;