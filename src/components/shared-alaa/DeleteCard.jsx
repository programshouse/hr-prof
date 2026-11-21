import { Button } from "./ui/button";
import { useTranslation } from 'react-i18next';

const ConfirmDeleteModal = ({ onCancel, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl border-6 border-[#F7F1F5] p-6 w-[400px] text-center">
        <div className="flex justify-center mb-4">
          <div className="size-12 flex items-center justify-center rounded-full border border-[#FF4747] bg-[#FFD9D9]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#FF4747] "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 
                0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6"
              />
            </svg>
          </div>
        </div>
        <p className="text-lg font-medium mb-6 ">
          {t('deleteModals.description', 'Are you sure you want to delete it?')}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            {t('deleteModals.cancel', 'Cancel')}
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            {t('deleteModals.title', 'Delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
