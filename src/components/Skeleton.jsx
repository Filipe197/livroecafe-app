export function SkeletonBlock({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{
        width, height, borderRadius: radius, flexShrink: 0,
        background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite linear',
        ...style
      }} />
    </>
  )
}

export function SkeletonCard() {
  return (
    <div style={{ flex: '0 0 130px' }}>
      <SkeletonBlock height={188} radius={10} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={11} width="80%" style={{ marginBottom: 5 }} />
      <SkeletonBlock height={10} width="55%" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
      <SkeletonBlock width={46} height={66} radius={5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <SkeletonBlock height={13} width="70%" style={{ marginBottom: 7 }} />
        <SkeletonBlock height={11} width="45%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={18} width="30%" radius={8} />
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '0 16px' }}>
      {[...Array(9)].map((_, i) => (
        <div key={i}>
          <SkeletonBlock height={150} radius={7} style={{ marginBottom: 5 }} />
          <SkeletonBlock height={11} width="85%" style={{ marginBottom: 4 }} />
          <SkeletonBlock height={10} width="60%" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonFeatured() {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'hidden' }}>
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
