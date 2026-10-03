import { render, screen } from '@testing-library/react';
import Footer from './Footer';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

test('renders the official Enamad seal with its verification link and origin referrer', () => {
  render(<Footer />);

  const sealLink = screen.getByRole('link', { name: /مشاهده نماد اعتماد الکترونیکی/ });
  const sealImage = screen.getByRole('img', { name: 'نماد اعتماد الکترونیکی فروشگاه شمین' });

  expect(sealLink).toHaveAttribute('href', 'https://trustseal.enamad.ir/?id=8024610&Code=jLh5EKvkHg1C1fCIhzcLbXlMgq1KALbg');
  expect(sealLink).toHaveAttribute('target', '_blank');
  expect(sealLink).toHaveAttribute('rel', 'noopener');
  expect(sealLink).toHaveAttribute('referrerpolicy', 'origin');
  expect(sealLink).toContainElement(sealImage);
  expect(sealImage).toHaveAttribute('src', 'https://trustseal.enamad.ir/logo.aspx?id=8024610&Code=jLh5EKvkHg1C1fCIhzcLbXlMgq1KALbg');
  expect(sealImage).toHaveAttribute('referrerpolicy', 'origin');
  expect(sealImage).toHaveAttribute('code', 'jLh5EKvkHg1C1fCIhzcLbXlMgq1KALbg');
  expect(screen.getByRole('link', { name: 'وبلاگ' })).toHaveAttribute('href', '/blog');
  expect(screen.getByRole('link', { name: 'درباره ما' })).toHaveAttribute('href', '/about-us');
});
