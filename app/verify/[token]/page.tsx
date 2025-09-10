
import VerifyPage from '@/components/Common/VerifyPage';

export default async function VerifyMainPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <VerifyPage token={token} />;
}