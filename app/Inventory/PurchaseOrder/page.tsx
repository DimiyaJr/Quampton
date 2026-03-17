"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from "@nextui-org/table";
import { IconEye, IconTrashX, IconSquareRoundedPlus, IconX } from "@tabler/icons-react";
import { supplierService } from "@/lib/services/suppliers";
import { productService } from "@/lib/services/products";
import { purchaseOrderService } from "@/lib/services/purchase-orders";

interface SupplierRow {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  cost: number;
  quantity: number;
}

interface ReceiptEntry {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  cost: number;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  color: "#111827",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "4px",
  display: "block",
};

export default function PurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductRow[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productCost, setProductCost] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(0);
  const [receiptEntries, setReceiptEntries] = useState<ReceiptEntry[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [pos, sups, prods] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
        productService.getAll(),
      ]);
      setPurchaseOrders(pos as any[]);
      setSuppliers(sups as SupplierRow[]);
      const mapped = (prods as any[]).map(p => ({
        id: p.id,
        sku: p.sku || "",
        name: p.name || "",
        cost: p.cost || 0,
        quantity: p.quantity || 0,
      }));
      setProducts(mapped);
      setFilteredProducts(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProductSearch = (val: string) => {
    setProductSearch(val);
    setShowProductDropdown(true);
    const lower = val.toLowerCase();
    if (!lower) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p =>
        p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower)
      ));
    }
  };

  const handleSelectProduct = (product: ProductRow) => {
    setSelectedProduct(product);
    setProductSearch(`${product.sku} — ${product.name}`);
    setProductCost(product.cost || 0);
    setShowProductDropdown(false);
  };

  const handleAddProductToReceipt = () => {
    if (!selectedProduct || productQuantity <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }
    const newEntry: ReceiptEntry = {
      product_id: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      quantity: productQuantity,
      cost: productCost,
    };
    setReceiptEntries(prev => [...prev, newEntry]);
    setTotalCost(prev => prev + productCost * productQuantity);
    setSelectedProduct(null);
    setProductSearch("");
    setProductCost(0);
    setProductQuantity(0);
  };

  const handleRemoveEntry = (index: number) => {
    const entry = receiptEntries[index];
    setTotalCost(prev => prev - entry.cost * entry.quantity);
    setReceiptEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePurchaseOrder = async () => {
    if (!selectedSupplier) { alert("Please select a supplier."); return; }
    if (receiptEntries.length === 0) { alert("Add at least one product."); return; }
    setSaving(true);
    try {
      await purchaseOrderService.create({
        supplier_id: selectedSupplier.id,
        total_cost: totalCost,
        items: receiptEntries.map(e => ({ product_id: e.product_id, quantity: e.quantity, cost: e.cost })),
      });
      handleCloseAdd();
      loadAll();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to save purchase order.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    setSelectedSupplier(null);
    setSelectedProduct(null);
    setProductSearch("");
    setProductCost(0);
    setProductQuantity(0);
    setReceiptEntries([]);
    setTotalCost(0);
  };

  const handleView = async (po: any) => {
    try {
      const detail = await purchaseOrderService.getById(po.id);
      setViewDetail(detail);
      setIsViewOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (po: any) => {
    if (!confirm(`Delete purchase order ${po.po_code}?`)) return;
    try {
      await purchaseOrderService.delete(po.id);
      loadAll();
    } catch (e: any) {
      alert(e.message || "Failed to delete.");
    }
  };

  return (
    <div className="pb-20 md:pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 pb-4 pt-4 rounded-t-2xl shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <Button color="primary" startContent={<IconSquareRoundedPlus size={18} />} onPress={() => setIsAddOpen(true)} className="w-full sm:w-auto">
          Add Purchase Order
        </Button>
      </div>

      <div className="overflow-x-auto mt-2">
        <Table aria-label="Purchase Orders">
          <TableHeader>
            <TableColumn>PO CODE</TableColumn>
            <TableColumn>SUPPLIER</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>TOTAL COST</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No purchase orders found." items={purchaseOrders}>
            {(order) => (
              <TableRow key={order.id}>
                <TableCell style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>{order.po_code}</TableCell>
                <TableCell>{order.suppliers?.name || "—"}</TableCell>
                <TableCell>{order.created_at?.split("T")[0] || "—"}</TableCell>
                <TableCell>LKR {Number(order.total_cost).toFixed(2)}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button size="sm" variant="flat" color="primary" startContent={<IconEye size={15} />} onPress={() => handleView(order)}>View</Button>
                    <Button size="sm" variant="flat" color="danger" startContent={<IconTrashX size={15} />} onPress={() => handleDelete(order)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Purchase Order Modal */}
      {isAddOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAdd(); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "900px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>New Purchase Order</h3>
              <button onClick={handleCloseAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex" }}>
                <IconX size={20} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Supplier Select */}
              <div>
                <label style={labelStyle}>Select Supplier *</label>
                <select
                  style={inputStyle}
                  value={selectedSupplier?.id || ""}
                  onChange={(e) => {
                    const sup = suppliers.find(s => s.id === e.target.value) || null;
                    setSelectedSupplier(sup);
                  }}
                >
                  <option value="">— Choose a supplier —</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Supplier info cards */}
              {selectedSupplier && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Supplier</div>
                    <div style={{ fontWeight: 600, color: "#1e293b", marginTop: "4px" }}>{selectedSupplier.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedSupplier.code}</div>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</div>
                    <div style={{ fontWeight: 500, color: "#1e293b", marginTop: "4px" }}>{selectedSupplier.phone || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedSupplier.email || "—"}</div>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</div>
                    <div style={{ fontWeight: 500, color: "#1e293b", marginTop: "4px" }}>{selectedSupplier.city || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedSupplier.country || "—"}</div>
                  </div>
                </div>
              )}

              {/* Add Product Row */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Add Products</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "10px", alignItems: "flex-end" }}>
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>Product</label>
                    <input
                      style={inputStyle}
                      placeholder="Search by name or SKU..."
                      value={productSearch}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      onFocus={() => setShowProductDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                      autoComplete="off"
                    />
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", zIndex: 50, maxHeight: "220px", overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                        {filteredProducts.slice(0, 50).map(p => (
                          <div
                            key={p.id}
                            onMouseDown={() => handleSelectProduct(p)}
                            style={{ padding: "8px 12px", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid #f8fafc" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                          >
                            <span style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace", marginRight: "8px" }}>{p.sku}</span>
                            <span style={{ color: "#1e293b" }}>{p.name}</span>
                            <span style={{ float: "right", color: "#64748b", fontSize: "12px" }}>LKR {p.cost}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input style={inputStyle} type="number" min="1" placeholder="0" value={productQuantity || ""} onChange={e => setProductQuantity(Number(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cost (LKR)</label>
                    <input style={inputStyle} type="number" min="0" placeholder="0.00" value={productCost || ""} onChange={e => setProductCost(Number(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, visibility: "hidden" }}>Add</label>
                    <button
                      onClick={handleAddProductToReceipt}
                      style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#006FEE", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Receipt table */}
              {receiptEntries.length > 0 && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["SKU", "Product", "Qty", "Cost", "Subtotal", ""].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {receiptEntries.map((entry, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#2563eb" }}>{entry.sku}</td>
                          <td style={{ padding: "10px 14px", color: "#1e293b" }}>{entry.name}</td>
                          <td style={{ padding: "10px 14px", color: "#374151" }}>{entry.quantity}</td>
                          <td style={{ padding: "10px 14px", color: "#374151" }}>LKR {entry.cost.toFixed(2)}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b" }}>LKR {(entry.cost * entry.quantity).toFixed(2)}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <button onClick={() => handleRemoveEntry(idx)} style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#dc2626", cursor: "pointer", padding: "4px 10px", fontSize: "12px" }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Total: <span style={{ color: "#2563eb" }}>LKR {totalCost.toFixed(2)}</span></div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleCloseAdd} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#374151" }}>Cancel</button>
                  <button
                    onClick={handleSavePurchaseOrder}
                    disabled={saving}
                    style={{ padding: "9px 20px", borderRadius: "8px", border: "none", background: saving ? "#94a3b8" : "#006FEE", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600 }}
                  >
                    {saving ? "Saving..." : "Save Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && viewDetail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsViewOpen(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: 0 }}>PO — {viewDetail.po_code}</h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Supplier: {viewDetail.suppliers?.name || "—"}</div>
              </div>
              <button onClick={() => setIsViewOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex" }}>
                <IconX size={20} />
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["SKU", "Product", "Qty", "Cost", "Subtotal"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(viewDetail.purchase_order_items || []).map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#2563eb" }}>{item.products?.sku || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>{item.products?.name || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 14px" }}>LKR {Number(item.cost).toFixed(2)}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>LKR {(item.cost * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: "16px", textAlign: "right", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                Total: <span style={{ color: "#2563eb" }}>LKR {Number(viewDetail.total_cost).toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => setIsViewOpen(false)} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#374151" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
