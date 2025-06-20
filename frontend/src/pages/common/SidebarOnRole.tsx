import EmpSidebar from "../employee/EmpSideBar";
import AdminSidebar from "../admin/AdminSideBar";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

const RoleBasedSidebar = () => {
  const { user: currentUser, isLoading } = useAuth(); // Use useAuth hook

  // Show a loading indicator or null while authentication status is being determined
  if (isLoading) {
    return null; // Or a loading spinner
  }

  const role = currentUser?.role_id?.toString(); // Get role from currentUser and convert to string

  // Define admin roles as strings for consistency with comparison
  const adminRoles = ["1", "2", "6"];

  if (role && adminRoles.includes(role)) {
    return <AdminSidebar />;
  }

  return <EmpSidebar />;
};

export default RoleBasedSidebar;