export function SkeletonBook({ width = 120, height = 170 }) {
  return (
    <div style={{ flex: `0 0 ${width}px` }}>
      <div className="skeleton" style={{ width, height, borderRadius: 8, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: '85%', height: 10, borderRadius: 4, marginBottom: 4 }} />
      <div className="skeleton" style={{ width: '60%', height: 9, borderRadius: 4 }} />
    </div>
  )
}

export function SkeletonRow({ count = 4, width = 120, height = 170 }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBook key={i} width={width} height={height} />
      ))}
    </div>
  )
}
