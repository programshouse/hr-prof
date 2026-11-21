// /src/components/ui/employeeInfoCard.jsx

import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function EmployeeInfoCard({
  title,
  items = [],
  isEditing = false,
  onChangeItem = () => {},
}) {
  const { t } = useTranslation();
  const handleChange = (field, value) => {
    onChangeItem(field, value);
  };

  return (
    <Card>
      <CardTitle>{t(title)}</CardTitle>

      <CardContent className="space-y-2 text-sm font-medium">
        {items.map((item, idx) => {
          // CASE 1 — Custom JSX (FieldSelect / FieldDate / Any)
          if (item.customRender) {
            return <div key={idx}>{item.customRender()}</div>;
          }

          // Normal Fields
          const value = item.value ?? '';

          return (
            <div
              key={item.field || idx}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
            >
              {/* LABEL (LEFT) */}
              <span>{item.label}</span>

              {/* EDIT MODE */}
              {isEditing && item.editable !== false ? (
                <>
                  {/* Text Input */}
                  {item.type === 'text' || !item.type ? (
                    <Input
                      value={value}
                      onChange={(e) => handleChange(item.field, e.target.value)}
                      className="h-8 w-48"
                    />
                  ) : null}
                </>
              ) : (
                /* VIEW MODE */
                <span className="text-primary text-right font-medium">{value || '--'}</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
