import { html } from "../lib.js";
import { useQrScanner } from "../hooks/useQrScanner.js";
import { formatDate } from "../utils/format.js";
import { StatusChip } from "./common.js";

export const SecurityDashboard = ({
  slots,
  activeReservations,
  verificationResult,
  onVerify,
  onToggleSlot,
}) => {
  const {
    active,
    mode,
    status,
    videoRef,
    canvasRef,
    startScanner,
    stopScanner,
  } = useQrScanner({
    enabled: true,
    onDetected: onVerify,
  });

  const handleManualVerify = async (event) => {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);
    try {
      await onVerify(payload.get("permitCode"));
    } catch (error) {
      return;
    }
  };

  const start = async () => {
    try {
      await startScanner();
    } catch (error) {
      try {
        await onVerify(null, error);
      } catch (ignoredError) {
        return;
      }
    }
  };

  return html`
    <section className="grid main-grid">
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Verification</p>
            <h2>Permit Verification</h2>
          </div>
        </div>

        <form className="form-grid" onSubmit=${handleManualVerify}>
          <label>
            <span>Permit Code</span>
            <input name="permitCode" placeholder="PK-..." required />
          </label>
          <button className="btn btn-primary" type="submit">Verify Permit / QR Payload Code</button>
        </form>

        <div className="scanner-shell">
          <div className="between">
            <strong>Camera QR Scanner</strong>
            <div className="chip-row">
              <button className="btn btn-ghost" type="button" onClick=${start}>
                Start Camera
              </button>
              <button className="btn btn-danger" type="button" onClick=${stopScanner}>
                Stop Camera
              </button>
            </div>
          </div>
          <div className="scanner-frame">
            <video className="scanner-video" ref=${videoRef} autoPlay playsInline muted></video>
            <div className="scanner-overlay"></div>
            <div className="scanner-guide"></div>
          </div>
          <canvas ref=${canvasRef} hidden></canvas>
          <p className="scanner-status subtle">
            ${status}${mode ? ` (${mode === "native" ? "native" : "fallback"} mode)` : ""}
          </p>
          ${active ? html`<p className="subtle">Camera is live and scanning automatically.</p>` : null}
        </div>

        <div className="cards">
          ${verificationResult
            ? html`
                <article className="reservation-card">
                  <div className="between">
                    <strong>
                      ${verificationResult.valid ? "Permit Valid" : "Permit Expired / Invalid"}
                    </strong>
                    <${StatusChip}
                      variant=${verificationResult.valid ? "available" : "expired"}
                    >
                      ${verificationResult.reservation.status}
                    </${StatusChip}>
                  </div>
                  <p>
                    ${verificationResult.reservation.user?.name || "Unknown"} •
                    ${verificationResult.reservation.vehicleNumber}
                  </p>
                  <p className="subtle">
                    ${verificationResult.reservation.zone?.name || "Zone"} /
                    ${verificationResult.reservation.slot?.slotNumber || ""}
                  </p>
                  <p className="subtle">
                    Expires ${formatDate(verificationResult.reservation.expiresAt)}
                  </p>
                </article>
              `
            : html`<p className="muted">Scan a QR code or enter a permit code to verify it.</p>`}
        </div>
      </div>

      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Active Reservations</h2>
          </div>
        </div>
        <div className="reservation-list">
          ${activeReservations.map(
            (reservation) => html`
              <article className="reservation-card" key=${reservation._id}>
                <div className="between">
                  <strong>${reservation.user?.name || "User"}</strong>
                  <${StatusChip} variant="active">Active</${StatusChip}>
                </div>
                <p>${reservation.zone?.name || "Zone"} / ${reservation.slot?.slotNumber || ""}</p>
                <p className="subtle">${reservation.permitCode} • ${reservation.vehicleNumber}</p>
                <p className="subtle">Expires ${formatDate(reservation.expiresAt)}</p>
              </article>
            `
          )}
        </div>
      </div>
    </section>

    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Availability</p>
          <h2>Update Slot Availability</h2>
        </div>
      </div>
      <div className="slot-list">
        ${slots.map(
          (slot) => html`
            <article className="slot-card" key=${slot._id}>
              <div className="between">
                <strong>${slot.slotNumber}</strong>
                <${StatusChip} variant=${slot.isAvailable ? "available" : "occupied"}>
                  ${slot.isAvailable ? "Available" : "Occupied"}
                </${StatusChip}>
              </div>
              <p className="muted">${slot.zone?.name || "Zone"} • ${slot.vehicleType}</p>
              <button
                className="btn btn-ghost"
                onClick=${() => onToggleSlot(slot._id, slot.isAvailable)}
              >
                Mark as ${slot.isAvailable ? "Occupied" : "Available"}
              </button>
            </article>
          `
        )}
      </div>
    </section>
  `;
};
