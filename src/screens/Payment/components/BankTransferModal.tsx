import React, { useState, useEffect } from "react";
import PayphoneIcon from "../../../components/icons/PayphoneIcon";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const BankTransferModal: React.FC<Props> = ({ visible, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let t: any;
    if (copied) t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!visible) return null;

  const copyToClipboard = async () => {
    const text = `Vargas Reyes Diego Vicente\nBanco Guayaquil\nAhorro # 0005889133\nDIEGOVARGASREYES@GMAIL.COM\nCI: 1705919668`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
    } catch (err) {
      setCopied(true);
    }
  };

  return (
    <div
      className="bank-transfer-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="bank-transfer-modal-content" role="document">
        <header className="bank-transfer-modal-header">
          <div>
            <h3 className="bank-transfer-title">Transferencia bancaria</h3>
            <p className="bank-transfer-subtitle">
              Instrucciones para completar el pago mediante transferencia
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </header>

        <section
          className="bank-transfer-details"
          aria-label="Detalles de la cuenta"
        >
          <div className="bank-row">
            <div className="bank-label">Titular</div>
            <div className="bank-value">Vargas Reyes Diego Vicente</div>
          </div>
          <div className="bank-row">
            <div className="bank-label">Banco</div>
            <div className="bank-value">Banco Guayaquil</div>
          </div>
          <div className="bank-row">
            <div className="bank-label">Cuenta</div>
            <div className="bank-value">Ahorro # 0005889133</div>
          </div>
          <div className="bank-row">
            <div className="bank-label">Email</div>
            <div className="bank-value">DIEGOVARGASREYES@GMAIL.COM</div>
          </div>
          <div className="bank-row">
            <div className="bank-label">CI</div>
            <div className="bank-value">1705919668</div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 18,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button className="secondary-button" onClick={onClose}>
            Cerrar
          </button>
          <button className="primary-button" onClick={copyToClipboard}>
            Copiar datos
          </button>
        </footer>

        {copied && (
          <div className="bank-transfer-copied-banner" role="status">
            He copiado los datos
          </div>
        )}
      </div>
    </div>
  );
};

export default BankTransferModal;
