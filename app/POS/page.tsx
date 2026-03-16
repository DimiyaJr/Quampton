"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Input,
  Button,
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
  Select,
  SelectItem,
  DatePicker,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { IconSearch, IconPlus, IconTrash, IconUser, IconPackage, IconShoppingCart, IconReceipt } from "@tabler/icons-react";
import { customerService } from "@/lib/services/customers";
import { productService } from "@/lib/services/products";
import { invoiceService } from "@/lib/services/invoices";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  max_discount: number;
  category_id: string;
}

interface CartItem {
  productId: string;
  sku: string;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  isFree?: boolean;
}

export default function POSPage() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemQty, setItemQty] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [postDate, setPostDate] = useState(today(getLocalTimeZone()));
  const [dueDate, setDueDate] = useState(today(getLocalTimeZone()));
  const [loading, setLoading] = useState(false);
  const [invoiceCode, setInvoiceCode] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const formatter = useDateFormatter({ dateStyle: "medium" });

  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customers, products] = await Promise.all([
          customerService.getAll(),
          productService.getAll(),
        ]);
        setAllCustomers(customers as Customer[]);
        setAllProducts((products as any[]).filter((p) => p.quantity > 0));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomerSearch = (val: string) => {
    setCustomerSearch(val);
    setSelectedCustomer(null);
    if (val.trim().length === 0) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }
    const lower = val.toLowerCase();
    const filtered = allCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        (c.contact && c.contact.toLowerCase().includes(lower)) ||
        c.code.toLowerCase().includes(lower)
    );
    setFilteredCustomers(filtered);
    setShowCustomerDropdown(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  const handleProductSearch = (val: string) => {
    setProductSearch(val);
    setSelectedProduct(null);
    if (val.trim().length === 0) {
      setFilteredProducts([]);
      setShowProductDropdown(false);
      return;
    }
    const lower = val.toLowerCase();
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered);
    setShowProductDropdown(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(`${product.sku} — ${product.name}`);
    setShowProductDropdown(false);
    setFilteredProducts([]);
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert("Please select a product first.");
      return;
    }
    if (itemQty <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }
    if (itemDiscount > selectedProduct.max_discount) {
      alert(`Max discount for this product is ${selectedProduct.max_discount}%.`);
      return;
    }

    const alreadyInCart = cart.filter((i) => i.sku === selectedProduct.sku && !i.isFree);
    const totalQtyInCart = alreadyInCart.reduce((sum, i) => sum + i.quantity, 0);
    if (totalQtyInCart + itemQty > selectedProduct.quantity) {
      alert(`Only ${selectedProduct.quantity} units available. Already ${totalQtyInCart} in cart.`);
      return;
    }

    const newItems: CartItem[] = [];
    const existingIndex = cart.findIndex((i) => i.sku === selectedProduct.sku && !i.isFree);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += itemQty;
      setCart(updated);
    } else {
      newItems.push({
        productId: selectedProduct.id,
        sku: selectedProduct.sku,
        productName: selectedProduct.name,
        price: Number(selectedProduct.price),
        quantity: itemQty,
        discount: itemDiscount,
      });
      setCart((prev) => [...prev, ...newItems]);
    }

    setSelectedProduct(null);
    setProductSearch("");
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const netTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce(
    (acc, item) => acc + (item.price * item.quantity * item.discount) / 100,
    0
  );
  const grandTotal = netTotal - totalDiscount;

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (!window.confirm("Confirm checkout?")) return;

    setLoading(true);
    try {
      const invoice = await invoiceService.create({
        customer_id: selectedCustomer.id,
        post_date: postDate.toString(),
        due_date: dueDate.toString(),
        payment_method: paymentMethod,
        total_amount: netTotal,
        discount_amount: totalDiscount,
        net_total: grandTotal,
        items: cart.map((item) => ({
          product_id: item.productId,
          sku: item.sku,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          is_free: item.isFree || false,
        })),
      });
      setInvoiceCode(invoice.invoice_code);
      const updatedProducts = await productService.getAll();
      setAllProducts((updatedProducts as any[]).filter((p) => p.quantity > 0));
      onInvoiceOpen();
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Checkout failed: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInvoice = () => {
    onInvoiceClose();
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setProductSearch("");
    setSelectedProduct(null);
    setInvoiceCode("");
  };

  const generatePDF = async () => {
    if (typeof window === "undefined") return;
    const html2pdf = require("html2pdf.js");
    const element = document.getElementById("invoice-print");
    if (!element) return;
    await html2pdf()
      .set({
        margin: 0.5,
        filename: `${invoiceCode}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <IconShoppingCart size={28} color="#2563eb" />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b" }}>Point of Sale</h1>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Left: Main POS panel */}
          <div style={{ flex: 1, minWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Customer section */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <IconUser size={18} color="#2563eb" />
                <span style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>Customer</span>
              </div>

              <div ref={customerRef} style={{ position: "relative" }}>
                <Input
                  placeholder="Search by name, phone, or code..."
                  value={customerSearch}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onFocus={() => customerSearch && setShowCustomerDropdown(true)}
                  startContent={<IconSearch size={16} color="#94a3b8" />}
                  size="sm"
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 240, overflowY: "auto", marginTop: 4
                  }}>
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        style={{
                          padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{customer.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{customer.contact} &bull; {customer.code}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showCustomerDropdown && filteredCustomers.length === 0 && customerSearch.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "12px 14px", marginTop: 4,
                    color: "#64748b", fontSize: 13
                  }}>
                    No customers found
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div style={{
                  marginTop: 14, background: "#f0f7ff", borderRadius: 10, padding: "12px 16px",
                  border: "1px solid #bfdbfe", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px"
                }}>
                  <div><span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Name</span><div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{selectedCustomer.name}</div></div>
                  <div><span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Contact</span><div style={{ fontSize: 14, color: "#1e293b" }}>{selectedCustomer.contact}</div></div>
                  <div><span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Email</span><div style={{ fontSize: 14, color: "#1e293b" }}>{selectedCustomer.email || "—"}</div></div>
                  <div><span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>City</span><div style={{ fontSize: 14, color: "#1e293b" }}>{selectedCustomer.city || "—"}</div></div>
                  <div style={{ gridColumn: "span 2" }}><span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Address</span><div style={{ fontSize: 14, color: "#1e293b" }}>{selectedCustomer.address || "—"}</div></div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 4 }}>Post Date</div>
                  <DatePicker
                    value={postDate}
                    onChange={(date: CalendarDate | null) => date && setPostDate(date)}
                    size="sm"
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 4 }}>Due Date</div>
                  <DatePicker
                    value={dueDate}
                    onChange={(date: CalendarDate | null) => date && setDueDate(date)}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Product add section */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <IconPackage size={18} color="#2563eb" />
                <span style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>Add Product</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 4 }}>Search Product</div>
                  <div ref={productRef} style={{ position: "relative" }}>
                    <Input
                      placeholder="Search by name or SKU..."
                      value={productSearch}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      onFocus={() => productSearch && !selectedProduct && setShowProductDropdown(true)}
                      startContent={<IconSearch size={16} color="#94a3b8" />}
                      size="sm"
                    />
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 260, overflowY: "auto", marginTop: 4
                      }}>
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            style={{
                              padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{product.name}</div>
                            <div style={{ fontSize: 12, color: "#64748b", display: "flex", gap: 12 }}>
                              <span>SKU: {product.sku}</span>
                              <span style={{ color: "#16a34a" }}>In Stock: {product.quantity}</span>
                              <span style={{ color: "#2563eb" }}>LKR {Number(product.price).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {showProductDropdown && filteredProducts.length === 0 && productSearch.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "12px 14px", marginTop: 4,
                        color: "#64748b", fontSize: 13
                      }}>
                        No products found
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 4 }}>
                    Qty {selectedProduct ? <span style={{ color: "#64748b" }}>(max {selectedProduct.quantity})</span> : ""}
                  </div>
                  <Input
                    type="number"
                    value={itemQty.toString()}
                    onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={selectedProduct?.quantity}
                    size="sm"
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 4 }}>
                    Discount% {selectedProduct ? <span style={{ color: "#64748b" }}>(max {selectedProduct.max_discount}%)</span> : ""}
                  </div>
                  <Input
                    type="number"
                    value={itemDiscount.toString()}
                    onChange={(e) => setItemDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    max={selectedProduct?.max_discount || 0}
                    size="sm"
                  />
                </div>

                <Button
                  color="primary"
                  onPress={handleAddToCart}
                  style={{ height: 36 }}
                  startContent={<IconPlus size={16} />}
                >
                  Add
                </Button>
              </div>

              {selectedProduct && (
                <div style={{
                  marginTop: 12, background: "#f0fdf4", borderRadius: 8, padding: "8px 14px",
                  border: "1px solid #bbf7d0", display: "flex", gap: 24, fontSize: 13
                }}>
                  <span><strong>Price:</strong> LKR {Number(selectedProduct.price).toFixed(2)}</span>
                  <span><strong>In Stock:</strong> {selectedProduct.quantity}</span>
                  <span><strong>Max Discount:</strong> {selectedProduct.max_discount}%</span>
                  {itemQty > 0 && (
                    <span style={{ color: "#2563eb" }}>
                      <strong>Line Total:</strong> LKR {(Number(selectedProduct.price) * itemQty * (1 - itemDiscount / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <IconShoppingCart size={18} color="#2563eb" />
                <span style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>Cart</span>
                {cart.length > 0 && (
                  <Chip size="sm" color="primary" variant="flat">{cart.length} item{cart.length > 1 ? "s" : ""}</Chip>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0", fontSize: 14 }}>
                  No items added yet. Search and add products above.
                </div>
              ) : (
                <Table aria-label="Cart" removeWrapper>
                  <TableHeader>
                    <TableColumn>SKU</TableColumn>
                    <TableColumn>Product</TableColumn>
                    <TableColumn>Qty</TableColumn>
                    <TableColumn>Unit Price</TableColumn>
                    <TableColumn>Discount</TableColumn>
                    <TableColumn>Total</TableColumn>
                    <TableColumn> </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontSize: 13 }}>{item.sku}</TableCell>
                        <TableCell style={{ fontSize: 13, fontWeight: 500 }}>{item.productName}</TableCell>
                        <TableCell style={{ fontSize: 13 }}>{item.quantity}</TableCell>
                        <TableCell style={{ fontSize: 13 }}>LKR {item.price.toFixed(2)}</TableCell>
                        <TableCell style={{ fontSize: 13 }}>{item.discount}%</TableCell>
                        <TableCell style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                          LKR {(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleRemoveFromCart(index)}
                          >
                            <IconTrash size={15} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Right: Summary & Checkout */}
          <div style={{ width: 300, minWidth: 280 }}>
            <div style={{
              background: "#fff", borderRadius: 16, padding: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "sticky", top: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <IconReceipt size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Order Summary</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#475569" }}>
                  <span>Subtotal</span>
                  <span>LKR {netTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#dc2626" }}>
                  <span>Discount</span>
                  <span>- LKR {totalDiscount.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  <span>Grand Total</span>
                  <span>LKR {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Payment Method</div>
                <Select
                  selectedKeys={[paymentMethod]}
                  onSelectionChange={(keys) => setPaymentMethod(Array.from(keys)[0] as string)}
                  size="sm"
                >
                  <SelectItem key="cash">Cash</SelectItem>
                  <SelectItem key="card">Card</SelectItem>
                  <SelectItem key="online">Online Transfer</SelectItem>
                  <SelectItem key="cheque">Cheque</SelectItem>
                </Select>
              </div>

              {!selectedCustomer && (
                <div style={{ fontSize: 12, color: "#f59e0b", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                  Select a customer to proceed
                </div>
              )}
              {cart.length === 0 && (
                <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                  Add items to cart to proceed
                </div>
              )}

              <Button
                color="primary"
                fullWidth
                size="lg"
                isDisabled={!selectedCustomer || cart.length === 0 || loading}
                isLoading={loading}
                onPress={handleCheckout}
                style={{ fontWeight: 600 }}
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceOpen} onClose={handleCloseInvoice} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconReceipt size={20} />
            Invoice — {invoiceCode}
          </ModalHeader>
          <ModalBody>
            <div id="invoice-print" ref={invoiceRef} style={{ fontFamily: "Arial, sans-serif", padding: 20, background: "#fff" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>Invoice</div>
                <div style={{ fontSize: 13, color: "#475569" }}>Invoice No: <strong>{invoiceCode}</strong></div>
                <div style={{ fontSize: 13, color: "#475569" }}>
                  Date: {postDate ? formatter.format(postDate.toDate(getLocalTimeZone())) : "—"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, fontSize: 13 }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Bill To</div>
                  <div>{selectedCustomer?.name}</div>
                  <div>{selectedCustomer?.contact}</div>
                  <div>{selectedCustomer?.address}</div>
                  <div>{selectedCustomer?.city}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Payment</div>
                  <div>Method: {paymentMethod}</div>
                  <div>Due Date: {dueDate ? formatter.format(dueDate.toDate(getLocalTimeZone())) : "—"}</div>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "left" }}>SKU</th>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "left" }}>Product</th>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "center" }}>Qty</th>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "center" }}>Disc%</th>
                    <th style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px" }}>{item.sku}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px" }}>{item.productName}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right" }}>LKR {item.price.toFixed(2)}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "center" }}>{item.discount}%</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right" }}>LKR {(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right", fontWeight: 600 }}>Subtotal</td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right" }}>LKR {netTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#dc2626" }}>Discount</td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "right", color: "#dc2626" }}>- LKR {totalDiscount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ background: "#f1f5f9" }}>
                    <td colSpan={5} style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>Grand Total</td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>LKR {grandTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={generatePDF}>Export PDF</Button>
            <Button color="default" variant="light" onPress={handleCloseInvoice}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
