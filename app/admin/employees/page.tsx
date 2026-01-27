'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmployeeModal from './EmployeeModal';
import EmployeeTable from './EmployeeTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authFetch, API_BASE_URL } from '@/lib/auth';

interface Employee {
  _id: string;
  name: string;
  role: string;
  department: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/employees`);
      const data = await res.json();

      if (data.success) {
        setEmployees(data.data);
        setError(null);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEmployees(employees.filter((e) => e._id !== id));
      } else {
        setError('Failed to delete employee');
      }
    } catch (err) {
      setError('Error deleting employee');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    fetchEmployees();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Employees</h1>
          <p className="text-muted-foreground">Add and manage team members</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Employee
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your organization's employees and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
