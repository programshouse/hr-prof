// src/features/applicants/components/profile/ApplicantProfileCards.jsx
import ApplicantBasicInformationCard from './cards/ApplicantBasicInformationCard';
import ApplicantContactInformationCard from './cards/ApplicantContactInformationCard';
import ApplicantDocumentsCard from './cards/ApplicantDocumentsCard';
import ApplicantRoleInformationCard from './cards/ApplicantRoleInformationCard';

export default function ApplicantProfileCards({ applicant }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <ApplicantBasicInformationCard basic={applicant.basic} />

      <ApplicantContactInformationCard contact={applicant.contact} links={applicant.links} />

      <ApplicantRoleInformationCard role={applicant.role} />
      <ApplicantDocumentsCard documents={applicant.documents} />
    </div>
  );
}
