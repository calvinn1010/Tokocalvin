import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge, ButtonGroup } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getInstruments, createInstrument, updateInstrument, deleteInstrument, getCategories } from '../utils/api';
import Footer from '../components/Footer';

const Instruments = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [instruments, setInstruments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addToCartSuccess, setAddToCartSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    condition: 'Baik',
    stock: '',
    description: '',
    price_per_day: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const { nightMode, setNightMode } = useTheme();

  useEffect(() => {
    loadInstruments();
    loadCategories();
  }, []);

  useEffect(() => {
    filterInstruments();
  }, [instruments, selectedCategory, searchQuery]);

  const loadInstruments = async () => {
    try {
      const response = await getInstruments();
      setInstruments(response.data);
    } catch (error) {
      setError('Gagal memuat data alat musik');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Gagal memuat kategori');
    }
  };

  const filterInstruments = () => {
    let filtered = instruments;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredInstruments(filtered);
  };

  const handleShowModal = (instrument = null) => {
    if (instrument) {
      setEditingId(instrument.id);
      setFormData({
        name: instrument.name,
        category_id: instrument.category_id || '',
        condition: instrument.condition,
        stock: instrument.stock,
        description: instrument.description || '',
        price_per_day: instrument.price_per_day || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category_id: '',
        condition: 'Baik',
        stock: '',
        description: '',
        price_per_day: ''
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('condition', formData.condition);
      data.append('stock', formData.stock);
      data.append('description', formData.description);
      data.append('price_per_day', formData.price_per_day);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await updateInstrument(editingId, data);
        setSuccess('Alat musik berhasil diupdate');
      } else {
        await createInstrument(data);
        setSuccess('Alat musik berhasil ditambahkan');
      }

      handleCloseModal();
      loadInstruments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus alat musik ini?')) {
      try {
        await deleteInstrument(id);
        setSuccess('Alat musik berhasil dihapus');
        loadInstruments();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus alat musik');
      }
    }
  };

  const handleAddToCart = (instrument) => {
    addToCart(instrument);
    setAddToCartSuccess(`${instrument.name} ditambahkan ke keranjang!`);
    setTimeout(() => setAddToCartSuccess(''), 3000);
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge bg="danger" className="badge-modern">Habis</Badge>;
    } else if (stock <= 2) {
      return <Badge bg="warning" text="dark" className="badge-modern">Terbatas</Badge>;
    } else {
      return <Badge bg="success" className="badge-modern">Tersedia</Badge>;
    }
  };

  const getConditionBadge = (condition) => {
    const conditionMap = {
      'Baik': 'success',
      'Cukup': 'warning',
      'Rusak': 'danger'
    };
    return <Badge bg={conditionMap[condition] || 'secondary'} className="badge-modern">{condition}</Badge>;
  };

  const getInstrumentIcon = (instrumentName) => {
    const name = (instrumentName || '').toLowerCase();
    if (name.includes('gitar') || name.includes('guitar')) return '🎸';
    if (name.includes('drum')) return '🥁';
    if (name.includes('biola') || name.includes('violin')) return '🎻';
    if (name.includes('piano') || name.includes('keyboard')) return '🎹';
    if (name.includes('sax') || name.includes('saksofon')) return '🎷';
    if (name.includes('flute') || name.includes('seruling')) return '🎶';
    if (name.includes('headphone') || name.includes('headphones')) return '🎧';
    if (name.includes('speaker') || name.includes('monitor') || name.includes('subwoofer')) return '🔊';
    return '🎵';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6c757d';
  };

  const canEdit = user.role === 'admin' || user.role === 'petugas';
  const isUser = user.role === 'user';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar />
      <div style={{ flex: 1 }}>
        <Container fluid className="px-4 fade-in">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #2a2d6f 0%, #423f84 100%)', color: 'white' }}>
          <div>
            <div className="mb-2">
              <span className="badge bg-light text-dark fw-bold" style={{ borderRadius: '999px', padding: '0.35rem 0.9rem' }}>NEW</span>
            </div>
            <h1 className="display-6 fw-bold" style={{ letterSpacing: '-0.5px' }}>🎸 Katalog Alat Musik Profesional</h1>
            <p className="mb-0" style={{ opacity: 0.9 }}>Sewa instrumen berkualitas dan peralatan studio lengkap untuk setiap musisi.</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-light" className="btn-modern fw-semibold" onClick={() => setNightMode(prev => !prev)}>
              <i className={`bi ${nightMode ? 'bi-sun-fill' : 'bi-moon-fill'} me-1`} />
              {nightMode ? 'Day' : 'Night'}
            </Button>
            <Button variant="light" className="btn-modern fw-semibold" onClick={() => setViewMode('grid')} style={{ color: '#2b3a67' }}>
              <i className="bi bi-grid-3x3-gap me-1"></i> Grid
            </Button>
            <Button variant="outline-light" className="btn-modern fw-semibold" onClick={() => setViewMode('table')}>
              <i className="bi bi-list-ul me-1"></i> Tabel
            </Button>
            {canEdit && (
              <Button
                variant="warning"
                onClick={() => handleShowModal()}
                className="btn-modern fw-semibold"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Tambah Alat
              </Button>
            )}
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
        {addToCartSuccess && <Alert variant="info" dismissible onClose={() => setAddToCartSuccess('')}><i className="bi bi-check-circle me-2"></i>{addToCartSuccess}</Alert>}

        <Card className="border-0 shadow-sm mb-4 card-gradient">
          <Card.Body>
            <Row className="align-items-center g-3">
              <Col md={5}>
                <div className="position-relative">
                  <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
                  <Form.Control
                    type="text"
                    placeholder="Cari alat musik..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-5"
                    style={{ borderRadius: '14px', background: '#f7f8ff', borderColor: '#dde4ff', height: '45px' }}
                  />
                </div>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: '14px', background: '#f7f8ff', borderColor: '#dde4ff', height: '45px', fontWeight: 600 }}
                >
                  <option value="all">🎵 Semua Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <ButtonGroup className="w-100">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('table')}
                  >
                    <i className="bi bi-list-ul"></i>
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="mb-5">
          <h5 className="fw-bold mb-3">Kategori Populer</h5>
          <Row className="g-3">
            {categories.slice(0, 4).map(category => {
              const count = instruments.filter(i => i.category === category.name).length;
              return (
                <Col key={category.id} md={3} sm={6}>
                  <Card
                    className="category-card border-0 shadow-sm h-100"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}40 100%)`
                    }}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <Card.Body className="text-center py-4">
                      <div style={{ fontSize: '3rem' }}>{category.icon}</div>
                      <h6 className="fw-bold mt-2 mb-1">{category.name}</h6>
                      <small className="text-muted">{count} Alat</small>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {viewMode === 'grid' ? (
          <Row className="g-4">
            {filteredInstruments.length === 0 ? (
              <Col xs={12}>
                <Card className="border-0 shadow-sm text-center py-5">
                  <Card.Body>
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>🎵</div>
                    <h5 className="text-muted mt-3">Tidak ada alat musik</h5>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              filteredInstruments.map((instrument) => (
                <Col key={instrument.id} lg={3} md={4} sm={6}>
                  <Card className="instrument-card border-0 shadow-sm h-100">
                    <div
                      className="p-4 text-center"
                      style={{
                        background: `linear-gradient(135deg, ${getCategoryColor(instrument.category)}20 0%, ${getCategoryColor(instrument.category)}40 100%)`,
                        minHeight: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ fontSize: '3.8rem', lineHeight: 1 }}>
                        {getInstrumentIcon(instrument.name)}
                      </div>
                    </div>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge
                          style={{ backgroundColor: getCategoryColor(instrument.category) }}
                          className="badge-modern"
                        >
                          {instrument.category}
                        </Badge>
                        {getStockBadge(instrument.stock)}
                      </div>
                      <div className="d-flex gap-2 flex-wrap mb-2">
                        <Badge bg="info" className="badge-modern">{instrument.condition}</Badge>
                        <Badge bg="secondary" className="badge-modern">Stock: {instrument.stock}</Badge>
                      </div>
                      <h5 className="fw-bold mb-2">{instrument.name}</h5>
                      <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                        {instrument.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <small className="text-muted d-block">Kondisi</small>
                          {getConditionBadge(instrument.condition)}
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block">Stok</small>
                          <span className="fw-bold">{instrument.stock}</span>
                        </div>
                      </div>
                      {instrument.price && (
                        <div className="mb-3">
                          <small className="text-muted">Harga Sewa/Hari</small>
                          <h6 className="fw-bold text-primary mb-0">
                            Rp {parseInt(instrument.price).toLocaleString('id-ID')}
                          </h6>
                        </div>
                      )}
                      <div className="d-grid gap-2">
                        {isUser && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleAddToCart(instrument)}
                            disabled={instrument.stock === 0 || instrument.is_available === 0 || instrument.is_available === false}
                            className="btn-modern"
                          >
                            <i className="bi bi-cart-plus me-2"></i>Tambah ke Keranjang
                          </Button>
                        )}
                        {!isUser && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="btn-modern"
                            title="Hanya user yang dapat menambah ke keranjang"
                          >
                            <i className="bi bi-eye me-2"></i>Lihat Saja (Admin/Petugas)
                          </Button>
                        )}
                        {canEdit && (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(instrument)}
                            >
                              <i className="bi bi-pencil me-2"></i>Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(instrument.id)}
                            >
                              <i className="bi bi-trash me-2"></i>Hapus
                            </Button>
                          </>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-modern">
                    <tr>
                      <th>Alat Musik</th>
                      <th>Kategori</th>
                      <th>Kondisi</th>
                      <th>Stok</th>
                      <th>Harga</th>
                      {canEdit && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstruments.map((instrument) => (
                      <tr key={instrument.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3" style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: '#f5f5f5', display: 'grid', placeItems: 'center', fontSize: '1.7rem' }}>
                              {getInstrumentIcon(instrument.name)}
                            </div>
                            <div>
                              <div className="fw-bold">{instrument.name}</div>
                              <small className="text-muted">{instrument.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            style={{ backgroundColor: getCategoryColor(instrument.category) }}
                          >
                            {instrument.category}
                          </Badge>
                        </td>
                        <td>{getConditionBadge(instrument.condition)}</td>
                        <td>{getStockBadge(instrument.stock)} <span className="ms-2">{instrument.stock}</span></td>
                        <td>
                          {instrument.price ?
                            `Rp ${parseInt(instrument.price).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td>
                          {isUser && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleAddToCart(instrument)}
                              disabled={instrument.stock === 0}
                              className="btn-modern me-2"
                            >
                              <i className="bi bi-cart-plus me-1"></i>Keranjang
                            </Button>
                          )}
                          {!isUser && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                              className="btn-modern me-2"
                              title="Hanya user yang dapat menambah ke keranjang"
                            >
                              <i className="bi bi-eye me-1"></i>Lihat
                            </Button>
                          )}
                          {canEdit && (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleShowModal(instrument)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(instrument.id)}
                              >
                                Hapus
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" className="modal-modern">
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit' : 'Tambah'} Alat Musik</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit} className="form-modern">
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Nama *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Kategori *</Form.Label>
                    <Form.Select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Kondisi *</Form.Label>
                    <Form.Select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Rusak">Rusak</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Stok *</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Harga/Hari</Form.Label>
                    <Form.Control
                      type="number"
                      name="price_per_day"
                      value={formData.price_per_day}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Deskripsi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-semibold">Gambar</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
              <Button variant="primary" type="submit">{editingId ? 'Update' : 'Simpan'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Instruments;
