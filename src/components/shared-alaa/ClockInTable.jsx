import { FiClock, FiCalendar } from "react-icons/fi";
import { BsPeople } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";

const ClockInTable = () => {
  const records = [
    {
      name: "John Doe",
      department: "D. In Medicine",
      avatar: "https://i.pravatar.cc/100?img=1",
      status: "On Time",
      clockIn: "09:00 AM",
      date: "3 Aug 2025",
    },
    {
      name: "John Doe",
      department: "D. In Medicine",
      avatar: "https://i.pravatar.cc/100?img=2",
      status: "Late",
      clockIn: "09:30 AM",
      date: "3 Aug 2025",
    },
    {
      name: "John Doe",
      department: "D. In Medicine",
      avatar: "https://i.pravatar.cc/100?img=2",
      status: "Late",
      clockIn: "09:30 AM",
      date: "3 Aug 2025",
    },
  ];

  const statusStyles = {
    "On Time": "bg-[#DFF7E9] text-[#28C76F]",
    Late: "bg-[#FDECEC] text-[#EA5455]",
  };

  const handleViewAll = () => {
    alert("Navigating to all employees' clock-ins");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 ">
      <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-3xl">
        <div className="grid grid-cols-4 font-semibold justify-items-center text-black border-b-2  border-gray-300 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <BsPeople className="text-[#7DA0FA] size-6" />
            Employees
          </div>
          <div className="flex items-center gap-2">
            <img src="assets/images/icons/status.svg" alt="" />
            Status
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="text-[#7DA0FA]  size-6" />
            Clock In Time
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="text-[#7DA0FA]  size-6" />
            Date
          </div>
        </div>

        {records.map((record, idx) => (
          <div
            key={idx}
            className="grid grid-cols-4 items-center justify-items-center py-5 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <img
                src={record.avatar}
                alt={record.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[#5C6BC0] font-medium text-[14px] cursor-pointer">
                  {record.name}
                </p>
                <p className="text-black font-medium text-[15px]">
                  {record.department}
                </p>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium w-25 ${statusStyles[record.status]}`}
              >
                <span
                  className={`h-2 w-2 rounded-lg ${
                    record.status === "On Time" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                {record.status}
              </span>
            </div>

            <div className="text-black font-semibold">{record.clockIn}</div>
            <div className="text-black font-semibold">{record.date}</div>
          </div>
        ))}

        <div className="justify-items-end mt-4 ">
          <button
            onClick={handleViewAll}
            className="font-semibold underline flex "
          >
            <a href="">View All Employees Clock-Ins </a>
            <IoIosArrowForward className="ms-2 size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClockInTable;
