import { PartyProfile } from '@/features/parties/components/PartyProfile';

export default function PartyProfilePage({ params }: { params: { id: string } }) {
  return <PartyProfile partyId={params.id} />;
}
