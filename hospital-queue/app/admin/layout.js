import Link from "next/link";
import "../portal.css";

export const metadata = {
	title: "Admin | DigiQueue",
};

export default function AdminLayout({ children }) {
	return (
		<div className="portal-shell">
			<header className="portal-header">
				<div className="portal-brand">
					<h2>DigiQueue Admin</h2>
					<p>Reception and operations</p>
				</div>
				<nav className="portal-nav">
					<Link href="/admin/dashboard">Dashboard</Link>
					<Link href="/admin/doctors">Doctors</Link>
					<Link href="/admin/queue">Queue</Link>
					<Link href="/admin/create-token">Create Token</Link>
					<form action="/api/auth/admin-logout" method="post">
						<button type="submit" className="nav-btn btn-danger">
							Logout
						</button>
					</form>
				</nav>
			</header>

			<main className="portal-main">
				<div className="portal-page">{children}</div>
			</main>
		</div>
	);
}
