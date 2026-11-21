// src/features/attendanceOverview/components/MissingHoursDialogTrigger.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, UploadCloud, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function MissingHoursDialogTrigger({ value, employeeId, month, children }) {
  const [open, setOpen] = useState(false);
  const [missingHoursData, setMissingHoursData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // This is a placeholder function - replace with actual API call
  const fetchMissingHours = useCallback(async () => {
    if (!employeeId || !month) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to fetch missing hours data
      // const data = await api.fetchMissingHours({ employeeId, month });
      // setMissingHoursData(data);
      
      // Mock data for demonstration
      setMissingHoursData([
        {
          id: 1,
          date: '2025-03-08',
          expectedHours: '8h',
          actualHours: '6h',
          missingHours: '2h',
          status: 'Pending'
        },
        // Add more mock data as needed
      ]);
    } catch (error) {
      toast.error("Failed to fetch missing hours data");
      console.error("Error fetching missing hours:", error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, month]);

  useEffect(() => {
    if (open) {
      fetchMissingHours();
    }
  }, [open, fetchMissingHours]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality will be implemented soon");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View missing hours</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Missing Hours Details</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-slate-500">
              Showing missing hours for {format(new Date(month), 'MMMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || missingHoursData.length === 0}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Expected Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Missing Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-slate-500">Loading missing hours...</p>
                    </TableCell>
                  </TableRow>
                ) : missingHoursData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No missing hours data available
                    </TableCell>
                  </TableRow>
                ) : (
                  missingHoursData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{record.expectedHours}</TableCell>
                      <TableCell>{record.actualHours}</TableCell>
                      <TableCell className="text-rose-600 font-medium">
                        {record.missingHours}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MissingHoursDialogTrigger;
