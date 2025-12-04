import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import { useLocalization } from "../context/LocalizationContext";

const SCHEDULE_WINDOW_LENGTH = 5;
const STATUS_VALUES = ["", "done", "progress", "pending"];

const ROLE_BADGE_CLASS = {
  owner: "bg-emerald-100 text-emerald-700",
  member: "bg-blue-100 text-blue-700",
};

const STATUS_BADGE_CLASS = {
  default: "border border-gray-200 bg-gray-50 text-gray-600",
  done: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  progress: "border border-amber-200 bg-amber-50 text-amber-700",
  pending: "border border-slate-200 bg-white text-slate-600",
};

export default function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, locale } = useLocalization();

  const statusOptions = useMemo(() => {
    const fallbackMap = {
      "": "-",
      done: "Selesai",
      progress: "Proses",
      pending: "Pending",
    };

    return STATUS_VALUES.map((value) => {
      const translationKey = value ? value : "none";
      return {
        value,
        label: t(`group_detail.status.${translationKey}`, fallbackMap[value] ?? "-"),
      };
    });
  }, [t]);

  const statusLabelMap = useMemo(() => {
    return statusOptions.reduce((acc, option) => {
      acc[option.value ?? ""] = option.label;
      return acc;
    }, {});
  }, [statusOptions]);
  const statusUnselectedLabel = t('group_detail.status.unselected', 'Belum dipilih');

  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [groupTasks, setGroupTasks] = useState([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const pendingSavesRef = useRef(new Map());
  const groupTasksRef = useRef(groupTasks);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [windowStartDate, setWindowStartDate] = useState(todayISO);
  const scheduleDates = useMemo(
    () => buildScheduleTemplate(SCHEDULE_WINDOW_LENGTH, windowStartDate),
    [windowStartDate]
  );

  const members = group?.users ?? [];
  const memberLookup = useMemo(() => {
    const lookup = new Map();
    members.forEach((member) => lookup.set(member.id, member));
    return lookup;
  }, [members]);
  const schedule = useMemo(
    () => buildScheduleMatrix(scheduleDates, members, groupTasks),
    [members, groupTasks, scheduleDates]
  );
  const isShowingPastWindow = useMemo(
    () => new Date(windowStartDate) < new Date(todayISO),
    [todayISO, windowStartDate]
  );
  const dateRangeStartLabel = scheduleDates[0]?.date ?? "-";
  const dateRangeEndLabel =
    scheduleDates[scheduleDates.length - 1]?.date ?? "-";

  useEffect(() => {
    groupTasksRef.current = groupTasks;
  }, [groupTasks]);


  useEffect(() => {
    return () => {
      pendingSavesRef.current.forEach((timer) => clearTimeout(timer));
      pendingSavesRef.current.clear();
    };
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      setCurrentUser(null);
    }
  }, []);

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

  const fetchGroupTasks = useCallback(async (groupId) => {
    try {
      setIsScheduleLoading(true);
      setScheduleError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setScheduleError("Sesi berakhir, silakan login ulang.");
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/groups/${groupId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroupTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setScheduleError(
        error?.response?.data?.message ?? "Gagal memuat jurnal group."
      );
    } finally {
      setIsScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!group?.id) {
      return;
    }

    fetchGroupTasks(group.id);
  }, [group?.id, fetchGroupTasks]);

  const persistTask = useCallback(
    async (taskDate, userId, taskValue, statusValue) => {
      if (!group?.id) {
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setScheduleError("Sesi berakhir, silakan login ulang.");
        return;
      }

      const sanitizedTask = typeof taskValue === "string" ? taskValue.trim() : "";
      const sanitizedStatus =
        typeof statusValue === "string" && statusValue.length > 0
          ? statusValue
          : null;

      try {
        await axios.put(
          `http://127.0.0.1:8000/api/groups/${group.id}/tasks`,
          {
            task_date: taskDate,
            user_id: userId,
            task: sanitizedTask,
            status: sanitizedStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setScheduleError("");
      } catch (error) {
        console.error("Gagal menyimpan jadwal group:", error);
        setScheduleError(
          error?.response?.data?.message ?? "Gagal menyimpan jadwal. Coba lagi."
        );
      }
    },
    [group?.id]
  );

  const queuePersistTask = useCallback(
    (taskDate, userId, taskValue, statusValue) => {
      if (!group?.id) {
        return;
      }

      const key = `${taskDate}:${userId}`;
      const pendingTimer = pendingSavesRef.current.get(key);
      if (pendingTimer) {
        clearTimeout(pendingTimer);
      }

      const timer = setTimeout(() => {
        persistTask(taskDate, userId, taskValue, statusValue).finally(() => {
          pendingSavesRef.current.delete(key);
        });
      }, 450);

      pendingSavesRef.current.set(key, timer);
    },
    [group?.id, persistTask]
  );

  useEffect(() => {
    if (!group?.id) {
      return;
    }

    const token = localStorage.getItem("token");
    const getEchoInstance =
      typeof window !== "undefined" ? window.getEchoInstance : null;

    if (!token || typeof getEchoInstance !== "function") {
      return;
    }

    const echo = getEchoInstance(token);
    if (!echo) {
      return;
    }

    const channelName = `groups.${group.id}`;
    const privateChannelName = `private-${channelName}`;
    const channel = echo.private(channelName);

    const handleRealtimeUpdate = (payload) => {
      setGroupTasks((prev) => applyRealtimeGroupTaskChange(prev, payload));
    };

    channel.listen(".GroupScheduleUpdated", handleRealtimeUpdate);

    return () => {
      channel.stopListening(".GroupScheduleUpdated");
      echo.leave(privateChannelName);
    };
  }, [group?.id]);

  useEffect(() => {
    if (!members.length) {
      setGroupTasks([]);
    }
  }, [members.length]);

  const handleEdit = (rowIndex, memberIndex, field, value) => {
    if (!group?.id) {
      return;
    }

    const dateInfo = scheduleDates[rowIndex];
    const member = members[memberIndex];

    if (!dateInfo || !member) {
      return;
    }

    if (!currentUser || currentUser.id !== member.id) {
      return;
    }

    const existingEntry = groupTasksRef.current.find(
      (entry) =>
        entry.task_date === dateInfo.date && entry.user_id === member.id
    );

    const nextTaskValue = field === "task" ? value : existingEntry?.task ?? "";
    const nextStatusValue = field === "status" ? value : existingEntry?.status ?? "";

    setGroupTasks((prev) =>
      upsertGroupTaskState(prev, {
        groupId: group.id,
        userId: member.id,
        taskDate: dateInfo.date,
        task: nextTaskValue,
        status: nextStatusValue,
        existingId: existingEntry?.id,
      })
    );

    queuePersistTask(dateInfo.date, member.id, nextTaskValue, nextStatusValue);
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
  const isOwner = currentUser?.id === group?.owner_id;
  const createdAtLabel = group?.created_at
    ? new Date(group.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const renderBadgeClass = (role) =>
    ROLE_BADGE_CLASS[role] ?? "bg-gray-100 text-gray-600";

  const resolveMemberAvatar = (member) => {
    if (!member) {
      return { url: null, initials: "?" };
    }

    const safeName = member.name?.trim() || "Tanpa nama";
    const url =
      member.avatar_url ||
      member.profile_photo_url ||
      null;

    const initials = safeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk.charAt(0).toUpperCase())
      .join("") || "?";

    return { url, initials, name: safeName };
  };

  const openDeleteModal = () => {
    if (!isOwner || !group) {
      return;
    }

    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
  };

  const handleDeleteGroup = async () => {
    if (!group || !isOwner || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteError("Sesi berakhir, silakan login ulang sebelum menghapus.");
        setIsDeleting(false);
        return;
      }

      await axios.delete(`http://127.0.0.1:8000/api/groups/${group.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsDeleteModalOpen(false);
      navigate("/group", { replace: true });
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message ?? "Gagal menghapus group, coba lagi."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowPreviousDates = useCallback(() => {
    setWindowStartDate((prev) => shiftDateString(prev, -SCHEDULE_WINDOW_LENGTH));
  }, []);

  const handleShowNextDates = useCallback(() => {
    setWindowStartDate((prev) => {
      const nextStart = shiftDateString(prev, SCHEDULE_WINDOW_LENGTH);
      if (new Date(nextStart) > new Date(todayISO)) {
        return todayISO;
      }
      return nextStart;
    });
  }, [todayISO]);

  const handleBackToToday = useCallback(() => {
    setWindowStartDate(todayISO);
  }, [todayISO]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={navigateBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            type="button"
          >
            <span className="inline-block rounded-full border border-emerald-200 px-3 py-1 text-xs uppercase tracking-wide">
              Kembali
            </span>
          </button>

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="text-right sm:text-left">
              <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                Detail Group
              </p>
              <h1 className="text-2xl font-bold text-gray-900">
                {group?.name ?? "Memuat..."}
              </h1>
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={openDeleteModal}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={16} />
                {isDeleting ? "Menghapus..." : "Hapus group"}
              </button>
            )}
          </div>
        </div>

        {deleteError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        )}

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
                  {members.map((member) => {
                    const avatar = resolveMemberAvatar(member);
                    return (
                      <li
                        key={member.id}
                        className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {avatar.url ? (
                            <img
                              src={avatar.url}
                              alt={`Foto profil ${avatar.name}`}
                              className="h-12 w-12 rounded-full border border-gray-100 object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-600">
                              {avatar.initials}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {member.name ?? "Tanpa nama"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.email ?? "Email tidak tersedia"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${renderBadgeClass(
                            member?.pivot?.role
                          )}`}
                        >
                          {(member?.pivot?.role ?? "member").toUpperCase()}
                        </span>
                      </li>
                    );
                  })}
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
                <div className="text-xs font-semibold text-emerald-600">
                  <span>Disimpan otomatis & realtime</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Menampilkan {dateRangeStartLabel} s/d {dateRangeEndLabel}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] normal-case">
                  <button
                    type="button"
                    onClick={handleShowPreviousDates}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
                    aria-label="Tanggal sebelumnya"
                    title="Tanggal sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {isShowingPastWindow && (
                    <>
                      <button
                        type="button"
                        onClick={handleShowNextDates}
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
                        aria-label="Tanggal berikutnya"
                        title="Tanggal berikutnya"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleBackToToday}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 transition hover:border-emerald-300"
                        aria-label="Kembali ke hari ini"
                        title="Kembali ke hari ini"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {scheduleError && (
                <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {scheduleError}
                </div>
              )}

              {members.length ? (
                <>
                  <div className="space-y-4 px-4 py-4">
                    {isScheduleLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((placeholder) => (
                          <div
                            key={`schedule-loading-${placeholder}`}
                            className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                  <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
                    <table className="min-w-full text-sm text-gray-700">
                      <thead>
                        <tr className="bg-emerald-50/70 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          <th className="w-40 border-b border-r border-emerald-100 px-4 py-3">Tanggal</th>
                          <th className="w-28 border-b border-r border-emerald-100 px-4 py-3">Hari</th>
                          {members.map((member) => (
                            <th
                              key={member.id}
                              colSpan={2}
                              className="border-b border-l border-emerald-100 px-4 py-3 text-center"
                            >
                              <div className="text-gray-800">
                                <p className="text-xs font-semibold">{member.name ?? "Tanpa nama"}</p>
                                <p className="text-[10px] font-normal text-gray-500">Task & Status</p>
                              </div>
                            </th>
                          ))}
                        </tr>
                        <tr className="bg-white text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          <th className="border-b border-r border-gray-200 px-4 py-2"></th>
                          <th className="border-b border-r border-gray-200 px-4 py-2"></th>
                          {members.map((member) => (
                            <React.Fragment key={`subheader-${member.id}`}>
                              <th className="border-b border-r border-l border-gray-200 px-4 py-2 text-center">
                                Task
                              </th>
                              <th className="border-b border-gray-200 px-4 py-2 text-center">
                                Status
                              </th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row, rowIndex) => {
                          const isTodayRow = row.date === todayISO;
                          const rowBackground = isTodayRow
                            ? "bg-emerald-50/70"
                            : rowIndex % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50";

                          return (
                            <tr
                              key={row.date}
                              className={`${rowBackground} transition-colors`}
                            >
                              <td className="border-t border-r border-gray-200 px-4 py-4 align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatDateWithDay(row.date)}
                                  </span>
                                  <span className="text-xs text-gray-500">{row.date}</span>
                                  {isTodayRow && (
                                    <span className="mt-1 inline-flex w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                      Hari ini
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="border-t border-r border-gray-200 px-4 py-4 align-top text-sm font-semibold text-gray-600">
                                {row.day}
                              </td>
                              {members.map((member, memberIndex) => {
                                const task = row.tasks?.[memberIndex] ?? {
                                  task: "",
                                  status: "",
                                };
                                const canEditCell = currentUser?.id === member.id;
                                const badgeClass = STATUS_BADGE_CLASS[task.status] ?? STATUS_BADGE_CLASS.default;
                                const statusLabel = statusLabelMap[task.status ?? ""] ?? statusUnselectedLabel;

                                return (
                                  <React.Fragment key={`${row.date}-${member.id}`}>
                                    <td className="border-t border-r border-l border-gray-200 px-3 py-4 align-top">
                                      <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                          Task
                                        </span>
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
                                          disabled={!canEditCell}
                                          title={!canEditCell ? "Hanya pemilik jurnal yang dapat mengubah catatan ini" : undefined}
                                          className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-200/60 ${
                                            canEditCell
                                              ? "border-gray-200 bg-white/90 focus:border-emerald-400"
                                              : "border-gray-100 bg-gray-50 text-gray-400"
                                          }`}
                                        />
                                      </div>
                                    </td>
                                    <td className="border-t border-gray-200 px-3 py-4 align-top">
                                      <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                          Status
                                        </span>
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
                                          disabled={!canEditCell}
                                          title={!canEditCell ? "Anda tidak bisa mengubah status jurnal milik anggota lain" : undefined}
                                          className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-200/60 ${
                                            canEditCell
                                              ? "border-gray-200 bg-white/90 focus:border-emerald-400"
                                              : "border-gray-100 bg-gray-50 text-gray-400"
                                          }`}
                                        >
                                          {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                              {option.label}
                                            </option>
                                          ))}
                                        </select>
                                        <div className="text-center">
                                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                                            {statusLabel}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4 md:hidden">
                    {schedule.map((row, rowIndex) => {
                      const isTodayRow = row.date === todayISO;

                      return (
                        <div
                          key={`${row.date}-mobile`}
                          className="rounded-2xl border border-emerald-50 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between rounded-t-2xl bg-emerald-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            <div>
                              <p>{formatDateWithDay(row.date)}</p>
                              <p className="text-[11px] font-normal text-emerald-800/70">{row.date}</p>
                            </div>
                            <div className="text-right">
                              <p>{row.day}</p>
                              {isTodayRow && (
                                <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Hari ini
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {members.map((member, memberIndex) => {
                              const task = row.tasks?.[memberIndex] ?? {
                                task: "",
                                status: "",
                              };
                              const canEditCell = currentUser?.id === member.id;
                              const badgeClass = STATUS_BADGE_CLASS[task.status] ?? STATUS_BADGE_CLASS.default;
                              const statusLabel = statusLabelMap[task.status ?? ""] ?? statusUnselectedLabel;

                              return (
                                <div key={`${row.date}-${member.id}`} className="space-y-3 px-4 py-4">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {member.name ?? "Tanpa nama"}
                                  </p>
                                  <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      Task
                                    </label>
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
                                      disabled={!canEditCell}
                                      title={!canEditCell ? "Hanya pemilik jurnal yang dapat mengubah catatan ini" : undefined}
                                      className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200/60 ${
                                        canEditCell
                                          ? "border-gray-200 bg-white/90 focus:border-emerald-400"
                                          : "border-gray-100 bg-gray-50 text-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      Status
                                    </label>
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
                                      disabled={!canEditCell}
                                      title={!canEditCell ? "Anda tidak bisa mengubah status jurnal milik anggota lain" : undefined}
                                      className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200/60 ${
                                        canEditCell
                                          ? "border-gray-200 bg-white/90 focus:border-emerald-400"
                                          : "border-gray-100 bg-gray-50 text-gray-400"
                                      }`}
                                    >
                                      {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="text-center">
                                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                                        {statusLabel}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                    )}
                  </div>

                </>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Tambahkan anggota terlebih dahulu untuk membuat rencana mingguan.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus group?"
        description={
          group?.name
            ? `Group "${group.name}" akan dihapus permanen beserta anggota yang terkait.`
            : "Group ini akan dihapus permanen beserta anggota yang terkait."
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteGroup}
        onCancel={closeDeleteModal}
        isConfirming={isDeleting}
        variant="danger"
        errorMessage={deleteError}
      />
    </div>
  );
}

function buildScheduleTemplate(length = 5, startDateInput = new Date()) {
  const startDate = normalizeDateInput(startDateInput);

  return Array.from({ length }, (_, index) => {
    const cursor = new Date(startDate);
    cursor.setDate(startDate.getDate() + index);

    return {
      date: cursor.toISOString().slice(0, 10),
      day: cursor.toLocaleDateString("id-ID", { weekday: "long" }),
    };
  });
}

function buildScheduleMatrix(dates, members, entries) {
  const safeDates = Array.isArray(dates) ? dates : [];
  const safeMembers = Array.isArray(members) ? members : [];
  const safeEntries = Array.isArray(entries) ? entries : [];

  return safeDates.map((dateInfo) => {
    const tasks = safeMembers.map((member) => {
      const entry = safeEntries.find(
        (item) => item.task_date === dateInfo.date && item.user_id === member.id
      );

      return {
        task: entry?.task ?? "",
        status: entry?.status ?? "",
      };
    });

    return { ...dateInfo, tasks };
  });
}

function upsertGroupTaskState(list, { groupId, userId, taskDate, task, status, existingId }) {
  const safeList = Array.isArray(list) ? [...list] : [];
  const normalizedTask = typeof task === "string" ? task : "";
  const normalizedStatus = typeof status === "string" ? status : "";

  const filtered = safeList.filter(
    (entry) => !(entry.task_date === taskDate && entry.user_id === userId)
  );

  if (!normalizedTask.trim() && !normalizedStatus) {
    return filtered;
  }

  const nextEntry = {
    id: existingId ?? null,
    group_id: groupId,
    user_id: userId,
    task_date: taskDate,
    task: normalizedTask,
    status: normalizedStatus || null,
  };

  return [...filtered, nextEntry];
}

function applyRealtimeGroupTaskChange(list, payload) {
  const safeList = Array.isArray(list) ? [...list] : [];
  const action = payload?.action;
  const entry = payload?.entry;

  if (!action || !entry) {
    return safeList;
  }

  const taskDate = entry.task_date ?? entry.date;
  const userId = entry.user_id;

  if (!taskDate || userId == null) {
    return safeList;
  }

  const filtered = safeList.filter(
    (item) => !(item.task_date === taskDate && item.user_id === userId)
  );

  if (action === "deleted") {
    return filtered;
  }

  if (action === "upserted") {
    return [...filtered, entry];
  }

  return safeList;
}

function shiftDateString(dateInput, amount) {
  const base = normalizeDateInput(dateInput);
  base.setDate(base.getDate() + amount);
  return base.toISOString().slice(0, 10);
}

function normalizeDateInput(input) {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return new Date(input);
  }

  if (typeof input === "string" || typeof input === "number") {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function formatDateWithDay(dateString) {
  if (!dateString) {
    return "-";
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  const weekday = parsed.toLocaleDateString("id-ID", { weekday: "long" });
  const fullDate = parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${weekday}, ${fullDate}`;
}
