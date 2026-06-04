export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case "ongoing":
      return "bg-blue-100 text-blue-800";
    case "finish":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    case "maintenance":
      return "bg-purple-100 text-purple-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    case "hold":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
