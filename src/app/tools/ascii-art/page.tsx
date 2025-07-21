'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

interface AsciiFont {
  name: string
  chars: Record<string, string[]>
}

// 简单的ASCII字体定义
const fonts: Record<string, AsciiFont> = {
  block: {
    name: '方块字体',
    chars: {
      'A': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '██  ██ ',
        '██  ██ '
      ],
      'B': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '██  ██ ',
        '██████ '
      ],
      'C': [
        '██████ ',
        '██     ',
        '██     ',
        '██     ',
        '██████ '
      ],
      'D': [
        '██████ ',
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        '██████ '
      ],
      'E': [
        '██████ ',
        '██     ',
        '██████ ',
        '██     ',
        '██████ '
      ],
      'F': [
        '██████ ',
        '██     ',
        '██████ ',
        '██     ',
        '██     '
      ],
      'G': [
        '██████ ',
        '██     ',
        '██ ███ ',
        '██  ██ ',
        '██████ '
      ],
      'H': [
        '██  ██ ',
        '██  ██ ',
        '██████ ',
        '██  ██ ',
        '██  ██ '
      ],
      'I': [
        '██████ ',
        '  ██   ',
        '  ██   ',
        '  ██   ',
        '██████ '
      ],
      'J': [
        '██████ ',
        '    ██ ',
        '    ██ ',
        '██  ██ ',
        '██████ '
      ],
      'K': [
        '██  ██ ',
        '██ ██  ',
        '████   ',
        '██ ██  ',
        '██  ██ '
      ],
      'L': [
        '██     ',
        '██     ',
        '██     ',
        '██     ',
        '██████ '
      ],
      'M': [
        '██  ██ ',
        '██████ ',
        '██████ ',
        '██  ██ ',
        '██  ██ '
      ],
      'N': [
        '██  ██ ',
        '███ ██ ',
        '██████ ',
        '██ ███ ',
        '██  ██ '
      ],
      'O': [
        '██████ ',
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        '██████ '
      ],
      'P': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '██     ',
        '██     '
      ],
      'Q': [
        '██████ ',
        '██  ██ ',
        '██  ██ ',
        '██ ███ ',
        '██████ '
      ],
      'R': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '██ ██  ',
        '██  ██ '
      ],
      'S': [
        '██████ ',
        '██     ',
        '██████ ',
        '    ██ ',
        '██████ '
      ],
      'T': [
        '██████ ',
        '  ██   ',
        '  ██   ',
        '  ██   ',
        '  ██   '
      ],
      'U': [
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        '██████ '
      ],
      'V': [
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        ' ████  ',
        '  ██   '
      ],
      'W': [
        '██  ██ ',
        '██  ██ ',
        '██████ ',
        '██████ ',
        '██  ██ '
      ],
      'X': [
        '██  ██ ',
        ' ████  ',
        '  ██   ',
        ' ████  ',
        '██  ██ '
      ],
      'Y': [
        '██  ██ ',
        '██  ██ ',
        ' ████  ',
        '  ██   ',
        '  ██   '
      ],
      'Z': [
        '██████ ',
        '   ██  ',
        '  ██   ',
        ' ██    ',
        '██████ '
      ],
      ' ': [
        '       ',
        '       ',
        '       ',
        '       ',
        '       '
      ],
      '0': [
        '██████ ',
        '██  ██ ',
        '██  ██ ',
        '██  ██ ',
        '██████ '
      ],
      '1': [
        '  ██   ',
        ' ███   ',
        '  ██   ',
        '  ██   ',
        '██████ '
      ],
      '2': [
        '██████ ',
        '    ██ ',
        '██████ ',
        '██     ',
        '██████ '
      ],
      '3': [
        '██████ ',
        '    ██ ',
        '██████ ',
        '    ██ ',
        '██████ '
      ],
      '4': [
        '██  ██ ',
        '██  ██ ',
        '██████ ',
        '    ██ ',
        '    ██ '
      ],
      '5': [
        '██████ ',
        '██     ',
        '██████ ',
        '    ██ ',
        '██████ '
      ],
      '6': [
        '██████ ',
        '██     ',
        '██████ ',
        '██  ██ ',
        '██████ '
      ],
      '7': [
        '██████ ',
        '    ██ ',
        '   ██  ',
        '  ██   ',
        ' ██    '
      ],
      '8': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '██  ██ ',
        '██████ '
      ],
      '9': [
        '██████ ',
        '██  ██ ',
        '██████ ',
        '    ██ ',
        '██████ '
      ]
    }
  },
  small: {
    name: '小字体',
    chars: {
      'A': ['▄▀█', '█▀█'],
      'B': ['█▀▄', '█▄▀'],
      'C': ['▄▀█', '▀▄▄'],
      'D': ['█▀▄', '█▄▀'],
      'E': ['█▀▀', '█▄▄'],
      'F': ['█▀▀', '█▀▀'],
      'G': ['▄▀█', '▀▄█'],
      'H': ['█ █', '█▀█'],
      'I': ['█', '█'],
      'J': ['  █', '▄▄█'],
      'K': ['█▄▀', '█ █'],
      'L': ['█  ', '█▄▄'],
      'M': ['█▄█', '█▀█'],
      'N': ['█▄█', '█▀█'],
      'O': ['▄▀█', '▀▄▀'],
      'P': ['█▀▄', '█▀▀'],
      'Q': ['▄▀█', '▀▄█'],
      'R': ['█▀▄', '█▀▄'],
      'S': ['▄▀▀', '▄▄▀'],
      'T': ['▀█▀', ' █ '],
      'U': ['█ █', '▀▄▀'],
      'V': ['█ █', ' ▀ '],
      'W': ['█ █', '█▄█'],
      'X': ['▀▄▀', '▄▀▄'],
      'Y': ['▀▄▀', ' █ '],
      'Z': ['▀▀▀', '▄▄▄'],
      ' ': [' ', ' '],
      '0': ['▄▀█', '▀▄▀'],
      '1': ['█', '█'],
      '2': ['▀▀▄', '▄▄▀'],
      '3': ['▀▀▄', '▄▄▀'],
      '4': ['█▄█', '  █'],
      '5': ['█▀▀', '▄▄▀'],
      '6': ['▄▀▀', '▀▄▀'],
      '7': ['▀▀█', '  █'],
      '8': ['▄▀▄', '▀▄▀'],
      '9': ['▄▀▄', '▄▄▀']
    }
  }
}

