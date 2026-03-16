import NextLink from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", maxWidth: "700px", zIndex: 1 }}>
        {/* <div style={{ marginBottom: "32px" }}>
          <Image
            src="/logo2.jpg"
            alt="Retail Flow"
            width={220}
            height={70}
            style={{ objectFit: "contain", filter: "brightness(1.1)" }}
          />
        </div> */}

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: "700",
          color: "#ffffff",
          lineHeight: "1.15",
          marginBottom: "20px",
          letterSpacing: "-0.02em",
        }}>
          Retail Flow
          <span style={{ display: "block", color: "#38bdf8" }}>
            Inventory Management
          </span>
        </h1> 

        {/* <p style={{
          fontSize: "18px",
          color: "#94a3b8",
          lineHeight: "1.6",
          maxWidth: "500px",
          margin: "0 auto 48px",
        }}>
          Streamline your inventory, manage suppliers, track customers, and grow your business — all in one place.
        </p> */}

        <NextLink href="/auth" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 48px",
          background: "#0ea5e9",
          color: "#ffffff",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "700",
          textDecoration: "none",
          boxShadow: "0 8px 32px rgba(14,165,233,0.4)",
          border: "2px solid #0ea5e9",
        }}>
          Get Started
        </NextLink>

        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginTop: "64px",
          flexWrap: "wrap",
        }}>
          {[
            { label: "Products", desc: "Real-time inventory" },
            { label: "Customers", desc: "Customer database" },
            { label: "Suppliers", desc: "Supplier network" },
            { label: "POS", desc: "Point-of-sale" },
          ].map((feature) => (
            <div key={feature.label} style={{
              textAlign: "center",
              padding: "20px 24px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              minWidth: "130px",
            }}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" }}>{feature.label}</p>
              <p style={{ fontSize: "12px", color: "#64748b" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
