import React, { useState, useEffect } from 'react';
import "../css/StaffPage.css";
const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [searchRole, setSearchRole] = useState('');
  const [activeRole, setActiveRole] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    role: '',
    hireDate: '',
    avatar: null,
  });
  const [deleteStaffId, setDeleteStaffId] = useState('');
  const [singleStaffId, setSingleStaffId] = useState('');
  const [singleStaff, setSingleStaff] = useState(null);
  const [singleStaffError, setSingleStaffError] = useState(null);
  // NEW: Edit states - exactly like you specified
  const [editStaffId, setEditStaffId] = useState(null);
  const [editStaffData, setEditStaffData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    hireDate: '',
    avatar: null,
  });
  const fetchStaff = async () => {
    try {
      let url = '';
      if (activeRole !== null && activeRole !== '') {
        url = `http://localhost:5290/api/staff/search?role=${encodeURIComponent(activeRole)}`;
      } else {
        url = `http://localhost:5290/api/staff/paged?page=${page}&pageSize=${pageSize}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStaffList(data);
        setTotalCount(data.length);
      } else {
        setStaffList(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };
  const fetchSingleStaff = async (id) => {
    if (!id) {
      setSingleStaff(null);
      setSingleStaffError('Please enter a valid Staff ID');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5290/api/staff/${id}`);
      if (!response.ok) {
        throw new Error(`Staff with ID ${id} not found`);
      }
      const data = await response.json();
      setSingleStaff(data);
      setSingleStaffError(null);
    } catch (error) {
      setSingleStaff(null);
      setSingleStaffError(error.message);
    }
  };
  useEffect(() => {
    fetchStaff();
  }, [page, pageSize, activeRole]);
  const handleSearch = () => {
    setActiveRole(searchRole === '' ? null : searchRole);
    setPage(1);
  };
  const handleClearSearch = () => {
    setSearchRole('');
    setActiveRole(null);
    setPage(1);
  };
  const handleAddStaff = async () => {
    try {
      const formData = new FormData();
      formData.append('firstName', newStaff.firstName);
      formData.append('lastName', newStaff.lastName);
      formData.append('role', newStaff.role);
      formData.append('hireDate', newStaff.hireDate);
      if (newStaff.avatar) {
        formData.append('avatar', newStaff.avatar);
      }
      const response = await fetch('http://localhost:5290/api/staff', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setNewStaff({
          firstName: '',
          lastName: '',
          role: '',
          hireDate: '',
          avatar: null,
        });
        fetchStaff();
      } else {
        console.error('Failed to add staff');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };
  const handleDeleteStaff = async (id) => {
    if (!id) {
      alert('Please enter a valid Staff ID to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete staff member ${id}?`)) return;
    try {
      const response = await fetch(`http://localhost:5290/api/staff/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteStaffId('');
        fetchStaff();
      } else {
        console.error('Failed to delete staff');
        alert('Failed to delete staff. Please check the Staff ID.');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error deleting staff. See console for details.');
    }
  };
  const handleEditClick = (staff) => {
    setEditStaffId(staff.staffId);
    setEditStaffData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : '',
      avatar: null,
    });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStaffData(prev => ({ ...prev, [name]: value }));
  };
  // NEW: Handle avatar file input for edit
  const handleEditAvatarChange = (e) => {
    setEditStaffData(prev => ({ ...prev, avatar: e.target.files[0] }));
  };
  // NEW: Cancel editing
  const handleCancelEdit = () => {
    setEditStaffId(null);
    setEditStaffData({
      firstName: '',
      lastName: '',
      role: '',
      hireDate: '',
      avatar: null,
    });
  };
  // NEW: Save edited staff to backend
  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('staffId', editStaffId);
      formData.append('firstName', editStaffData.firstName);
      formData.append('lastName', editStaffData.lastName);
      formData.append('role', editStaffData.role);
      formData.append('hireDate', editStaffData.hireDate);
      if (editStaffData.avatar) {
        formData.append('avatar', editStaffData.avatar);
      }
      const response = await fetch(`http://localhost:5290/api/staff/${editStaffId}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        setEditStaffId(null);
        setEditStaffData({
          firstName: '',
          lastName: '',
          role: '',
          hireDate: '',
          avatar: null,
        });
        fetchStaff();
      } else {
        console.error('Failed to update staff');
        alert('Failed to update staff.');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Error updating staff. See console for details.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <div className="staff-background">
      <div className="staff-content">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Staff</h1>

        {/* Add staff form */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Staff</h2>
          <input type="text" placeholder="First Name" style={{ padding: '6px', marginRight: '8px' }} value={newStaff.firstName} onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })} />
          <input type="text" placeholder="Last Name" style={{ padding: '6px', marginRight: '8px' }} value={newStaff.lastName} onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })} />
          <input type="text" placeholder="Role" style={{ padding: '6px', marginRight: '8px' }} value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })} />
          <input type="date" style={{ padding: '6px', marginRight: '8px' }} value={newStaff.hireDate} onChange={(e) => setNewStaff({ ...newStaff, hireDate: e.target.value })} />
          <input type="file" accept="image/*" style={{ padding: '6px', marginRight: '8px' }} onChange={(e) => setNewStaff({ ...newStaff, avatar: e.target.files[0] })} />
          <button
            onClick={handleAddStaff}
            style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Add Staff
          </button>
        </div>

        {/* Search input */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filter by Role</h2>
          <input
            type="text"
            placeholder="Role"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
          />
          <button
            onClick={handleSearch}
            style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#1D4ED8', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Search
          </button>
          <button
            onClick={handleClearSearch}
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>

        {/* Search single staff by ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search Staff by ID</h2>
          <input
            type="number"
            placeholder="Staff ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={singleStaffId}
            onChange={(e) => setSingleStaffId(e.target.value)}
          />
          <button
            onClick={() => fetchSingleStaff(singleStaffId)}
            style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }}
          >
            Search Staff
          </button>
          <button
            onClick={() => {
              setSingleStaffId('');
              setSingleStaff(null);
              setSingleStaffError(null);
            }}
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>

          {singleStaffError && (
            <div style={{ color: '#DC2626', marginTop: '8px' }}>{singleStaffError}</div>
          )}
        </div>

        {/* Single staff details */}
        {singleStaff && (
          <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Staff Details</h2>
            <p><strong>ID:</strong> {singleStaff.staffId}</p>
            <p><strong>Name:</strong> {singleStaff.firstName} {singleStaff.lastName}</p>
            <p><strong>Role:</strong> {singleStaff.role}</p>
            <p><strong>Hire Date:</strong> {new Date(singleStaff.hireDate).toLocaleDateString()}</p>
            {singleStaff.avatarUrl && (
              <div style={{ marginTop: '12px' }}>
                <strong>Avatar:</strong><br />
                <img src={singleStaff.avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
            )}
          </div>
        )}

        {/* Delete staff by ID input and button */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Staff</h2>
          <input
            type="number"
            placeholder="Staff ID to Delete"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={deleteStaffId}
            onChange={(e) => setDeleteStaffId(e.target.value)}
          />
          <button
            onClick={() => handleDeleteStaff(deleteStaffId)}
            style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Delete Staff
          </button>
        </div>

        {/* Staff table with Edit buttons and inline edit form */}
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Staff ID</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>First Name</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Last Name</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Role</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Hire Date</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Avatar</th>
              <th style={{ border: '1px solid gray', padding: '8px', backgroundColor: '#eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.staffId}>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{staff.staffId}</td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{editStaffId === staff.staffId ?
                  <input type="text" name="firstName" value={editStaffData.firstName} onChange={handleEditChange} className="border p-1" /> : staff.firstName}
                </td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{editStaffId === staff.staffId ?
                  <input type="text" name="lastName" value={editStaffData.lastName} onChange={handleEditChange} className="border p-1" /> : staff.lastName}
                </td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{editStaffId === staff.staffId ?
                  <input type="text" name="role" value={editStaffData.role} onChange={handleEditChange} className="border p-1" /> : staff.role}
                </td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>{editStaffId === staff.staffId ?
                  <input type="date" name="hireDate" value={editStaffData.hireDate} onChange={handleEditChange} className="border p-1" /> : staff.hireDate?.split('T')[0]}
                </td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>
                  {staff.avatar && (
                    <img
                      src={`http://localhost:5290/${staff.avatarPath || staff.avatar}`}
                      alt="avatar"
                      style={{ width: '50px', height: '50px' }}
                    />
                  )}
                  {editStaffId === staff.staffId && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditAvatarChange}
                      className="mt-1"
                    />
                  )}
                </td>
                <td style={{ border: '1px solid gray', padding: '8px' }}>
                  {editStaffId === staff.staffId ? (
                    <>
                      <button onClick={handleSaveEdit} style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      >Save</button>
                      <button onClick={handleCancelEdit} style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditClick(staff)} style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                    >Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* PageSize selector */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
export default StaffPage;