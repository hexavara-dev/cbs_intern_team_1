"use client";

import { CBSData } from "@/types/cbs-wbs";

type CBSTableProps = {
  data: Omit<CBSData, "selected">[];
  onEdit?: (index: number) => void;
};

export default function CBSTable({ data }: CBSTableProps) {
  // const { mutate } = useDeleteCBS();

  const headers = ["No", "Name", "Cost Type"];

  return (
    <div className="w-full overflow-x-auto rounded-sm border">
      <table className="w-full border-collapse">
        {/* Header - Dark Gray */}
        <thead className="bg-gray-700 text-white">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="border-b border-gray-600 px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              return (
                <tr
                  key={index}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  {/* No */}
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-center text-sm">{item.name}</td>

                  {/* Cost Type */}
                  <td className="px-4 py-3 text-center text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.type === "Per Item"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Action - Delete Button */}
                  {/* <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => onEdit(index)}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-8 w-8 bg-transparent! p-0 text-red-500 hover:bg-red-100!"
                        onClick={() => deleteCategory(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td> */}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
