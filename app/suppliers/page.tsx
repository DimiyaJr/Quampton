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
  code: string;
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
    code: "",
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
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      alert("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormValues({
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      status: 1,
    });
    onAddOpen();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormValues(supplier);
    onEditOpen();
  };

  const handleDelete = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    onDeleteOpen();
  };

  const handleSave = async () => {
    if (!formValues.code || !formValues.name) {
      alert("Code and Name are required!");
      return;
    }

    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id!, formValues);
        onEditClose();
      } else {
        await supplierService.create(formValues);
        onAddClose();
      }
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

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Suppliers</h1>
        <Button
          color="primary"
          onPress={handleAdd}
          size="lg"
          startContent={<IconSquareRoundedPlus size={20} />}
        >
          Add Supplier
        </Button>
      </div>

      <Table aria-label="Suppliers table">
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
        <TableBody items={suppliers} isLoading={loading} loadingContent={<div>Loading...</div>}>
          {(supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>{supplier.code}</TableCell>
              <TableCell style={{ fontWeight: "500" }}>{supplier.name}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell>{supplier.city}</TableCell>
              <TableCell>{supplier.country}</TableCell>
              <TableCell>
                <Chip color={supplier.status === 1 ? "success" : "default"} variant="flat">
                  {supplier.status === 1 ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<IconEdit size={16} />}
                    onPress={() => handleEdit(supplier)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    startContent={<IconTrashX size={16} />}
                    onPress={() => handleDelete(supplier)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isAddOpen || isEditOpen} onClose={() => { onAddClose(); onEditClose(); }} size="2xl">
        <ModalContent>
          <ModalHeader>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</ModalHeader>
          <ModalBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Input
                  label="Code"
                  placeholder="SUP001"
                  value={formValues.code}
                  onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                  required
                />
                <Input
                  label="Name"
                  placeholder="Supplier name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="supplier@example.com"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  placeholder="+1234567890"
                  value={formValues.phone}
                  onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                />
              </div>
              <Input
                label="Address"
                placeholder="Street address"
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onAddClose(); onEditClose(); }}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingSupplier ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete supplier <strong>{editingSupplier?.name}</strong>? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
