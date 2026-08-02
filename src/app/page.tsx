import { getContentOverrides } from '@/lib/content'
import DraftCalPage from './DraftCalPage'
import GammaHero from '@/components/GammaHero'
import PromoBar from '@/components/PromoBar'

export default async function Page() {
  const overrides = await getContentOverrides()
  return (
    <>
      <PromoBar accentColor="#d97706" />
      <GammaHero />
      <DraftCalPage overrides={overrides} />
    </>
  )
}
