import { html } from "../lib.js";
import { FeedbackBanner } from "./common.js";

export const AuthPage = ({ feedback, onLogin, onRegister }) => {
  const handleLogin = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    await onLogin(payload);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    await onRegister(payload);
  };

  return html`
    <${FeedbackBanner} feedback=${feedback} />
    <section className="grid auth-grid">
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Welcome Back</p>
            <h2>Login</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit=${handleLogin}>
          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="user@campus.com" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" placeholder="password123" required />
          </label>
          <button className="btn btn-primary" type="submit">Login</button>
        </form>
      </div>

      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">New User</p>
            <h2>Register</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit=${handleRegister}>
          <label>
            <span>Name</span>
            <input type="text" name="name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" minLength="6" required />
          </label>
          <label>
            <span>Vehicle Number</span>
            <input type="text" name="vehicleNumber" placeholder="JH10AB1234" />
          </label>
          <label>
            <span>Department</span>
            <input type="text" name="department" placeholder="Computer Science" />
          </label>
          <button className="btn btn-secondary" type="submit">Create Account</button>
        </form>
      </div>
    </section>
  `;
};
