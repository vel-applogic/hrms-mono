'use client';

import type { PayslipListResponseType } from '@repo/dto';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { generatePayslips } from '@/lib/action/payslip.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type EmployeeOption = { value: string; label: string };

export function PayslipGenerateDrawer({ open, onOpenChange, onSuccess }: Props) {
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear));
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingPayslips, setExistingPayslips] = useState<PayslipListResponseType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [yearError, setYearError] = useState('');

  useEffect(() => {
    if (open) {
      setMonth(String(new Date().getMonth() + 1));
      setYear(String(currentYear));
      setSelectedEmployeeIds([]);
      setError('');
      setExistingPayslips([]);
      setShowConfirm(false);
      setYearError('');
      loadEmployees();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      const employees = await getEmployeesList();
      setEmployeeOptions(
        employees.map((e) => ({
          value: String(e.id),
          label: `${e.firstname} ${e.lastname}`,
          keywords: [e.email],
        })),
      );
    } catch {
      // non-blocking
    }
  };

  const validateYear = (val: string) => {
    const num = parseInt(val, 10);
    if (!val || isNaN(num) || num < 2000 || num > 2100) {
      setYearError('Enter a valid year (2000–2100)');
      return false;
    }
    setYearError('');
    return true;
  };

  const handleGenerate = async (force = false) => {
    if (!validateYear(year)) return;
    setLoading(true);
    setError('');
    try {
      const result = await generatePayslips({
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        employeeIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds.map(Number) : undefined,
        force,
      });

      if (result.alreadyExisting && !force) {
        setExistingPayslips(result.existingPayslips ?? []);
        setShowConfirm(true);
        setLoading(false);
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOverwrite = () => {
    setShowConfirm(false);
    handleGenerate(true);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title='Generate Payslips'
      description='Generate payslips for a specific month and year. Leave employees empty to generate for all.'
      footer={
        showConfirm ? (
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setShowConfirm(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmOverwrite} disabled={loading}>
              {loading ? 'Regenerating...' : 'Overwrite & Regenerate'}
            </Button>
          </div>
        ) : (
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => handleGenerate(false)} disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        )
      }
    >
      <div className='flex flex-col gap-6 p-6'>
        {error && <p className='rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive'>{error}</p>}

        {showConfirm && (
          <div className='rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-yellow-500' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-yellow-400'>Payslips already exist</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {existingPayslips.length} payslip{existingPayslips.length > 1 ? 's' : ''} already exist for{' '}
                  <strong className='text-white'>{MONTH_LABELS[parseInt(month, 10) - 1]} {year}</strong>.
                  Regenerating will overwrite them.
                </p>
                <div className='mt-2 flex flex-col gap-1'>
                  {existingPayslips.slice(0, 5).map((p) => (
                    <p key={p.id} className='text-xs text-muted-foreground'>
                      • {p.employeeFirstname} {p.employeeLastname}
                    </p>
                  ))}
                  {existingPayslips.length > 5 && (
                    <p className='text-xs text-muted-foreground'>…and {existingPayslips.length - 5} more</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth} disabled={showConfirm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_LABELS.map((label, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Year</Label>
            <Input
              type='number'
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (yearError) validateYear(e.target.value);
              }}
              onBlur={() => validateYear(year)}
              min={2000}
              max={2100}
              disabled={showConfirm}
              className={cn(yearError && 'border-destructive')}
            />
            {yearError && <p className='text-sm text-destructive'>{yearError}</p>}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label>
            Employees <span className='text-muted-foreground'>(optional — leave empty for all)</span>
          </Label>
          <SelectSearchMulti
            values={selectedEmployeeIds}
            options={employeeOptions}
            placeholder='All employees'
            searchPlaceholder='Search employees...'
            onChange={setSelectedEmployeeIds}
            disabled={showConfirm}
          />
        </div>

        {!showConfirm && (
          <div className='rounded-md border border-border bg-muted/30 p-3'>
            <p className='text-xs text-muted-foreground'>
              Payslips will be generated based on each employee's active compensation and applicable deductions for the
              selected month. Employees without an active compensation will be skipped.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
