"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconSearch, IconReceipt, IconDownload, IconEye, IconFileInvoice, IconX } from "@tabler/icons-react";
import { invoiceService } from "@/lib/services/invoices";

interface InvoiceListItem {
  id: string;
  invoice_code: string;
  post_date: string;
  due_date: string;
  payment_method: string;
  payment_status: 'not_paid' | 'partial' | 'paid';
  total_amount: number;
  discount_amount: number;
  net_total: number;
  created_at: string;
  customers: {
    name: string;
    contact: string;
  } | null;
}

interface InvoiceDetail extends InvoiceListItem {
  customers: {
    id: string;
    code: string;
    name: string;
    email: string;
    contact: string;
    address: string;
    city: string;
    country: string;
  } | null;
  invoice_items: Array<{
    id: string;
    sku: string;
    product_name: string;
    quantity: number;
    price: number;
    discount: number;
    is_free: boolean;
  }>;
}

const PAYMENT_COLORS: Record<string, { bg: string; color: string }> = {
  cash: { bg: "#dcfce7", color: "#166534" },
  card: { bg: "#dbeafe", color: "#1e40af" },
  online: { bg: "#f3e8ff", color: "#6b21a8" },
  cheque: { bg: "#fef9c3", color: "#854d0e" },
};

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  not_paid: { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5", label: "Not Paid" },
  partial: { bg: "#fffbeb", color: "#92400e", border: "#fcd34d", label: "Partial Payment" },
  paid: { bg: "#f0fdf4", color: "#166534", border: "#86efac", label: "Full Payment" },
};

function PaymentBadge({ method }: { method: string }) {
  const style = PAYMENT_COLORS[method.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 500, background: style.bg, color: style.color }}>
      {method}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const s = PAYMENT_STATUS_STYLES[status] || PAYMENT_STATUS_STYLES.not_paid;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

