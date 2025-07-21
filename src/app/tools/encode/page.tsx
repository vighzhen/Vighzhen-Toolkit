'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function EncodeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const base64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError('')
    } catch (err) {
      setError('Base64编码失败')
      setOutput('')
    }
  }

  const base64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
      setError('')
    } catch (err) {
      setError('Base64解码失败，请检查输入格式')
      setOutput('')
    }
  }

  const urlEncode = () => {
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      setError('')
    } catch (err) {
      setError('URL编码失败')
      setOutput('')
    }
  }

  const urlDecode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      setError('')
    } catch (err) {
      setError('URL解码失败，请检查输入格式')
      setOutput('')
    }
  }

  const htmlEncode = () => {
    const encoded = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    setOutput(encoded)
    setError('')
  }

  const htmlDecode = () => {
    const decoded = input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    setOutput(decoded)
    setError('')
  }

  const hexEncode = () => {
    try {
      const encoded = Array.from(new TextEncoder().encode(input))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      setOutput(encoded)
      setError('')
    } catch (err) {
      setError('Hex编码失败')
      setOutput('')
    }
  }

  const hexDecode = () => {
    try {
      const cleanInput = input.replace(/\s/g, '')
      if (cleanInput.length % 2 !== 0) {
        setError('Hex字符串长度必须是偶数')
        setOutput('')
        return
      }

      const bytes = []
      for (let i = 0; i < cleanInput.length; i += 2) {
        const byte = parseInt(cleanInput.substr(i, 2), 16)
        if (isNaN(byte)) {
          setError('包含无效的Hex字符')
          setOutput('')
          return
        }
        bytes.push(byte)
      }

      const decoded = new TextDecoder().decode(new Uint8Array(bytes))
      setOutput(decoded)
      setError('')
    } catch (err) {
      setError('Hex解码失败')
      setOutput('')
    }
  }

  const binaryEncode = () => {
    try {
      const encoded = Array.from(new TextEncoder().encode(input))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(' ')
      setOutput(encoded)
      setError('')
    } catch (err) {
      setError('二进制编码失败')
      setOutput('')
    }
  }

  const binaryDecode = () => {
    try {
      const binaryGroups = input.replace(/\s/g, '').match(/.{1,8}/g)
      if (!binaryGroups) {
        setError('无效的二进制格式')
        setOutput('')
        return
      }

      const bytes = binaryGroups.map(binary => {
        if (binary.length !== 8 || !/^[01]+$/.test(binary)) {
          throw new Error('无效的二进制字符')
        }
        return parseInt(binary, 2)
      })

      const decoded = new TextDecoder().decode(new Uint8Array(bytes))
      setOutput(decoded)
      setError('')
    } catch (err) {
      setError('二进制解码失败，请检查格式')
      setOutput('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const swapInputOutput = () => {
    const temp = input
    setInput(output)
    setOutput(temp)
    setError('')
  }

  const sampleTexts = {
    base64: 'Hello, 世界! 🌍',
    url: 'https://example.com/search?q=hello world&lang=zh',
    html: '<div class="example">Hello & welcome!</div>',
    hex: 'Hello World',
    binary: 'Hi!'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🔤 编码解码</h1>
          <p className="text-muted-foreground">Base64、URL、HTML、Hex、二进制编解码工具</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输入文本</CardTitle>
              <CardDescription>在此输入需要编码或解码的文本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={clearAll} variant="outline" size="sm">
                  清空
                </Button>
                <Button onClick={swapInputOutput} variant="outline" size="sm">
                  输入输出互换
                </Button>
              </div>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入文本..."
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输出结果</CardTitle>
              <CardDescription>
                {error ? '错误信息' : output ? '处理结果' : '选择操作类型'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
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
                    rows={10}
                    className="font-mono text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      长度: {output.length}
                    </Badge>
                    <Badge variant="outline">
                      字节: {new Blob([output]).size}
                    </Badge>
                  </div>
                </>
              )}

              {!output && !error && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    输入文本并选择编码/解码操作
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Operation Tabs */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>编码解码操作</CardTitle>
            <CardDescription>选择编码格式并执行操作</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="base64">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="base64">Base64</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="hex">Hex</TabsTrigger>
                <TabsTrigger value="binary">二进制</TabsTrigger>
              </TabsList>

              <TabsContent value="base64" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setInput(sampleTexts.base64)} variant="outline" size="sm">
                    示例文本
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button onClick={base64Encode} className="flex-1">
                    Base64 编码
                  </Button>
                  <Button onClick={base64Decode} variant="outline" className="flex-1">
                    Base64 解码
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Base64是一种基于64个可打印字符来表示二进制数据的表示方法
                </p>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setInput(sampleTexts.url)} variant="outline" size="sm">
                    示例URL
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button onClick={urlEncode} className="flex-1">
                    URL 编码
                  </Button>
                  <Button onClick={urlDecode} variant="outline" className="flex-1">
                    URL 解码
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL编码用于在URL中安全传输特殊字符
                </p>
              </TabsContent>

              <TabsContent value="html" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setInput(sampleTexts.html)} variant="outline" size="sm">
                    示例HTML
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button onClick={htmlEncode} className="flex-1">
                    HTML 编码
                  </Button>
                  <Button onClick={htmlDecode} variant="outline" className="flex-1">
                    HTML 解码
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  HTML编码用于在HTML中显示特殊字符，防止XSS攻击
                </p>
              </TabsContent>

              <TabsContent value="hex" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setInput(sampleTexts.hex)} variant="outline" size="sm">
                    示例文本
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button onClick={hexEncode} className="flex-1">
                    Hex 编码
                  </Button>
                  <Button onClick={hexDecode} variant="outline" className="flex-1">
                    Hex 解码
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  十六进制编码将每个字节表示为两个十六进制字符
                </p>
              </TabsContent>

              <TabsContent value="binary" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setInput(sampleTexts.binary)} variant="outline" size="sm">
                    示例文本
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button onClick={binaryEncode} className="flex-1">
                    二进制编码
                  </Button>
                  <Button onClick={binaryDecode} variant="outline" className="flex-1">
                    二进制解码
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  二进制编码将每个字符表示为8位二进制数
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
