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
  code?: string;
  name: string;
  email: string;
  contact: string;
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
    name: "",
    email: "",
    contact: "",
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
      setCustomers(data as Customer[]);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues({ name: "", email: "", contact: "", address: "", city: "", country: "", status: 1 });
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    resetForm();
    onAddOpen();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormValues({ ...customer });
    onEditOpen();
  };

  const handleSave = async () => {
    if (!formValues.name.trim()) {
      alert("Customer name is required!");
      return;
    }

    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id!, {
          name: formValues.name,
          email: formValues.email,
          contact: formValues.contact,
          address: formValues.address,
          city: formValues.city,
          country: formValues.country,
        });
        onEditClose();
      } else {
        await customerService.create({
          name: formValues.name,
          email: formValues.email,
          contact: formValues.contact,
          address: formValues.address,
          city: formValues.city,
          country: formValues.country,
          status: 1,
        });
        onAddClose();
      }
      resetForm();
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

  const CustomerForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Enter customer name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          isRequired
        />
        <Input
          label="Email"
          type="email"
          placeholder="customer@example.com"
          value={formValues.email}
          onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
        />
      </div>
      <Input
        label="Phone / Contact"
        placeholder="+1 234 567 8900"
        value={formValues.contact}
        onChange={(e) => setFormValues({ ...formValues, contact: e.target.value })}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <Button
          color="primary"
          onPress={handleAdd}
          size="md"
          startContent={<IconSquareRoundedPlus size={18} />}
          className="w-full sm:w-auto"
        >
          Add Customer
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Customers table" shadow="sm">
          <TableHeader>
            <TableColumn>CODE</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>CONTACT</TableColumn>
            <TableColumn>CITY</TableColumn>
            <TableColumn>COUNTRY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody items={customers} isLoading={loading} loadingContent={<div>Loading customers...</div>} emptyContent="No customers found. Add your first customer!">
            {(customer) => (
              <TableRow key={customer.id}>
                <TableCell style={{ fontSize: "13px", color: "#6b7280" }}>{customer.code}</TableCell>
                <TableCell style={{ fontWeight: "500", color: "#111827" }}>{customer.name}</TableCell>
                <TableCell style={{ color: "#374151" }}>{customer.email || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{customer.contact || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{customer.city || "-"}</TableCell>
                <TableCell style={{ color: "#374151" }}>{customer.country || "-"}</TableCell>
                <TableCell>
                  <Chip color={customer.status === 1 ? "success" : "default"} variant="flat" size="sm">
                    {customer.status === 1 ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" startContent={<IconEdit size={15} />} onPress={() => handleEdit(customer)}>Edit</Button>
                    <Button size="sm" color="danger" startContent={<IconTrashX size={15} />} onPress={() => { setEditingCustomer(customer); onDeleteOpen(); }}>Delete</Button>
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
            <span>Add New Customer</span>
          </ModalHeader>
          <ModalBody><CustomerForm /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onAddClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Create Customer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); resetForm(); }} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Edit Customer</span>
          </ModalHeader>
          <ModalBody><CustomerForm /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onEditClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Update Customer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Confirm Delete</span>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete <strong>{editingCustomer?.name}</strong>? This action cannot be undone.</p>
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
