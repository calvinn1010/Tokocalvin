import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInstruments, getRentals, getUsers, getCategories } from '../utils/api';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInstruments: 0,
    totalRentals: 0,
    totalUsers: 0,
    pendingRentals: 0,
    approvedRentals: 0,
    availableInstruments: 0
  });
  const [categories, setCategories] = useState([]);
  const [recentRentals, setRecentRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [instrumentsRes, rentalsRes, categoriesRes] = await Promise.all([
        getInstruments(),
        getRentals(),
        getCategories()
      ]);

      // Normalize API responses which may be { success:true, data: [...] } or direct arrays
      const instruments = instrumentsRes.data && instrumentsRes.data.data ? instrumentsRes.data.data : instrumentsRes.data;
      const rentals = rentalsRes.data && rentalsRes.data.data ? rentalsRes.data.data : rentalsRes.data;
      const categoriesPayload = categoriesRes.data && categoriesRes.data.data ? categoriesRes.data.data : categoriesRes.data;

      const newStats = {
        totalInstruments: Array.isArray(instruments) ? instruments.length : 0,
        totalRentals: Array.isArray(rentals) ? rentals.length : 0,
        pendingRentals: Array.isArray(rentals) ? rentals.filter(r => r.status === 'pending').length : 0,
        approvedRentals: Array.isArray(rentals) ? rentals.filter(r => r.status === 'approved').length : 0,
        availableInstruments: Array.isArray(instruments) ? instruments.filter(i => i.stock > 0).length : 0
      };

      if (user.role === 'admin') {
        const usersRes = await getUsers();
        newStats.totalUsers = usersRes.data.length;
      }

      setStats(newStats);
      setCategories(Array.isArray(categoriesPayload) ? categoriesPayload : []);
      // Normalize recent rentals for display
      const recent = (Array.isArray(rentals) ? rentals : []).slice(0, 5).map(r => ({
        id: r.id,
        user: r.user || { fullName: r.full_name || r.user_full_name || r.user?.fullName, username: r.username || r.user?.username },
        instrument: r.instrument || { name: r.instrument_name || r.name || r.instrument?.name, category: r.category_name || r.instrument?.category },
        status: r.status,
        createdAt: r.created_at ?? r.createdAt ?? r.createdAt
      }));
      setRecentRentals(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Menunggu' },
      approved: { bg: 'success', text: 'Disetujui' },
      rejected: { bg: 'danger', text: 'Ditolak' },
      returned: { bg: 'secondary', text: 'Dikembalikan' }
    };
    const s = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={s.bg}>{s.text}</Badge>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavigationBar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner-border text-primary loading-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
          {/* Welcome Section */}
          <div className="mb-4">
            <h1 className="display-5 fw-bold gradient-text">Selamat Datang! 👋</h1>
            <p className="text-muted fs-5">{user.fullName}</p>
            <Badge bg="primary" className="badge-modern">{user?.role?.toUpperCase()}</Badge>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-5">
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Total Alat Musik</p>
                      <h2 className="fw-bold mb-0">{stats.totalInstruments}</h2>
                    </div>
                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                      <i className="bi bi-music-note-list fs-3"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <small className="opacity-75">
                      <i className="bi bi-check-circle me-1"></i>
                      {stats.availableInstruments} Tersedia
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
                      <p className="mb-1 opacity-75">Total Peminjaman</p>
                      <h2 className="fw-bold mb-0">{stats.totalRentals}</h2>
                    </div>
                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                      <i className="bi bi-calendar-check fs-3"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <small className="opacity-75">
                      <i className="bi bi-arrow-up-circle me-1"></i>
                      {stats.approvedRentals} Aktif
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 opacity-75">Menunggu Persetujuan</p>
                      <h2 className="fw-bold mb-0">{stats.pendingRentals}</h2>
                    </div>
                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                      <i className="bi bi-hourglass-split fs-3"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <small className="opacity-75">
                      <i className="bi bi-clock me-1"></i>
                      Perlu Ditinjau
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {user.role === 'admin' && (
              <Col md={6} lg={3}>
                <Card className="border-0 shadow-sm stats-card h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <Card.Body className="text-white">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="mb-1 opacity-75">Total Pengguna</p>
                        <h2 className="fw-bold mb-0">{stats.totalUsers}</h2>
                      </div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3">
                        <i className="bi bi-people fs-3"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <small className="opacity-75">
                        <i className="bi bi-person-check me-1"></i>
                        Terdaftar
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>

          <Row className="g-4">
            {/* Categories Section */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>
                      Kategori Alat Musik
                    </h5>
                    <Link to="/instruments" className="btn btn-sm btn-outline-primary">
                      Lihat Semua <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                  <Row className="g-3">
                    {categories.map(category => (
                      <Col key={category.id} md={6} lg={4}>
                        <Card
                          className="border category-card h-100"
                          style={{
                            borderColor: category.color,
                            background: `linear-gradient(135deg, ${category.color}10 0%, ${category.color}20 100%)`
                          }}
                        >
                          <Card.Body className="text-center py-3">
                            <div style={{ fontSize: '2.5rem' }}>{category.icon}</div>
                            <h6 className="fw-bold mt-2 mb-0 small">{category.name}</h6>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Quick Access & Info */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                    Akses Cepat
                  </h5>
                  <div className="d-grid gap-2">
                    <Link to="/instruments" className="btn btn-outline-primary btn-modern">
                      <i className="bi bi-music-note-list me-2"></i>
                      Lihat Alat Musik
                    </Link>
                    <Link to="/rentals" className="btn btn-outline-success btn-modern">
                      <i className="bi bi-plus-circle me-2"></i>
                      Peminjaman
                    </Link>
                    {(user.role === 'admin' || user.role === 'petugas') && (
                      <Link to="/rentals" className="btn btn-outline-warning btn-modern">
                        <i className="bi bi-check2-square me-2"></i>
                        Review Peminjaman ({stats.pendingRentals})
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-person-badge me-2 text-info"></i>
                    Hak Akses Anda
                  </h5>
                  {user.role === 'admin' && (
                    <div className="alert alert-primary mb-0">
                      <h6 className="fw-bold mb-2">
                        <i className="bi bi-shield-check me-2"></i>
                        Administrator
                      </h6>
                      <ul className="mb-0 small">
                        <li>Kelola semua pengguna</li>
                        <li>Kelola alat musik</li>
                        <li>Approve/Reject peminjaman</li>
                        <li>Akses penuh ke sistem</li>
                      </ul>
                    </div>
                  )}

                  {user.role === 'petugas' && (
                    <div className="alert alert-success mb-0">
                      <h6 className="fw-bold mb-2">
                        <i className="bi bi-person-check me-2"></i>
                        Petugas
                      </h6>
                      <ul className="mb-0 small">
                        <li>Kelola alat musik</li>
                        <li>Approve/Reject peminjaman</li>
                        <li>Lihat semua peminjaman</li>
                      </ul>
                    </div>
                  )}

                  {user.role === 'user' && (
                    <div className="alert alert-info mb-0">
                      <h6 className="fw-bold mb-2">
                        <i className="bi bi-person me-2"></i>
                        Pengguna
                      </h6>
                      <ul className="mb-0 small">
                        <li>Lihat katalog alat musik</li>
                        <li>Ajukan peminjaman</li>
                        <li>Lihat status peminjaman</li>
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Rentals */}
          {recentRentals.length > 0 && (
            <Row className="mt-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">
                        <i className="bi bi-clock-history me-2 text-primary"></i>
                        Peminjaman Terbaru
                      </h5>
                      <Link to="/rentals" className="btn btn-sm btn-outline-primary">
                        Lihat Semua
                      </Link>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Peminjam</th>
                            <th>Alat Musik</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRentals.map(rental => (
                            <tr key={rental.id}>
                              <td>
                                <div className="fw-semibold">{rental.user?.fullName || '-'}</div>
                                <small className="text-muted">{rental.user?.username || '-'}</small>
                              </td>
                              <td>
                                <div className="fw-semibold">{rental.instrument?.name || '-'}</div>
                                <small className="text-muted">{rental.instrument?.category || '-'}</small>
                              </td>
                              <td>{getStatusBadge(rental.status)}</td>
                              <td>
                                <small className="text-muted">
                                  {new Date(rental.createdAt).toLocaleDateString('id-ID')}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
