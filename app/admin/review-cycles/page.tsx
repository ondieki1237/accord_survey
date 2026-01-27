'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReviewCycleModal from './ReviewCycleModal';
import ReviewCycleTable from './ReviewCycleTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authFetch, API_BASE_URL } from '@/lib/auth';

interface ReviewCycle {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isActive: boolean;
  employees: any[];
  questions: any[];
  createdAt: string;
}

export default function ReviewCyclesPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/review-cycles`);
      const data = await res.json();

      if (data.success) {
        setCycles(data.data);
        setError(null);
      } else {
        setError('Failed to fetch review cycles');
      }
    } catch (err) {
      setError('Failed to load review cycles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleCreate = () => {
    setSelectedCycle(null);
    setShowModal(true);
  };

  const handleEdit = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review cycle?')) {
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/review-cycles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCycles(cycles.filter((c) => c._id !== id));
      } else {
        setError('Failed to delete review cycle');
      }
    } catch (err) {
      setError('Error deleting review cycle');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCycle(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    fetchCycles();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Review Cycles</h1>
          <p className="text-muted-foreground">Create and manage review cycles</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create Cycle
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Review Cycles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Review Cycles</CardTitle>
          <CardDescription>
            Manage your review cycles and time spans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewCycleTable
            cycles={cycles}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <ReviewCycleModal
          cycle={selectedCycle}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
