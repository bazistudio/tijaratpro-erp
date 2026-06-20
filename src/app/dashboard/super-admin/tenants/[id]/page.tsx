import ClientPage from './client-page';

export async function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function TenantDetailPageWrapper() {
  return <ClientPage />;
}
