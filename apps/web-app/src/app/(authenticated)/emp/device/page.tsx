import { EmployeeDeviceList } from '@/feature/device/device-employee-list';
import { deviceService } from '@/lib/service/device.service';

export const dynamic = 'force-dynamic';

export default async function EmployeeDevicePage() {
  const devices = await deviceService.getMyDevices();

  return (
    <div className='flex h-full flex-col'>
      <EmployeeDeviceList devices={devices} />
    </div>
  );
}
