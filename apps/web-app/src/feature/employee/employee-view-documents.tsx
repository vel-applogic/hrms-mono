'use client';

import type { EmployeeDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getEmployeeById } from '@/lib/action/employee.actions';

import { EmployeeDocumentsEditDrawer } from './container/employee-documents-edit.drawer';

interface Props {
  employeeId: number;
}

function DocumentItem({ doc }: { doc: { id: number; name: string; urlFull: string } }) {
  return (
    <a
      href={doc.urlFull}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50'
    >
      <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
      <span className='truncate text-primary hover:underline'>{doc.name}</span>
    </a>
  );
}

export function EmployeeViewDocuments({ employeeId }: Props) {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeDetailResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployeeById(employeeId);
      setEmployee(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void fetchEmployee();
  }, [fetchEmployee]);

  const handleSuccess = () => {
    setEditOpen(false);
    void fetchEmployee();
    router.refresh();
  };

  if (loading || !employee) {
    return <p className='text-sm text-muted-foreground'>Loading...</p>;
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Documents</h2>
        <Button size='sm' onClick={() => setEditOpen(true)}>
          <Plus className='h-4 w-4' />
          Add/Edit Documents
        </Button>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Resume</Label>
          <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
            {employee.resume ? (
              <DocumentItem doc={{ id: employee.resume.id, name: employee.resume.name, urlFull: employee.resume.urlFull }} />
            ) : (
              <p className='col-span-full rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>No resume</p>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Offer letters</Label>
          <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
            {(employee.offerLetters ?? []).length > 0 ? (
              (employee.offerLetters ?? []).map((doc) => (
                <DocumentItem key={doc.id} doc={{ id: doc.id, name: doc.name, urlFull: doc.urlFull }} />
              ))
            ) : (
              <p className='col-span-full rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>No offer letters</p>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Other documents</Label>
          <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
            {(employee.otherDocuments ?? []).length > 0 ? (
              (employee.otherDocuments ?? []).map((doc) => (
                <DocumentItem key={doc.id} doc={{ id: doc.id, name: doc.name, urlFull: doc.urlFull }} />
              ))
            ) : (
              <p className='col-span-full rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>No other documents</p>
            )}
          </div>
        </div>
      </div>

      <EmployeeDocumentsEditDrawer open={editOpen} onOpenChange={setEditOpen} employee={employee} onSuccess={handleSuccess} />
    </div>
  );
}
