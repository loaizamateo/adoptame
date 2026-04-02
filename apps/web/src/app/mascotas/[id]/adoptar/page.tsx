import AdoptionRequestForm from '@/components/adoptions/AdoptionRequestForm'

interface Props { params: Promise<{ id: string }> }

export default async function AdoptRequestPage({ params }: Props) {
  const { id } = await params
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <AdoptionRequestForm petId={id} />
    </main>
  )
}
