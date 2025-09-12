import React, { useEffect, useMemo, useState } from 'react'

type WeatherIndex = {
  generatedAt: string
  timeZone: string
  hourPath: string
  source: string
  totalItems: number
  items: Array<{
    originId: string
    title: string
    content?: string
    observedAt?: string
    placeCountry?: string
    placePref?: string
    placeCity?: string
    latitude?: number
    longitude?: number
  }>
}

export const App: React.FC = () => {
  const [data, setData] = useState<WeatherIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const url = `data/latest.json`

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as WeatherIndex
        if (!alive) return
        setData(json)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [url])

  const alerts = useMemo(() => data?.items ?? [], [data])

  if (loading) return <div>Loading…</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return <div>No data</div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>気象特別警報・警報・注意報（最新）</h1>
      <p>
        生成: <code>{data.generatedAt}</code> / 時間帯: <code>{data.hourPath}</code>
      </p>
      <p>収集件数: <b>{data.totalItems}</b></p>
      <ul>
        {alerts.slice(0, 50).map((it) => (
          <li key={it.originId}>
            {it.placePref ?? ''} {it.placeCity ?? ''} — {it.title}
          </li>
        ))}
      </ul>
      {alerts.length > 50 ? (
        <p>(他 {alerts.length - 50} 件)</p>
      ) : null}
    </div>
  )
}

