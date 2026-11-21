import React from "react";
import EmployeeDetailsSkeleton from "./EmployeeDetailsSkeleton";

import DocumentsCard from "./components/DocumentsCard";
import AverageTable from "./components/AverageTable";

// Cards
import BasicInformationCard from "./cards/BasicInformationCard";
import ContactInformationCard from "./cards/ContactInformationCard";
import WorkDetailsCard from "./cards/WorkDetailsCard";
import ContractDetailsCard from "./cards/ContractDetailsCard";
import SalaryDetailsCard from "./cards/SalaryDetailsCard";

export default function EmployeeDetailsCards({
  employee,
  isLoading,
  isEditing = false,
  onFieldChange,
}) {
  if (isLoading || !employee) return <EmployeeDetailsSkeleton />;

  const {
    basic,
    contact = {},
    documents,
    work = {},
    contract = {},
    salary = {},
  } = employee;

  // Determine if employee is a freelancer
  const shiftType = work.shiftType ?? work.shift_id;
  const shiftLabel = work?.employmentType || employee?.employmentType || "";
  const employmentName = (shiftLabel || "").toLowerCase();

  const isFreelancer = employmentName.includes("free") || Number(shiftType) === 3;

  const salaryType = salary.type || salary.salary_type || "";
  const averageDetails = salary.averageDetails || salary.salary_details || [];

  const showAverage =
    (salaryType || "").toLowerCase() === "multi" &&
    Array.isArray(averageDetails) &&
    averageDetails.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <BasicInformationCard
        basic={basic}
        isEditing={isEditing}
        onFieldChange={(field, value) => onFieldChange("basic", field, value)}
      />

      <ContactInformationCard
        contact={contact}
        isEditing={isEditing}
        onFieldChange={(field, value) => onFieldChange("contact", field, value)}
      />

      <DocumentsCard documents={documents} />

      <WorkDetailsCard
        work={work}
        isEditing={isEditing}
        onFieldChange={(field, value) => onFieldChange("work", field, value)}
        isFreelancer={isFreelancer}
      />

      <ContractDetailsCard
        contract={contract}
        isEditing={isEditing}
        onFieldChange={(field, value) => onFieldChange("contract", field, value)}
      />

      {/* ✅ pass employee so KPI can be read from employee.kpi */}
      <SalaryDetailsCard
        salary={salary}
        employee={employee}
        isEditing={isEditing}
        onFieldChange={(field, value) => onFieldChange("salary", field, value)}
      />

      {showAverage && (
        <div className="col-span-1 md:col-span-2 xl:col-span-3 mt-2">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <AverageTable details={averageDetails} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
