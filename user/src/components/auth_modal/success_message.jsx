import React from "react";
import "./success_message.css";

function SuccessMessage({
  message,
  actionText,
  onActionClick,
  onClose,
  closeText = "Zamknij",
}) {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <p>{message}</p>
        <div className="success-actions">
          {actionText && onActionClick && (
            <button className="btn btn-primary" onClick={onActionClick}>
              {actionText}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessMessage;
