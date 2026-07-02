import { getContentOverrides } from '@/lib/content'
import DraftCalPage from './DraftCalPage'
import GammaHero from '@/components/GammaHero'

export default async function Page() {
  const overrides = await getContentOverrides()
  return (
    <>
      <GammaHero />
      <DraftCalPage overrides={overrides} />
    </>
  )
}
