import Parser from 'rss-parser'
import { detectLocation } from 'detect-location-jp'
import fs from 'fs/promises'
import path from 'path'

const rssParser = new Parser()

const crawl = async () => {
  const feedUrl = 'http://www.data.jma.go.jp/developer/xml/feed/extra.xml'
  const feed = await rssParser.parseURL(feedUrl)
  const alerts = await convertFeed(feed)

  const { dir, hourPath, generatedAt } = buildHourlyDirPathJST()
  await fs.mkdir(dir, { recursive: true })

  const output = {
    generatedAt,
    timeZone: 'Asia/Tokyo',
    hourPath,
    source: feedUrl,
    totalItems: alerts.length,
    items: alerts,
  }
  const filepath = path.join(dir, 'index.json')
  await fs.writeFile(filepath, JSON.stringify(output, null, 2), 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`wrote: ${filepath} (items: ${alerts.length})`)

  const latestPath = path.join(process.cwd(), 'public', 'data', 'latest.json')
  await fs.mkdir(path.dirname(latestPath), { recursive: true })
  await fs.writeFile(latestPath, JSON.stringify(output, null, 2), 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`updated latest: ${latestPath}`)
}

const convertFeed = async (feed: any) => {
  const alerts: any[] = []
  for await (const item of feed.items) {
    if (item.title !== '気象特別警報・警報・注意報') continue
    const content: string | undefined = item.contentSnippet ?? item.content
    if (!content) continue
    const location = await detectLocation(content)
    if (location === null) continue
    const observedAt = item.pubDate ? new Date(Date.parse(item.pubDate)) : undefined
    const alert = {
      originId: item.id ?? item.link ?? `${item.title}:${item.pubDate}`,
      title: item.title as string,
      content: content,
      observedAt: observedAt?.toISOString(),
      placeCountry: location.country,
      placePref: location.state,
      placeCity: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
    }
    alerts.push(alert)
  }
  return alerts
}

const buildHourlyDirPathJST = () => {
  const nowUtc = new Date()
  const jst = new Date(nowUtc.getTime() + 9 * 60 * 60 * 1000)
  const yyyy = String(jst.getUTCFullYear())
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(jst.getUTCDate()).padStart(2, '0')
  const hh = String(jst.getUTCHours()).padStart(2, '0')
  const hourPath = `${yyyy}/${mm}/${dd}/${hh}`
  const dir = path.join(process.cwd(), 'public', 'data', yyyy, mm, dd, hh)
  return { dir, hourPath, generatedAt: nowUtc.toISOString() }
}

;(async () => {
  try {
    await crawl()
    process.exit(0)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('weather script failed:', e)
    process.exit(1)
  }
})()
