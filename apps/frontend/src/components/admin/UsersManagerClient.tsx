"use client";

import { useEffect, useState } from "react";
import { Users, Shield, ShieldOff, Trash2, Search, Loader2, Edit, X, Plus, Upload } from "lucide-react";
import { usersApi, type SystemUser } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { ImportUsersExcelModal } from "./ImportUsersExcelModal";

export function UsersManagerClient() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = useAuthStore((state) => state.user);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    status: "ACTIVE" | "INACTIVE";
  }>({ name: "", email: "", role: "USER", status: "ACTIVE" });
  const [saving, setSaving] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.list();
      setUsers(data as SystemUser[]);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", role: "USER", status: "ACTIVE" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingUser) {
        // Cập nhật
        const payload = {
          name: form.name,
          role: form.role,
          status: form.status
        };
        await usersApi.update(editingUser.id, payload);
        alert("Cập nhật thông tin thành công!");
      } else {
        // Thêm mới
        await usersApi.create(form as any);
        alert("Thêm mới người dùng thành công!");
      }
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      alert((err instanceof Error ? err.message : null) || (editingUser ? "Cập nhật thất bại." : "Thêm mới thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await usersApi.delete(id);
      alert("Đã xóa người dùng thành công.");
      fetchUsers();
    } catch (err: unknown) {
      alert((err instanceof Error ? err.message : null) || "Xóa người dùng thất bại.");
    }
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    fetchUsers();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Người dùng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem và chỉnh sửa tài khoản người dùng, thay đổi quyền và trạng thái.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 p-4 border-b bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold text-foreground transition hover:bg-muted/80 shadow-sm border border-border"
            >
              <Upload className="size-4" />
              Import Excel
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="size-4" />
              Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="size-8 animate-spin mb-4 text-emerald-500" />
              <p>Đang tải danh sách người dùng...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 bg-rose-50/50">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium border shadow-sm hover:bg-gray-50 transition"
              >
                Thử lại
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Users className="size-12 opacity-20 mb-4" />
              <p>Không tìm thấy người dùng nào.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Người dùng</th>
                  <th className="px-6 py-4 font-semibold">Quyền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Ngày tham gia</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p>{u.name}</p>
                          <p className="text-xs text-muted-foreground font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === "ADMIN" 
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}>
                        {u.role === "ADMIN" ? <Shield className="size-3.5" /> : <Users className="size-3.5" />}
                        {u.role === "ADMIN" ? "Quản trị viên" : "Nông dân"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.status === "ACTIVE" 
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.id !== u.id && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Sửa thông tin"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition hover:text-blue-700"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            title="Xóa người dùng"
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition hover:text-rose-700"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                      {currentUser?.id === u.id && (
                        <span className="text-xs text-muted-foreground italic">Bạn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">{editingUser ? "Chỉnh sửa Người dùng" : "Thêm Người dùng"}</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted transition">
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  readOnly={!!editingUser}
                  value={form.email}
                  onChange={(e) => !editingUser && setForm({...form, email: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                    editingUser 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-background focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Quyền hạn</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value as "ADMIN" | "USER"})}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="USER">Nông dân (USER)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value as "ACTIVE" | "INACTIVE"})}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="INACTIVE">Bị khóa (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportUsersExcelModal 
        open={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={handleImportSuccess} 
      />
    </div>
  );
}
