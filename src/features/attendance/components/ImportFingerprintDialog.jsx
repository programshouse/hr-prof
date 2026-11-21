import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useImportFingerprint } from '../hooks/useImportFingerprint';

export function ImportFingerprintDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const importMutation = useImportFingerprint();

  const handleFileSelect = (file) => {
    if (file && (file.name.endsWith('.xls') || 
                 file.name.endsWith('.csv') || 
                 file.name.endsWith('.txt'))) {
      setSelectedFile(file);
    } else {
      toast.error(t('attendance.invalidFileType'));
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile, {
        onSuccess: () => {
          setSelectedFile(null);
          onOpenChange(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      });
    }
  };

  const handleClose = () => {
    if (!importMutation.isPending) {
      setSelectedFile(null);
      onOpenChange(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('attendance.importFingerprint')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.csv,.txt"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {t('attendance.clickToUpload')}
                  </span>
                  {' '}{t('attendance.orDragDrop')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('attendance.supportedFormats')}: XLS, CSV, TXT
                </div>
              </div>
            </Label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={importMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={importMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || importMutation.isPending}
              className="min-w-[100px]"
            >
              {importMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>{t('common.uploading')}</span>
                </div>
              ) : (
                t('common.upload')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
