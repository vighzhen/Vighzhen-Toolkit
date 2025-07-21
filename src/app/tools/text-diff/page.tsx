'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

interface DiffResult {
  type: 'equal' | 'insert' | 'delete' | 'replace'
  oldText?: string
  newText?: string
  text?: string
}

export default function TextDiff() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [diffResults, setDiffResults] = useState<DiffResult[]>([])
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [stats, setStats] = useState<{
    additions: number
    deletions: number
    modifications: number
    unchanged: number
  } | null>(null)
  
  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)

  // 简单的文本差异算法
  const computeDiff = () => {
    let text1 = leftText
    let text2 = rightText

    // 处理选项
    if (ignoreCase) {
      text1 = text1.toLowerCase()
      text2 = text2.toLowerCase()
    }
    
    if (ignoreWhitespace) {
      text1 = text1.replace(/\s+/g, ' ').trim()
      text2 = text2.replace(/\s+/g, ' ').trim()
    }

    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    
    const results: DiffResult[] = []
    let additions = 0
    let deletions = 0
    let modifications = 0
    let unchanged = 0

    const maxLines = Math.max(lines1.length, lines2.length)
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      
      if (line1 === line2) {
        results.push({ type: 'equal', text: line1 })
        unchanged++
      } else if (line1 === '') {
        results.push({ type: 'insert', newText: line2 })
        additions++
      } else if (line2 === '') {
        results.push({ type: 'delete', oldText: line1 })
        deletions++
      } else {
        results.push({ type: 'replace', oldText: line1, newText: line2 })
        modifications++
      }
    }
    
    setDiffResults(results)
    setStats({ additions, deletions, modifications, unchanged })
  }

  const clearAll = () => {
    setLeftText('')
    setRightText('')
    setDiffResults([])
    setStats(null)
  }

  const loadSampleData = () => {
    setLeftText(`Hello World!
This is the original text.
Line 3 remains the same.
This line will be modified.
This line will be deleted.`)
    setRightText(`Hello World!
This is the updated text.
Line 3 remains the same.
This line has been modified.
This is a new line.`)
  }

  const importFile = (side: 'left' | 'right') => {
    const input = side === 'left' ? leftFileRef.current : rightFileRef.current
    input?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (side === 'left') {
          setLeftText(content)
        } else {
          setRightText(content)
        }
      }
      reader.readAsText(file)
    } else {
      alert('请选择文本文件 (.txt)')
    }
  }

  const exportDiff = () => {
    let output = '=== 文本对比结果 ===\n\n'
    
    if (stats) {
      output += `统计信息:\n`
      output += `- 新增行: ${stats.additions}\n`
      output += `- 删除行: ${stats.deletions}\n`
      output += `- 修改行: ${stats.modifications}\n`
      output += `- 未变行: ${stats.unchanged}\n\n`
    }
    
    output += '详细差异:\n'
    diffResults.forEach((result, index) => {
      switch (result.type) {
        case 'equal':
          output += `  ${index + 1}: ${result.text}\n`
          break
        case 'insert':
          output += `+ ${index + 1}: ${result.newText}\n`
          break
        case 'delete':
          output += `- ${index + 1}: ${result.oldText}\n`
          break
        case 'replace':
          output += `- ${index + 1}: ${result.oldText}\n`
          output += `+ ${index + 1}: ${result.newText}\n`
          break
      }
    })
    
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'text-diff-result.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const renderSideBySide = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>原始文本</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => importFile('left')}>
                导入
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(leftText)}>
                复制
              </Button>
            </div>
          </CardTitle>
          <CardDescription>在此输入或粘贴原始文本</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="输入原始文本..."
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>对比文本</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => importFile('right')}>
                导入
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(rightText)}>
                复制
              </Button>
            </div>
          </CardTitle>
          <CardDescription>在此输入或粘贴要对比的文本</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="输入对比文本..."
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )

  const renderUnified = () => (
    <Card>
      <CardHeader>
        <CardTitle>文本输入</CardTitle>
        <CardDescription>分别输入要对比的两段文本</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">原始文本</label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => importFile('left')}>
                导入
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(leftText)}>
                复制
              </Button>
            </div>
          </div>
          <Textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="输入原始文本..."
            rows={8}
            className="font-mono text-sm"
          />
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">对比文本</label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => importFile('right')}>
                导入
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(rightText)}>
                复制
              </Button>
            </div>
          </div>
          <Textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="输入对比文本..."
            rows={8}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderDiffResults = () => {
    if (diffResults.length === 0) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">对比结果将在这里显示</p>
              <p className="text-sm text-muted-foreground">输入文本并点击"开始对比"</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>对比结果</CardTitle>
          <CardDescription>
            {stats && (
              <div className="flex gap-4 mt-2">
                <Badge variant="outline" className="text-green-600">+{stats.additions}</Badge>
                <Badge variant="outline" className="text-red-600">-{stats.deletions}</Badge>
                <Badge variant="outline" className="text-blue-600">~{stats.modifications}</Badge>
                <Badge variant="outline">=={stats.unchanged}</Badge>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-auto font-mono text-sm">
            {diffResults.map((result, index) => {
              switch (result.type) {
                case 'equal':
                  return (
                    <div key={index} className="flex">
                      <span className="w-12 text-muted-foreground text-right mr-4">{index + 1}</span>
                      <span className="text-muted-foreground">{result.text}</span>
                    </div>
                  )
                case 'insert':
                  return (
                    <div key={index} className="flex bg-green-50 dark:bg-green-900/20">
                      <span className="w-12 text-green-600 text-right mr-4">+{index + 1}</span>
                      <span className="text-green-600">{result.newText}</span>
                    </div>
                  )
                case 'delete':
                  return (
                    <div key={index} className="flex bg-red-50 dark:bg-red-900/20">
                      <span className="w-12 text-red-600 text-right mr-4">-{index + 1}</span>
                      <span className="text-red-600 line-through">{result.oldText}</span>
                    </div>
                  )
                case 'replace':
                  return (
                    <div key={index}>
                      <div className="flex bg-red-50 dark:bg-red-900/20">
                        <span className="w-12 text-red-600 text-right mr-4">-{index + 1}</span>
                        <span className="text-red-600 line-through">{result.oldText}</span>
                      </div>
                      <div className="flex bg-green-50 dark:bg-green-900/20">
                        <span className="w-12 text-green-600 text-right mr-4">+{index + 1}</span>
                        <span className="text-green-600">{result.newText}</span>
                      </div>
                    </div>
                  )
                default:
                  return null
              }
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">📊 文本对比</h1>
          <p className="text-muted-foreground">智能文本差异分析和对比工具</p>
        </div>

        {/* 控制面板 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList>
                  <TabsTrigger value="side-by-side">并排显示</TabsTrigger>
                  <TabsTrigger value="unified">统一显示</TabsTrigger>
                </TabsList>
              </Tabs>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex gap-2">
                <Button
                  variant={ignoreWhitespace ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
                >
                  忽略空格
                </Button>
                <Button
                  variant={ignoreCase ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIgnoreCase(!ignoreCase)}
                >
                  忽略大小写
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex gap-2">
                <Button onClick={loadSampleData} variant="outline" size="sm">
                  示例数据
                </Button>
                <Button onClick={computeDiff} size="sm">
                  开始对比
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  清空
                </Button>
                {diffResults.length > 0 && (
                  <Button onClick={exportDiff} variant="outline" size="sm">
                    导出结果
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文本输入区域 */}
        {viewMode === 'side-by-side' ? renderSideBySide() : renderUnified()}

        {/* 对比结果 */}
        <div className="mt-6">
          {renderDiffResults()}
        </div>

        {/* 使用说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
            <CardDescription>文本对比工具的功能介绍</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium">🔍 智能对比</h5>
                <p className="text-sm text-muted-foreground">
                  逐行对比文本差异，支持新增、删除、修改的可视化显示
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">⚙️ 对比选项</h5>
                <p className="text-sm text-muted-foreground">
                  支持忽略空格和大小写，提供更灵活的对比方式
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📁 文件支持</h5>
                <p className="text-sm text-muted-foreground">
                  支持导入文本文件进行对比，结果可导出保存
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📊 统计信息</h5>
                <p className="text-sm text-muted-foreground">
                  显示详细的差异统计，包括新增、删除、修改行数
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🎨 可视化</h5>
                <p className="text-sm text-muted-foreground">
                  颜色标记不同类型的差异，绿色新增、红色删除
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📱 响应式</h5>
                <p className="text-sm text-muted-foreground">
                  支持并排和统一两种显示模式，适配不同屏幕尺寸
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 隐藏的文件输入 */}
        <input
          ref={leftFileRef}
          type="file"
          accept=".txt"
          onChange={(e) => handleFileImport(e, 'left')}
          className="hidden"
        />
        <input
          ref={rightFileRef}
          type="file"
          accept=".txt"
          onChange={(e) => handleFileImport(e, 'right')}
          className="hidden"
        />
      </div>
    </div>
  )
}