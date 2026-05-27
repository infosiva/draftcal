import { getContentOverrides } from '@/lib/content'
import DraftCalPage from './DraftCalPage'

export default async function Page() {
  const overrides = await getContentOverrides()
  return <DraftCalPage overrides={overrides} />
}
