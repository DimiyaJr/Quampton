"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from "@nextui-org/table";
import { IconTrashX, IconSquareRoundedPlus, IconEdit, IconX } from "@tabler/icons-react";
import { supplierService } from "@/lib/services/suppliers";
import { countries } from "@/app/data/Countries";

interface Supplier {
  id?: string;
  code?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: number;
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 500,
      background: active ? "#dcfce7" : "#f3f4f6",
      color: active ? "#166534" : "#6b7280",
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SimpleModal({ isOpen, onClose, title, children, footer }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex" }}>
            <IconX size={20} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>{footer}</div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formValues, setFormValues] = useState<Supplier>({
    name: "", email: "", phone: "", address: "", city: "", country: "", status: 1,
  });

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data as Supplier[]);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      alert("Failed to load suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues({ name: "", email: "", phone: "", address: "", city: "", country: "", status: 1 });
  };

  const handleAdd = () => { setEditingSupplier(null); resetForm(); setIsAddOpen(true); };
  const handleEdit = (s: Supplier) => { setEditingSupplier(s); setFormValues({ ...s }); setIsEditOpen(true); };

  const handleSave = async () => {
    if (!formValues.name.trim()) { alert("Supplier name is required!"); return; }
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id!, { name: formValues.name, email: formValues.email, phone: formValues.phone, address: formValues.address, city: formValues.city, country: formValues.country });
        setIsEditOpen(false);
      } else {
        await supplierService.create({ name: formValues.name, email: formValues.email, phone: formValues.phone, address: formValues.address, city: formValues.city, country: formValues.country, status: 1 });
        setIsAddOpen(false);
      }
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      console.error("Error saving supplier:", error);
      alert(error.message || "Failed to save supplier");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await supplierService.delete(editingSupplier!.id!);
      setIsDeleteOpen(false);
      loadSuppliers();
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      alert(error.message || "Failed to delete supplier");
    }
  };

  const f = (field: keyof Supplier) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormValues(prev => ({ ...prev, [field]: e.target.value }));

  const supplierForm = (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Supplier Name *</label>
          <input style={inputStyle} placeholder="Enter supplier name" value={formValues.name} onChange={f("name")} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" placeholder="supplier@example.com" value={formValues.email} onChange={f("email")} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} placeholder="+1 234 567 8900" value={formValues.phone} onChange={f("phone")} />
      </div>
      <div>
        <label style={labelStyle}>Address</label>
        <input style={inputStyle} placeholder="Street address" value={formValues.address} onChange={f("address")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>City</label>
          <input style={inputStyle} placeholder="City" value={formValues.city} onChange={f("city")} />
        </div>
        <div>
          <label style={labelStyle}>Country</label>
          <select style={inputStyle} value={formValues.country} onChange={f("country")}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={typeof c === "string" ? c : (c as any).name} value={typeof c === "string" ? c : (c as any).name}>
                {typeof c === "string" ? c : (c as any).name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your supplier network</p>
        </div>
        <Button color="primary" onPress={handleAdd} size="md" startContent={<IconSquareRoundedPlus size={18} />} className="w-full sm:w-auto">
          Add Supplier
        </Button>
      </div>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table aria-label="Suppliers table" shadow="sm" style={{ minWidth: "820px" }}>
          <TableHeader>
            <TableColumn>CODE</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>PHONE</TableColumn>
            <TableColumn>CITY</TableColumn>
            <TableColumn>COUNTRY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody items={suppliers} isLoading={loading} loadingContent={<div>Loading suppliers...</div>} emptyContent="No suppliers found. Add your first supplier!">
            {(supplier) => (
              <TableRow key={supplier.id}>
                <TableCell style={{ fontSize: "13px", color: "#6b7280" }}>{supplier.code}</TableCell>
                <TableCell style={{ fontWeight: "500", color: "#111827" }}>{supplier.name}</TableCell>
                <TableCell style={{ color: "#374151" }}>{supplier.email || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{supplier.phone || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{supplier.city || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{supplier.country || "-"}</TableCell>
                <TableCell><StatusBadge active={supplier.status === 1} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" startContent={<IconEdit size={15} />} onPress={() => handleEdit(supplier)}>Edit</Button>
                    <Button size="sm" color="danger" startContent={<IconTrashX size={15} />} onPress={() => { setEditingSupplier(supplier); setIsDeleteOpen(true); }}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SimpleModal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="Add New Supplier"
        footer={<>
          <button onClick={() => { setIsAddOpen(false); resetForm(); }} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#006FEE", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Create Supplier</button>
        </>}
      >{supplierForm}</SimpleModal>

      <SimpleModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); resetForm(); }} title="Edit Supplier"
        footer={<>
          <button onClick={() => { setIsEditOpen(false); resetForm(); }} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#006FEE", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Update Supplier</button>
        </>}
      >{supplierForm}</SimpleModal>

      <SimpleModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Delete"
        footer={<>
          <button onClick={() => setIsDeleteOpen(false)} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#374151" }}>Cancel</button>
          <button onClick={handleDeleteConfirm} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#f31260", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Delete</button>
        </>}
      >
        <p style={{ margin: 0, color: "#374151", fontSize: "15px" }}>Are you sure you want to delete <strong>{editingSupplier?.name}</strong>? This action cannot be undone.</p>
      </SimpleModal>
    </div>
  );
}
