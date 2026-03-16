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
import { customerService } from "@/lib/services/customers";
import { countries } from "@/app/data/Countries";

interface Customer {
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formValues, setFormValues] = useState<Customer>({
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
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customers");
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

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormValues(customer);
    onEditOpen();
  };

  const handleDelete = (customer: Customer) => {
    setEditingCustomer(customer);
    onDeleteOpen();
  };

  const handleSave = async () => {
    if (!formValues.code || !formValues.name) {
      alert("Code and Name are required!");
      return;
    }

    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id!, formValues);
        onEditClose();
      } else {
        await customerService.create(formValues);
        onAddClose();
      }
      loadCustomers();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      alert(error.message || "Failed to save customer");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await customerService.delete(editingCustomer!.id!);
      onDeleteClose();
      loadCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      alert(error.message || "Failed to delete customer");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Customers</h1>
        <Button
          color="primary"
          onPress={handleAdd}
          size="lg"
          startContent={<IconSquareRoundedPlus size={20} />}
        >
          Add Customer
        </Button>
      </div>

      <Table aria-label="Customers table">
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
        <TableBody items={customers} isLoading={loading} loadingContent={<div>Loading...</div>}>
          {(customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.code}</TableCell>
              <TableCell style={{ fontWeight: "500" }}>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.city}</TableCell>
              <TableCell>{customer.country}</TableCell>
              <TableCell>
                <Chip color={customer.status === 1 ? "success" : "default"} variant="flat">
                  {customer.status === 1 ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<IconEdit size={16} />}
                    onPress={() => handleEdit(customer)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    startContent={<IconTrashX size={16} />}
                    onPress={() => handleDelete(customer)}
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
          <ModalHeader>{editingCustomer ? "Edit Customer" : "Add New Customer"}</ModalHeader>
          <ModalBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Input
                  label="Code"
                  placeholder="CUST001"
                  value={formValues.code}
                  onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                  required
                />
                <Input
                  label="Name"
                  placeholder="Customer name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="customer@example.com"
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
              {editingCustomer ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete customer <strong>{editingCustomer?.name}</strong>? This action cannot be undone.</p>
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
