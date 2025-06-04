import React, { useState, useEffect } from 'react';
import "../css/PaymentsPage.css";
const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchPaymentMethod, setSearchPaymentMethod] = useState('');
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [newPayment, setNewPayment] = useState({
    bookingId: '',
    paymentDate: '',
    amount: '',
    paymentMethod: '',
  });

  const [deletePaymentId, setDeletePaymentId] = useState('');

  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    bookingId: '',
    paymentDate: '',
    amount: '',
    paymentMethod: '',
  });

  const [paymentIdToFetch, setPaymentIdToFetch] = useState('');
  const [fetchedPayment, setFetchedPayment] = useState(null);

  // Fetch paged/filtered payments
  const fetchPayments = async () => {
    try {
      let url = 'http://localhost:5290/api/payment/paged?';
      if (activeBookingId !== null && activeBookingId !== '') {
        url += `bookingId=${activeBookingId}&`;
      }
      if (activePaymentMethod !== null && activePaymentMethod !== '') {
        url += `paymentMethod=${activePaymentMethod}&`;
      }
      if (activeBookingId === null && activePaymentMethod === null) {
        url += `page=${page}&pageSize=${pageSize}&`;
      }
      url = url.slice(0, -1); // remove trailing '&' or '?'

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPayments(data);
        setTotalCount(data.length);
      } else {
        setPayments(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Fetch single payment by ID
  const fetchPaymentById = async (id) => {
    if (!id) {
      alert('Please enter a valid Payment ID.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5290/api/payment/${id}`);
      if (!response.ok) {
        alert(`Payment with ID ${id} not found.`);
        setFetchedPayment(null);
        return;
      }
      const data = await response.json();
      setFetchedPayment(data);
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      alert('Error fetching payment. Check console for details.');
    }
  };

  // Add a new payment
  const handleAddPayment = async () => {
    try {
      const response = await fetch('http://localhost:5290/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment),
      });
      if (response.ok) {
        setNewPayment({
          bookingId: '',
          paymentDate: '',
          amount: '',
          paymentMethod: '',
        });
        fetchPayments();
      } else {
        alert('Failed to add payment.');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error adding payment. Check console.');
    }
  };

  // Delete payment by ID
  const handleDeletePayment = async (id) => {
    if (!id) {
      alert('Please enter a valid Payment ID to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete payment ${id}?`)) return;

    try {
      const response = await fetch(`http://localhost:5290/api/payment/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setDeletePaymentId('');
        fetchPayments();
      } else {
        alert('Failed to delete payment. Check Payment ID.');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. See console for details.');
    }
  };

  // Handle search submit
  const handleSearch = () => {
    setActiveBookingId(searchBookingId === '' ? null : searchBookingId);
    setActivePaymentMethod(searchPaymentMethod === '' ? null : searchPaymentMethod);
    setPage(1);
  };

  // Clear search filters
  const handleClearSearch = () => {
    setSearchBookingId('');
    setSearchPaymentMethod('');
    setActiveBookingId(null);
    setActivePaymentMethod(null);
    setPage(1);
  };

  // Fetch payments on dependency changes
  useEffect(() => {
    fetchPayments();
  }, [page, pageSize, activeBookingId, activePaymentMethod]);

  // When Edit clicked: populate editPaymentData and set editPaymentId
  const handleEditClick = (payment) => {
    setEditPaymentId(payment.paymentId);
    setEditPaymentData({
      bookingId: payment.bookingId,
      paymentDate: payment.paymentDate.slice(0, 16), // for datetime-local input, trim seconds
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
    });
  };

  // On input changes in edit mode
  const handleEditChange = (field, value) => {
    setEditPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditPaymentId(null);
    setEditPaymentData({
      bookingId: '',
      paymentDate: '',
      amount: '',
      paymentMethod: '',
    });
  };

  // Save updated payment
  const handleSaveEdit = async () => {
    try {
      const updatedPayment = {
        paymentId: editPaymentId,
        bookingId: Number(editPaymentData.bookingId),
        paymentDate: editPaymentData.paymentDate,
        amount: Number(editPaymentData.amount),
        paymentMethod: editPaymentData.paymentMethod,
      };

      const response = await fetch(`http://localhost:5290/api/payment/${editPaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayment),
      });

      if (response.ok) {
        // Refresh list and clear edit state
        fetchPayments();
        handleCancelEdit();
      } else {
        alert('Failed to update payment.');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment. See console for details.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="payments-background">
      <div className="payments-content">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Payments</h1>

        {/* Add payment form */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Add New Payments</h2>
          <input
            type="number"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Booking ID"
            value={newPayment.bookingId}
            onChange={(e) => setNewPayment({ ...newPayment, bookingId: parseInt(e.target.value) })}
          />
          <input
            type="datetime-local"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Payment Date"
            value={newPayment.paymentDate}
            onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
          />
          <input
            type="text"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Payment Method"
            value={newPayment.paymentMethod}
            onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
          />
          <button
            style={{ padding: '6px 16px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={handleAddPayment}
          >
            Add
          </button>
        </div>

        {/* Search inputs */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Filters Payments</h2>
          <input
            type="number"
            placeholder="Booking ID"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={searchBookingId}
            onChange={(e) => setSearchBookingId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Payment Method"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={searchPaymentMethod}
            onChange={(e) => setSearchPaymentMethod(e.target.value)}
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

        {/* Get Payment By ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Search by Payments ID</h2>
          <input
            type="number"
            placeholder="Payment ID to Fetch"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            value={paymentIdToFetch}
            onChange={(e) => setPaymentIdToFetch(e.target.value)}
          />
          <button
            style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px' }}
            onClick={() => fetchPaymentById(paymentIdToFetch)}
          >
            Get Payment By ID
          </button>
          <button
            style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              setPaymentIdToFetch('');
              setFetchedPayment(null);
            }}
          >
            Clear
          </button>
        </div>

        {/* Display fetched payment */}
        {fetchedPayment && (
          <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid gray', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Fetched Payment Details</h2>
            <p><strong>ID:</strong> {fetchedPayment.paymentId}</p>
            <p><strong>Booking ID:</strong> {fetchedPayment.bookingId}</p>
            <p><strong>Date:</strong> {new Date(fetchedPayment.paymentDate).toLocaleString()}</p>
            <p><strong>Amount:</strong> ${fetchedPayment.amount.toFixed(2)}</p>
            <p><strong>Method:</strong> {fetchedPayment.paymentMethod}</p>
          </div>
        )}

        {/* Delete by ID */}
        <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid gray', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Delete Payment</h2>
          <input
            type="number"
            style={{ marginRight: '8px', padding: '6px', marginBottom: '8px' }}
            placeholder="Payment ID to Delete"
            value={deletePaymentId}
            onChange={(e) => setDeletePaymentId(e.target.value)}
          />
          <button
            style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => handleDeletePayment(deletePaymentId)}
          >
            Delete Payment by ID
          </button>
        </div>

        {/* Payments table */}
        <table style={{ borderCollapse: 'collapse', border: '1px solid gray', width: '100%' }}>
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th style={{ border: '1px solid gray', padding: '8px' }}>Payment ID</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Booking ID</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Payment Date</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Amount</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Payment Method</th>
              <th style={{ border: '1px solid gray', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.paymentId}>
                <td style={{ border: '1px solid gray', padding: '8px' }}>
                  {payment.paymentId}
                </td>

                {/* If this row is being edited, show inputs */}
                {editPaymentId === payment.paymentId ? (
                  <>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="number"
                        value={editPaymentData.bookingId}
                        onChange={(e) => handleEditChange('bookingId', e.target.value)}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="datetime-local"
                        value={editPaymentData.paymentDate}
                        onChange={(e) => handleEditChange('paymentDate', e.target.value)}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={editPaymentData.amount}
                        onChange={(e) => handleEditChange('amount', e.target.value)}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <input
                        type="text"
                        value={editPaymentData.paymentMethod}
                        onChange={(e) => handleEditChange('paymentMethod', e.target.value)}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <button
                        style={{ marginRight: '8px', backgroundColor: '#22C55E', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                      <button
                        style={{ backgroundColor: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* Normal row display */}
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{payment.bookingId}</td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      {new Date(payment.paymentDate).toLocaleString()}
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>{payment.paymentMethod}</td>
                    <td style={{ border: '1px solid gray', padding: '8px' }}>
                      <button
                        style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={() => handleEditClick(payment)}
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '8px' }}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* PageSize selector */}
        {activeBookingId === null && activePaymentMethod === null && (
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

export default PaymentsPage;
