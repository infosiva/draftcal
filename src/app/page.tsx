import { getContentOverrides } from '@/lib/content'
import DraftCalPage from './DraftCalPage'
import PromoBar from '@/components/PromoBar'

export default async function Page() {
  const overrides = await getContentOverrides()
  return (
    <>
      <PromoBar accentColor="#d97706" />
      <DraftCalPage overrides={overrides} />
    </>
  )
}
