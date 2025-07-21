'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function ColorTool() {
  const [currentColor, setCurrentColor] = useState('#3b82f6')
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
        default: h = 0
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const generatePalette = (baseColor: string) => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const colors = []
    for (let i = 1; i <= 9; i++) {
      const factor = i * 0.1
      const newR = Math.round(rgb.r + (255 - rgb.r) * (1 - factor))
      const newG = Math.round(rgb.g + (255 - rgb.g) * (1 - factor))
      const newB = Math.round(rgb.b + (255 - rgb.b) * (1 - factor))
      colors.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`)
    }
    return colors
  }

  const rgb = hexToRgb(currentColor)
  const hsl = hexToHsl(currentColor)
  const palette = generatePalette(currentColor)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🎨 颜色工具</h1>
          <p className="text-muted-foreground">颜色选择器、调色板生成和颜色格式转换</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>颜色选择器</CardTitle>
              <CardDescription>选择颜色并查看不同格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-16 h-16 rounded border cursor-pointer"
                />
                <Input
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>

              <div
                className="w-full h-24 rounded border-2 border-border"
                style={{ backgroundColor: currentColor }}
              />

              <Tabs defaultValue="hex">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="hex">HEX</TabsTrigger>
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="hsl">HSL</TabsTrigger>
                </TabsList>

                <TabsContent value="hex" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={currentColor.toUpperCase()} readOnly />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(currentColor.toUpperCase(), 'hex')}
                    >
                      {copied === 'hex' ? '已复制!' : '复制'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="rgb" className="space-y-2">
                  {rgb && (
                    <div className="flex items-center gap-2">
                      <Input value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} readOnly />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                      >
                        {copied === 'rgb' ? '已复制!' : '复制'}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hsl" className="space-y-2">
                  {hsl && (
                    <div className="flex items-center gap-2">
                      <Input value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} readOnly />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                      >
                        {copied === 'hsl' ? '已复制!' : '复制'}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>调色板生成器</CardTitle>
              <CardDescription>基于当前颜色生成渐变调色板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {palette.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="w-full h-16 rounded border cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => copyToClipboard(color, `palette-${index}`)}
                      title="点击复制"
                    />
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer"
                        onClick={() => copyToClipboard(color, `palette-${index}`)}
                      >
                        {copied === `palette-${index}` ? '已复制!' : color.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                点击颜色块或代码复制到剪贴板
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
