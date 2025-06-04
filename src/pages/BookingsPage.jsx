import React, { useState, useEffect } from 'react';
import "../css/BookingsPage.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [searchGuestId, setSearchGuestId] = useState('');
  const [searchRoomId, setSearchRoomId] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [activeGuestId, setActiveGuestId] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [newBooking, setNewBooking] = useState({
    guestID: '',
    roomID: '',
    checkInDate: '',
    checkOutDate: '',
    bookingStatus: ''
  });
  const [deleteBookingId, setDeleteBookingId] = useState('');

  const [editBookingId, setEditBookingId] = useState(null);
  const [editBookingData, setEditBookingData] = useState({
    guestID: '',
    roomID: '',
    checkInDate: '',
    checkOutDate: '',
    bookingStatus: ''
  });
  const fetchBookings = async () => {
    try {
      if (activeBookingId !== null && activeBookingId !== '') {
        // Fetch single booking by ID
        const url = `http://localhost:5290/api/booking/${activeBookingId}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setBookings([data]);
          setTotalCount(1);
        } else {
          setBookings([]);
          setTotalCount(0);
        }
        return;
      }

      let url = '';
      if (activeGuestId !== null || activeRoomId !== null) {
        url = 'http://localhost:5290/api/booking/search?';
        if (activeGuestId !== null && activeGuestId !== '') url += `guestId=${activeGuestId}&`;
        if (activeRoomId !== null && activeRoomId !== '') url += `roomId=${activeRoomId}&`;
      } else {
        url = `http://localhost:5290/api/booking/paged?page=${page}&pageSize=${pageSize}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setBookings(data);
        setTotalCount(data.length);
      } else {
        setBookings(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize, activeGuestId, activeRoomId, activeBookingId]);

  const handleSearch = () => {
    setActiveGuestId(searchGuestId === '' ? null : searchGuestId);
    setActiveRoomId(searchRoomId === '' ? null : searchRoomId);
    setActiveBookingId(null); // Clear booking ID search if guest/room search is done
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchGuestId('');
    setSearchRoomId('');
    setActiveGuestId(null);
    setActiveRoomId(null);
    setActiveBookingId(null);
    setPage(1);
  };

  const handleAddBooking = async () => {
    try {
      const response = await fetch('http://localhost:5290/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (response.ok) {
        setNewBooking({
          guestID: '',
          roomID: '',
          checkInDate: '',
          checkOutDate: '',
          bookingStatus: ''
        });
        fetchBookings();
      } else {
        console.error('Failed to add booking');
      }
    } catch (error) {
      console.error('Error adding booking:', error);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!id) {
      alert('Please enter a valid Booking ID to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete booking ${id}?`)) return;

    try {
      const response = await fetch(`http://localhost:5290/api/booking/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setDeleteBookingId('');
        fetchBookings();
      } else {
        console.error('Failed to delete booking');
        alert('Failed to delete booking. Please check the Booking ID.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. See console for details.');
    }
  };

  const startEditing = (booking) => {
    setEditBookingId(booking.bookingId);
    setEditBookingData({
      guestID: booking.guestId,
      roomID: booking.roomId,
      checkInDate: booking.checkInDate.slice(0, 16), // format for input type="datetime-local"
      checkOutDate: booking.checkOutDate.slice(0, 16),
      bookingStatus: booking.bookingStatus
    });
  };

  const cancelEditing = () => {
    setEditBookingId(null);
    setEditBookingData({
      guestID: '',
      roomID: '',
      checkInDate: '',
      checkOutDate: '',
      bookingStatus: ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5290/api/booking/${editBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: editBookingId,
          guestID: Number(editBookingData.guestID),
          roomID: Number(editBookingData.roomID),
          checkInDate: new Date(editBookingData.checkInDate).toISOString(),
          checkOutDate: new Date(editBookingData.checkOutDate).toISOString(),
          bookingStatus: editBookingData.bookingStatus
        }),
      });
      if (response.ok) {
        cancelEditing();
        fetchBookings();
      } else {
        alert('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking. Check console for details.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (

    
    <div className="bookings-background">
      <div className="bookings-content">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Bookings</h1>

      {/* Add booking form */}
      <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Booking </h2>
        <input
          type="number"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          placeholder="Guest ID"
          value={newBooking.guestID}
          onChange={(e) => setNewBooking({ ...newBooking, guestID: parseInt(e.target.value) })}
        />
        <input
          type="number"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          placeholder="Room ID"
          value={newBooking.roomID}
          onChange={(e) => setNewBooking({ ...newBooking, roomID: parseInt(e.target.value) })}
        />
        <input
          type="datetime-local"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          placeholder="Check-In Date"
          value={newBooking.checkInDate}
          onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
        />
        <input
          type="datetime-local"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          placeholder="Check-Out Date"
          value={newBooking.checkOutDate}
          onChange={(e) => setNewBooking({ ...newBooking, checkOutDate: e.target.value })}
        />
        <input
          type="text"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          placeholder="Booking Status"
          value={newBooking.bookingStatus}
          onChange={(e) => setNewBooking({ ...newBooking, bookingStatus: e.target.value })} />
        <button
          style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleAddBooking}> Add Booking
        </button>
      </div>

      {/* Search inputs */}
      <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filter Booking</h2>
        <input
          type="number"
          placeholder="Guest ID"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          value={searchGuestId}
          onChange={(e) => setSearchGuestId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Room ID"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          value={searchRoomId}
          onChange={(e) => setSearchRoomId(e.target.value)}
        />
        <button
          style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#1D4ED8', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={handleClearSearch}
        >
          Clear
        </button>
      </div>
      {/* Booking ID search */}
      <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search by Booking ID</h2>
        <input
          type="number"
          placeholder="Booking ID"
          style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
          value={searchBookingId}
          onChange={(e) => setSearchBookingId(e.target.value)}
        />
        <button
          style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }}
          onClick={() => {
            setActiveBookingId(searchBookingId === '' ? null : searchBookingId);
            setActiveGuestId(null);
            setActiveRoomId(null);
            setPage(1);
          }}
        >
          Search
        </button>
        <button
          style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            setSearchBookingId('');
            setActiveBookingId(null);
            setPage(1);
          }}
        >
          Clear
        </button>
      </div>

      {/* Show Booking by ID */}
      {activeBookingId !== null && bookings.length === 1 && (
        <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Booking Details</h2>
          <p><strong>Booking ID:</strong> {bookings[0].bookingId}</p>
          <p><strong>Guest ID:</strong> {bookings[0].guestId}</p>
          <p><strong>Room ID:</strong> {bookings[0].roomId}</p>
          <p><strong>Check-In:</strong> {new Date(bookings[0].checkInDate).toLocaleString()}</p>
          <p><strong>Check-Out:</strong> {new Date(bookings[0].checkOutDate).toLocaleString()}</p>
          <p><strong>Status:</strong> {bookings[0].bookingStatus}</p>
        </div>
      )}

      {/* Delete booking by ID input and button */}
      <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Booking</h2>
        <input type="number" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} placeholder="Booking ID to Delete" value={deleteBookingId} onChange={(e) => setDeleteBookingId(e.target.value)} />

        <button style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteBooking(deleteBookingId)}> Delete </button>
      </div>

      {/* Bookings table */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid gray', width: '100%' }}>
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-400">
            <th style={{ border: '1px solid gray', padding: '8px' }}>Booking ID</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Guest ID</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Room ID</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Check-In</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Check-Out</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid gray', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '8px' }}> No bookings found. </td>
            </tr>
          )}
          {bookings.map((booking) => (
            <tr key={booking.bookingId}>
              <td style={{ border: '1px solid gray', padding: '8px' }}> {booking.bookingId}</td>

              <td style={{ border: '1px solid gray', padding: '8px' }}>{editBookingId === booking.bookingId ?
                <input type="number" value={editBookingData.guestID} onChange={(e) => handleEditChange('guestID', e.target.value)} /> : booking.guestId}
              </td>

              <td style={{ border: '1px solid gray', padding: '8px' }}> {editBookingId === booking.bookingId ?
                <input type="number" value={editBookingData.roomID} onChange={(e) => handleEditChange('roomID', e.target.value)} /> : booking.roomId}
              </td>

              <td style={{ border: '1px solid gray', padding: '8px' }}>{editBookingId === booking.bookingId ?
                <input type="datetime-local" value={editBookingData.checkInDate} onChange={(e) => handleEditChange('checkInDate', e.target.value)} /> : new Date(booking.checkInDate).toLocaleString()}
              </td>

              <td style={{ border: '1px solid gray', padding: '8px' }}>{editBookingId === booking.bookingId ?
                <input type="datetime-local" value={editBookingData.checkOutDate} onChange={(e) => handleEditChange('checkOutDate', e.target.value)} /> : new Date(booking.checkOutDate).toLocaleString()}
              </td>

              <td style={{ border: '1px solid gray', padding: '8px' }}>{editBookingId === booking.bookingId ?
                <input type="text" value={editBookingData.bookingStatus} onChange={(e) => handleEditChange('bookingStatus', e.target.value)} />
                : booking.bookingStatus}
              </td>

              <td style={{ border: '1px solid gray', padding: '8px' }}>{editBookingId === booking.bookingId ?
                <>
                  <button style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }} onClick={handleSaveEdit}>Save</button>

                  <button style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }} onClick={cancelEditing}> Cancel</button>
                </> : <>
                  <button style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }} onClick={() => startEditing(booking)}> Edit </button>
                </>
              }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* PageSize selector */}
      {activeGuestId === null && activeRoomId === null && activeBookingId === null && (
        <div className="mb-4">
          <label className="mr-2">Page Size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setPage(1);
            }}
            className="border p-2"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination controls */}
      {activeGuestId === null && activeRoomId === null && activeBookingId === null && (
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
                setPageSize(parseInt(e.target.value));
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
export default BookingsPage;