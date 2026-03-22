import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { HeatmapEntry } from './types'

interface Props {
  data: HeatmapEntry[]
}

const CELL_SIZE = 13
const CELL_GAP = 3
const STEP = CELL_SIZE + CELL_GAP
const WEEKS = 52
const DAYS = 7

export default function Heatmap({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const dataMap = new Map(data.map((d) => [d.date, d.total]))
    const maxTotal = d3.max(data, (d) => d.total) ?? 1

    const colorScale = d3
      .scaleSequential()
      .domain([0, maxTotal])
      .interpolator(d3.interpolate('rgba(128, 128, 128, 0.1)', '#1D9E75'))

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - WEEKS * 7)

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < DAYS; day++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + week * 7 + day)
        const dateStr = date.toISOString().split('T')[0]
        const total = dataMap.get(dateStr) ?? 0

        svg
          .append('rect')
          .attr('x', week * STEP)
          .attr('y', day * STEP)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE)
          .attr('rx', 2)
          .attr('fill', total > 0 ? colorScale(total) : 'rgba(128, 128, 128, 0.1)')
          .append('title')
          .text(total > 0 ? `${dateStr}: ${Math.round(total / 60000)}m` : dateStr)
      }
    }
  }, [data])

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: 13, color: 'grey', marginBottom: 8 }}>Activity — last 12 months</p>
      <svg ref={svgRef} width={WEEKS * STEP} height={DAYS * STEP} />
    </div>
  )
}
