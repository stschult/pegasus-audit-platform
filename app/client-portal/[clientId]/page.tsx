// app/client-portal/[clientId]/page.tsx
import { ClientUploadPortal } from '../../../components/client/ClientUploadPortal';

interface ClientPortalPageProps {
  params: Promise<{
    clientId: string;
  }>;
  searchParams?: Promise<{
    audit?: string;
    client?: string;
  }>;
}

export default async function ClientPortalPage({ 
  params, 
  searchParams 
}: ClientPortalPageProps) {
  // Await the parameters
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract parameters
  const clientId = resolvedParams.clientId;
  const auditId = resolvedSearchParams?.audit || 'audit-2024-q3';
  const clientName = resolvedSearchParams?.client || 'Tech Corp';

  return (
    <ClientUploadPortal 
      clientId={clientId}
      auditId={auditId}
      clientName={clientName}
    />
  );
}
