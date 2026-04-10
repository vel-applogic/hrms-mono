'use client';

import type { ExpenseForecastResponseType } from '@repo/dto';
import { ExpenseForecastFrequencyDtoEnum, ExpenseTypeDtoEnum } from '@repo/dto';
import { expenseForecastFrequencyDtoEnumToReadableLabel, expenseTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { bulkSaveExpenseForecasts, getExpenseForecasts } from '@/lib/action/expense-forecast.actions';

interface ForecastItem {
  key: string;
  id?: number;
  description: string;
  type: ExpenseTypeDtoEnum | '';
  amount: string;
  frequency: ExpenseForecastFrequencyDtoEnum;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function createEmptyItem(): ForecastItem {
  return {
    key: `new-${Date.now()}-${Math.random()}`,
    description: '',
    type: '',
    amount: '',
    frequency: ExpenseForecastFrequencyDtoEnum.monthly,
  };
}

function dbToFormItem(dbRec: ExpenseForecastResponseType): ForecastItem {
  return {
    key: `existing-${dbRec.id}`,
    id: dbRec.id,
    description: dbRec.description ?? '',
    type: dbRec.type,
    amount: String(dbRec.amount),
    frequency: dbRec.frequency,
  };
}

const FORM_ID = 'expense-forecast-upsert-form';

export function ExpenseForecastUpsertDrawer({ open, onOpenChange, onSuccess }: Props) {
  const [items, setItems] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFetchLoading(true);
      setError('');
      getExpenseForecasts()
        .then((data) => {
          if (data.length > 0) {
            setItems(data.map(dbToFormItem));
          } else {
            setItems([createEmptyItem()]);
          }
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to load forecasts';
          setError(message);
          setItems([createEmptyItem()]);
        })
        .finally(() => setFetchLoading(false));
    }
  }, [open]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleUpdateItem = (key: string, field: keyof ForecastItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validItems = items.filter((item) => item.type && item.amount);
    if (validItems.length === 0) {
      setError('At least one forecast item with type and amount is required');
      return;
    }

    for (const item of validItems) {
      const amount = Number(item.amount);
      if (isNaN(amount) || amount < 1) {
        setError('All amounts must be at least 1');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await bulkSaveExpenseForecasts({
        items: validItems.map((item) => ({
          id: item.id,
          description: item.description,
          type: item.type as ExpenseTypeDtoEnum,
          amount: Number(item.amount),
          frequency: item.frequency,
        })),
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const monthlyTotal = items.reduce((sum, item) => {
    const amount = Number(item.amount) || 0;
    if (item.frequency === ExpenseForecastFrequencyDtoEnum.yearly) {
      return sum + amount / 12;
    }
    return sum + amount;
  }, 0);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title='Expense Forecast'
      description='Manage your recurring expense forecasts'
      footer={
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Monthly Total: <span className='font-semibold text-blue-500'>₹ {Math.round(monthlyTotal).toLocaleString('en-IN')}</span>
          </div>
          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' form={FORM_ID} disabled={loading || fetchLoading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      }
    >
      {fetchLoading ? (
        <div className='flex flex-col gap-4 p-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 animate-pulse rounded bg-muted' />
          ))}
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className='flex flex-col gap-4 p-6'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          {items.map((item) => (
            <div key={item.key} className='flex items-start gap-3 border-b border-muted-foreground/25 pb-4'>
              <div className='flex flex-1 flex-col gap-3'>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>Frequency</span>
                    <Select value={item.frequency} onValueChange={(val) => handleUpdateItem(item.key, 'frequency', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ExpenseForecastFrequencyDtoEnum).map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {expenseForecastFrequencyDtoEnumToReadableLabel(freq)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>Type</span>
                    <Select value={item.type} onValueChange={(val) => handleUpdateItem(item.key, 'type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ExpenseTypeDtoEnum).map((type) => (
                          <SelectItem key={type} value={type}>
                            {expenseTypeDtoEnumToReadableLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>Amount</span>
                    <Input
                      type='number'
                      step='1'
                      placeholder='0'
                      value={item.amount}
                      onChange={(e) => handleUpdateItem(item.key, 'amount', e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>Description</span>
                  <Input
                    placeholder='Description'
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.key, 'description', e.target.value)}
                  />
                </div>
              </div>

              <button
                type='button'
                onClick={() => handleRemoveItem(item.key)}
                className='mt-6 inline-flex items-center justify-center rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10'
                title='Remove'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          ))}

          <Button type='button' variant='outline' size='sm' onClick={handleAddItem} className='self-start'>
            <Plus className='h-4 w-4' />
            Add new
          </Button>
        </form>
      )}
    </Drawer>
  );
}
