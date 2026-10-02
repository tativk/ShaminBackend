import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './Login';

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockRecovery = true;
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockRecovery ? 'recovery=1' : ''), mockSetParams],
}));

beforeEach(() => {
  mockRecovery = true;
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
});
afterEach(() => { delete global.fetch; });
const reply = (data, ok = true) => global.fetch.mockResolvedValueOnce({ ok, json: async () => data });

test('recovers password through real API requests and returns to login', async () => {
  reply({ retry_after: 120 });
  reply({ reset_token: 'server-token' });
  reply({ detail: 'ok' });
  render(<Login />);
  fireEvent.change(screen.getByLabelText('شماره موبایل'), { target: { value: '۰۹۱۲۳۴۵۶۷۸۹' } });
  fireEvent.click(screen.getByRole('button', { name: 'ارسال کد بازیابی' }));
  const code = await screen.findByLabelText('کد تأیید پیامکی');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ phone: '09123456789' });
  fireEvent.change(code, { target: { value: '۱۲۳۴۵۶' } });
  fireEvent.click(screen.getByRole('button', { name: 'تأیید کد و ادامه' }));
  fireEvent.change(await screen.findByLabelText('رمز عبور جدید', { selector: 'input' }), { target: { value: 'Fresh!Gallery728' } });
  fireEvent.change(screen.getByLabelText('تکرار رمز عبور'), { target: { value: 'Fresh!Gallery728' } });
  fireEvent.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));
  expect(await screen.findByRole('heading', { name: 'رمز عبور تغییر کرد' })).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[2][1].body)).toEqual({ reset_token: 'server-token', password: 'Fresh!Gallery728', password_confirm: 'Fresh!Gallery728' });
  fireEvent.click(screen.getByRole('button', { name: 'بازگشت به ورود' }));
  expect(mockSetParams).toHaveBeenCalledWith({});
});

test('failed request shows error and permits retry without advancing', async () => {
  reply({ detail: 'ارسال پیامک انجام نشد.' }, false);
  render(<Login />);
  fireEvent.change(screen.getByLabelText('شماره موبایل'), { target: { value: '09123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'ارسال کد بازیابی' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('ارسال پیامک انجام نشد.');
  expect(screen.getByRole('button', { name: 'ارسال کد بازیابی' })).toBeEnabled();
  expect(screen.queryByLabelText('کد تأیید پیامکی')).not.toBeInTheDocument();
});

test('password login saves tokens and opens dashboard', async () => {
  mockRecovery = false;
  reply({ access: 'access-token', refresh: 'refresh-token', user: { role: 'customer' } });
  render(<Login />);
  fireEvent.change(screen.getByPlaceholderText('شماره موبایل'), { target: { value: '09123456789' } });
  fireEvent.change(screen.getByPlaceholderText('رمز عبور'), { target: { value: 'Fresh!Gallery728' } });
  fireEvent.click(screen.getByRole('button', { name: 'ورود' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  expect(localStorage.getItem('access')).toBe('access-token');
});
