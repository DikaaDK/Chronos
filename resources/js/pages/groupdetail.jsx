import React, { useState } from "react";

export default function GroupDetail() {
  const members = [
    { id: 1, name: "" },
    { id: 2, name: "" },
    { id: 3, name: "" },
  ];

  const dates = [
    { date: "2025-01-12", day: "Minggu" },
    { date: "2025-01-13", day: "Senin" },
    { date: "2025-01-14", day: "Selasa" },
  ];

  const [data, setData] = useState(
    dates.map((d) => ({
      date: d.date,
      day: d.day,
      tasks: members.map(() => ({ task: "", status: "" })),
    }))
  );

  const handleEdit = (rowIndex, memberIndex, field, value) => {
    setData((prev) => {
      const newData = [...prev];x
      newData[rowIndex].tasks[memberIndex][field] = value;
      return newData;
    });
  };

  return (
    <div className="p-4">
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-left w-28">
                Tanggal
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left w-24">
                Hari
              </th>
              {members.map((member) => (
                <th
                  key={member.id}
                  colSpan={2}
                  className="border border-gray-300 px-2 py-1 text-center"
                >
                  {member.name}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <th colSpan={2}></th>
              {members.map((member) => (
                <React.Fragment key={member.id}>
                  <th className="border border-gray-300 px-2 py-1 w-48">
                    Task
                  </th>
                  <th className="border border-gray-300 px-2 py-1 w-24">
                    Status
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.date} className="even:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                  {row.date}
                </td>
                <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                  {row.day}
                </td>
                {members.map((_, memberIndex) => (
                  <React.Fragment key={memberIndex}>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={row.tasks[memberIndex].task}
                        onChange={(e) =>
                          handleEdit(rowIndex, memberIndex, "task", e.target.value)
                        }
                        className="w-full border-none focus:ring-0 p-1 text-sm bg-transparent"
                        placeholder="Ketik task..."
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <select
                        value={row.tasks[memberIndex].status}
                        onChange={(e) =>
                          handleEdit(rowIndex, memberIndex, "status", e.target.value)
                        }
                        className="w-full border-none focus:ring-0 text-sm bg-transparent"
                      >
                        <option value="">-</option>
                        <option value="done">Selesai</option>
                        <option value="progress">Proses</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={row.date}
            className="border rounded-lg shadow-sm bg-white overflow-hidden"
          >
            <div className="bg-gray-100 px-3 py-2 flex justify-between text-sm font-semibold">
              <span>{row.date}</span>
              <span>{row.day}</span>
            </div>
            <div className="divide-y">
              {members.map((member, memberIndex) => (
                <div key={member.id} className="p-3">
                  <div className="text-sm font-medium mb-1">
                    {member.name}
                  </div>
                  <input
                    type="text"
                    value={row.tasks[memberIndex].task}
                    onChange={(e) =>
                      handleEdit(rowIndex, memberIndex, "task", e.target.value)
                    }
                    className="w-full mb-2 border border-gray-300 rounded p-1 text-sm"
                    placeholder="Ketik task..."
                  />
                  <select
                    value={row.tasks[memberIndex].status}
                    onChange={(e) =>
                      handleEdit(rowIndex, memberIndex, "status", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded p-1 text-sm"
                  >
                    <option value="">Pilih status</option>
                    <option value="done">Selesai</option>
                    <option value="progress">Proses</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
