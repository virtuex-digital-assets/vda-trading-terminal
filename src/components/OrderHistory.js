import React from 'react';
import { useSelector } from 'react-redux';

const OrderHistory = () => {
  const orders = useSelector((state) => state.orders.orders);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' });
  };

  return (
    <div className="card order-history">
      <div className="card-header">Order History</div>
      {orders.length === 0 ? (
        <div className="card-body">
          <p className="empty-state">No orders placed yet</p>
        </div>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Side</th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Price (USD)</th>
              <th>Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.timestamp)}</td>
                <td className={order.side === 'BUY' ? 'positive' : 'negative'}>{order.side}</td>
                <td>{order.symbol}</td>
                <td>{order.quantity.toFixed(6)}</td>
                <td>${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${(order.quantity * order.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
