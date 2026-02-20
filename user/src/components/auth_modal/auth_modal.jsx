import React from "react";
import "./auth_modal.css";

function AuthModal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{title}</h2>
          <button className="auth-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="auth-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default AuthModal;
