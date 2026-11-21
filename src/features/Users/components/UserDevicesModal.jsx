import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usersApi } from '../api/users.api';

export default function UserDevicesModal({ open, onOpenChange, user }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ device_name: '', mac_address: '' });

  const employeeId = user?.employee_id ?? user?.employee?.id ?? user?.id;
  const employeeName = user?.employee?.name || user?.name || 'Employee';

  const loadDevices = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const response = await usersApi.getDevices(employeeId);
      setDevices(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load MAC devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && employeeId) {
      setForm({ device_name: '', mac_address: '' });
      loadDevices();
    }
  }, [open, employeeId]);

  const handleCreate = async (event) => {
    event.preventDefault();

    const deviceName = form.device_name.trim();
    const macAddress = form.mac_address.trim();

    if (!deviceName || !macAddress) {
      toast.error('Device name and MAC address are required');
      return;
    }

    setCreating(true);
    try {
      const response = await usersApi.createDevice(employeeId, {
        device_name: deviceName,
        mac_address: macAddress,
      });

      toast.success(response?.message || 'Device added successfully');
      setForm({ device_name: '', mac_address: '' });
      await loadDevices();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add device');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (device) => {
    if (!device?.id) return;

    setDeletingId(device.id);
    try {
      const response = await usersApi.deleteDevice(device.id);
      toast.success(response?.message || 'Device deleted successfully');
      setDevices((current) => current.filter((item) => item.id !== device.id));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete device');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>MAC Devices - {employeeName}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="device_name">Device Name</Label>
            <Input
              id="device_name"
              value={form.device_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, device_name: event.target.value }))
              }
              placeholder="e.g. iPhone 15"
              disabled={creating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mac_address">MAC Address</Label>
            <Input
              id="mac_address"
              value={form.mac_address}
              onChange={(event) =>
                setForm((current) => ({ ...current, mac_address: event.target.value }))
              }
              placeholder="e.g. 12:34:56:78:90:AB"
              disabled={creating}
            />
          </div>

          <Button type="submit" disabled={creating || !employeeId}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add
          </Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <span>Device Name</span>
            <span>MAC Address</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No MAC devices added for this employee.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-900">
                    {device.device_name || '-'}
                  </span>
                  <span className="break-all text-slate-600">{device.mac_address || '-'}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={deletingId === device.id}
                    onClick={() => handleDelete(device)}
                    title="Delete device"
                  >
                    {deletingId === device.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
