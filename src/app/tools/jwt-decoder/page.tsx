'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Alert component removed - using simple error display instead
import Link from 'next/link'

interface JWTDecoded {
  header: any
  payload: any
  signature: string
  headerRaw: string
  payloadRaw: string
}

export default function JWTDecoderTool() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null)
  const [error, setError] = useState('')

  const decodeJWT = () => {
    try {
      if (!input.trim()) {
        setError('请输入JWT token')
        setDecoded(null)
        return
      }

      const parts = input.trim().split('.')
      if (parts.length !== 3) {
        setError('无效的JWT格式。JWT应该包含三个由点号分隔的部分')
        setDecoded(null)
        return
      }

      const [headerB64, payloadB64, signature] = parts

      // 解码header
      const headerRaw = base64UrlDecode(headerB64)
      const header = JSON.parse(headerRaw)

      // 解码payload
      const payloadRaw = base64UrlDecode(payloadB64)
      const payload = JSON.parse(payloadRaw)

      setDecoded({
        header,
        payload,
        signature,
        headerRaw,
        payloadRaw
      })
      setError('')
    } catch (err) {
      setError('JWT解析失败：' + (err instanceof Error ? err.message : '未知错误'))
      setDecoded(null)
    }
  }

  const base64UrlDecode = (str: string): string => {
    // 添加必要的填充
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    try {
      return decodeURIComponent(escape(atob(base64)))
    } catch (err) {
      throw new Error('Base64解码失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const clearAll = () => {
    setInput('')
    setDecoded(null)
    setError('')
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  const isExpired = (exp?: number): boolean => {
    if (!exp) return false
    return Date.now() / 1000 > exp
  }

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQ2NzIwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">� JWT Decoder</h1>
          <p className="text-muted-foreground">解析JWT token并展示其结构内容</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>JWT Token 输入</CardTitle>
              <CardDescription>
                输入完整的JWT token进行解析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="请输入JWT token...\n\n例如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={decodeJWT} className="flex-1">
                  解析JWT
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setInput(sampleJWT)}
                >
                  使用示例
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  清空
                </Button>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle>解析结果</CardTitle>
              <CardDescription>
                JWT token的结构化内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              {decoded ? (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">概览</TabsTrigger>
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="signature">Signature</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">Token 信息</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">算法:</span>
                            <Badge variant="secondary">{decoded.header.alg || 'N/A'}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">类型:</span>
                            <Badge variant="secondary">{decoded.header.typ || 'N/A'}</Badge>
                          </div>
                          {decoded.payload.iss && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">签发者:</span>
                              <span className="text-sm">{decoded.payload.iss}</span>
                            </div>
                          )}
                          {decoded.payload.sub && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">主题:</span>
                              <span className="text-sm">{decoded.payload.sub}</span>
                            </div>
                          )}
                          {decoded.payload.aud && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">受众:</span>
                              <span className="text-sm">{Array.isArray(decoded.payload.aud) ? decoded.payload.aud.join(', ') : decoded.payload.aud}</span>
                            </div>
                          )}
                          {decoded.payload.iat && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">签发时间:</span>
                              <span className="text-sm">{formatTimestamp(decoded.payload.iat)}</span>
                            </div>
                          )}
                          {decoded.payload.exp && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">过期时间:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{formatTimestamp(decoded.payload.exp)}</span>
                                {isExpired(decoded.payload.exp) ? (
                                  <Badge variant="destructive">已过期</Badge>
                                ) : (
                                  <Badge variant="default">有效</Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {decoded.payload.nbf && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">生效时间:</span>
                              <span className="text-sm">{formatTimestamp(decoded.payload.nbf)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="header" className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Header (已解码)</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                        >
                          复制
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payload" className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Payload (已解码)</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                        >
                          复制
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signature" className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Signature (Base64编码)</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(decoded.signature)}
                        >
                          复制
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto break-all">
                        {decoded.signature}
                      </pre>
                      <p className="text-sm text-muted-foreground mt-2">
                        注意：签名验证需要密钥，此工具仅显示签名内容。
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-4">🔐</div>
                  <p>请输入JWT token进行解析</p>
                  <div className="mt-4 text-sm">
                    <p className="mb-2">JWT结构说明：</p>
                    <div className="text-left max-w-md mx-auto space-y-1">
                      <p>• <strong>Header</strong>: 包含算法和token类型</p>
                      <p>• <strong>Payload</strong>: 包含声明(claims)信息</p>
                      <p>• <strong>Signature</strong>: 用于验证token完整性</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🔍 JWT解析</h4>
                <p className="text-muted-foreground">输入完整的JWT token，工具会自动解析header、payload和signature三个部分</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📋 结构展示</h4>
                <p className="text-muted-foreground">以JSON格式展示解码后的header和payload内容，便于查看和理解</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏰ 时间信息</h4>
                <p className="text-muted-foreground">自动识别并格式化显示签发时间、过期时间等时间戳信息</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔒 安全提示</h4>
                <p className="text-muted-foreground">所有解析在本地进行，不会上传token到服务器，保护您的数据安全</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}