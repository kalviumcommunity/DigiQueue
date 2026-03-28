import Link from "next/link";
import "./portal.css";

export default function Home() {
  return (
    <div className="portal-shell">
      <main className="portal-main">
        <div className="portal-page">
          <section className="page-hero">
            <h1>Hospital Digital Queue System</h1>
            <p>Select your role to login.</p>
          </section>

          <section className="card">
            <div className="card-grid">
              <Link className="portal-tile" href="/admin/login">
                <h3>Admin Login</h3>
                <p>Manage doctors, queues, and token operations.</p>
              </Link>
              <Link className="portal-tile" href="/doctor/login">
                <h3>Doctor Login</h3>
                <p>View your queue and call the next patient.</p>
              </Link>
              <Link className="portal-tile" href="/patient/login">
                <h3>Patient Login</h3>
                <p>Get a token and track your queue status live.</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
