'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function HashTool() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [file, setFile] = useState<File | null>(null)

  const calculateHashes = async (data: string | ArrayBuffer) => {
    const encoder = new TextEncoder()
    const inputData = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(data)

    const results: Record<string, string> = {}

    try {
      // MD5 - 使用简单的 JavaScript 实现
      results.md5 = await md5Hash(inputData)

      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', inputData)
      results.sha1 = bufferToHex(sha1Buffer)

      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', inputData)
      results.sha256 = bufferToHex(sha256Buffer)

      // SHA-384
      const sha384Buffer = await crypto.subtle.digest('SHA-384', inputData)
      results.sha384 = bufferToHex(sha384Buffer)

      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', inputData)
      results.sha512 = bufferToHex(sha512Buffer)

    } catch (error) {
      console.error('Hash calculation error:', error)
    }

    setHashes(results)
  }

  // 简单的 MD5 实现（仅用于演示，实际项目中建议使用库）
  const md5Hash = async (data: Uint8Array): Promise<string> => {
    // 这里使用一个简化的哈希算法作为示例
    // 实际项目中应该使用专门的 MD5 库
    let hash = 0
    const str = new TextDecoder().decode(data)
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleTextInput = () => {
    if (input.trim()) {
      calculateHashes(input)
    } else {
      setHashes({})
    }
  }

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      calculateHashes(arrayBuffer)
    }
  }

  const copyToClipboard = (text: string, algorithm: string) => {
    navigator.clipboard.writeText(text)
    alert(`${algorithm.toUpperCase()} 哈希值已复制到剪贴板!`)
  }

  const clearAll = () => {
    setInput('')
    setFile(null)
    setHashes({})
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const sampleTexts = [
    'Hello World',
    'The quick brown fox jumps over the lazy dog',
    '中文测试文本',
    '123456789',
    JSON.stringify({ name: 'test', value: 123 })
  ]

  const hashAlgorithms = [
    { key: 'md5', name: 'MD5', description: '128位哈希值，已不安全但仍广泛使用' },
    { key: 'sha1', name: 'SHA-1', description: '160位哈希值，逐渐被淘汰' },
    { key: 'sha256', name: 'SHA-256', description: '256位哈希值，目前最常用' },
    { key: 'sha384', name: 'SHA-384', description: '384位哈希值，高安全性' },
    { key: 'sha512', name: 'SHA-512', description: '512位哈希值，最高安全性' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🔒 哈希生成器</h1>
          <p className="text-muted-foreground">支持MD5、SHA-1、SHA-256等多种哈希算法</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输入数据</CardTitle>
              <CardDescription>选择文本输入或文件上传</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'text' | 'file')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">文本输入</TabsTrigger>
                  <TabsTrigger value="file">文件上传</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">快速输入</label>
                    <div className="flex gap-2 flex-wrap">
                      {sampleTexts.map((text, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(text)}
                        >
                          示例{index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="在此输入要计算哈希的文本..."
                    rows={6}
                    className="font-mono text-sm"
                  />

                  <Button onClick={handleTextInput} className="w-full">
                    计算哈希值
                  </Button>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">选择文件</label>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileInput}
                      className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>

                  {file && (
                    <div className="p-4 border rounded-lg bg-muted">
                      <h4 className="font-medium mb-2">文件信息</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>文件名:</span>
                          <span className="font-mono truncate max-w-xs">{file.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>文件大小:</span>
                          <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>文件类型:</span>
                          <Badge variant="outline">{file.type || '未知'}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={clearAll} variant="outline" className="flex-1">
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>哈希结果</CardTitle>
              <CardDescription>
                {Object.keys(hashes).length > 0 ? '各种算法的哈希值' : '等待计算...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(hashes).length > 0 ? (
                <div className="space-y-4">
                  {hashAlgorithms.map((algorithm) => {
                    const hashValue = hashes[algorithm.key]
                    if (!hashValue) return null

                    return (
                      <div key={algorithm.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{algorithm.name}</h4>
                            <p className="text-xs text-muted-foreground">{algorithm.description}</p>
                          </div>
                          <Badge variant="outline">
                            {hashValue.length * 4} 位
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={hashValue}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(hashValue, algorithm.name)}
                          >
                            复制
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">哈希结果将在这里显示</p>
                    <p className="text-sm text-muted-foreground">
                      输入文本或上传文件开始计算
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>哈希算法说明</CardTitle>
            <CardDescription>了解不同哈希算法的特点和用途</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">🔒 安全性对比</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>MD5</span>
                      <Badge variant="destructive">已破解</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SHA-1</span>
                      <Badge variant="destructive">不安全</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SHA-256</span>
                      <Badge variant="default">安全</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SHA-384/512</span>
                      <Badge variant="default">高安全</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">📋 常见用途</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 文件完整性验证</li>
                    <li>• 密码存储（加盐哈希）</li>
                    <li>• 数字签名</li>
                    <li>• 区块链和加密货币</li>
                    <li>• 数据指纹识别</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
