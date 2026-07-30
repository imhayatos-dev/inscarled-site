import AdminLiveForm from "@/components/Admin/AdminLiveForm";
import AdminNewsForm from "@/components/Admin/AdminNewsForm";
import AdminMusicForm from "@/components/Admin/AdminMusicForm";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <h1>Admin</h1>

      <section className="admin-section">
        <AdminLiveForm />
      </section>

      <section className="admin-section">
        <AdminNewsForm />
      </section>

      <section className="admin-section">
    <AdminMusicForm />
</section>
    </main>
  );
}