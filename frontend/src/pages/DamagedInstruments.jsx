import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRentals } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const DamagedInstruments = () => {
    const [damagedRentals, setDamagedRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { nightMode } = useTheme();

    useEffect(() => {
        fetchDamagedItems();
    }, []);

    const fetchDamagedItems = async () => {
        try {
            setLoading(true);
            // Fetch rentals that are marked as damaged (condition 'Cukup' or 'Rusak')
            const response = await getRentals({ isDamaged: 'true' });
            const data = response.data.data || response.data;
            setDamagedRentals(data);
            setError('');
        } catch (err) {
            console.error('Error fetching damaged items:', err);
            setError('Gagal memuat data barang rusak.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getConditionBadge = (condition) => {
        // Log the condition to debug why it might be missing
        console.log('Rendering condition:', condition);
        const condStr = (condition || '').trim();
        
        switch (condStr) {
            case 'Baik':
                return <Badge bg="success" className="badge-modern shadow-sm"><i className="bi bi-shield-check me-1"></i>Baik</Badge>;
            case 'Cukup':
                return <Badge bg="warning" text="dark" className="badge-modern shadow-sm"><i className="bi bi-shield-exclamation me-1"></i>Cukup</Badge>;
            case 'Rusak':
                return <Badge bg="danger" className="badge-modern shadow-sm"><i className="bi bi-shield-slash me-1"></i>Rusak</Badge>;
            default:
                return <Badge bg="secondary" className="badge-modern shadow-sm">{condStr || 'N/A'}</Badge>;
        }
    };

    return (
        <div className={`min-vh-100 d-flex flex-column ${nightMode ? 'dark-theme' : 'bg-light-gradient'}`} style={{ transition: 'all 0.3s ease' }}>
            <NavigationBar />
            
            <Container className="flex-grow-1 py-5 fade-in">
                <header className="mb-5">
                    <Row className="align-items-center">
                        <Col lg={7}>
                            <h2 className="fw-800 display-5 mb-2 gradient-text">
                                <i className="bi bi-shield-exclamation me-3"></i>
                                Riwayat Barang Rusak
                            </h2>
                            <p className="text-muted lead mb-0">
                                Laporan pemantauan alat musik yang dikembalikan dalam kondisi tidak prima. 
                                Memastikan transparansi dan pertanggungjawaban penyewa.
                            </p>
                        </Col>
                        <Col lg={5} className="text-lg-end mt-4 mt-lg-0">
                            <div className="d-flex justify-content-lg-end gap-3">
                                <div className={`glass-card p-3 text-center rounded-4 shadow-sm border ${nightMode ? 'border-primary' : 'border-light'}`} style={{ minWidth: '120px' }}>
                                    <div className="h3 fw-bold mb-0 text-danger">{damagedRentals.length}</div>
                                    <div className="small text-muted text-uppercase text-xs fw-bold">Total Laporan</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </header>

                {error && <Alert variant="danger" className="shadow-lg mb-4">{error}</Alert>}

                <Card className={`border-0 shadow-lg rounded-4 overflow-hidden ${nightMode ? 'glass-card bg-secondary text-light' : 'bg-white'}`}>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-grow text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted fw-500">Menyinkronkan data...</p>
                            </div>
                        ) : damagedRentals.length === 0 ? (
                            <div className="text-center py-5 px-3">
                                <div className="mb-4">
                                    <i className="bi bi-patch-check-fill display-1 text-success opacity-10"></i>
                                </div>
                                <h4 className="fw-bold text-muted">Katalog Terjaga dengan Baik</h4>
                                <p className="text-muted max-width-500 mx-auto">
                                    Hebat! Sejauh ini tidak ada alat musik yang dikembalikan dalam kondisi rusak. 
                                    Semua unit dalam kondisi prima.
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover borderless className={`mb-0 align-middle ${nightMode ? 'table-dark' : 'table-modern-custom'}`}>
                                    <thead className={nightMode ? 'bg-darker' : 'bg-light-soft'}>
                                        <tr className="border-bottom">
                                            <th className="px-4 py-3 text-uppercase text-xs fw-800 text-muted">Alat Musik</th>
                                            <th className="px-4 py-3 text-uppercase text-xs fw-800 text-muted">Peminjam</th>
                                            <th className="px-4 py-3 text-uppercase text-xs fw-800 text-muted">Tanggal Kembali</th>
                                            <th className="px-4 py-3 text-uppercase text-xs fw-800 text-muted">Kondisi Akhir</th>
                                            <th className="px-4 py-3 text-uppercase text-xs fw-800 text-muted">Detail Kerusakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {damagedRentals.map((rental) => (
                                            <tr key={rental.id} className="transition-all hover-scale-sm">
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary">
                                                            <i className="bi bi-music-note-beamed fs-4"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-800 text-dark-blue">{rental.instrument_name}</div>
                                                            <div className="small text-muted text-uppercase text-xs fw-bold tracking-wider">{rental.brand}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="me-3">
                                                            <div className="fw-700">{rental.full_name || rental.username}</div>
                                                            <div className="small text-muted">{rental.email || 'Email tidak tersedia'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 fw-500">
                                                    <i className="bi bi-calendar-check me-2 text-primary opacity-50"></i>
                                                    {formatDate(rental.actual_return_date)}
                                                </td>
                                                <td className="px-4">
                                                    {getConditionBadge(rental.return_condition)}
                                                </td>
                                                <td className="px-4">
                                                    <div className={`p-2 rounded-3 small border-start border-3 ${rental.damage_notes ? (nightMode ? 'bg-dark bg-opacity-50 border-danger' : 'bg-danger bg-opacity-10 border-danger') : (nightMode ? 'bg-darker border-secondary' : 'bg-light border-secondary')}`}>
                                                        {rental.damage_notes ? (
                                                            <span className="fw-500">{rental.damage_notes}</span>
                                                        ) : (
                                                            <span className="text-muted italic opacity-50">Tidak ada catatan detail</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <Footer />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .bg-light-gradient {
                    background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
                }
                .bg-light-soft {
                    background-color: #f8fafc;
                }
                .text-xs { font-size: 0.75rem; }
                .fw-800 { font-weight: 800; }
                .fw-700 { font-weight: 700; }
                .fw-500 { font-weight: 500; }
                .tracking-wider { letter-spacing: 0.05em; }
                .text-dark-blue { color: #1e293b; }
                .bg-darker { background-color: #0f172a; }
                .glass-card {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .dark-theme .glass-card {
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .hover-scale-sm {
                    transition: all 0.2s ease-in-out;
                }
                .hover-scale-sm:hover {
                    background: rgba(102, 126, 234, 0.04) !important;
                    transform: scale(1.002);
                }
                .divide-y > tr:not(:last-child) {
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .dark-theme .divide-y > tr:not(:last-child) {
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
            `}} />
        </div>
    );
};

export default DamagedInstruments;
