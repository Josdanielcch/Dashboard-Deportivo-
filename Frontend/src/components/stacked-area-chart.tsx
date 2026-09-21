'use client'

import { useState, useEffect, useRef } from 'react'

interface SalesRow { date: string; bookings: number; revenue: number; bookingRevenue: number; productRevenue: number }

export default function StackedAreaChart({ data }: { data: SalesRow[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: SalesRow } | null>(null)
  const [animated, setAnimated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 800
  const H = 280
  const PAD = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [data])

  if (data.length === 0) {
    return <p className="text-zinc-500 text-sm py-4 w-full text-center">No hay datos de ventas para este periodo.</p>
  }

  const maxVal = Math.max(...data.map(d => d.revenue), 1)
  const niceMax = Math.ceil(maxVal / 1000) * 1000 || 1000
  const yTicks = 5

  const toX = (i: number) => PAD.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
  const toY = (v: number) => PAD.top + chartH - (v / niceMax) * chartH

  const bookingPts = data.map((d, i) => ({ x: toX(i), y: toY(d.bookingRevenue) }))
  const totalPts = data.map((d, i) => ({ x: toX(i), y: toY(d.revenue) }))

  const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ')

  const areaTopPath = toPath(totalPts)
  const areaBotPath = toPath(bookingPts)

  const productAreaPath = areaTopPath
    + ' L' + bookingPts.map(p => p.x + ',' + p.y).reverse().join(' L')
    + ' Z'

  const bookingAreaPath = areaBotPath
    + ' L' + bookingPts.map(p => p.x + ',' + p.y).reverse().join(' L')
    + ' L' + bookingPts[bookingPts.length - 1].x + ',' + toY(0)
    + ' L' + bookingPts[0].x + ',' + toY(0)
    + ' Z'

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * W
    let closest = 0
    let minDist = Infinity
    data.forEach((_, i) => {
      const dist = Math.abs(toX(i) - mouseX)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    if (minDist < chartW / data.length) {
      const pt = totalPts[closest]
      setTooltip({ x: pt.x, y: pt.y, item: data[closest] })
    } else {
      setTooltip(null)
    }
  }

  const fmt = (v: number) => {
    if (v >= 1000) return '$' + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k'
    return '$' + v
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={'0 0 ' + W + ' ' + H}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="gradBooking" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="gradProduct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ccff00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ccff00" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = (niceMax / yTicks) * i
          const y = toY(v)
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="10" fontFamily="sans-serif">
                {fmt(v)}
              </text>
            </g>
          )
        })}

        <path
          d={bookingAreaPath}
          fill="url(#gradBooking)"
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease-out' }}
        />
        <path
          d={productAreaPath}
          fill="url(#gradProduct)"
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease-out 0.2s' }}
        />

        <polyline
          points={totalPts.map(p => p.x + ',' + p.y).join(' ')}
          fill="none"
          stroke="#ccff00"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            strokeDasharray: animated ? '2000' : '2000',
            strokeDashoffset: animated ? '0' : '2000',
            transition: 'stroke-dashoffset 1.2s ease-out'
          }}
        />
        <polyline
          points={bookingPts.map(p => p.x + ',' + p.y).join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            strokeDasharray: animated ? '2000' : '2000',
            strokeDashoffset: animated ? '0' : '2000',
            transition: 'stroke-dashoffset 1.2s ease-out 0.1s'
          }}
        />

        {totalPts.map((p, i) => (
          <circle
            key={'dt' + i}
            cx={p.x}
            cy={p.y}
            r={tooltip?.item === data[i] ? 5 : 3}
            fill="#ccff00"
            stroke="#0a0e27"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.6s ease-out ' + (i * 0.05) + 's, r 0.2s' }}
          />
        ))}

        {bookingPts.map((p, i) => (
          <circle
            key={'db' + i}
            cx={p.x}
            cy={p.y}
            r={tooltip?.item === data[i] ? 5 : 3}
            fill="#6366f1"
            stroke="#0a0e27"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.6s ease-out ' + (i * 0.05) + 's, r 0.2s' }}
          />
        ))}

        {data.map((d, i) => {
          const x = toX(i)
          const show = data.length <= 14 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1
          return show ? (
            <text key={i} x={x} y={H - 8} textAnchor="middle" className="fill-zinc-500" fontSize="10" fontFamily="sans-serif">
              {d.date}
            </text>
          ) : null
        })}

        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + chartH} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <rect
              x={tooltip.x + (tooltip.x > W / 2 ? -160 : 12)}
              y={Math.max(PAD.top, tooltip.y - 80)}
              width="148"
              height="84"
              rx="10"
              fill="#0a0e27"
              stroke="#1a1f3a"
              strokeWidth="1"
            />
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -148 : 24)}
              y={Math.max(PAD.top + 14, tooltip.y - 62)}
              className="fill-zinc-500"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
              letterSpacing="0.1em"
            >
              {tooltip.item.date}
            </text>
            <circle cx={tooltip.x + (tooltip.x > W / 2 ? -144 : 28)} cy={Math.max(PAD.top + 24, tooltip.y - 50)} r="3" fill="#6366f1" />
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -136 : 36)}
              y={Math.max(PAD.top + 27, tooltip.y - 47)}
              className="fill-zinc-300"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Reservas: ${tooltip.item.bookingRevenue.toLocaleString()}
            </text>
            <circle cx={tooltip.x + (tooltip.x > W / 2 ? -144 : 28)} cy={Math.max(PAD.top + 40, tooltip.y - 34)} r="3" fill="#ccff00" />
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -136 : 36)}
              y={Math.max(PAD.top + 43, tooltip.y - 31)}
              className="fill-zinc-300"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Productos: ${tooltip.item.productRevenue.toLocaleString()}
            </text>
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -148 : 24)}
              y={Math.max(PAD.top + 62, tooltip.y - 12)}
              className="fill-[#ccff00]"
              fontSize="11"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Total: ${tooltip.item.revenue.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
