import React, { useState, useEffect } from 'react';
import "../css/ServicesPage.css";
const ServicesPage = () => {
  const [services, setServices] = useState([]);

  const [newService, setNewService] = useState({
    serviceName: '',
    price: '',
  });
  const [deleteServiceId, setDeleteServiceId] = useState('');
  const [fetchServiceId, setFetchServiceId] = useState('');
  const [fetchedService, setFetchedService] = useState(null);
  const [fetchError, setFetchError] = useState('');

  // NEW STATE for paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size
  const [totalCount, setTotalCount] = useState(0);

  // NEW STATES for editing
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({
    serviceName: '',
    price: '',
  });

  // Fetch all services WITH paging
  const fetchServices = async (pageToFetch = page, pageSizeToFetch = pageSize) => {
    try {
      const response = await fetch(
        `http://localhost:5290/api/servicess/paged?page=${pageToFetch}&pageSize=${pageSizeToFetch}`
      );
      const data = await response.json();

      setServices(data.items);
      setTotalCount(data.totalCount);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Add new service
  const handleAddService = async () => {
    try {
      const response = await fetch('http://localhost:5290/api/servicess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        setNewService({ serviceName: '', price: '' });
        fetchServices(1, pageSize); // reset to page 1 on new addition
      } else {
        console.error('Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  // Delete service by ID
  const handleDeleteService = async (id) => {
    if (!id) {
      alert('Please enter a valid Service ID to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete service ${id}?`)) return;

    try {
      const response = await fetch(`http://localhost:5290/api/servicess/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteServiceId('');
        if (fetchedService && fetchedService.serviceId === Number(id)) {
          setFetchedService(null);
          setFetchServiceId('');
          setFetchError('');
        }
        fetchServices(page, pageSize); // refresh current page
      } else {
        console.error('Failed to delete service');
        alert('Failed to delete service. Please check the Service ID.');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. See console for details.');
    }
  };

  // Fetch a single service by ID
  const handleFetchServiceById = async () => {
    if (!fetchServiceId) {
      setFetchedService(null);
      setFetchError('Please enter a Service ID to fetch.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5290/api/servicess/${fetchServiceId}`);

      if (response.ok) {
        const data = await response.json();
        setFetchedService(data);
        setFetchError('');
      } else if (response.status === 404) {
        setFetchedService(null);
        setFetchError('Service not found.');
      } else {
        setFetchedService(null);
        setFetchError('Error fetching service.');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setFetchedService(null);
      setFetchError('Network error while fetching service.');
    }
  };

  // Clear the fetch service input and result
  const handleClearFetch = () => {
    setFetchServiceId('');
    setFetchedService(null);
    setFetchError('');
  };

  // Handle entering edit mode on a service row
  const handleEditClick = (service) => {
    setEditServiceId(service.serviceId);
    setEditServiceData({
      serviceName: service.serviceName,
      price: service.price,
    });
  };

  // Handle changes in edit input fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditServiceData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value,
    }));
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditServiceId(null);
    setEditServiceData({ serviceName: '', price: '' });
  };

  // Save edited service to backend
  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5290/api/servicess/${editServiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: editServiceId, ...editServiceData }),
      });

      if (response.ok) {
        setEditServiceId(null);
        setEditServiceData({ serviceName: '', price: '' });
        fetchServices(page, pageSize); // refresh current page after update
      } else {
        alert('Failed to update service. Please check your input.');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service. See console for details.');
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchServices(newPage, pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
    fetchServices(1, newSize);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="services-background">
      <div className="services-content">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Services</h1>

          {/* Add Service */}
          <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Service</h2>
            <input
              className="border p-2 mr-2"
              placeholder="Service Name"
              style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
              value={newService.serviceName}
              onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 mr-2"
              placeholder="Price"
              style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: parseFloat(e.target.value) || '' })
              }
            />
            <button
              onClick={handleAddService}
              style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Add Service
            </button>
          </div>

          {/* Fetch Single Service by ID */}
          <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search Guest Services</h2>
            <input
              type="number"
              className="border p-2 mr-2"
              placeholder="Service ID to Fetch"
              style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
              value={fetchServiceId}
              onChange={(e) => setFetchServiceId(e.target.value)}
            />
            <button
              style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }}
              onClick={handleFetchServiceById}
            >
              Fetch Service
            </button>
            <button
              style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
              onClick={handleClearFetch}
            >
              Clear
            </button>
          </div>

          {fetchError && <p className="text-red-600 mt-2">{fetchError}</p>}

          {fetchedService && (
            <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid gray', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Fetched Service Details</h2>
              <p><strong>ID:</strong> {fetchedService.serviceId}</p>
              <p><strong>Name:</strong> {fetchedService.serviceName}</p>
              <p><strong>Price:</strong> ${parseFloat(fetchedService.price).toFixed(2)}</p>
            </div>
          )}


          {/* Delete Service */}
          <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Service</h2>
            <input
              type="number"
              className="border p-2 mr-2"
              placeholder="Service ID to Delete"
              style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
              value={deleteServiceId}
              onChange={(e) => setDeleteServiceId(e.target.value)}
            />
            <button
              style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }}
              onClick={() => handleDeleteService(deleteServiceId)}
            >
              Delete Service by ID
            </button>
          </div>

          {/* Table of all services */}
          <table style={{ borderCollapse: 'collapse', border: '1px solid gray', width: '100%' }}>
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-400">
                <th style={{ border: '1px solid gray', padding: '8px' }}>Service ID</th>
                <th style={{ border: '1px solid gray', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid gray', padding: '8px' }}>Price</th>
                <th style={{ border: '1px solid gray', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.serviceId}>
                  <td style={{ border: '1px solid gray', padding: '8px' }}>{service.serviceId}</td>
                  <td style={{ border: '1px solid gray', padding: '8px' }}>
                    {editServiceId === service.serviceId ? (
                      <input
                        type="text"
                        name="serviceName"
                        value={editServiceData.serviceName}
                        onChange={handleEditChange}
                      />
                    ) : (
                      service.serviceName
                    )}
                  </td>
                  <td style={{ border: '1px solid gray', padding: '8px' }}>
                    {editServiceId === service.serviceId ? (
                      <input
                        type="number"
                        name="price"
                        value={editServiceData.price}
                        onChange={handleEditChange}
                      />
                    ) : (
                      `$${parseFloat(service.price).toFixed(2)}`
                    )}
                  </td>
                  <td style={{ border: '1px solid gray', padding: '8px' }}>
                    {editServiceId === service.serviceId ?
                      <>
                        <button
                          style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          onClick={handleEditSave}
                        >
                          Save
                        </button>
                        <button
                          style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </>
                      :
                      <>
                        <button
                          style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          onClick={() => handleEditClick(service)}
                        >
                          Edit
                        </button>
                      </>
                    }
                  </td>
                </tr>
              ))}

              {services.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '12px' }}>
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div>
              Page {page} of {totalPages} ({totalCount} items)
            </div>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
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
                onClick={() => goToPage(page + 1)}
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

export default ServicesPage;