import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function KpiItemForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    custom_item: item?.custom_item || '',
    max_score: item?.max_score || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom_item">KPI Item Name</Label>
        <Input
          id="custom_item"
          type="text"
          value={formData.custom_item}
          onChange={(e) => handleChange('custom_item', e.target.value)}
          placeholder="Enter KPI item name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_score">Max Score</Label>
        <Input
          id="max_score"
          type="number"
          value={formData.max_score}
          onChange={(e) => handleChange('max_score', e.target.value)}
          placeholder="Enter maximum score"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item ? 'Update' : 'Create'} KPI Item
        </Button>
      </div>
    </form>
  );
}
