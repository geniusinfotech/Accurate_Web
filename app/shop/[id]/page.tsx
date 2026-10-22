import { redirect } from 'next/navigation';

export default async function LegacyShopProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/product/${id}`);
}

