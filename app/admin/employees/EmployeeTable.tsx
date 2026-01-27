'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Employee {
  _id: string;
  name: string;
  role: string;
  department: string;
  createdAt: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export default function EmployeeTable({
  employees,
  loading,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading employees...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees yet. Add your first team member.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr className="text-left text-muted-foreground font-semibold">
            <th className="pb-3 px-4">Name</th>
            <th className="pb-3 px-4">Role</th>
            <th className="pb-3 px-4">Department</th>
            <th className="pb-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee._id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-3 px-4 font-medium">{employee.name}</td>
              <td className="py-3 px-4">
                <Badge variant="outline">{employee.role}</Badge>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {employee.department || '—'}
              </td>
              <td className="py-3 px-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(employee)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => onDelete(employee._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
