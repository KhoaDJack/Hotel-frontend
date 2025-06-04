import React, { useState, useEffect } from 'react';
import "../css/GuestsPage.css";
const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [searchLastName, setSearchLastName] = useState('');
  const [activeLastName, setActiveLastName] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [editGuestId, setEditGuestId] = useState(null);
  const [editGuestData, setEditGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [deleteGuestId, setDeleteGuestId] = useState('');
  const [guestIdToFetch, setGuestIdToFetch] = useState('');
  const [singleGuest, setSingleGuest] = useState(null);
  const [singleGuestError, setSingleGuestError] = useState(null);

  const fetchGuests = async () => {
    try {
      let url = '';
      if (activeLastName !== null && activeLastName !== '') {
        url = `http://localhost:5290/api/guest/search?lastName=${encodeURIComponent(activeLastName)}`;
      } else {
        url = `http://localhost:5290/api/guest/paged?page=${page}&pageSize=${pageSize}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setGuests(data);
        setTotalCount(data.length);
      } else {
        setGuests(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [page, pageSize, activeLastName]);

  const handleSearch = () => {
    setActiveLastName(searchLastName === '' ? null : searchLastName);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchLastName('');
    setActiveLastName(null);
    setPage(1);
  };

  const handleAddGuest = async () => {
    try {
      const response = await fetch('http://localhost:5290/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest),
      });
      if (response.ok) {
        setNewGuest({ firstName: '', lastName: '', email: '', phone: '' });
        fetchGuests();
      } else {
        alert('Failed to add guest.');
      }
    } catch (error) {
      alert('Error adding guest.');
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!id) {
      alert('Please enter a valid Guest ID to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete guest ${id}?`)) return;
    try {
      const response = await fetch(`http://localhost:5290/api/guest/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        if (deleteGuestId === id.toString()) setDeleteGuestId('');
        fetchGuests();
      } else {
        alert('Failed to delete guest. Please check the Guest ID.');
      }
    } catch {
      alert('Error deleting guest.');
    }
  };

  const fetchGuestById = async () => {
    setSingleGuest(null);
    setSingleGuestError(null);
    if (!guestIdToFetch || isNaN(guestIdToFetch) || guestIdToFetch <= 0) {
      setSingleGuestError('Please enter a valid Guest ID.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5290/api/guest/${guestIdToFetch}`);
      if (response.ok) {
        const guest = await response.json();
        if (guest) setSingleGuest(guest);
        else setSingleGuestError('Guest not found.');
      } else if (response.status === 404) {
        setSingleGuestError('Guest not found.');
      } else {
        setSingleGuestError('Failed to fetch guest.');
      }
    } catch {
      setSingleGuestError('Error fetching guest.');
    }
  };

  const handleEditClick = (guest) => {
    setEditGuestId(guest.guestId);
    setEditGuestData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
    });
  };

  const handleCancelEdit = () => {
    setEditGuestId(null);
    setEditGuestData({ firstName: '', lastName: '', email: '', phone: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditGuestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (guestId) => {
    try {
      const updatedGuest = { guestId, ...editGuestData, };
      const response = await fetch(`http://localhost:5290/api/guest/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGuest),
      });
      if (response.ok) {
        setEditGuestId(null);
        fetchGuests();
      } else {
        alert('Failed to update guest.');
      }
    } catch {
      alert('Error updating guest.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="guests-background">
      <div className="guests-content">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Guests</h1>

        {/* Add guest */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Guest</h2>
          <input
            type="text"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="First Name"
            value={newGuest.firstName}
            onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
          />
          <input
            type="text"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Last Name"
            value={newGuest.lastName}
            onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
          />
          <input
            type="email"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Email"
            value={newGuest.email}
            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
          />
          <input
            type="tel"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Phone"
            value={newGuest.phone}
            onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
          />
          <button style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleAddGuest}>
            Add Guest
          </button>
        </div>

        {/* Search by Last Name */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filter Guest</h2>
          <input
            type="text"
            placeholder="Search by Last Name"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={searchLastName}
            onChange={(e) => setSearchLastName(e.target.value)}
          />
          <button style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#1D4ED8', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleSearch}>
            Search
          </button>
          <button style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleClearSearch}>
            Clear
          </button>
        </div>

        {/* Fetch Guest By ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Fetch Guest by ID</h2>
          <input
            type="number"
            placeholder="Enter Guest ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={guestIdToFetch}
            onChange={(e) => setGuestIdToFetch(e.target.value)}
          />
          <button style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }} onClick={fetchGuestById}>
            Fetch Guest
          </button>

          <button
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              setGuestIdToFetch('');
              setSingleGuest(null);
              setSingleGuestError(null);
            }}
          >
            Clear
          </button>
        </div>


        {singleGuest && (
          <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Guest Details:</h2>
            <p><strong>ID:</strong> {singleGuest.guestId}</p>
            <p><strong>First Name:</strong> {singleGuest.firstName}</p>
            <p><strong>Last Name:</strong> {singleGuest.lastName}</p>
            <p><strong>Email:</strong> {singleGuest.email}</p>
            <p><strong>Phone:</strong> {singleGuest.phone}</p>
          </div>
        )}

        {singleGuestError && <p className="mt-4 text-red-600 font-semibold">{singleGuestError}</p>}


        {/* Delete Guest By ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Guest </h2>
          <input
            type="number"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Guest ID to Delete"
            value={deleteGuestId}
            onChange={(e) => setDeleteGuestId(e.target.value)}
          />
          <button
            style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => handleDeleteGuest(deleteGuestId)}
          >
            Delete Guest by ID
          </button>
        </div>


        {/* Guests table */}
        <table style={{ borderCollapse: 'collapse', border: '1px solid gray', width: '100%' }}>
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th style={{ border: '1px solid gray', padding: '8px' }}>Guest ID</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>First Name</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Last Name</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Email</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Phone</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.guestId}>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{guest.guestId}</td>

                {/* Editable fields */}
                {editGuestId === guest.guestId ? (
                  <>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="text"
                        name="firstName"
                        value={editGuestData.firstName}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="text"
                        name="lastName"
                        value={editGuestData.lastName}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="email"
                        name="email"
                        value={editGuestData.email}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="tel"
                        name="phone"
                        value={editGuestData.phone}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{guest.firstName}</td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{guest.lastName}</td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{guest.email}</td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{guest.phone}</td>
                  </>
                )}

                <td style={{ border: '1px solid gray', padding: '8px' }}>
                  {editGuestId === guest.guestId ? (
                    <>
                      <button
                        style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={() => handleSaveEdit(guest.guestId)}
                      >
                        Save
                      </button>
                      <button
                        style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      onClick={() => handleEditClick(guest)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '8px' }}>
                  No guests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination and pageSize selector if no search */}
        {activeLastName === null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div>
              Page {page} of {totalPages} ({totalCount} items)
            </div>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
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
                onClick={() => setPage(page + 1)}
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
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(1);
                }}
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
        )}
      </div>
    </div>
  );
};

export default GuestsPage;
