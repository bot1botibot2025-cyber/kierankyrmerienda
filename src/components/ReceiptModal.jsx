import React from 'react';
import { Printer, X, CheckCircle, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export function ReceiptModal({ order, storeSettings, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `*** ${storeSettings.storeName.toUpperCase()} ***`,
      storeSettings.tagline,
      storeSettings.storeAddress,
      `Order #: ${order.id}`,
      `Date: ${new Date(order.timestamp).toLocaleString()}`,
      `Customer: ${order.customerName || 'Walk-in'}`,
      '--------------------------------',
      ...order.items.map(item => `${item.name} x${item.quantity} = ${formatCurrency(item.subtotal)}`),
      '--------------------------------',
      `TOTAL: ${formatCurrency(order.totalAmount)}`,
      `Payment: ${order.paymentMethod}`,
      order.cashReceived ? `Cash Given: ${formatCurrency(order.cashReceived)}` : '',
      order.changeGiven ? `Change: ${formatCurrency(order.changeGiven)}` : '',
      order.refNumber ? `Ref #: ${order.refNumber}` : '',
      '--------------------------------',
      storeSettings.receiptFooterMessage || 'Thank you po! Please come again!'
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    alert('Receipt copied to clipboard! You can paste it into SMS or Messenger.');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content receipt-modal-wrapper">
        {/* Modal Actions Header */}
        <div className="modal-actions-bar no-print">
          <div className="flex-align-center gap-2">
            <CheckCircle className="text-emerald" size={20} />
            <span className="font-bold text-white">Order Completed!</span>
          </div>
          <div className="flex-align-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleCopyText} title="Copy receipt text">
              <Share2 size={15} /> Copy Text
            </button>
            <button className="btn btn-emerald btn-sm" onClick={handlePrint} title="Print on POS thermal printer">
              <Printer size={15} /> Print Slip
            </button>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Paper Thermal Receipt Slip */}
        <div className="thermal-receipt-paper printable-area" id="printable-receipt">
          <div className="receipt-header">
            <div className="receipt-store-logo">🍔🌭🧋</div>
            <h2 className="receipt-store-title">{storeSettings.storeName}</h2>
            <p className="receipt-sub">{storeSettings.tagline}</p>
            <p className="receipt-address">{storeSettings.storeAddress}</p>
            <p className="receipt-phone">Tel: {storeSettings.contactNumber}</p>
          </div>

          <div className="receipt-divider-dashed"></div>

          <div className="receipt-meta-grid">
            <div>
              <span className="receipt-meta-label">ORDER:</span>
              <strong className="mono-num">{order.id}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="receipt-meta-label">DATE:</span>
              <span>{new Date(order.timestamp).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="receipt-meta-label">CUSTOMER:</span>
              <span>{order.customerName || 'Walk-in Suki'}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="receipt-meta-label">TIME:</span>
              <span>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="receipt-divider-dashed"></div>

          {/* Purchased Items Table */}
          <table className="receipt-items-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>ITEM</th>
                <th style={{ textAlign: 'center' }}>QTY</th>
                <th style={{ textAlign: 'right' }}>PRICE</th>
                <th style={{ textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="receipt-item-name">{item.name}</td>
                  <td style={{ textAlign: 'center' }} className="mono-num">x{item.quantity}</td>
                  <td style={{ textAlign: 'right' }} className="mono-num">{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: 'right' }} className="mono-num font-bold">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider-solid"></div>

          {/* Subtotal & Totals */}
          <div className="receipt-totals-list">
            <div className="receipt-total-row">
              <span>Subtotal:</span>
              <span className="mono-num">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="receipt-total-row text-danger">
                <span>Discount:</span>
                <span className="mono-num">-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="receipt-total-row receipt-grand-total">
              <span>TOTAL DUE:</span>
              <span className="mono-num">{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="receipt-divider-dashed"></div>

            <div className="receipt-total-row">
              <span>Payment Mode:</span>
              <strong>{order.paymentMethod}</strong>
            </div>

            {order.paymentMethod === 'Cash' && (
              <>
                <div className="receipt-total-row">
                  <span>Cash Tendered:</span>
                  <span className="mono-num">{formatCurrency(order.cashReceived || order.totalAmount)}</span>
                </div>
                <div className="receipt-total-row" style={{ fontWeight: 'bold' }}>
                  <span>Change (Sukli):</span>
                  <span className="mono-num">{formatCurrency(order.changeGiven || 0)}</span>
                </div>
              </>
            )}

            {(order.paymentMethod === 'GCash' || order.paymentMethod === 'Maya') && order.refNumber && (
              <div className="receipt-total-row">
                <span>Ref Number:</span>
                <span className="mono-num">{order.refNumber}</span>
              </div>
            )}

            {order.paymentMethod === 'Credit/Utang' && (
              <div className="receipt-total-row text-danger font-bold">
                <span>Status:</span>
                <span>Unpaid / Suki Credit</span>
              </div>
            )}
          </div>

          <div className="receipt-divider-dashed"></div>

          <div className="receipt-footer">
            <p className="receipt-thankyou">{storeSettings.receiptFooterMessage || "Salamat po sa pagtangkilik! Please come again! ❤️"}</p>
            <div className="receipt-barcode">
              ||| | |||| | ||| |||| | ||||| ||| |||
            </div>
            <p className="receipt-barcode-num">TXN-{order.id.replace('ORD-', '')}-{Date.now().toString().slice(-4)}</p>
          </div>
        </div>

        {/* Modal Bottom Close Button */}
        <div className="modal-footer no-print" style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-card-border)' }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onClose}>
            Done & Next Customer
          </button>
        </div>
      </div>
    </div>
  );
}
