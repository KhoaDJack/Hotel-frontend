import React, { useState, useEffect } from 'react';
import "../css/RoomsPage.css";
const RoomsPage = () => {
  // Existing states for paged/search rooms list
  const [rooms, setRooms] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [searchByIdInput, setSearchByIdInput] = useState('');
  const [roomById, setRoomById] = useState(null);

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    capacity: '',
    pricePerNight: '',
    roomType: '',
    avatar: null,
  });
  const [deleteRoomId, setDeleteRoomId] = useState('');

  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomData, setEditRoomData] = useState({
    roomNumber: '',
    capacity: '',
    pricePerNight: '',
    roomType: '',
    avatar: null,
  });

  const fetchRooms = async () => {
    try {
      let url = `http://localhost:5290/api/room/paged?page=${page}&pageSize=${pageSize}`;
      if (searchQuery.trim() !== '') {
        url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.items && data.totalCount !== undefined) {
        setRooms(data.items);
        setTotalCount(data.totalCount);
      } else if (Array.isArray(data)) {
        setRooms(data);
        setTotalCount(data.length);
      } else {
        setRooms([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchRoomById = async () => {
    if (!searchByIdInput) {
      alert('Please enter a valid Room ID');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5290/api/room/${searchByIdInput}`);
      if (response.ok) {
        const data = await response.json();
        setRoomById(data);
      } else if (response.status === 404) {
        alert('Room not found');
        setRoomById(null);
      } else {
        alert('Error fetching room by ID');
        setRoomById(null);
      }
    } catch (error) {
      console.error('Error fetching room by ID:', error);
      alert('Error fetching room by ID');
      setRoomById(null);
    }
  };

  const clearFetchById = () => {
    setSearchByIdInput('');
    setRoomById(null);
  };

  useEffect(() => {
    fetchRooms();
  }, [page, pageSize, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleAddRoom = async () => {
    try {
      const formData = new FormData();
      formData.append('RoomNumber', newRoom.roomNumber);
      formData.append('Capacity', newRoom.capacity);
      formData.append('PricePerNight', newRoom.pricePerNight);
      formData.append('RoomType', newRoom.roomType);
      if (newRoom.avatar) {
        formData.append('Avatar', newRoom.avatar);
      }
      const response = await fetch('http://localhost:5290/api/room', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setNewRoom({
          roomNumber: '',
          capacity: '',
          pricePerNight: '',
          roomType: '',
          avatar: null,
        });
        fetchRooms();
      } else {
        const errorText = await response.text();
        console.error('Failed to add room:', errorText);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!id) {
      alert('Please enter a valid Room ID to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete room ${id}?`)) return;
    try {
      const response = await fetch(`http://localhost:5290/api/room/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteRoomId('');
        fetchRooms();
      } else {
        console.error('Failed to delete room');
        alert('Failed to delete room. Please check the Room ID.');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room. See console for details.');
    }
  };
  // Handle edit button click - load room data into edit form
  const handleEditClick = (room) => {
    setEditRoomId(room.roomId ?? room.RoomID);
    setEditRoomData({
      roomNumber: room.roomNumber ?? room.RoomNumber,
      capacity: room.capacity ?? room.Capacity,
      pricePerNight: room.pricePerNight ?? room.PricePerNight,
      roomType: room.roomType ?? room.RoomType,
      avatar: null,
    });
  };
  // Handle changes in edit form fields
  const handleEditChange = (field, value) => {
    setEditRoomData(prev => ({ ...prev, [field]: value }));
  };
  // Save updated room via PUT request
  const handleUpdateRoom = async () => {
    if (!editRoomId) return;
    try {
      const formData = new FormData();
      formData.append('RoomId', editRoomId);
      formData.append('RoomNumber', editRoomData.roomNumber);
      formData.append('Capacity', editRoomData.capacity);
      formData.append('PricePerNight', editRoomData.pricePerNight);
      formData.append('RoomType', editRoomData.roomType);
      if (editRoomData.avatar) {
        formData.append('Avatar', editRoomData.avatar);
      }
      const response = await fetch(`http://localhost:5290/api/room/${editRoomId}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        setEditRoomId(null);
        setEditRoomData({
          roomNumber: '',
          capacity: '',
          pricePerNight: '',
          roomType: '',
          avatar: null,
        });
        fetchRooms();
      } else {
        const errorText = await response.text();
        console.error('Failed to update room:', errorText);
        alert('Failed to update room.');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Error updating room.');
    }
  };
  const cancelEdit = () => {
    setEditRoomId(null);
    setEditRoomData({
      roomNumber: '',
      capacity: '',
      pricePerNight: '',
      roomType: '',
      avatar: null,
    });
  };
  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <div className="rooms-background">
      <div className="rooms-content">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Rooms</h1>

        {/* Add room form */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Room</h2>
          <input type="text" placeholder="Room Number" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={newRoom.roomNumber} onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })} />

          <input type="number" placeholder="Capacity" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} min={1} />

          <input type="number" placeholder="Price Per Night" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={newRoom.pricePerNight} onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })} min={0} step="0.01" />

          <input type="text" placeholder="Room Type" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={newRoom.roomType} onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })} />

          <input type="file" accept="image/*" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} onChange={(e) => setNewRoom({ ...newRoom, avatar: e.target.files[0] })} />

          <button style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleAddRoom}> Add Room </button>
        </div>

        {/* Search bar for paged rooms */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filter Room</h2>
          <input type="text" placeholder="Search by Room Number or Room Type" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />

          <button style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#1D4ED8', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleSearch}> Search </button>

          <button style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handleClearSearch}> Clear </button>
        </div>

        {/*Fetch Room by ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search by Room ID</h2>
          <input type="number" placeholder="Fetch Room by ID" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={searchByIdInput} onChange={(e) => setSearchByIdInput(e.target.value)} />

          <button style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }} onClick={fetchRoomById}>Fetch </button>

          <button style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }} onClick={clearFetchById}>Clear</button>
        </div>

        {/* Display fetched Room by ID */}
        {roomById && (
          <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Fetched Room Details </h2>
            <p><strong>Room Number:</strong> {roomById.roomNumber ?? roomById.RoomNumber}</p>
            <p><strong>Capacity:</strong> {roomById.capacity ?? roomById.Capacity}</p>
            <p><strong>Price Per Night:</strong> ${roomById.pricePerNight ?? roomById.PricePerNight}</p>
            <p><strong>Room Type:</strong> {roomById.roomType ?? roomById.RoomType}</p>
            {(roomById.avatarUrl || roomById.Avatar) && (
              <img
                src={roomById.avatarUrl ?? roomById.Avatar}
                alt="Avatar"
                style={{ width: '120px', height: '80px', objectFit: 'cover', marginTop: '8px' }} />)}
          </div>
        )}

        {/* Delete room by ID input and button */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Room</h2>
          <input type="number" placeholder="Room ID to Delete" style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }} value={deleteRoomId} onChange={(e) => setDeleteRoomId(e.target.value)} />
          <button style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteRoom(deleteRoomId)}> Delete Room by ID </button>
        </div>

        {/* Rooms Table */}
        <table style={{ borderCollapse: 'collapse', border: '1px solid gray', width: '100%' }}>
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th style={{ border: '1px solid gray', padding: '8px' }}>Room ID</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Room Number</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Capacity</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Price Per Night</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Room Type</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Avatar</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '8px' }}>No rooms found.</td>
              </tr>
            ) : (
              rooms.map((room) => {
                const roomId = room.roomId ?? room.RoomID;
                const isEditing = editRoomId === roomId;

                return (
                  <tr key={roomId}>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{roomId}</td>

                    {isEditing ? (
                      <>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <input
                            type="text"
                            value={editRoomData.roomNumber}
                            onChange={(e) => handleEditChange('roomNumber', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <input
                            type="number"
                            value={editRoomData.capacity}
                            onChange={(e) => handleEditChange('capacity', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <input
                            type="number"
                            value={editRoomData.pricePerNight}
                            onChange={(e) => handleEditChange('pricePerNight', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <input
                            type="text"
                            value={editRoomData.roomType}
                            onChange={(e) => handleEditChange('roomType', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditChange('avatar', e.target.files[0])}
                          />
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <button
                            onClick={handleUpdateRoom}
                            style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>{room.roomNumber ?? room.RoomNumber}</td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>{room.capacity ?? room.Capacity}</td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>${room.pricePerNight ?? room.PricePerNight}</td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>{room.roomType ?? room.RoomType}</td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          {(room.avatarUrl || room.Avatar) ? (
                            <img
                              src={room.avatarUrl ?? room.Avatar}
                              alt="Avatar"
                              style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            'No Image'
                          )}
                        </td>
                        <td style={{ border: '1px solid gray', padding: '8px' }}>
                          <button
                            onClick={() => handleEditClick(room)}
                            style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* Pagination controls */}
        {searchQuery.trim() === '' && (
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
export default RoomsPage;