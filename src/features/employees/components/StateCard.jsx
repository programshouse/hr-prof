import { Users, UserPlus, User, UserCheck } from "lucide-react";

const SimpleStatCard = ({ title, value, icon: Icon, bgColor }) => {
  return (
    <div
      className={`rounded-xl shadow-sm p-4 flex items-center gap-4 w-[20%] ${bgColor}`}
    >
      <div className="rounded-lg p-3 bg-white">
        <Icon className="size-6 text-black " />
      </div>

      <div>
        <div className="flex items-center gap-2 text-black text-lg font-medium ">
          {title}
        </div>
        <span className="text-lg font-semibold text-gray ">{value}</span>
      </div>
    </div>
  );
};

export default function EmployeeStats() {
  const stats = [
    {
      title: "Total Employees",
      value: 300,
      icon: Users,
      bgColor: "bg-[#F6F1FF]",
    },
    {
      title: "New Employees",
      value: 20,
      icon: UserPlus,
      bgColor: "bg-[#FEF4EC]",
    },
    {
      title: "Male",
      value: 30,
      icon: User,
      bgColor: "bg-[#EBF0FE]",
    },
    {
      title: "Female",
      value: 40,
      icon: UserCheck,
      bgColor: "bg-[#DFF5EE]",
    },
  ];

  return (
    <div className="p-6 flex gap-6 bg-gray-50 rounded-lg">
      {stats.map((stat, index) => (
        <SimpleStatCard key={index} {...stat} />
      ))}
    </div>
  );
}
