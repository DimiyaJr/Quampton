"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Switch,
  Table,
  Modal,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ModalContent,
  Chip,
  Select,
  SelectItem,
  Image,
} from "@nextui-org/react";
import { IconEdit, IconTrashX, IconSquareRoundedPlus, IconPhoto, IconX } from "@tabler/icons-react";
import { productService } from "@/lib/services/products";
import { categoryService } from "@/lib/services/categories";
import config from "../../config";

interface Product {
  id: string;
  sku: string;
  name: string;
  category_id?: string;
  quantity: number;
  cost: number;
  price: number;
  image?: string;
  max_discount?: number;
  product_categories?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  status: number;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showMaxDiscount, setShowMaxDiscount] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    sku: "",
    name: "",
    category_id: "",
    quantity: 0,
    cost: 0,
    price: 0,
    max_discount: 0,
    image: "",
  });

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data as Product[]);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data as Category[]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const resetForm = () => {
    setFormValues({ sku: "", name: "", category_id: "", quantity: 0, cost: 0, price: 0, max_discount: 0, image: "" });
    setImagePreview(null);
    setShowMaxDiscount(false);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    resetForm();
    onAddOpen();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormValues({
      sku: product.sku,
      name: product.name,
      category_id: product.category_id || "",
      quantity: product.quantity,
      cost: product.cost,
      price: product.price,
      max_discount: product.max_discount || 0,
      image: product.image || "",
    });
    setImagePreview(product.image || null);
    setShowMaxDiscount(!!product.max_discount);
    onEditOpen();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormValues((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formValues.name) {
      alert("Product name is required!");
      return;
    }
    try {
      const payload = {
        sku: formValues.sku || undefined,
        name: formValues.name,
        category_id: formValues.category_id || null,
        quantity: Number(formValues.quantity),
        cost: Number(formValues.cost),
        price: Number(formValues.price),
        max_discount: showMaxDiscount ? Number(formValues.max_discount) : 0,
        image: formValues.image || null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        onEditClose();
      } else {
        await productService.create(payload);
        onAddOpen();
        onAddClose();
      }
      loadProducts();
      resetForm();
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.message || "Failed to save product");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingProduct) return;
    try {
      await productService.delete(editingProduct.id);
      onDeleteClose();
      loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Failed to delete product");
    }
  };

  const getStockStatus = (qty: number) => {
    if (qty <= config.OUT_OF_STOCK) return { label: "Out of Stock", color: "danger" as const };
    if (qty < config.LOW_STOCK) return { label: "Low Stock", color: "warning" as const };
    return { label: "In Stock", color: "success" as const };
  };

  const FormFields = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="SKU"
          placeholder="Auto-generated if empty"
          value={formValues.sku}
          onChange={(e) => setFormValues({ ...formValues, sku: e.target.value })}
        />
        <Input
          label="Product Name"
          placeholder="Enter product name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          isRequired
        />
      </div>

      <Select
        label="Category"
        placeholder="Select a category"
        selectedKeys={formValues.category_id ? [formValues.category_id] : []}
        onChange={(e) => setFormValues({ ...formValues, category_id: e.target.value })}
      >
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          type="number"
          label="Quantity"
          min="0"
          value={String(formValues.quantity)}
          onChange={(e) => setFormValues({ ...formValues, quantity: Math.max(0, Number(e.target.value)) })}
        />
        <Input
          type="number"
          label="Cost Price"
          min="0"
          value={String(formValues.cost)}
          onChange={(e) => setFormValues({ ...formValues, cost: Math.max(0, Number(e.target.value)) })}
        />
        <Input
          type="number"
          label="Selling Price"
          min="0"
          value={String(formValues.price)}
          onChange={(e) => setFormValues({ ...formValues, price: Math.max(0, Number(e.target.value)) })}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Switch isSelected={showMaxDiscount} onValueChange={setShowMaxDiscount}>
          Max Discount
        </Switch>
        {showMaxDiscount && (
          <Input
            type="number"
            label="Max Discount (%)"
            min="0"
            max="100"
            value={String(formValues.max_discount)}
            onChange={(e) => setFormValues({ ...formValues, max_discount: Math.max(0, Number(e.target.value)) })}
            style={{ maxWidth: "200px" }}
          />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Product Image</label>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          background: "#f1f5f9",
          borderRadius: "8px",
          cursor: "pointer",
          border: "2px dashed #cbd5e1",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: "500",
        }}>
          <IconPhoto size={18} />
          Choose Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        {imagePreview && (
          <Image src={imagePreview} alt="Preview" width={80} height={80} style={{ borderRadius: "8px", objectFit: "cover" }} />
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <Button
          color="primary"
          onPress={handleAdd}
          size="md"
          startContent={<IconSquareRoundedPlus size={18} />}
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
      <Table aria-label="Products table">
        <TableHeader>
          <TableColumn>SKU</TableColumn>
          <TableColumn>IMAGE</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>QTY</TableColumn>
          <TableColumn>COST</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>MAX DISC.</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody items={products} isLoading={loading} loadingContent={<div>Loading...</div>}>
          {(product) => {
            const stock = getStockStatus(product.quantity);
            return (
              <TableRow key={product.id}>
                <TableCell style={{ fontSize: "13px", color: "#6b7280" }}>{product.sku}</TableCell>
                <TableCell>
                  {product.image ? (
                    <Image src={product.image} alt={product.name} width={40} height={40} style={{ borderRadius: "6px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 40, height: 40, background: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconPhoto size={18} color="#94a3b8" />
                    </div>
                  )}
                </TableCell>
                <TableCell style={{ fontWeight: "500" }}>{product.name}</TableCell>
                <TableCell style={{ color: "#6b7280" }}>{product.product_categories?.name || "-"}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.cost}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.max_discount ? `${product.max_discount}%` : "-"}</TableCell>
                <TableCell>
                  <Chip color={stock.color} variant="flat" size="sm">{stock.label}</Chip>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button size="sm" color="primary" startContent={<IconEdit size={15} />} onPress={() => handleEdit(product)}>Edit</Button>
                    <Button size="sm" color="danger" startContent={<IconTrashX size={15} />} onPress={() => { setEditingProduct(product); onDeleteOpen(); }}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); resetForm(); }} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader className="relative pr-10">
            <span>Add New Product</span>
            <Button isIconOnly size="sm" variant="light" className="absolute right-2 top-1/2 -translate-y-1/2" onPress={() => { onAddClose(); resetForm(); }}><IconX size={18} /></Button>
          </ModalHeader>
          <ModalBody><FormFields /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onAddClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Add Product</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); resetForm(); }} size="lg" hideCloseButton>
        <ModalContent>
          <ModalHeader className="relative pr-10">
            <span>Edit Product</span>
            <Button isIconOnly size="sm" variant="light" className="absolute right-2 top-1/2 -translate-y-1/2" onPress={() => { onEditClose(); resetForm(); }}><IconX size={18} /></Button>
          </ModalHeader>
          <ModalBody><FormFields /></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onEditClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Update Product</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader className="relative pr-10">
            <span>Confirm Delete</span>
            <Button isIconOnly size="sm" variant="light" className="absolute right-2 top-1/2 -translate-y-1/2" onPress={onDeleteClose}><IconX size={18} /></Button>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete <strong>{editingProduct?.name}</strong>? This action cannot be undone.</p>
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
