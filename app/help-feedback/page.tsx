"use client";

import { useState } from "react";
import {
  IconQuestionMark,
  IconMessageCircle,
  IconBook,
  IconMail,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
} from "@tabler/icons-react";

const faqs = [
  {
    question: "How do I add a new product to inventory?",
    answer: "Go to Inventory > Products, then click 'Add Product'. Fill in the product details including SKU, name, category, cost, and quantity, then click Save.",
  },
  {
    question: "How do I create a Purchase Order?",
    answer: "Navigate to Inventory > Purchase Orders, click 'Add Purchase Order', select a supplier from the dropdown, search and add products with quantities and costs, then click 'Save Order'.",
  },
  {
    question: "How do I process a sale at the POS?",
    answer: "Go to the POS page, search and select products to add to the cart, select a customer, then click 'Checkout' to complete the sale and generate an invoice.",
  },
  {
    question: "How do I manage suppliers?",
    answer: "Go to the Suppliers page to view all suppliers. You can add new suppliers, edit existing ones, or deactivate them using the action buttons on the table.",
  },
  {
    question: "How do I view sales reports?",
    answer: "Visit the Home dashboard. Use the 'Group By' dropdown to switch between Daily, Monthly, and Yearly views of your sales data.",
  },
  {
    question: "How do I add a new system user?",
    answer: "Go to the Users page and click 'Add User'. Enter a username, full name, email, role, and password. Only admins can manage users.",
  },
];

export default function HelpFeedbackPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitted(true);
    setName(""); setEmail(""); setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff",
    color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px", display: "block",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "24px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "32px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Help & Feedback</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "6px" }}>Find answers to common questions or send us your feedback.</p>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
          {[
            { icon: <IconBook size={22} color="#0284c7" />, bg: "#e0f2fe", label: "Documentation", desc: "Read the user guide" },
            { icon: <IconMessageCircle size={22} color="#16a34a" />, bg: "#dcfce7", label: "Live Chat", desc: "Chat with support" },
            { icon: <IconMail size={22} color="#d97706" />, bg: "#fef3c7", label: "Email Support", desc: "support@retailflow.lk" },
          ].map(({ icon, bg, label, desc }) => (
            <div key={label} style={{ background: "#fff", borderRadius: "12px", padding: "18px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconQuestionMark size={18} color="#0284c7" />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", background: openFaq === idx ? "#f0f9ff" : "#fff",
                    border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{faq.question}</span>
                  {openFaq === idx ? <IconChevronUp size={16} color="#0284c7" /> : <IconChevronDown size={16} color="#94a3b8" />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: "0 16px 14px", fontSize: "13px", color: "#475569", lineHeight: "1.6", background: "#f0f9ff" }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback form */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconMessageCircle size={18} color="#d97706" />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Send Feedback</h2>
          </div>

          {submitted && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "9px", padding: "12px 16px", fontSize: "14px", color: "#16a34a", fontWeight: 500, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <IconCheck size={16} /> Thank you! Your feedback has been received.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input style={inputStyle} placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Email (optional)</label>
                <input type="email" style={inputStyle} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Message *</label>
              <textarea
                style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                placeholder="Describe your issue, suggestion, or feedback..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                style={{ padding: "11px 28px", borderRadius: "9px", border: "none", background: "#0284c7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
