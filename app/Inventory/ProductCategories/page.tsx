"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { IconEdit, IconTrashX, IconSquareRoundedPlus } from "@tabler/icons-react";
import { categoryService } from "@/lib/services/categories";

interface ProductCategory {
  id: string;
  name: string;
  status: number;
}

export default function ProductCategoriesPage() {
  const [productCategoryList, setProductCategoryList] = useState<ProductCategory[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const loadProductCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setProductCategoryList(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name cannot be empty!");
      return;
    }

    try {
      await categoryService.create({ name: categoryName, status: 1 });
      setCategoryName("");
      onAddClose();
      loadProductCategories();
    } catch (error: any) {
      console.error("Error adding category:", error);
      alert(error.message || "Failed to add category");
    }
  };

  const handleEditProductCategory = (category: ProductCategory) => {
    setSelectedCategoryId(category.id);
    setCategoryName(category.name);
    onEditOpen();
  };

  const handleUpdateProductCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name cannot be empty!");
      return;
    }

    try {
      await categoryService.update(selectedCategoryId, { name: categoryName });
      setCategoryName("");
      onEditClose();
      loadProductCategories();
    } catch (error: any) {
      console.error("Error updating category:", error);
      alert(error.message || "Failed to update category");
    }
  };

  const handleDeleteConfirm = (id: string) => {
    setSelectedCategoryId(id);
    onDeleteOpen();
  };

  const handleDeleteProceed = async () => {
    try {
      await categoryService.delete(selectedCategoryId);
      onDeleteClose();
      loadProductCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(error.message || "Failed to delete category");
    }
  };

  useEffect(() => {
    loadProductCategories();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Product Categories</h1>
        <Button
          color="primary"
          onPress={onAddOpen}
          size="lg"
          startContent={<IconSquareRoundedPlus size={20} />}
        >
          Add Category
        </Button>
      </div>

      <Table aria-label="Product categories table">
        <TableHeader>
          <TableColumn>CATEGORY NAME</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody items={productCategoryList} isLoading={loading} loadingContent={<div>Loading...</div>}>
          {(category) => (
            <TableRow key={category.id}>
              <TableCell style={{ fontSize: "16px", fontWeight: "500" }}>{category.name}</TableCell>
              <TableCell>
                <Chip color={category.status === 1 ? "success" : "default"} variant="flat">
                  {category.status === 1 ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<IconEdit size={16} />}
                    onPress={() => handleEditProductCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    startContent={<IconTrashX size={16} />}
                    onPress={() => handleDeleteConfirm(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isAddOpen} onClose={onAddClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Add New Category</span>
          </ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onAddClose}>Cancel</Button>
            <Button color="primary" onPress={handleAddProductCategory}>Add Category</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Edit Category</span>
          </ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onEditClose}>Cancel</Button>
            <Button color="primary" onPress={handleUpdateProductCategory}>Update Category</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <span>Confirm Delete</span>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>Cancel</Button>
            <Button color="danger" onPress={handleDeleteProceed}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}