export default function BillsPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<InvoiceListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await invoiceService.getAll();
        setInvoices(data as InvoiceListItem[]);
        setFiltered(data as InvoiceListItem[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    const lower = val.toLowerCase();
    if (!lower) { setFiltered(invoices); return; }
    setFiltered(invoices.filter(inv =>
      inv.invoice_code.toLowerCase().includes(lower) ||
      inv.customers?.name.toLowerCase().includes(lower) ||
      inv.customers?.contact.toLowerCase().includes(lower) ||
      inv.payment_method.toLowerCase().includes(lower)
    ));
  };

  const handleView = async (id: string) => {
    setDetailLoading(true);
    setIsOpen(true);
    try {
      const detail = await invoiceService.getById(id);
      setSelectedInvoice(detail as InvoiceDetail);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const buildInvoiceHTML = (inv: InvoiceDetail) => {
    const grossTotal = inv.invoice_items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalDiscount = inv.invoice_items.reduce((acc, item) => acc + item.price * item.quantity * (item.discount / 100), 0);
    const netTotal = grossTotal - totalDiscount;
    const rows = inv.invoice_items.map(item => `
      <tr ${item.is_free ? 'style="color:green;font-weight:bold;"' : ""}>
        <td style="border:1px solid #000;padding:6px;">${item.quantity}</td>
        <td style="border:1px solid #000;padding:6px;">${item.product_name}${item.sku ? ` (${item.sku})` : ""}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "Free" : item.discount > 0 ? item.discount + "%" : ""}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "0.00" : item.price.toFixed(2)}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "0.00" : (item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");
    const emptyRows = Array(6).fill(`<tr><td style="border:1px solid #000;padding:6px;">&nbsp;</td><td style="border:1px solid #000;padding:6px;"></td><td style="border:1px solid #000;padding:6px;"></td><td style="border:1px solid #000;padding:6px;"></td><td style="border:1px solid #000;padding:6px;"></td></tr>`).join("");
    const dateStr = inv.post_date ? new Date(inv.post_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
    return `<div id="invoice-pdf-content" style="font-family:Arial,sans-serif;margin:0;padding:0;background:#fff;"><div style="width:95%;margin:20px auto;padding:10px;border:1px solid #000;"><div style="text-align:center;font-size:25px;font-weight:bold;margin-bottom:5px;text-transform:uppercase;">Anuradha Transport Services</div><div style="text-align:center;font-size:15px;margin-bottom:15px;">No.219, Nawana, Mirigama<br/>Tel: 0777 898 929 / 0727 898 929 / 0770 584 959</div><div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:10px;"><div><strong>Invoice No:</strong> ${inv.invoice_code}</div><div><strong>Date:</strong> ${dateStr}</div></div><div style="font-size:15px;border:1px solid #000;padding:8px;margin-bottom:10px;"><strong>Brown &amp; Company PLC - Pharmaceuticals Division</strong><br/>34, Sir Mohamed Macan Marker Mawatha, Colombo 03<br/>Tel: 011 266 3000</div><div style="font-size:15px;border:1px solid #000;padding:8px;margin-bottom:10px;"><strong>Customer Name:</strong> ${inv.customers?.name || "N/A"}<br/><strong>Address:</strong> ${inv.customers?.address || "N/A"}<br/><strong>Contact No:</strong> ${inv.customers?.contact || "N/A"}</div><table style="width:100%;border-collapse:collapse;font-size:15px;"><thead><tr style="background-color:#e0e0e0;"><th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Qty</th><th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Description</th><th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Disc%</th><th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Unit Price (LKR)</th><th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Amount (LKR)</th></tr></thead><tbody>${rows}${emptyRows}<tr><td colspan="3" style="border:none;"></td><td style="border:1px solid #000;padding:6px;"><strong>GROSS TOTAL</strong></td><td style="border:1px solid #000;padding:6px;">LKR ${grossTotal.toFixed(2)}</td></tr><tr><td colspan="3" style="border:none;"></td><td style="border:1px solid #000;padding:6px;"><strong>DISCOUNT</strong></td><td style="border:1px solid #000;padding:6px;">LKR ${totalDiscount.toFixed(2)}</td></tr><tr><td colspan="3" style="border:none;"></td><td style="border:1px solid #000;padding:6px;"><strong>NET TOTAL</strong></td><td style="border:1px solid #000;padding:6px;"><strong>LKR ${netTotal.toFixed(2)}</strong></td></tr></tbody></table><div style="margin-top:15px;font-size:15px;border-top:1px solid #000;padding-top:8px;">PLEASE DRAW THE CHEQUE IN FAVOUR OF ANURADHA TRANSPORT SERVICES</div><div style="margin-top:30px;display:flex;justify-content:space-between;font-size:15px;"><span>Checked By: ________________________</span><span>Goods Received By Customer</span></div></div></div>`;
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoice || typeof window === "undefined") return;
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;
    const element = document.getElementById("invoice-pdf-content");
    if (!element) return;
    await html2pdf().set({ margin: 0.5, filename: `${selectedInvoice.invoice_code}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } }).from(element).save();
  };

  const handleStatusChange = async (id: string, newStatus: 'not_paid' | 'partial' | 'paid') => {
    setStatusUpdating(id);
    try {
      await invoiceService.updatePaymentStatus(id, newStatus);
      setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, payment_status: newStatus } : inv));
      setFiltered((prev) => prev.map((inv) => inv.id === id ? { ...inv, payment_status: newStatus } : inv));
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const btnBase: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconFileInvoice size={28} color="#2563eb" />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Bill History</h1>
              <div style={{ fontSize: 13, color: "#64748b" }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <IconSearch size={16} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              placeholder="Search by invoice, customer, contact..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ padding: "8px 12px 8px 34px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", outline: "none", width: "320px", background: "#fff" }}
            />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>No invoices found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    {["Invoice No", "Customer", "Date", "Due Date", "Payment", "Discount", "Net Total", "Status", "Actions"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: i >= 5 && i <= 6 ? "right" : i === 7 || i === 8 ? "center" : "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa")}
                    >
                      <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>{inv.invoice_code}</span></td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{inv.customers?.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{inv.customers?.contact || ""}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{formatDate(inv.post_date)}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{formatDate(inv.due_date)}</td>
                      <td style={{ padding: "12px 16px" }}><PaymentBadge method={inv.payment_method} /></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#dc2626" }}>LKR {Number(inv.discount_amount).toFixed(2)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#1e293b" }}>LKR {Number(inv.net_total).toFixed(2)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <PaymentStatusBadge status={inv.payment_status || "not_paid"} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <select
                            value={inv.payment_status || "not_paid"}
                            disabled={statusUpdating === inv.id}
                            onChange={(e) => handleStatusChange(inv.id, e.target.value as 'not_paid' | 'partial' | 'paid')}
                            style={{
                              padding: "5px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                              border: "1px solid #d1d5db", outline: "none", cursor: "pointer",
                              background: "#fff", color: "#374151",
                              opacity: statusUpdating === inv.id ? 0.5 : 1,
                            }}
                          >
                            <option value="not_paid">Not Paid</option>
                            <option value="partial">Partial Payment</option>
                            <option value="paid">Full Payment</option>
                          </select>
                          <button style={{ ...btnBase, background: "#dbeafe", color: "#1e40af" }} onClick={() => handleView(inv.id)}>
                            <IconEye size={14} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "860px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconReceipt size={20} color="#2563eb" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: 0 }}>
                  {selectedInvoice ? `Invoice — ${selectedInvoice.invoice_code}` : "Loading..."}
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex" }}>
                <IconX size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {detailLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                  <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : selectedInvoice ? (
                <div ref={invoiceRef} dangerouslySetInnerHTML={{ __html: buildInvoiceHTML(selectedInvoice) }} />
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <button
                onClick={handleDownloadPDF}
                disabled={!selectedInvoice || detailLoading}
                style={{ ...btnBase, background: !selectedInvoice || detailLoading ? "#e2e8f0" : "#006FEE", color: !selectedInvoice || detailLoading ? "#94a3b8" : "#fff", cursor: !selectedInvoice || detailLoading ? "not-allowed" : "pointer" }}
              >
                <IconDownload size={16} /> Download PDF
              </button>
              <button onClick={() => setIsOpen(false)} style={{ ...btnBase, background: "#f1f5f9", color: "#374151" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}