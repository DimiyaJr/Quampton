"use client"
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
import { Button } from "@nextui-org/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Chip } from "@nextui-org/chip";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  status: number;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "cashier",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        full_name: user.full_name || "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        full_name: "",
        role: "cashier",
      });
    }
    onOpen();
  };

  const handleSaveUser = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const token = localStorage.getItem('token');

      if (editingUser) {
        const updates: any = {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        };

        if (formData.password) {
          const response = await fetch(`${supabaseUrl}/functions/v1/update-user-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              user_id: editingUser.id,
              new_password: formData.password,
              token,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update password");
          }
        }

        const { error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", editingUser.id);

        if (error) throw error;
      } else {
        const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create user");
        }
      }

      await fetchUsers();
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.message || "Failed to save user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "manager":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <Button color="primary" onPress={() => handleOpenModal()} size="md" className="w-full sm:w-auto">
          Add New User
        </Button>
      </div>

      <div className="overflow-x-auto">
      <Table aria-label="Users table">
        <TableHeader>
          <TableColumn>USERNAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>FULL NAME</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={users}
          isLoading={loading}
          loadingContent={<div>Loading...</div>}
        >
          {(user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.full_name || "-"}</TableCell>
              <TableCell>
                <Chip color={getRoleColor(user.role)} variant="flat">
                  {user.role.toUpperCase()}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip color={user.status === 1 ? "success" : "default"} variant="flat">
                  {user.status === 1 ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button size="sm" color="primary" onPress={() => handleOpenModal(user)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color={user.status === 1 ? "warning" : "success"}
                    onPress={() => handleToggleStatus(user)}
                  >
                    {user.status === 1 ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>{editingUser ? "Edit User" : "Add New User"}</span>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingUser}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              <Input
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
              <Select
                label="Role"
                selectedKeys={[formData.role]}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <SelectItem key="admin" value="admin">Admin</SelectItem>
                <SelectItem key="manager" value="manager">Manager</SelectItem>
                <SelectItem key="cashier" value="cashier">Cashier</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveUser}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
