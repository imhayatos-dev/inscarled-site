import AdminLiveForm from "@/components/Admin/AdminLiveForm";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <h1>Admin</h1>

      <section className="admin-section">
        <AdminLiveForm />
      </section>
    </main>
  );
}