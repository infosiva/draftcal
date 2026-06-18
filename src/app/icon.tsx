import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, #b45309, #d97706)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Calendar — rounded rect body + two top binding rings + divider line */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M3 10h18" stroke="white" strokeWidth="2"/>
        <path d="M8 2.5v5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 2.5v5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
