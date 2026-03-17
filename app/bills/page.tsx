"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Chip } from "@nextui-org/chip";
import { Spinner } from "@nextui-org/spinner";
import { IconSearch, IconReceipt, IconDownload, IconEye, IconFileInvoice } from "@tabler/icons-react";
import { invoiceService } from "@/lib/services/invoices";

interface InvoiceListItem {
  id: string;
  invoice_code: string;
  post_date: string;
  due_date: string;
  payment_method: string;
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

export default function BillsPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<InvoiceListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    if (!lower) {
      setFiltered(invoices);
      return;
    }
    setFiltered(
      invoices.filter(
        (inv) =>
          inv.invoice_code.toLowerCase().includes(lower) ||
          inv.customers?.name.toLowerCase().includes(lower) ||
          inv.customers?.contact.toLowerCase().includes(lower) ||
          inv.payment_method.toLowerCase().includes(lower)
      )
    );
  };

  const handleView = async (id: string) => {
    setDetailLoading(true);
    onOpen();
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
    const calcGrandTotal = inv.invoice_items.reduce(
      (acc, item) => acc + item.price * item.quantity * (1 - item.discount / 100),
      0
    );
    const calcDiscount = inv.invoice_items.reduce(
      (acc, item) => acc + item.price * item.quantity * (item.discount / 100),
      0
    );
    const calcNetTotal = inv.invoice_items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const rows = inv.invoice_items.map((item) => `
      <tr ${item.is_free ? 'style="color:green;font-weight:bold;"' : ""}>
        <td style="border:1px solid #000;padding:6px;">${item.quantity}</td>
        <td style="border:1px solid #000;padding:6px;">${item.product_name}${item.sku ? ` (${item.sku})` : ""}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "Free" : item.discount + "%"}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "0.00" : item.price.toFixed(2)}</td>
        <td style="border:1px solid #000;padding:6px;">${item.is_free ? "0.00" : (item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const emptyRows = Array(6).fill(`
      <tr>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;"></td>
        <td style="border:1px solid #000;padding:6px;"></td>
        <td style="border:1px solid #000;padding:6px;"></td>
        <td style="border:1px solid #000;padding:6px;"></td>
      </tr>
    `).join("");

    const dateStr = inv.post_date
      ? new Date(inv.post_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "—";

    return `
      <div id="invoice-pdf-content" style="font-family:Arial,sans-serif;margin:0;padding:0;background:#fff;">
        <div style="width:95%;margin:20px auto;padding:10px;border:1px solid #000;">
          <div style="text-align:center;font-size:22px;font-weight:bold;margin-bottom:5px;text-transform:uppercase;">
            Anuradha Transport Services
          </div>
          <div style="text-align:center;font-size:12px;margin-bottom:15px;">
            No.219, Nawana, Mirigama<br/>
            Tel: 0777 898 929 / 0727 898 929 / 0770 584 959
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:10px;">
            <div><strong>Invoice No:</strong> ${inv.invoice_code}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
          </div>

          <div style="font-size:12px;border:1px solid #000;padding:8px;margin-bottom:10px;">
            <strong>Brown &amp; Company PLC - Pharmaceuticals Division</strong><br/>
            34, Sir Mohamed Macan Marker Mawatha, Colombo 03<br/>
            Tel: 011 266 3000
          </div>

          <div style="font-size:12px;border:1px solid #000;padding:8px;margin-bottom:10px;">
            <strong>Customer Name:</strong> ${inv.customers?.name || "N/A"}<br/>
            <strong>Address:</strong> ${inv.customers?.address || "N/A"}<br/>
            <strong>Contact No:</strong> ${inv.customers?.contact || "N/A"}
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background-color:#e0e0e0;">
                <th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Qty</th>
                <th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Description</th>
                <th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Discount</th>
                <th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Unit Price (LKR)</th>
                <th style="border:1px solid #000;padding:6px;text-align:left;text-transform:uppercase;">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              ${emptyRows}
              <tr>
                <td colspan="3" style="border:none;"></td>
                <td style="border:1px solid #000;padding:6px;"><strong>Sub Total</strong></td>
                <td style="border:1px solid #000;padding:6px;">LKR ${calcGrandTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="border:none;"></td>
                <td style="border:1px solid #000;padding:6px;"><strong>Discount</strong></td>
                <td style="border:1px solid #000;padding:6px;">LKR ${calcDiscount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="border:none;"></td>
                <td style="border:1px solid #000;padding:6px;"><strong>Grand Total</strong></td>
                <td style="border:1px solid #000;padding:6px;"><strong>LKR ${calcNetTotal.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:15px;font-size:12px;border-top:1px solid #000;padding-top:8px;">
            PLEASE DRAW THE CHEQUE IN FAVOUR OF ANURADHA TRANSPORT SERVICES
          </div>

          <div style="margin-top:30px;display:flex;justify-content:space-between;font-size:12px;">
            <span>Checked By: ________________________</span>
            <span>Goods Received By Customer</span>
          </div>
        </div>
      </div>
    `;
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoice || typeof window === "undefined") return;
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;
    const element = document.getElementById("invoice-pdf-content");
    if (!element) return;
    await html2pdf()
      .set({
        margin: 0.5,
        filename: `${selectedInvoice.invoice_code}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  const getPaymentChipColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash": return "success";
      case "card": return "primary";
      case "online": return "secondary";
      case "cheque": return "warning";
      default: return "default";
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconFileInvoice size={28} color="#2563eb" />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Bill History</h1>
              <div style={{ fontSize: 13, color: "#64748b" }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</div>
            </div>
          </div>
          <Input
            placeholder="Search by invoice, customer, contact..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            startContent={<IconSearch size={16} color="#94a3b8" />}
            style={{ maxWidth: 340 }}
            size="sm"
          />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
              No invoices found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Invoice No</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Customer</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Date</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Due Date</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Payment</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Discount</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Net Total</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>{inv.invoice_code}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{inv.customers?.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{inv.customers?.contact || ""}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{formatDate(inv.post_date)}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{formatDate(inv.due_date)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getPaymentChipColor(inv.payment_method) as any}
                        >
                          {inv.payment_method}
                        </Chip>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#dc2626" }}>
                        LKR {Number(inv.discount_amount).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                        LKR {Number(inv.net_total).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<IconEye size={14} />}
                            onPress={() => handleView(inv.id)}
                          >
                            View
                          </Button>
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

      {/* Invoice detail modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconReceipt size={20} />
            {selectedInvoice ? `Invoice — ${selectedInvoice.invoice_code}` : "Loading..."}
          </ModalHeader>
          <ModalBody>
            {detailLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <Spinner size="lg" />
              </div>
            ) : selectedInvoice ? (
              <div
                ref={invoiceRef}
                dangerouslySetInnerHTML={{ __html: buildInvoiceHTML(selectedInvoice) }}
              />
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              startContent={<IconDownload size={16} />}
              onPress={handleDownloadPDF}
              isDisabled={!selectedInvoice || detailLoading}
            >
              Download PDF
            </Button>
            <Button color="default" variant="light" onPress={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
