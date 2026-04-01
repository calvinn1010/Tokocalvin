import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Badge, Button } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getRentals } from '../utils/api';
import Footer from '../components/Footer';

const Reports = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const response = await getRentals();
      const payload = response.data && response.data.data ? response.data.data : response.data;

      const normalized = (payload || []).map(r => ({
        id: r.id,
        user: {
          fullName: r.full_name ?? r.user?.fullName ?? r.user?.full_name ?? r.user?.fullName,
          username: r.username ?? r.user?.username ?? r.user?.username
        },
        instrument: {
          name: r.instrument_name ?? r.instrument?.name ?? r.instrument?.instrument_name,
          category: r.category_name ?? r.instrument?.category ?? r.instrument?.category_name
        },
        startDate: r.start_date ?? r.startDate ?? r.start_date,
        endDate: r.end_date ?? r.endDate ?? r.end_date,
        totalPrice: r.total_price ?? r.totalPrice ?? r.totalPrice,
        status: r.status
      }));

      // Sort by start date, newest first
      normalized.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      setRentals(normalized);
    } catch (error) {
      setError('Gagal memuat data peminjaman');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Menunggu' },
      approved: { text: 'Disetujui' },
      rejected: { text: 'Ditolak' },
      returned: { text: 'Selesai/Dikembalikan' }
    };
    const statusInfo = statusMap[status] || { text: status };
    return statusInfo.text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
    return (
      <Container className="mt-5 text-center">
        <h3>Akses Ditolak</h3>
        <p>Hanya Admin dan Petugas yang dapat melihat halaman laporan.</p>
      </Container>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="d-print-none">
        <NavigationBar />
      </div>
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in py-4">
          <div className="d-flex justify-content-between align-items-center mb-4 text-center text-md-start">
            <div>
              <h1 className="display-6 fw-bold mb-2">
                <i className="bi bi-file-earmark-bar-graph me-2 text-primary d-print-none"></i>
                Laporan Peminjaman
              </h1>
              <p className="text-muted mb-0 d-print-none">
                Cetak laporan sirkulasi peminjaman alat musik.
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={handlePrint}
              className="btn-modern shadow-sm d-print-none"
              size="lg"
            >
              <i className="bi bi-printer me-2"></i>
              Cetak Laporan
            </Button>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4 d-print-none">{error}</Alert>}

          <Card className="border-0 shadow-sm report-table-card">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 table-bordered">
                  <thead className="table-modern print-header">
                    <tr>
                      <th className="text-center">No.</th>
                      <th>Peminjam</th>
                      <th>Alat Musik</th>
                      <th className="text-center">Tgl Pinjam</th>
                      <th className="text-center">Tgl Kembali</th>
                      <th className="text-end">Total Biaya</th>
                      <th className="text-center">Status</th>
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
                      rentals.map((rental, index) => (
                        <tr key={rental.id}>
                          <td className="text-center align-middle">{index + 1}</td>
                          <td className="align-middle">
                            {rental.user ? (
                              <div>
                                <div className="fw-semibold">{rental.user.fullName}</div>
                                <small className="text-muted">{rental.user.username}</small>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="align-middle">
                            {rental.instrument ? (
                              <div>
                                <div className="fw-semibold">{rental.instrument.name}</div>
                                <small className="text-muted">{rental.instrument.category}</small>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="text-center align-middle">
                            {formatDate(rental.startDate)}
                          </td>
                          <td className="text-center align-middle">
                            {formatDate(rental.endDate)}
                          </td>
                          <td className="text-end align-middle fw-semibold text-primary">
                            {rental.totalPrice ? `Rp ${parseFloat(rental.totalPrice).toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="text-center align-middle">
                            <span className="fw-medium">{getStatusBadge(rental.status)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <div className="d-print-none">
        <Footer />
      </div>
    </div>
  );
};

export default Reports;
