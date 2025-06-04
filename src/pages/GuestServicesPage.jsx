import React, { useState, useEffect } from 'react';
import "../css/GuestServicesPage.css";
const GuestServicesPage = () => {
  const [guestServices, setGuestServices] = useState([]);
  const [filters, setFilters] = useState({ bookingId: '', serviceId: '' });
  const [newGuestService, setNewGuestService] = useState({
    bookingId: '',
    serviceId: '',
    quantity: ''
  });
  const [deleteGuestServiceId, setDeleteGuestServiceId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [guestServiceById, setGuestServiceById] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    bookingId: '',
    serviceId: '',
    quantity: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const fetchGuestServices = async (bookingId, serviceId, pageNumber = page, size = pageSize) => {
    try {
      let query = [];
      if (bookingId) query.push(`bookingId=${bookingId}`);
      if (serviceId) query.push(`serviceId=${serviceId}`);
      query.push(`page=${pageNumber}`);
      query.push(`pageSize=${size}`);

      const queryString = `?${query.join('&')}`;

      const response = await fetch(`http://localhost:5290/api/guestservice/paged${queryString}`);
      const data = await response.json();

      setGuestServices(data.items || []);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || pageNumber);
      setPageSize(data.pageSize || size);
    } catch (error) {
      console.error('Error fetching guest services:', error);
    }
  };
  const fetchGuestServicesBySearch = async (bookingId, serviceId) => {
    try {
      let query = [];
      if (bookingId) query.push(`bookingId=${bookingId}`);
      if (serviceId) query.push(`serviceId=${serviceId}`);

      const queryString = query.length ? `?${query.join('&')}` : '';

      const response = await fetch(`http://localhost:5290/api/guestservice/search${queryString}`);
      const data = await response.json();

      setGuestServices(data || []);
      setTotalCount(data.length || 0);
      setPage(1); // reset pagination on search
      setPageSize(10);
    } catch (error) {
      console.error('Error fetching guest services by search:', error);
    }
  };

  const fetchGuestServiceById = async () => {
    if (!searchId) {
      alert('Please enter a Guest Service ID to search.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5290/api/guestservice/${searchId}`);
      if (response.ok) {
        const data = await response.json();
        setGuestServiceById(data);
      } else {
        alert('Guest Service not found.');
        setGuestServiceById(null);
      }
    } catch (error) {
      console.error('Error fetching guest service by ID:', error);
      alert('Error fetching guest service. See console for details.');
      setGuestServiceById(null);
    }
  };

  const handleSearch = () => {
    fetchGuestServicesBySearch(filters.bookingId, filters.serviceId);
  };

  const handleClear = () => {
    setFilters({ bookingId: '', serviceId: '' });
    setPage(1);
    fetchGuestServices('', '', 1, pageSize);
  };

  const handleAddGuestService = async () => {
    try {
      const response = await fetch('http://localhost:5290/api/guestservice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuestService),
      });

      if (response.ok) {
        setNewGuestService({ bookingId: '', serviceId: '', quantity: '' });
        fetchGuestServices(filters.bookingId, filters.serviceId, page, pageSize);
      } else {
        console.error('Failed to add guest service');
      }
    } catch (error) {
      console.error('Error adding guest service:', error);
    }
  };

  const handleDeleteGuestService = async (id) => {
    if (!id) {
      alert('Please enter a valid Guest Service ID to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete guest service ${id}?`)) return;
    try {
      const response = await fetch(`http://localhost:5290/api/guestservice/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteGuestServiceId('');
        fetchGuestServices(filters.bookingId, filters.serviceId, page, pageSize);
      } else {
        console.error('Failed to delete guest service');
        alert('Failed to delete guest service. Please check the ID.');
      }
    } catch (error) {
      console.error('Error deleting guest service:', error);
      alert('Error deleting guest service. See console for details.');
    }
  };

  const handleEditClick = (gs) => {
    setEditingId(gs.guestServiceId);
    setEditFormData({
      bookingId: gs.bookingId,
      serviceId: gs.serviceId,
      quantity: gs.quantity
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({ bookingId: '', serviceId: '', quantity: '' });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'bookingId' || name === 'serviceId' ? parseInt(value) || '' : value
    }));
  };

  const handleSaveClick = async () => {
    try {
      const updatedGuestService = {
        guestServiceId: editingId,
        bookingId: editFormData.bookingId,
        serviceId: editFormData.serviceId,
        quantity: editFormData.quantity
      };

      const response = await fetch(`http://localhost:5290/api/guestservice/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGuestService),
      });

      if (response.ok) {
        setEditingId(null);
        setEditFormData({ bookingId: '', serviceId: '', quantity: '' });
        fetchGuestServices(filters.bookingId, filters.serviceId, page, pageSize);
      } else {
        alert('Failed to update guest service');
      }
    } catch (error) {
      console.error('Error updating guest service:', error);
      alert('Error updating guest service. See console for details.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchGuestServices(filters.bookingId, filters.serviceId, newPage, pageSize);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
    fetchGuestServices(filters.bookingId, filters.serviceId, 1, newSize);
  };

  useEffect(() => {
    fetchGuestServices(filters.bookingId, filters.serviceId, page, pageSize);
  }, []);

  const cellStyle = { border: '1px solid gray', padding: '8px' };
  const headerStyle = { ...cellStyle, backgroundColor: '#eee' };

  return (
    <div className="guestservices-background">
      <div className="guestservices-content">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Guest Services</h1>

        {/* Add new GuestService */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Guest Service</h2>
          <input
            type="number"
            placeholder="Booking ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={newGuestService.bookingId}
            onChange={(e) => setNewGuestService({ ...newGuestService, bookingId: e.target.value })}
          />
          <input
            type="number"
            placeholder="Service ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={newGuestService.serviceId}
            onChange={(e) => setNewGuestService({ ...newGuestService, serviceId: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={newGuestService.quantity}
            onChange={(e) => setNewGuestService({ ...newGuestService, quantity: e.target.value })}
          />
          <button
            onClick={handleAddGuestService}
            style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filter Guest Services</h2>
          <input
            type="number"
            placeholder="Booking ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={filters.bookingId}
            onChange={(e) => setFilters({ ...filters, bookingId: e.target.value })}
          />
          <input
            type="number"
            placeholder="Service ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={filters.serviceId}
            onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
          />
          <button
            onClick={handleSearch}
            style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#1D4ED8', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Search
          </button>
          <button
            onClick={handleClear}
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>

        {/* Search by ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search by GuestService ID</h2>
          <input
            type="number"
            placeholder="GuestService ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            onClick={fetchGuestServiceById}
            style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }}
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchId('');
              setGuestServiceById(null);
            }}
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>

        {/* Show GuestService by ID */}
        {guestServiceById && (
          <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search Guest Service</h2>
            <p><b>ID:</b> {guestServiceById.guestServiceId}</p>
            <p><b>Booking ID:</b> {guestServiceById.bookingId}</p>
            <p><b>Service ID:</b> {guestServiceById.serviceId}</p>
            <p><b>Quantity:</b> {guestServiceById.quantity}</p>
          </div>
        )}

        {/* Delete GuestService */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Guest Service</h2>
          <input
            type="number"
            placeholder="GuestService ID to delete"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={deleteGuestServiceId}
            onChange={(e) => setDeleteGuestServiceId(e.target.value)}
          />
          <button
            onClick={() => handleDeleteGuestService(deleteGuestServiceId)}
            style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>

        {/* GuestServices Table */}
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={headerStyle}>GuestServiceId</th>
              <th style={headerStyle}>BookingId</th>
              <th style={headerStyle}>ServiceId</th>
              <th style={headerStyle}>Quantity</th>
              <th style={headerStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guestServices.map((gs) => (
              <tr key={gs.guestServiceId}>
                <td style={cellStyle}>{gs.guestServiceId}</td>
                {editingId === gs.guestServiceId ? (
                  <>
                    <td style={cellStyle}>
                      <input
                        type="number"
                        name="bookingId"
                        value={editFormData.bookingId}
                        onChange={handleEditFormChange}
                        style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        type="number"
                        name="serviceId"
                        value={editFormData.serviceId}
                        onChange={handleEditFormChange}
                        style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        type="number"
                        name="quantity"
                        value={editFormData.quantity}
                        onChange={handleEditFormChange}
                        style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={handleSaveClick}
                        style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelClick}
                        style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={cellStyle}>{gs.bookingId}</td>
                    <td style={cellStyle}>{gs.serviceId}</td>
                    <td style={cellStyle}>{gs.quantity}</td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleEditClick(gs)}
                        style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Page {page} of {totalPages} ({totalCount} items)
          </div>
          <div>
            <button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              style={{
                padding: '6px 12px',
                marginRight: '8px',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1
              }}
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              style={{
                padding: '6px 12px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
          <div>
            <label htmlFor="pageSizeSelect" style={{ marginRight: '8px' }}>Page Size:</label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ padding: '6px' }}
            >
              {[5, 10, 20, 50].map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GuestServicesPage;
