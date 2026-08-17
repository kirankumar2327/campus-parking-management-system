import { html } from "../lib.js";

export const roleHeadline = {
  user: "Student and Staff Parking Dashboard",
  security: "Security Operations Dashboard",
  admin: "Administration Dashboard",
};

export const FeedbackBanner = ({ feedback }) =>
  feedback
    ? html`<div className=${`feedback ${feedback.type}`}>${feedback.message}</div>`
    : null;

export const StatusChip = ({ variant = "", children }) =>
  html`<span className=${`chip ${variant}`.trim()}>${children}</span>`;

export const MetricGrid = ({ metrics = [] }) => html`
  <section className="metrics">
    ${metrics.map(
      (metric) => html`
        <article className="metric-card" key=${metric.label}>
          <div className="metric-label">${metric.label}</div>
          <div className="metric-value">${metric.value}</div>
        </article>
      `
    )}
  </section>
`;

export const DashboardShell = ({ user, feedback, metrics, onLogout, children }) => html`
  <section className="dashboard-header">
    <div className="dashboard-title">
      <p className="eyebrow">${user.role}</p>
      <h2>${roleHeadline[user.role]}</h2>
      <p className="muted">Signed in as ${user.name} (${user.email})</p>
    </div>
    <button className="btn btn-danger" onClick=${onLogout}>Logout</button>
  </section>
  <${FeedbackBanner} feedback=${feedback} />
  <${MetricGrid} metrics=${metrics} />
  ${children}
`;
