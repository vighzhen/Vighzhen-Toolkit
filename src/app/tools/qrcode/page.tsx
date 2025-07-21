'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import QRCode from 'qrcode'

export default function QRCodeTool() {
  const [text, setText] = useState('https://example.com')
  const [qrDataURL, setQrDataURL] = useState('')
  const [size, setSize] = useState(200)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [loading, setLoading] = useState(false)

  const generateQRCode = useCallback(async () => {
    if (!text.trim()) {
      setQrDataURL('')
      return
    }

    setLoading(true)
    try {
      const dataURL = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: errorLevel
      })
      setQrDataURL(dataURL)
    } catch (error) {
      console.error('生成二维码失败:', error)
    } finally {
      setLoading(false)
    }
  }, [text, size, errorLevel])

  const downloadQRCode = () => {
    if (!qrDataURL) return

    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrDataURL
    link.click()
  }

  const copyToClipboard = async () => {
    if (!qrDataURL) return

    try {
      const response = await fetch(qrDataURL)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('二维码已复制到剪贴板!')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请尝试下载')
    }
  }

  useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

  const presetTexts = [
    { label: '个人网站', value: 'https://example.com' },
    { label: 'GitHub', value: 'https://github.com/username' },
    { label: '微信', value: 'weixin://contacts/profile/username' },
    { label: 'WiFi', value: 'WIFI:T:WPA;S:network_name;P:password;;' },
    { label: '电话', value: 'tel:+86-123-4567-8901' },
    { label: '邮箱', value: 'mailto:user@example.com' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">📱 二维码生成器</h1>
          <p className="text-muted-foreground">快速生成二维码，支持文本、链接、WiFi等</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>输入内容</CardTitle>
              <CardDescription>输入要生成二维码的文本或链接</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="custom" onValueChange={() => setText('')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">自定义</TabsTrigger>
                  <TabsTrigger value="preset">预设模板</TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-4">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入文本、链接或其他内容..."
                    rows={4}
                  />
                </TabsContent>

                <TabsContent value="preset" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {presetTexts.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setText(preset.value)}
                        className="justify-start"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="点击上方预设或输入自定义内容..."
                    rows={4}
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    大小: {size}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    容错级别
                  </label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={errorLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setErrorLevel(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    L(7%) - M(15%) - Q(25%) - H(30%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>预览和下载二维码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {loading ? (
                  <div className="flex items-center justify-center w-48 h-48 border rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : qrDataURL ? (
                  <div className="space-y-4">
                    <img
                      src={qrDataURL}
                      alt="Generated QR Code"
                      className="border rounded-lg shadow-sm"
                      style={{ width: size, height: size }}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={downloadQRCode} size="sm">
                        下载图片
                      </Button>
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        复制图片
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground">输入内容生成二维码</p>
                  </div>
                )}
              </div>

              {qrDataURL && (
                <div className="space-y-2">
                  <h4 className="font-medium">信息</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>内容长度:</span>
                      <Badge variant="outline">{text.length} 字符</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>图片大小:</span>
                      <Badge variant="outline">{size}×{size}px</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>容错级别:</span>
                      <Badge variant="outline">{errorLevel}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
