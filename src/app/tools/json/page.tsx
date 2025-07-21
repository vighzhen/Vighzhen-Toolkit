'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function JSONTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<{
    size: string
    keys: number
    type: string
  } | null>(null)

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')

      const size = new Blob([formatted]).size
      const keys = countKeys(parsed)
      const type = Array.isArray(parsed) ? 'Array' : typeof parsed

      setStats({
        size: formatBytes(size),
        keys,
        type
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的JSON格式')
      setOutput('')
      setStats(null)
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')

      const size = new Blob([minified]).size
      const keys = countKeys(parsed)
      const type = Array.isArray(parsed) ? 'Array' : typeof parsed

      setStats({
        size: formatBytes(size),
        keys,
        type
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的JSON格式')
      setOutput('')
      setStats(null)
    }
  }

  const validateJSON = () => {
    try {
      JSON.parse(input)
      setError('')
      setOutput('✅ JSON格式正确')
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的JSON格式')
      setOutput('')
    }
  }

  const countKeys = (obj: unknown): number => {
    if (typeof obj !== 'object' || obj === null) return 0
    if (Array.isArray(obj)) {
      return obj.reduce((count: number, item: unknown) => count + countKeys(item), 0)
    }
    return Object.keys(obj).length + Object.values(obj).reduce((count: number, value: unknown) => count + countKeys(value), 0)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setStats(null)
  }

  const sampleJSON = `{
  "name": "示例数据",
  "version": "1.0.0",
  "description": "这是一个JSON示例",
  "author": {
    "name": "Vighzhen",
    "email": "example@example.com"
  },
  "features": [
    "JSON格式化",
    "JSON压缩",
    "JSON验证"
  ],
  "settings": {
    "theme": "dark",
    "language": "zh-CN",
    "notifications": true
  }
}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">📋 JSON 工具</h1>
          <p className="text-muted-foreground">JSON格式化、压缩、验证和分析</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输入 JSON</CardTitle>
              <CardDescription>粘贴或输入需要处理的JSON数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setInput(sampleJSON)} variant="outline" size="sm">
                  示例数据
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  清空
                </Button>
              </div>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入JSON数据..."
                rows={15}
                className="font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button onClick={formatJSON} className="flex-1">
                  格式化
                </Button>
                <Button onClick={minifyJSON} variant="outline" className="flex-1">
                  压缩
                </Button>
                <Button onClick={validateJSON} variant="outline" className="flex-1">
                  验证
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输出结果</CardTitle>
              <CardDescription>
                {error ? '错误信息' : output ? '处理结果' : '等待处理...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                  <h4 className="font-medium text-destructive mb-2">JSON 错误</h4>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {output && !error && (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">结果</h4>
                    <Button
                      onClick={() => copyToClipboard(output)}
                      size="sm"
                      variant="outline"
                    >
                      复制
                    </Button>
                  </div>

                  <Textarea
                    value={output}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </>
              )}

              {stats && (
                <div className="space-y-3">
                  <h4 className="font-medium">统计信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">类型:</span>
                        <Badge variant="outline">{stats.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">大小:</span>
                        <Badge variant="outline">{stats.size}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">键数量:</span>
                        <Badge variant="outline">{stats.keys}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!output && !error && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">处理结果将在这里显示</p>
                    <p className="text-sm text-muted-foreground">
                      输入JSON数据并选择操作
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用JSON操作和提示</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium">✨ 格式化</h5>
                <p className="text-sm text-muted-foreground">
                  将压缩的JSON转换为易读的格式，包含适当的缩进和换行
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🗜️ 压缩</h5>
                <p className="text-sm text-muted-foreground">
                  移除所有不必要的空格和换行，减少文件大小
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">✅ 验证</h5>
                <p className="text-sm text-muted-foreground">
                  检查JSON语法是否正确，显示详细的错误信息
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
