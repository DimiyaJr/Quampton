"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Switch } from "@nextui-org/switch";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalContent, useDisclosure } from "@nextui-org/modal";
import { Chip } from "@nextui-org/chip";
import { Select, SelectItem } from "@nextui-org/select";
import { Image } from "@nextui-org/image";
import { IconEdit, IconTrashX, IconSquareRoundedPlus, IconPhoto, IconGift, IconX, IconPlus } from "@tabler/icons-react";
import { productService } from "@/lib/services/products";
import { categoryService } from "@/lib/services/categories";
import config from "../../config";

interface FreeItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
}

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
  free_items?: FreeItem[] | null;
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
  const [freeItems, setFreeItems] = useState<FreeItem[]>([]);
  const [freeItemProductId, setFreeItemProductId] = useState("");
  const [freeItemQty, setFreeItemQty] = useState(1);
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

  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  };

  const resetForm = () => {
    setFormValues({ sku: "", name: "", category_id: "", quantity: 0, cost: 0, price: 0, max_discount: 0, image: "" });
    setImagePreview(null);
    setShowMaxDiscount(false);
    setFreeItems([]);
    setFreeItemProductId("");
    setFreeItemQty(1);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormValues({ sku: generateSKU(), name: "", category_id: "", quantity: 0, cost: 0, price: 0, max_discount: 0, image: "" });
    setImagePreview(null);
    setShowMaxDiscount(false);
    setFreeItems([]);
    setFreeItemProductId("");
    setFreeItemQty(1);
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
    setFreeItems(product.free_items || []);
    setFreeItemProductId("");
    setFreeItemQty(1);
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

  const handleAddFreeItem = () => {
    if (!freeItemProductId) return;
    if (freeItemQty <= 0) return;
    const selectedProduct = products.find((p) => p.id === freeItemProductId);
    if (!selectedProduct) return;
    const existing = freeItems.findIndex((fi) => fi.product_id === freeItemProductId);
    if (existing > -1) {
      const updated = [...freeItems];
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + freeItemQty };
      setFreeItems(updated);
    } else {
      setFreeItems([...freeItems, {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: freeItemQty,
      }]);
    }
    setFreeItemProductId("");
    setFreeItemQty(1);
  };

  const handleRemoveFreeItem = (index: number) => {
    setFreeItems(freeItems.filter((_, i) => i !== index));
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
        free_items: freeItems.length > 0 ? freeItems : null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        onEditClose();
      } else {
        await productService.create(payload);
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

  const freeItemsSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <IconGift size={16} color="#16a34a" />
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Free Items (auto-added at POS)</span>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <select
            value={freeItemProductId}
            onChange={(e) => setFreeItemProductId(e.target.value)}
            style={{
              width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", color: "#111827",
            }}
          >
            <option value="">Select a free product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div style={{ width: "80px" }}>
          <input
            type="number"
            min={1}
            value={freeItemQty}
            onChange={(e) => setFreeItemQty(Math.max(1, Number(e.target.value)))}
            placeholder="Qty"
            style={{
              width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", color: "#111827",
            }}
          />
        </div>
        <button
          onClick={handleAddFreeItem}
          disabled={!freeItemProductId}
          style={{
            padding: "8px 14px", borderRadius: "8px", border: "none",
            background: freeItemProductId ? "#16a34a" : "#d1d5db",
            color: "#fff", cursor: freeItemProductId ? "pointer" : "not-allowed",
            fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <IconPlus size={14} /> Add
        </button>
      </div>

      {freeItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {freeItems.map((fi, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px",
              padding: "8px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconGift size={14} color="#16a34a" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>{fi.product_name}</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>({fi.sku})</span>
                <Chip size="sm" color="success" variant="flat">x{fi.quantity} free</Chip>
              </div>
              <button
                onClick={() => handleRemoveFreeItem(idx)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "2px" }}
              >
                <IconX size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const formFields = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="SKU"
          placeholder="Auto-generated"
          value={formValues.sku}
          isReadOnly
          classNames={{ input: "cursor-not-allowed opacity-70" }}
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
          display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
          background: "#f1f5f9", borderRadius: "8px", cursor: "pointer",
          border: "2px dashed #cbd5e1", fontSize: "14px", color: "#64748b", fontWeight: "500",
        }}>
          <IconPhoto size={18} />
          Choose Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        {imagePreview && (
          <Image src={imagePreview} alt="Preview" width={80} height={80} style={{ borderRadius: "8px", objectFit: "cover" }} />
        )}
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
        {freeItemsSection}
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

      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table aria-label="Products table" style={{ minWidth: "900px" }}>
          <TableHeader>
            <TableColumn>SKU</TableColumn>
            <TableColumn>IMAGE</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>QTY</TableColumn>
            <TableColumn>COST</TableColumn>
            <TableColumn>PRICE</TableColumn>
            <TableColumn>MAX DISC.</TableColumn>
            <TableColumn>FREE ITEMS</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody items={products} isLoading={loading} loadingContent={<div>Loading...</div>} emptyContent="No products found. Add your first product!">
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
                    {product.free_items && product.free_items.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {product.free_items.map((fi, idx) => (
                          <span key={idx} style={{ fontSize: "11px", color: "#16a34a", fontWeight: 500 }}>
                            +{fi.quantity} {fi.product_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip color={stock.color} variant="flat" size="sm">{stock.label}</Chip>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap" }}>
                      <Button size="sm" color="primary" startContent={<IconEdit size={15} />} onPress={() => handleEdit(product)}>Edit</Button>
                      <Button size="sm" color="danger" variant="solid" startContent={<IconTrashX size={15} />} onPress={() => { setEditingProduct(product); onDeleteOpen(); }} style={{ background: "firebrick", color: "white", borderColor: "firebrick" }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); resetForm(); }} size="lg" hideCloseButton scrollBehavior="inside">
        <ModalContent>
          <ModalHeader><span>Add New Product</span></ModalHeader>
          <ModalBody>{formFields}</ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onAddClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Add Product</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); resetForm(); }} size="lg" hideCloseButton scrollBehavior="inside">
        <ModalContent>
          <ModalHeader><span>Edit Product</span></ModalHeader>
          <ModalBody>{formFields}</ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => { onEditClose(); resetForm(); }}>Cancel</Button>
            <Button color="primary" onPress={handleSave}>Update Product</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" hideCloseButton>
        <ModalContent>
          <ModalHeader><span>Confirm Delete</span></ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete <strong>{editingProduct?.name}</strong>? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>Cancel</Button>
            <Button color="danger" onPress={handleDeleteConfirm} style={{ background: "firebrick", color: "white", borderColor: "firebrick" }}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
