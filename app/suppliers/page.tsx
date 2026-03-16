"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Table,
  Modal,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Select,
  useDisclosure,
  ModalContent,
  SelectItem,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@nextui-org/react";
import { IconTrashX, IconSquareRoundedPlus, IconEdit } from "@tabler/icons-react";
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formValues, setFormValues] = useState<Supplier>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    status: 1,
  });

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    loadSuppliers();
  }, []);

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

  const handleAdd = () => {
    setEditingSupplier(null);
    resetForm();
    onAddOpen();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormValues({ ...supplier });
    onEditOpen();
  };

  const handleSave = async () => {
    if (!formValues.name.trim()) {
      alert("Supplier name is required!");
      return;
    }

    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id!, {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          address: formValues.address,
          city: formValues.city,
          country: formValues.country,
        });
        onEditClose();
      } else {
        await supplierService.create({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          address: formValues.address,
          city: formValues.city,
          country: formValues.country,
          status: 1,
        });
        onAddClose();
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
      onDeleteClose();
      loadSuppliers();
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      alert(error.message || "Failed to delete supplier");
    }
  };

  const SupplierForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Supplier Name"
          placeholder="Enter supplier name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          isRequired
        />
        <Input
          label="Email"
          type="email"
          placeholder="supplier@example.com"
          value={formValues.email}
          onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
        />
      </div>
      <Input
        label="Phone"
        placeholder="+1 234 567 8900"
        value={formValues.phone}
        onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
      />
      <Input
        label="Address"
        placeholder="Street address"
        value={formValues.address}
        onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="City"
          value={formValues.city}
          onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
        />
        <Select
          label="Country"
          placeholder="Select country"
          selectedKeys={formValues.country ? [formValues.country] : []}
          onChange={(e) => setFormValues({ ...formValues, country: e.target.value })}
        >
          {countries.map((c) => (
            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
          ))}
        </Select>
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
        <Button
          color="primary"
          onPress={handleAdd}
          size="md"
          startContent={<IconSquareRoundedPlus size={18} />}
          className="w-full sm:w-auto"
        >
          Add Supplier
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Suppliers table" shadow="sm">
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
                <TableCell>
                  <Chip color={supplier.status === 1 ? "success" : "default"} variant="flat" size="sm">
                    {supplier.status === 1 ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" startContent={<IconEdit size={15} />} onPress={() => handleEdit(supplier)}>Edit</Button>
                    <Button size="sm" color="danger" startContent={<IconTrashX size={15} />} onPress={() => { setEditingSupplier(supplier); onDeleteOpen(); }}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); resetForm(); }} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Add New Supplier</span>
          </ModalHeader>
          <ModalBody><SupplierForm /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onAddClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Create Supplier</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); resetForm(); }} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Edit Supplier</span>
          </ModalHeader>
          <ModalBody><SupplierForm /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onEditClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Update Supplier</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Confirm Delete</span>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete <strong>{editingSupplier?.name}</strong>? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>Cancel</Button>
            <Button color="danger" onPress={handleDeleteConfirm}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
