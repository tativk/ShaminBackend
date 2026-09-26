import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { apiRequest } from '../api';
import AdminPanel from './AdminPanel';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../api', () => ({ apiRequest: jest.fn() }));
jest.mock('../components/Dashboard', () => () => <div>Dashboard content</div>);
jest.mock('../components/Orders', () => () => <div>Orders content</div>);
jest.mock('../components/Products', () => () => <div>Products content</div>);

let rows;
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  rows = [{ id: 10, kind: 'order', title: 'سفارش ثبت شد', message: 'سفارش شماره ۱۰', section: 'orders', created_at: '2026-09-24T10:00:00Z', is_read: false }];
  apiRequest.mockImplementation(async (path, options) => {
    if (path === '/auth/profile/') return { role: 'admin', first_name: 'آرمین', phone: '09964750762' };
    if (options?.method === 'POST') { rows = rows.map(row => ({ ...row, is_read: true })); return { unread_count: 0 }; }
    return { results: path.includes('unread=true') ? rows.filter(row => !row.is_read) : rows, unread_count: rows.filter(row => !row.is_read).length, latest_id: 10, next_before: null };
  });
});

test('opens real notifications and navigates to orders after reading', async () => {
  render(<AdminPanel />);
  fireEvent.click(await screen.findByRole('button', { name: 'اعلان‌ها، ۱ خوانده‌نشده' }));
  fireEvent.click(await screen.findByRole('button', { name: /سفارش ثبت شد/ }));
  expect(await screen.findByText('Orders content')).toBeInTheDocument();
  expect(apiRequest).toHaveBeenCalledWith('/admin/notifications/', { method: 'POST', body: JSON.stringify({ id: 10 }) });
  expect(screen.getByRole('button', { name: 'اعلان‌ها، ۰ خوانده‌نشده' })).toBeInTheDocument();
});

test('mark all preserves dashboard, filter shows empty state, escape returns focus', async () => {
  render(<AdminPanel />);
  fireEvent.click(await screen.findByRole('button', { name: 'اعلان‌ها، ۱ خوانده‌نشده' }));
  fireEvent.click(await screen.findByRole('button', { name: 'خواندن همه' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'خواندن همه' })).toBeDisabled());
  fireEvent.click(screen.getByRole('button', { name: 'خوانده‌نشده', exact: true }));
  expect(await screen.findByText('همه اعلان‌ها را خوانده‌اید')).toBeInTheDocument();
  expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('region', { name: 'اعلان‌های سایت' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'اعلان‌ها، ۰ خوانده‌نشده' })).toHaveFocus();
});

test('network errors do not remove dashboard and can be retried', async () => {
  const original = apiRequest.getMockImplementation();
  apiRequest.mockImplementation((path, options) => path.includes('/admin/notifications/') ? Promise.reject(new Error('offline')) : original(path, options));
  render(<AdminPanel />);
  fireEvent.click(await screen.findByRole('button', { name: /اعلان‌ها،/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('اعلان‌ها دریافت نشدند');
  expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  apiRequest.mockImplementation(original);
  fireEvent.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
  expect(await screen.findByText('سفارش ثبت شد')).toBeInTheDocument();
});
