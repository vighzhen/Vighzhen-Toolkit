'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function TimestampTool() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamp, setTimestamp] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [convertedTimestamp, setConvertedTimestamp] = useState('')
  const [convertedDateTime, setConvertedDateTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date: Date) => {
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0') + ':' +
           String(date.getSeconds()).padStart(2, '0')
  }

  const formatDateTimeForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const timestampToDateTime = () => {
    try {
      const ts = parseInt(timestamp)
      if (isNaN(ts)) {
        setConvertedDateTime('请输入有效的时间戳')
        return
      }

      // 自动检测时间戳格式（秒或毫秒）
      const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000)
      setConvertedDateTime(formatDateTime(date))
    } catch (error) {
      setConvertedDateTime('转换失败')
    }
  }

  const dateTimeToTimestamp = () => {
    try {
      if (!dateTime) {
        setConvertedTimestamp('请选择日期时间')
        return
      }

      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        setConvertedTimestamp('请输入有效的日期时间')
        return
      }

      setConvertedTimestamp(Math.floor(date.getTime() / 1000).toString())
    } catch (error) {
      setConvertedTimestamp('转换失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const setCurrentTimestamp = () => {
    setTimestamp(Math.floor(Date.now() / 1000).toString())
  }

  const setCurrentDateTime = () => {
    setDateTime(formatDateTimeForInput(new Date()))
  }

  const commonTimestamps = [
    { label: '今天 00:00:00', value: Math.floor(new Date().setHours(0, 0, 0, 0) / 1000) },
    { label: '昨天 00:00:00', value: Math.floor(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0) / 1000) },
    { label: '一周前', value: Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000) },
    { label: '一个月前', value: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000) },
    { label: 'Unix 纪元', value: 0 },
    { label: '2000年', value: 946684800 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">⏰ 时间戳转换</h1>
          <p className="text-muted-foreground">时间戳与日期时间相互转换工具</p>
        </div>

        {/* Current Time Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>当前时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">当前时间戳 (秒)</h4>
                <div className="text-2xl font-mono mb-2">
                  {Math.floor(currentTime.getTime() / 1000)}
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(Math.floor(currentTime.getTime() / 1000).toString())}
                >
                  复制
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">当前时间戳 (毫秒)</h4>
                <div className="text-2xl font-mono mb-2">
                  {currentTime.getTime()}
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(currentTime.getTime().toString())}
                >
                  复制
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">当前日期时间</h4>
                <div className="text-xl font-mono mb-2">
                  {formatDateTime(currentTime)}
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(formatDateTime(currentTime))}
                >
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timestamp to DateTime */}
          <Card>
            <CardHeader>
              <CardTitle>时间戳转日期时间</CardTitle>
              <CardDescription>将时间戳转换为可读的日期时间格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">时间戳 (秒或毫秒)</label>
                <div className="flex gap-2">
                  <Input
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="1640995200"
                  />
                  <Button onClick={setCurrentTimestamp} variant="outline">
                    当前
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">常用时间戳</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonTimestamps.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setTimestamp(item.value.toString())}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={timestampToDateTime} className="w-full">
                转换为日期时间
              </Button>

              {convertedDateTime && (
                <div className="p-4 border rounded-lg bg-muted">
                  <label className="text-sm font-medium mb-2 block">转换结果</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={convertedDateTime}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(convertedDateTime)}
                    >
                      复制
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DateTime to Timestamp */}
          <Card>
            <CardHeader>
              <CardTitle>日期时间转时间戳</CardTitle>
              <CardDescription>将日期时间转换为时间戳</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">选择日期时间</label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button onClick={setCurrentDateTime} variant="outline">
                    当前
                  </Button>
                </div>
              </div>

              <Button onClick={dateTimeToTimestamp} className="w-full">
                转换为时间戳
              </Button>

              {convertedTimestamp && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted">
                    <label className="text-sm font-medium mb-2 block">时间戳 (秒)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={convertedTimestamp}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(convertedTimestamp)}
                      >
                        复制
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted">
                    <label className="text-sm font-medium mb-2 block">时间戳 (毫秒)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={(parseInt(convertedTimestamp) * 1000).toString()}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard((parseInt(convertedTimestamp) * 1000).toString())}
                      >
                        复制
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>时间戳说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium">📅 什么是时间戳？</h5>
                <p className="text-sm text-muted-foreground">
                  时间戳是指格林威治时间1970年01月01日00时00分00秒起至现在的总秒数或毫秒数。
                  它是一种时间表示方式，通常用于程序中记录时间。
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🔄 格式说明</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 秒级时间戳：10位数字 (如: 1640995200)</li>
                  <li>• 毫秒级时间戳：13位数字 (如: 1640995200000)</li>
                  <li>• 工具会自动识别时间戳格式</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