// 预设的ASCII艺术图案
const presetArts = {
  heart: `
    ♥♥   ♥♥
  ♥♥♥♥ ♥♥♥♥
 ♥♥♥♥♥♥♥♥♥♥
  ♥♥♥♥♥♥♥♥
   ♥♥♥♥♥♥
    ♥♥♥♥
     ♥♥
      ♥
`,
  star: `
      ★
     ★★★
    ★★★★★
   ★★★★★★★
  ★★★★★★★★★
 ★★★★★★★★★★★
★★★★★★★★★★★★★
 ★★★★★★★★★★★
  ★★★★★★★★★
   ★★★★★★★
    ★★★★★
     ★★★
      ★
`,
  smile: `
    ████████
  ██        ██
 ██  ██  ██  ██
██    ██  ██    ██
██              ██
██  ██      ██  ██
 ██  ████████  ██
  ██          ██
    ████████
`,
  cat: `
 /\_/\
( o.o )
 > ^ <
`,
  arrow: `
    ▲
   ▲▲▲
  ▲▲▲▲▲
 ▲▲▲▲▲▲▲
▲▲▲▲▲▲▲▲▲
    █
    █
    █
`
}

export default function AsciiArtTool() {
  const [inputText, setInputText] = useState('')
  const [asciiOutput, setAsciiOutput] = useState('')
  const [selectedFont, setSelectedFont] = useState<keyof typeof fonts>('block')
  const [mode, setMode] = useState<'text' | 'preset' | 'custom' | 'image'>('text')
  const [customArt, setCustomArt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof presetArts>('heart')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageWidth, setImageWidth] = useState(80)
  const [imageContrast, setImageContrast] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const generateAsciiText = () => {
    if (!inputText.trim()) {
      setAsciiOutput('')
      return
    }

    const font = fonts[selectedFont]
    const lines: string[] = []
    const height = font.chars['A']?.length || 5

    // 初始化输出行
    for (let i = 0; i < height; i++) {
      lines[i] = ''
    }

    // 为每个字符生成ASCII艺术
    for (const char of inputText.toUpperCase()) {
      const charPattern = font.chars[char] || font.chars[' ']
      for (let i = 0; i < height; i++) {
        lines[i] += (charPattern[i] || '       ') + ' '
      }
    }

    setAsciiOutput(lines.join('\n'))
  }

  const loadPresetArt = () => {
    setAsciiOutput(presetArts[selectedPreset])
  }

  const loadCustomArt = () => {
    setAsciiOutput(customArt)
  }

  const copyToClipboard = () => {
    if (asciiOutput) {
      navigator.clipboard.writeText(asciiOutput)
      alert('已复制到剪贴板!')
    }
  }

  const downloadArt = () => {
    if (asciiOutput) {
      const blob = new Blob([asciiOutput], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ascii-art.txt'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const importFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCustomArt(content)
        setAsciiOutput(content)
        setMode('custom')
      }
      reader.readAsText(file)
    } else {
      alert('请选择文本文件 (.txt)')
    }
  }

  // 图片转ASCII功能
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      alert('请选择图片文件')
    }
  }

  const convertImageToAscii = async () => {
    if (!imageFile || !imagePreview) return
    
    setIsProcessing(true)
    
    try {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // 计算缩放比例
        const aspectRatio = img.height / img.width
        canvas.width = imageWidth
        canvas.height = Math.floor(imageWidth * aspectRatio * 0.5) // ASCII字符高度比宽度大
        
        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        
        // ASCII字符集（从暗到亮）
        const asciiChars = '@%#*+=-:. '
        
        let asciiArt = ''
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4
            const r = pixels[offset]
            const g = pixels[offset + 1]
            const b = pixels[offset + 2]
            
            // 计算灰度值
            const gray = Math.floor((r + g + b) / 3)
            
            // 应用对比度
            const adjustedGray = Math.min(255, Math.max(0, gray * imageContrast))
            
            // 映射到ASCII字符
            const charIndex = Math.floor((adjustedGray / 255) * (asciiChars.length - 1))
            asciiArt += asciiChars[asciiChars.length - 1 - charIndex]
          }
          asciiArt += '\n'
        }
        
        setAsciiOutput(asciiArt)
        setIsProcessing(false)
      }
      
      img.src = imagePreview
    } catch (error) {
      console.error('图片转换失败:', error)
      alert('图片转换失败，请重试')
      setIsProcessing(false)
    }
  }

  const selectImageFile = () => {
    imageInputRef.current?.click()
  }

  const clearAll = () => {
    setInputText('')
    setAsciiOutput('')
    setCustomArt('')
    setImageFile(null)
    setImagePreview('')
  }

  const sampleTexts = ['HELLO', 'ASCII', 'ART', '2024']

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🎭 ASCII画生成器</h1>
          <p className="text-muted-foreground">将文字和图片转换为ASCII艺术，创建个性化的文本图案</p>
        </div>

        {/* 控制面板 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text">文字转换</TabsTrigger>
                <TabsTrigger value="preset">预设图案</TabsTrigger>
                <TabsTrigger value="image">图片转换</TabsTrigger>
                <TabsTrigger value="custom">自定义</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">输入文字</label>
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="输入要转换的文字..."
                      className="mb-2"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {sampleTexts.map((text) => (
                        <Button
                          key={text}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputText(text)}
                        >
                          {text}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">选择字体</label>
                    <div className="space-y-2">
                      {Object.entries(fonts).map(([key, font]) => (
                        <Button
                          key={key}
                          variant={selectedFont === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFont(key as keyof typeof fonts)}
                          className="w-full justify-start"
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={generateAsciiText} className="w-full">
                  生成ASCII艺术字
                </Button>
              </TabsContent>

              <TabsContent value="preset" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">选择预设图案</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {Object.entries(presetArts).map(([key, art]) => (
                      <Button
                        key={key}
                        variant={selectedPreset === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPreset(key as keyof typeof presetArts)}
                        className="h-auto p-2"
                      >
                        <div className="text-center">
                          <div className="text-xs font-mono whitespace-pre-line mb-1">
                            {art.split('\n').slice(1, 4).join('\n')}
                          </div>
                          <div className="text-xs capitalize">{key}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={loadPresetArt} className="w-full">
                  加载选中图案
                </Button>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">上传图片</label>
                    <div className="space-y-4">
                      <Button onClick={selectImageFile} variant="outline" className="w-full">
                        选择图片文件
                      </Button>
                      {imagePreview && (
                        <div className="border rounded-lg p-4">
                          <img 
                            src={imagePreview} 
                            alt="预览" 
                            className="max-w-full h-auto max-h-48 mx-auto rounded"
                          />
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            {imageFile?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">转换参数</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          输出宽度: {imageWidth} 字符
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="150"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          对比度: {imageContrast.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={imageContrast}
                          onChange={(e) => setImageContrast(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={convertImageToAscii} 
                  className="w-full" 
                  disabled={!imageFile || isProcessing}
                >
                  {isProcessing ? '转换中...' : '转换为ASCII艺术'}
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p>• 支持 JPG、PNG、GIF 等常见图片格式</p>
                  <p>• 建议使用对比度较高的图片以获得更好效果</p>
                  <p>• 输出宽度影响细节程度，宽度越大细节越丰富</p>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">自定义ASCII艺术</label>
                  <Textarea
                    value={customArt}
                    onChange={(e) => setCustomArt(e.target.value)}
                    placeholder="在此输入或粘贴自定义的ASCII艺术..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={loadCustomArt} className="flex-1">
                    应用自定义艺术
                  </Button>
                  <Button onClick={importFile} variant="outline">
                    导入文件
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div className="flex gap-2 flex-wrap">
              <Button onClick={copyToClipboard} variant="outline" disabled={!asciiOutput}>
                复制结果
              </Button>
              <Button onClick={downloadArt} variant="outline" disabled={!asciiOutput}>
                下载文件
              </Button>
              <Button onClick={clearAll} variant="outline">
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <CardTitle>ASCII艺术输出</CardTitle>
            <CardDescription>
              {asciiOutput ? (
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">行数: {asciiOutput.split('\n').length}</Badge>
                  <Badge variant="outline">字符数: {asciiOutput.length}</Badge>
                </div>
              ) : (
                '生成的ASCII艺术将在这里显示'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asciiOutput ? (
              <div className="bg-muted p-4 rounded-lg overflow-auto">
                <pre className="font-mono text-sm whitespace-pre-wrap">{asciiOutput}</pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">ASCII艺术将在这里显示</p>
                  <p className="text-sm text-muted-foreground">
                    选择模式并生成你的ASCII艺术
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
            <CardDescription>ASCII画生成器的功能介绍</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium">📝 文字转换</h5>
                <p className="text-sm text-muted-foreground">
                  将普通文字转换为ASCII艺术字，支持多种字体风格
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🎭 预设图案</h5>
                <p className="text-sm text-muted-foreground">
                  提供多种精美的预设ASCII图案，如爱心、星星、笑脸等
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📷 图片转换</h5>
                <p className="text-sm text-muted-foreground">
                  上传图片并转换为ASCII艺术，支持参数调整优化效果
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">✏️ 自定义创作</h5>
                <p className="text-sm text-muted-foreground">
                  支持手动创建或导入自定义ASCII艺术作品
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">💾 导出功能</h5>
                <p className="text-sm text-muted-foreground">
                  支持复制到剪贴板或下载为文本文件保存
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🎨 多种字体</h5>
                <p className="text-sm text-muted-foreground">
                  提供方块字体、小字体等多种ASCII字体选择
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">⚙️ 智能参数</h5>
                <p className="text-sm text-muted-foreground">
                  可调节输出宽度和对比度，获得最佳转换效果
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📱 响应式</h5>
                <p className="text-sm text-muted-foreground">
                  完美适配各种设备，随时随地创作ASCII艺术
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileImport}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}