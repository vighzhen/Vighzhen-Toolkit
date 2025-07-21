'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

export default function PasswordTool() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  const [history, setHistory] = useState<string[]>([])

  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'"`~,;.<>'
  }

  const generatePassword = () => {
    let charset = ''

    if (options.uppercase) charset += charSets.uppercase
    if (options.lowercase) charset += charSets.lowercase
    if (options.numbers) charset += charSets.numbers
    if (options.symbols) charset += charSets.symbols

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !charSets.similar.includes(char)).join('')
    }

    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(char => !charSets.ambiguous.includes(char)).join('')
    }

    if (charset === '') {
      alert('请至少选择一种字符类型')
      return
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(result)

    // 添加到历史记录
    setHistory(prev => [result, ...prev.slice(0, 9)]) // 保留最近10个
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('密码已复制到剪贴板!')
  }

  const getPasswordStrength = (pwd: string) => {
    let score = 0

    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (pwd.length >= 16) score += 1
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) return { level: '弱', color: 'bg-red-500', text: 'text-red-500' }
    if (score <= 4) return { level: '中', color: 'bg-yellow-500', text: 'text-yellow-500' }
    if (score <= 6) return { level: '强', color: 'bg-green-500', text: 'text-green-500' }
    return { level: '很强', color: 'bg-green-600', text: 'text-green-600' }
  }

  const estimateTimeToCrack = (pwd: string) => {
    const charset = getCharsetSize(pwd)
    const combinations = Math.pow(charset, pwd.length)
    const secondsToHalfSearch = combinations / 2 / 1000000000 // 假设每秒10亿次尝试

    if (secondsToHalfSearch < 1) return '瞬间'
    if (secondsToHalfSearch < 60) return `${Math.round(secondsToHalfSearch)}秒`
    if (secondsToHalfSearch < 3600) return `${Math.round(secondsToHalfSearch / 60)}分钟`
    if (secondsToHalfSearch < 86400) return `${Math.round(secondsToHalfSearch / 3600)}小时`
    if (secondsToHalfSearch < 31536000) return `${Math.round(secondsToHalfSearch / 86400)}天`
    if (secondsToHalfSearch < 31536000000) return `${Math.round(secondsToHalfSearch / 31536000)}年`
    return '数百万年'
  }

  const getCharsetSize = (pwd: string) => {
    let size = 0
    if (/[a-z]/.test(pwd)) size += 26
    if (/[A-Z]/.test(pwd)) size += 26
    if (/[0-9]/.test(pwd)) size += 10
    if (/[^A-Za-z0-9]/.test(pwd)) size += 32
    return size
  }

  const strength = password ? getPasswordStrength(password) : null
  const crackTime = password ? estimateTimeToCrack(password) : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🔐 密码生成器</h1>
          <p className="text-muted-foreground">生成安全的随机密码，保护您的账户安全</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Section */}
          <Card>
            <CardHeader>
              <CardTitle>密码设置</CardTitle>
              <CardDescription>自定义密码生成规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Length */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  密码长度: {length}
                </label>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>4</span>
                  <span>64</span>
                </div>
              </div>

              {/* Character Sets */}
              <div>
                <label className="text-sm font-medium mb-3 block">字符类型</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={(e) => setOptions({...options, uppercase: e.target.checked})}
                    />
                    <span>大写字母 (A-Z)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={(e) => setOptions({...options, lowercase: e.target.checked})}
                    />
                    <span>小写字母 (a-z)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={(e) => setOptions({...options, numbers: e.target.checked})}
                    />
                    <span>数字 (0-9)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={(e) => setOptions({...options, symbols: e.target.checked})}
                    />
                    <span>特殊符号 (!@#$%^&*)</span>
                  </label>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <label className="text-sm font-medium mb-3 block">高级选项</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.excludeSimilar}
                      onChange={(e) => setOptions({...options, excludeSimilar: e.target.checked})}
                    />
                    <span>排除相似字符 (il1Lo0O)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.excludeAmbiguous}
                      onChange={(e) => setOptions({...options, excludeAmbiguous: e.target.checked})}
                    />
                    <span>排除模糊字符 ({}[]()等)</span>
                  </label>
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full" size="lg">
                生成密码
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>密码和安全性分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {password ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">生成的密码</label>
                    <div className="flex gap-2">
                      <Input
                        value={password}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        onClick={() => copyToClipboard(password)}
                        size="sm"
                      >
                        复制
                      </Button>
                    </div>
                  </div>

                  {strength && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">安全性分析</label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>强度等级:</span>
                          <Badge className={`${strength.color} text-white`}>
                            {strength.level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>破解时间:</span>
                          <Badge variant="outline">{crackTime}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>字符集大小:</span>
                          <Badge variant="outline">{getCharsetSize(password)}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground">点击生成密码开始使用</p>
                </div>
              )}

              {history.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium mb-3 block">历史记录</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.map((pwd, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded border">
                          <code className="flex-1 text-sm font-mono truncate">{pwd}</code>
                          <Button
                            onClick={() => copyToClipboard(pwd)}
                            size="sm"
                            variant="outline"
                          >
                            复制
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>安全提示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium">🔒 密码安全建议</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 使用至少12位字符的密码</li>
                  <li>• 包含大小写字母、数字和符号</li>
                  <li>• 每个账户使用不同的密码</li>
                  <li>• 定期更换重要账户密码</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">⚡ 使用建议</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 使用密码管理器存储密码</li>
                  <li>• 启用双因素认证</li>
                  <li>• 不要在不安全的地方记录密码</li>
                  <li>• 警惕钓鱼网站和邮件</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
