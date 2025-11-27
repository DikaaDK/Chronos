import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const SAMPLE_DATES = [
  { date: "2025-01-12", day: "Minggu" },
  { date: "2025-01-13", day: "Senin" },
  { date: "2025-01-14", day: "Selasa" },
];

const STATUS_OPTIONS = [
  { value: "", label: "-" },
  { value: "done", label: "Selesai" },
  { value: "progress", label: "Proses" },
  { value: "pending", label: "Pending" },
];

const ROLE_BADGE_CLASS = {
  owner: "bg-emerald-100 text-emerald-700",
  member: "bg-blue-100 text-blue-700",
};

export default function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [schedule, setSchedule] = useState(() =>
    SAMPLE_DATES.map((date) => ({ ...date, tasks: [] }))
  );

  const members = group?.users ?? [];

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMessage("Sesi berakhir, silakan login ulang.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGroup(response.data);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ?? "Gagal memuat detail group."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  useEffect(() => {
    if (!members.length) {
      setSchedule(SAMPLE_DATES.map((date) => ({ ...date, tasks: [] })));
      return;
    }

    setSchedule((prev) =>
      SAMPLE_DATES.map((date, dateIndex) => {
        const existingRow = prev[dateIndex] ?? { tasks: [] };

        const tasks = members.map((_, memberIndex) => {
          const existingTask = existingRow.tasks?.[memberIndex];
          if (existingTask) {
            return existingTask;
          }

          return { task: "", status: "" };
        });

        return { ...date, tasks };
      })
    );
  }, [members]);

  const handleEdit = (rowIndex, memberIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((row, currentRowIndex) => {
        if (currentRowIndex !== rowIndex) {
          return row;
        }

        const tasks = [...row.tasks];
        const currentTask = tasks[memberIndex] ?? { task: "", status: "" };
        tasks[memberIndex] = { ...currentTask, [field]: value };

        return { ...row, tasks };
      })
    );
  };

  const handleCopyInviteCode = async () => {
    if (!group?.invite_code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(group.invite_code);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch (err) {
      setInviteCopied(false);
    }
  };

  const navigateBack = () => {
    navigate("/group");
  };

  const owner = members.find((member) => member?.pivot?.role === "owner");
  const createdAtLabel = group?.created_at
    ? new Date(group.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const renderBadgeClass = (role) =>
    ROLE_BADGE_CLASS[role] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-24 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={navigateBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            type="button"
          >
            <span className="inline-block rounded-full border border-emerald-200 px-3 py-1 text-xs uppercase tracking-wide">
              Kembali
            </span>
            <span className="hidden sm:inline">Ke daftar group</span>
          </button>

          <div className="text-right sm:text-left">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Detail Group
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {group?.name ?? "Memuat..."}
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <div className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white/60" />
            <div className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white/60" />
            <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white/60" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6 text-red-700">
            <p className="text-sm font-medium">{errorMessage}</p>
            <button
              onClick={navigateBack}
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Kembali ke daftar group
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
                {group.description ? (
                  <p className="text-sm text-gray-600">{group.description}</p>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    Belum ada deskripsi untuk group ini.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Dibuat {createdAtLabel}
                  </span>
                  {owner && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Owner {owner.name}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Kode undangan
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {group.invite_code}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyInviteCode}
                    className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Salin kode
                  </button>
                  {inviteCopied && (
                    <p className="mt-2 text-xs font-medium text-emerald-600">
                      Kode berhasil disalin!
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total anggota</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{members.length}</p>
                <p className="mt-1 text-xs text-gray-500">Termasuk owner group</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pemilik</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {owner?.name ?? "Belum ditentukan"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {owner?.email ?? "Email tidak tersedia"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">ID Group</p>
                <p className="mt-2 truncate text-lg font-semibold text-gray-900">
                  {group.id}
                </p>
                <p className="mt-1 text-xs text-gray-500">Gunakan untuk referensi internal</p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Anggota group</h2>
                  <p className="text-sm text-gray-500">
                    {members.length ? "Pantau siapa saja yang ada di dalam group." : "Belum ada anggota lain di group ini."}
                  </p>
                </div>
              </div>

              {members.length ? (
                <ul className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {member.name ?? "Tanpa nama"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.email ?? "Email tidak tersedia"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${renderBadgeClass(
                          member?.pivot?.role
                        )}`}
                      >
                        {(member?.pivot?.role ?? "member").toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  Ajak anggota lain untuk bergabung menggunakan kode undangan.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Rencana mingguan</h2>
                  <p className="text-sm text-gray-500">
                    Gunakan catatan ini untuk membagi tugas ringan secara cepat.
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  Data tidak tersimpan permanen
                </span>
              </div>

              {members.length ? (
                <div className="space-y-4 px-4 py-4">
                  <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
                    <table className="min-w-full text-sm text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-32 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Tanggal
                          </th>
                          <th className="w-24 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Hari
                          </th>
                          {members.map((member) => (
                            <th
                              key={member.id}
                              colSpan={2}
                              className="border-b border-gray-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                              {member.name ?? "Tanpa nama"}
                            </th>
                          ))}
                        </tr>
                        <tr className="bg-gray-100">
                          <th className="border-b border-r border-gray-200 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            
                          </th>
                          <th className="border-b border-r border-gray-200 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            
                          </th>
                          {members.map((member) => (
                            <React.Fragment key={`header-${member.id}`}>
                              <th className="border-b border-r border-gray-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Task
                              </th>
                              <th className="border-b border-gray-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                              </th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row, rowIndex) => (
                          <tr key={row.date} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border-t border-r border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                              {row.date}
                            </td>
                            <td className="border-t border-r border-gray-200 px-4 py-3 text-sm text-gray-600">
                              {row.day}
                            </td>
                            {members.map((_, memberIndex) => {
                              const task = row.tasks?.[memberIndex] ?? {
                                task: "",
                                status: "",
                              };

                              return (
                                <React.Fragment key={`${row.date}-${memberIndex}`}>
                                  <td className="border-t border-r border-gray-200 px-3 py-3 align-top">
                                    <input
                                      type="text"
                                      value={task.task}
                                      onChange={(event) =>
                                        handleEdit(
                                          rowIndex,
                                          memberIndex,
                                          "task",
                                          event.target.value
                                        )
                                      }
                                      placeholder="Ketik task"
                                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                                    />
                                  </td>
                                  <td className="border-t border-gray-200 px-3 py-3 align-top">
                                    <select
                                      value={task.status}
                                      onChange={(event) =>
                                        handleEdit(
                                          rowIndex,
                                          memberIndex,
                                          "status",
                                          event.target.value
                                        )
                                      }
                                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                                    >
                                      {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4 md:hidden">
                    {schedule.map((row, rowIndex) => (
                      <div
                        key={`${row.date}-mobile`}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between rounded-t-xl bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>{row.date}</span>
                          <span>{row.day}</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {members.map((member, memberIndex) => {
                            const task = row.tasks?.[memberIndex] ?? {
                              task: "",
                              status: "",
                            };

                            return (
                              <div key={`${row.date}-${member.id}`} className="space-y-2 px-4 py-3">
                                <p className="text-sm font-semibold text-gray-900">
                                  {member.name ?? "Tanpa nama"}
                                </p>
                                <input
                                  type="text"
                                  value={task.task}
                                  onChange={(event) =>
                                    handleEdit(
                                      rowIndex,
                                      memberIndex,
                                      "task",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Ketik task"
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                                />
                                <select
                                  value={task.status}
                                  onChange={(event) =>
                                    handleEdit(
                                      rowIndex,
                                      memberIndex,
                                      "status",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Tambahkan anggota terlebih dahulu untuk membuat rencana mingguan.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
