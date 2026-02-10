import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getRentals, createRental, updateRentalStatus, deleteRental, getInstruments } from '../utils/api';

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
      // backend may return { success: true, data: [...] } or directly [...]
      const payload = response.data && response.data.data ? response.data.data : response.data;

      // Normalize rentals so frontend can rely on consistent shape
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

    // Auto-calculate payment amount when instrument, start date, or end date changes
    if ((name === 'instrumentId' || name === 'startDate' || name === 'endDate') && newFormData.instrumentId && newFormData.startDate && newFormData.endDate) {
      const selectedInstrument = instruments.find(i => i.id === parseInt(newFormData.instrumentId));
      if (selectedInstrument) {
        const start = new Date(newFormData.startDate);
        const end = new Date(newFormData.endDate);

        // Ensure dates are valid and end is after start
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
      pending: { bg: 'warning', text: 'Menunggu' },
      approved: { bg: 'success', text: 'Disetujui' },
      rejected: { bg: 'danger', text: 'Ditolak' },
      returned: { bg: 'secondary', text: 'Dikembalikan' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const canApprove = user.role === 'admin' || user.role === 'petugas';

  return (
    <>
      <NavigationBar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold">{user.role === 'admin' ? 'Persetujuan Peminjaman' : 'Daftar Peminjaman'}</h1>
            <p className="text-muted">{user.role === 'admin' ? 'Kelola persetujuan peminjaman' : 'Kelola peminjaman alat musik'}</p>
          </div>
          {user.role === 'user' && (
            <Button variant="primary" onClick={handleShowModal}>
              + Ajukan Peminjaman
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Peminjam</th>
                    <th>Alat Musik</th>
                    <th>Tanggal Mulai</th>
                    <th>Tanggal Selesai</th>
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
                      <td colSpan={user.role === 'user' ? '9' : '7'} className="text-center py-4 text-muted">
                        Tidak ada data peminjaman
                      </td>
                    </tr>
                  ) : (
                    rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td>{rental.id}</td>
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
                        <td>{formatDate(rental.startDate)}</td>
                        <td>{formatDate(rental.endDate)}</td>
                        {user.role === 'user' && (
                          <>
                            <td>
                              {rental.totalPrice ? (
                                <div>
                                  <div className="fw-semibold">Rp {parseFloat(rental.totalPrice).toLocaleString('id-ID')}</div>
                                  <small className="text-muted">{rental.totalDays} hari</small>
                                </div>
                              ) : '-'}
                            </td>
                            <td>
                              {rental.paymentStatus ? (
                                <div>
                                  <Badge bg={rental.paymentStatus === 'completed' ? 'success' : rental.paymentStatus === 'pending' ? 'warning' : 'danger'}>
                                    {rental.paymentStatus === 'completed' ? 'Terbayar' : rental.paymentStatus === 'pending' ? 'Menunggu' : 'Gagal'}
                                  </Badge>
                                  <br />
                                  <small className="text-muted">{rental.paymentMethod || 'Tunai'}</small>
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
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleUpdateStatus(rental.id, 'approved')}
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleUpdateStatus(rental.id, 'rejected')}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {canApprove && rental.status === 'approved' && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleUpdateStatus(rental.id, 'returned')}
                            >
                              Dikembalikan
                            </Button>
                          )}
                          {((user.role === 'user' && rental.userId === user.id && rental.status === 'pending') ||
                            user.role === 'admin') && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-1"
                                onClick={() => handleDelete(rental.id)}
                              >
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
          </div>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Ajukan Peminjaman</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Alat Musik *</Form.Label>
                <Form.Select
                  name="instrumentId"
                  value={formData.instrumentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih alat musik</option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name} - {instrument.category} (Stok: {instrument.stock})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tanggal Mulai *</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tanggal Selesai *</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Catatan</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Keperluan peminjaman"
                />
              </Form.Group>

              <hr className="my-3" />
              <h6 className="mb-3 fw-bold">💳 Informasi Pembayaran</h6>

              <Form.Group className="mb-3">
                <Form.Label>Metode Pembayaran *</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="cash">Tunai (Cash)</option>
                </Form.Select>
                <Form.Text className="text-muted">Pembayaran dilakukan saat pengambilan alat musik</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Jumlah Pembayaran *</Form.Label>
                <Form.Control
                  type="number"
                  name="paymentAmount"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  className="fw-bold"
                  required
                  step="0.01"
                  min="0"
                />
                <Form.Text className="text-muted">Dihitung otomatis dari durasi sewa & harga alat musik (bisa diubah jika diperlukan)</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Catatan Pembayaran</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="paymentReceipt"
                  value={formData.paymentReceipt}
                  onChange={handleChange}
                  placeholder="Contoh: Sudah siapkan uang cash, akan bayar H-1 pengambilan, dll"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Ajukan
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default Rentals;
