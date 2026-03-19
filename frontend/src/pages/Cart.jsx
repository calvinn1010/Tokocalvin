import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createBulkRentals } from '../utils/api';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const isUser = user?.role === 'user';
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [checkoutData, setCheckoutData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
    paymentMethod: 'cash'
  });

  const handleQuantityChange = (instrumentId, e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      updateQuantity(instrumentId, newQuantity);
    }
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckoutSuccess('');

    // Check if user is logged in
    if (!user || user.role !== 'user') {
      setCheckoutError('Anda harus login sebagai user untuk melakukan peminjaman. Silakan login terlebih dahulu.');
      return;
    }

    if (!checkoutData.startDate || !checkoutData.endDate) {
      setCheckoutError('Tanggal mulai dan tanggal akhir harus diisi');
      return;
    }

    const startDate = new Date(checkoutData.startDate);
    const endDate = new Date(checkoutData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setCheckoutError('Tanggal mulai harus hari ini atau di kemudian hari');
      return;
    }

    if (endDate <= startDate) {
      setCheckoutError('Tanggal akhir harus lebih besar dari tanggal mulai');
      return;
    }

    const unavailableItem = cartItems.find(item => item.stock <= 0 || item.is_available === 0 || item.is_available === false);
    if (unavailableItem) {
      setCheckoutError(`Alat musik ${unavailableItem.name} tidak tersedia. Periksa stok dan ketersediaan, lalu coba lagi.`);
      return;
    }

    setCheckoutLoading(true);

    try {
      // Create rental data for each cart item
      const rentalsToCreate = cartItems.map(item => ({
        instrumentId: item.id,
        startDate: checkoutData.startDate,
        endDate: checkoutData.endDate,
        notes: checkoutData.notes,
        paymentMethod: checkoutData.paymentMethod
      }));

      // Submit all rentals
      const response = await createBulkRentals(rentalsToCreate);
      
      console.log('[Checkout] Success:', response);
      setCheckoutSuccess('✓ Semua peminjaman berhasil dibuat!');
      
      // Clear cart after successful checkout
      setTimeout(() => {
        clearCart();
        setShowCheckoutModal(false);
        navigate('/rentals');
      }, 1500);

    } catch (error) {
      console.error('[Checkout] Error:', error);
      const reason = error?.response?.data?.message || error?.message || 'Gagal membuat peminjaman';
      setCheckoutError(reason);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="display-6 fw-bold mb-2">
                <i className="bi bi-cart-fill me-2" style={{ color: '#667eea' }}></i>
                Keranjang Peminjaman
              </h1>
              <p className="text-muted mb-0">Kelola alat musik yang ingin Anda pinjam</p>
            </div>
          </div>

          {!user && (
            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Belum Login</strong> - Anda dapat melihat keranjang, tapi harus <Link to="/login" className="alert-link">login</Link> untuk melakukan peminjaman.
            </Alert>
          )}

          {user && !isUser && (
            <Alert variant="warning" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Mode Lihat Saja</strong> - Anda adalah {user?.role}. Hanya user biasa yang dapat mengelola keranjang peminjaman.
            </Alert>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '20px' }}>🛒</div>
              <h3 className="text-muted mb-3">Keranjang Anda Masih Kosong</h3>
              <p className="text-muted mb-4">Tambahkan alat musik dari katalog untuk memulai peminjaman</p>
              <Link to="/instruments" className="btn btn-primary btn-modern">
                <i className="bi bi-plus-circle me-2"></i>
                Jelajahi Alat Musik
              </Link>
            </div>
          ) : (
            <Row className="g-4">
              <Col lg={8}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-transparent border-bottom">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-list-check me-2 text-primary"></i>
                      Items dalam Keranjang ({cartItems.length})
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-modern">
                          <tr>
                            <th>Alat Musik</th>
                            <th>Kategori</th>
                            <th>Harga/Hari</th>
                            <th>Jumlah Hari</th>
                            <th>Subtotal</th>
                            <th className="text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="fw-semibold">{item.name}</div>
                                <small className="text-muted">{item.description?.substring(0, 50)}</small>
                              </td>
                              <td>
                                <span className="badge bg-info" style={{ fontSize: '0.8rem' }}>
                                  {item.category}
                                </span>
                              </td>
                              <td className="fw-semibold text-primary">
                                Rp {(item.price_per_day || 0).toLocaleString('id-ID')}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={!isUser}
                                    style={{ padding: '2px 8px', fontSize: '0.9rem' }}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </Button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, e)}
                                    disabled={!isUser}
                                    style={{
                                      width: '45px',
                                      textAlign: 'center',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      opacity: isUser ? 1 : 0.6,
                                      cursor: isUser ? 'auto' : 'not-allowed'
                                    }}
                                    min="1"
                                  />
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={!isUser}
                                    style={{ padding: '2px 8px', fontSize: '0.9rem' }}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </Button>
                                </div>
                              </td>
                              <td className="fw-bold text-success">
                                Rp {(item.price_per_day * item.quantity).toLocaleString('id-ID')}
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  disabled={!isUser}
                                  className="btn-modern"
                                  title={isUser ? "Hapus dari keranjang" : "Hanya user dapat menghapus item"}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                <div className="mt-3">
                  <Button
                    variant="outline-danger"
                    onClick={clearCart}
                    disabled={!isUser}
                    className="btn-modern"
                  >
                    <i className="bi bi-trash-fill me-2"></i>
                    Kosongkan Keranjang
                  </Button>
                </div>
              </Col>

              <Col lg={4}>
                <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                  <Card.Header className="bg-transparent border-bottom">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-receipt me-2 text-primary"></i>
                      Ringkasan
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Items:</span>
                        <strong>{cartItems.length} item</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Hari:</span>
                        <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} hari</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between mb-3">
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total:</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#667eea' }}>
                          Rp {cartTotal.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {user && isUser ? (
                      <Button 
                        variant="primary" 
                        className="btn-modern w-100 mb-2"
                        onClick={() => setShowCheckoutModal(true)}
                      >
                        <i className="bi bi-bag-check me-2"></i>
                        Proses Peminjaman Sekarang
                      </Button>
                    ) : user && !isUser ? (
                      <Button variant="primary" disabled className="btn-modern w-100 mb-2">
                        <i className="bi bi-bag-check me-2"></i>
                        Proses Peminjaman (Hanya User)
                      </Button>
                    ) : (
                      <Link to="/login" className="btn btn-primary btn-modern w-100 mb-2">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login untuk Peminjaman
                      </Link>
                    )}

                    <Link to="/instruments" className="btn btn-outline-secondary btn-modern w-100">
                      <i className="bi bi-plus-circle me-2"></i>
                      Lanjut Berbelanja
                    </Link>

                    <Alert variant="info" className="mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      Klik "Proses Peminjaman Sekarang" untuk melanjutkan. Semua item dalam keranjang akan diminjam dengan periode yang sama.
                    </Alert>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Checkout Modal */}
      <Modal show={showCheckoutModal} onHide={() => {
        if (!checkoutLoading) setShowCheckoutModal(false);
      }} centered>
        <Modal.Header closeButton={!checkoutLoading} className="bg-gradient" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Modal.Title className="fw-bold text-white">
            <i className="bi bi-bag-check me-2"></i>
            Proses Peminjaman
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkoutError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              {checkoutError}
            </Alert>
          )}
          {checkoutSuccess && (
            <Alert variant="success" className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              {checkoutSuccess}
            </Alert>
          )}

          {!checkoutSuccess && (
            <>
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-list me-2"></i>Items yang akan dipinjam:
                </h6>
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <span>
                      <strong>{item.name}</strong>
                      <br />
                      <small className="text-muted">{item.quantity} hari × Rp {(item.price_per_day || 0).toLocaleString('id-ID')}</small>
                    </span>
                    <span className="fw-bold text-primary">Rp {(item.price_per_day * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                  <span className="fw-bold">Total Biaya:</span>
                  <span className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tanggal Mulai Peminjaman *</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={checkoutData.startDate}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tanggal Akhir Peminjaman *</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={checkoutData.endDate}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                    min={checkoutData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Metode Pembayaran</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={checkoutData.paymentMethod}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                  >
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="card">Kartu Kredit</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Catatan (Opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={checkoutData.notes}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                    placeholder="Catatan khusus untuk peminjaman..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="secondary"
            onClick={() => {
              if (!checkoutLoading) {
                setShowCheckoutModal(false);
                setCheckoutError('');
                setCheckoutSuccess('');
              }
            }}
            disabled={checkoutLoading || checkoutSuccess}
          >
            Tutup
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={checkoutLoading || checkoutSuccess}
            className="btn-modern"
          >
            {checkoutLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Memproses...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Proses Peminjaman
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default Cart;
