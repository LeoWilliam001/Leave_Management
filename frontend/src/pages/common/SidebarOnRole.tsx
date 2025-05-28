import EmpSidebar from "../employee/EmpSideBar";
import AdminSidebar from "../admin/AdminSideBar";

const RoleBasedSidebar = () => {
  const role = localStorage.getItem("role"); 

  const adminRoles = ["1", "2", "6"];

  if (role && adminRoles.includes(role)) {
    return <AdminSidebar />;
  }

  return <EmpSidebar />;
};

export default RoleBasedSidebar;
