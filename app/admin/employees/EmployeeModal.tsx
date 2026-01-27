'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authFetch, API_BASE_URL } from '@/lib/auth';

interface Employee {
  _id: string;
  name: string;
  role: string;
  department: string;
}

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: () => void;
}

const ROLES = [
  'Manager',
  'Developer',
  'Designer',
  'Product Manager',
  'QA Engineer',
  'HR Specialist',
  'Sales Representative',
  'Other',
];

export default function EmployeeModal({
  employee,
  onClose,
  onSave,
}: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        role: employee.role,
        department: employee.department,
      });
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const url = employee
        ? `${API_BASE_URL}/employees/${employee._id}`
        : `${API_BASE_URL}/employees`;
      const method = employee ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save employee');
      }
    } catch (err) {
      setError('Error saving employee');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit' : 'Add'} Employee</DialogTitle>
          <DialogDescription>
            {employee ? 'Update employee details' : 'Add a new team member'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-500 bg-red-50 text-red-900">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Engineering"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
