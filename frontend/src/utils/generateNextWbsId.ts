/**
 * Generate next WBS ID based on selected parent ID
 * Example:
 * parentId = "1"
 * existing IDs = ["1", "1.1", "1.2"]
 * result = "1.3"
 */
export function generateNextWbsId(
  parentId: string,
  wbsData: { wbs_id: string }[]
) {
  const children = wbsData
    .map((item) => item.wbs_id)
    .filter(
      (id) =>
        id.startsWith(`${parentId}.`) &&
        id.split(".").length === parentId.split(".").length + 1
    )
    .map((id) => Number(id.split(".").pop()))
    .filter((num) => !isNaN(num));

  const nextIndex = children.length > 0 ? Math.max(...children) + 1 : 1;

  return `${parentId}.${nextIndex}`;
}
