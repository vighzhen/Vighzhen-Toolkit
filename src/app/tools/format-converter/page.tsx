'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

// 设置 PDF.js worker - 使用稳定的 2.5.207 版本
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.min.js'
  } catch (error) {
    console.warn('PDF.js worker setup failed:', error)
    // 备用方案：使用 unpkg CDN
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.5.207/build/pdf.worker.min.js'
    } catch (e) {
      console.error('All PDF.js worker sources failed:', e)
    }
  }
}

interface ConversionFormat {
  from: string
  to: string
  label: string
  description: string
  supported: boolean
}

const supportedFormats: ConversionFormat[] = [
  {
    from: 'pdf',
    to: 'docx',
    label: 'PDF → Word',
    description: '将PDF文档转换为可编辑的Word文档',
    supported: true
  },
  {
    from: 'pdf',
    to: 'txt',
    label: 'PDF → 文本',
    description: '提取PDF中的文本内容',
    supported: true
  },
  {
    from: 'docx',
    to: 'pdf',
    label: 'Word → PDF',
    description: '将Word文档转换为PDF格式',
    supported: false
  },
  {
    from: 'txt',
    to: 'docx',
    label: '文本 → Word',
    description: '将纯文本转换为Word文档',
    supported: true
  },
  {
    from: 'html',
    to: 'pdf',
    label: 'HTML → PDF',
    description: '将HTML页面转换为PDF文档',
    supported: false
  }
]

export default function FormatConverterTool() {
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>(supportedFormats[0])
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [convertedContent, setConvertedContent] = useState<string>('')
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)
  const [previewPages, setPreviewPages] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [conversionStats, setConversionStats] = useState<{
    pages?: number
    characters: number
    words: number
    lines: number
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    processFile(file)
  }

  const processFile = (file: File | null | undefined) => {
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      // 检查文件类型是否匹配选择的转换格式
      if (fileExtension !== selectedFormat.from) {
        alert(`请选择 ${selectedFormat.from.toUpperCase()} 格式的文件`)
        return
      }

      setOriginalFile(file)
      setConvertedContent('')
      setConvertedBlob(null)
      setPreviewPages([])
      setExtractedText('')
      setConversionStats(null)
      setSearchTerm('')

      // 如果是PDF文件，生成预览
      if (fileExtension === 'pdf') {
        generatePDFPreview(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const generatePDFPreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument(arrayBuffer)
      const pdf = await loadingTask.promise
      const pages: string[] = []

      // 只预览前3页
      const maxPages = Math.min(pdf.numPages, 3)
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          pages.push(canvas.toDataURL())
        }
      }

      setPreviewPages(pages)
    } catch (error) {
      console.error('PDF预览生成失败:', error)
      alert('PDF预览生成失败，但仍可以进行转换')
    }
  }

  const convertFile = async () => {
    if (!originalFile) return

    setProcessing(true)

    try {
      if (selectedFormat.from === 'pdf' && selectedFormat.to === 'docx') {
        await convertPDFToWord()
      } else if (selectedFormat.from === 'pdf' && selectedFormat.to === 'txt') {
        await convertPDFToText()
      } else if (selectedFormat.from === 'txt' && selectedFormat.to === 'docx') {
        await convertTextToWord()
      }
    } catch (error) {
      console.error('转换失败:', error)
      alert('文件转换失败，请重试')
    }

    setProcessing(false)
  }

  const convertPDFToWord = async () => {
    if (!originalFile) return

    const arrayBuffer = await originalFile.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    
    const paragraphs: Paragraph[] = []
    let allText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // 更智能的文本提取和格式化
      const textItems = textContent.items as TextItem[]
      let currentLine = ''
      const lines: string[] = []
      let lastY = -1

      // 根据文本项的位置信息重建行结构
      textItems.forEach((item, index) => {
        const text = item.str || ''
        const transform = item.transform
        const y = transform ? transform[5] : 0

        // 检测换行：Y坐标变化或显著的水平间距
        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = text
        } else {
          // 同一行：检查是否需要添加空格
          const needSpace = currentLine && text && 
                           !currentLine.endsWith(' ') && 
                           !text.startsWith(' ') &&
                           !/[.,;:!?)]$/.test(currentLine) &&
                           !/^[.,;:!?(\[]/.test(text)
          
          currentLine += (needSpace ? ' ' : '') + text
        }
        
        lastY = y
      })

      // 添加最后一行
      if (currentLine.trim()) {
        lines.push(currentLine.trim())
      }

      // 处理提取的行，创建段落
      if (lines.length > 0) {
        lines.forEach((line: string) => {
          if (line.trim()) {
            allText += line + '\n'
            
            // 创建段落，保持原有格式
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({
                  text: line,
                  size: 24, // 12pt
                })],
                spacing: {
                  after: 200, // 段落后间距
                }
              })
            )
          }
        })

        // 页面间添加分隔
        if (i < pdf.numPages) {
          allText += '\n'
          paragraphs.push(
            new Paragraph({
              children: [new TextRun('')],
              spacing: { after: 400 }
            })
          )
        }
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    const blob = await Packer.toBlob(doc)
    setConvertedBlob(blob)
    setExtractedText(allText)
    setConvertedContent('Word文档已生成，可以下载')
    
    // 计算统计信息
    const words = allText.split(/\s+/).filter(word => word.length > 0).length
    const lines = allText.split('\n').filter(line => line.trim().length > 0).length
    setConversionStats({
      pages: pdf.numPages,
      characters: allText.length,
      words,
      lines
    })
  }

  const convertPDFToText = async () => {
    if (!originalFile) return

    const arrayBuffer = await originalFile.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    
    let allText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // 使用相同的智能文本提取逻辑
      const textItems = textContent.items as TextItem[]
      let currentLine = ''
      const lines: string[] = []
      let lastY = -1

      textItems.forEach((item) => {
        const text = item.str || ''
        const transform = item.transform
        const y = transform ? transform[5] : 0

        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = text
        } else {
          const needSpace = currentLine && text && 
                           !currentLine.endsWith(' ') && 
                           !text.startsWith(' ') &&
                           !/[.,;:!?)]$/.test(currentLine) &&
                           !/^[.,;:!?(\[]/.test(text)
          
          currentLine += (needSpace ? ' ' : '') + text
        }
        
        lastY = y
      })

      if (currentLine.trim()) {
        lines.push(currentLine.trim())
      }

      if (lines.length > 0) {
        allText += `=== 第 ${i} 页 ===\n`
        lines.forEach(line => {
          if (line.trim()) {
            allText += line + '\n'
          }
        })
        allText += '\n'
      }
    }

    setExtractedText(allText)
    setConvertedContent(allText)
    
    // 创建文本文件的 Blob
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
    setConvertedBlob(blob)
    
    // 计算统计信息
    const words = allText.split(/\s+/).filter(word => word.length > 0).length
    const lines = allText.split('\n').filter(line => line.trim().length > 0).length
    setConversionStats({
      pages: pdf.numPages,
      characters: allText.length,
      words,
      lines
    })
  }

  const convertTextToWord = async () => {
    if (!originalFile) return

    const text = await originalFile.text()
    const lines = text.split('\n')
    
    const paragraphs = lines.map(line => 
      new Paragraph({
        children: [new TextRun({
          text: line || ' ',
          size: 24, // 12pt
        })],
        spacing: {
          after: line.trim() ? 200 : 100, // 非空行后有更大间距
        }
      })
    )

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    const blob = await Packer.toBlob(doc)
    setConvertedBlob(blob)
    setExtractedText(text)
    setConvertedContent('Word文档已生成，可以下载')
  }

  const downloadConverted = () => {
    if (!convertedBlob || !originalFile) return

    const fileName = originalFile.name.replace(/\.[^/.]+$/, '')
    const extension = selectedFormat.to === 'docx' ? '.docx' : '.txt'
    
    saveAs(convertedBlob, `converted_${fileName}${extension}`)
  }

  const resetAll = () => {
    setOriginalFile(null)
    setConvertedContent('')
    setConvertedBlob(null)
    setPreviewPages([])
    setExtractedText('')
    setConversionStats(null)
    setSearchTerm('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTextForPreview = (text: string) => {
    const lines = text.split('\n')
    const formattedLines: Array<{type: 'title' | 'content' | 'empty', content: string, level?: number}> = []
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      
      if (!trimmedLine) {
        formattedLines.push({type: 'empty', content: ''})
        return
      }
      
      // 检测页面标题
      if (trimmedLine.includes('=== 第') && trimmedLine.includes('页 ===')) {
        formattedLines.push({type: 'title', content: trimmedLine.replace(/=/g, '').trim(), level: 1})
        return
      }
      
      // 检测可能的标题（数字开头或特殊格式）
      if (/^\d+\.?\d*\s/.test(trimmedLine) || /^[一二三四五六七八九十]\s*[、.]/.test(trimmedLine)) {
        formattedLines.push({type: 'title', content: trimmedLine, level: 2})
        return
      }
      
      formattedLines.push({type: 'content', content: trimmedLine})
    })
    
    return formattedLines
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🔄 格式转换器</h1>
          <p className="text-muted-foreground">支持PDF转Word、文本转换等多种格式转换</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 转换设置 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>转换设置</CardTitle>
              <CardDescription>选择转换格式并上传文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">选择转换格式</label>
                <div className="grid grid-cols-1 gap-2">
                  {supportedFormats.filter(format => format.supported).map((format) => (
                    <div
                      key={`${format.from}-${format.to}`}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormat === format
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-2 block">上传文件</label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedFormat.from === 'pdf' ? '.pdf' : selectedFormat.from === 'txt' ? '.txt' : '*'}
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">📁</span>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {isDragOver ? '释放文件以上传' : '点击选择文件或拖拽到此处'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 {selectedFormat.from.toUpperCase()} 格式的文件
                    </p>
                  </div>
                </div>
              </div>

              {originalFile && (
                <div className="p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">文件信息</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>文件名:</span>
                      <span className="font-mono truncate max-w-xs">{originalFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>文件大小:</span>
                      <Badge variant="outline">{formatFileSize(originalFile.size)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>文件类型:</span>
                      <Badge variant="outline">{originalFile.type || selectedFormat.from.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={convertFile}
                  disabled={!originalFile || processing || !selectedFormat.supported}
                  className="flex-1"
                >
                  {processing ? '转换中...' : '开始转换'}
                </Button>
                <Button onClick={resetAll} variant="outline">
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 预览和结果 */}
          <Card className={originalFile || previewPages.length > 0 || convertedContent || extractedText || convertedBlob ? "flex-1" : "h-fit"}>
            <CardHeader>
              <CardTitle>预览和结果</CardTitle>
              <CardDescription>文件预览和转换结果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">原文件预览</TabsTrigger>
                  <TabsTrigger value="result">转换结果</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  {previewPages.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">📄 PDF 预览</h4>
                        <Badge variant="secondary" className="text-xs">共 {previewPages.length} 页预览</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-[700px] overflow-y-auto pr-2">
                        {previewPages.map((page, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 flex items-center justify-between">
                              <span className="text-xs font-medium">第 {index + 1} 页</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = page
                                  link.download = `page-${index + 1}.png`
                                  link.click()
                                }}
                                className="h-5 px-2 text-xs"
                              >
                                下载
                              </Button>
                            </div>
                            <div className="p-1 bg-gray-50 dark:bg-gray-900">
                              <img
                                src={page}
                                alt={`第 ${index + 1} 页`}
                                className="w-full h-auto rounded border shadow-sm hover:shadow-lg transition-shadow cursor-zoom-in"
                                onClick={() => {
                                  const newWindow = window.open()
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>PDF 预览 - 第 ${index + 1} 页</title></head>
                                        <body style="margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;">
                                          <img src="${page}" style="max-width:100%;height:auto;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
                                        </body>
                                      </html>
                                    `)
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        💡 点击图片可放大查看，点击"下载图片"可保存单页
                      </div>
                    </div>
                                                          ) : originalFile ? (
                      <div className="border-2 border-dashed border-primary/25 rounded-lg bg-primary/5 p-4">
                        <div className="flex items-center justify-center h-16">
                          <div className="text-center">
                            <p className="text-primary font-medium mb-2 text-sm">文件已上传</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {selectedFormat.from.toUpperCase()} 文件预览生成中...
                            </p>
                            <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full inline-block max-w-xs truncate">
                              {originalFile.name}
                            </div>
                          </div>
                        </div>
                      </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors bg-muted/10 p-4">
                      <div className="flex items-center justify-center h-16">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2 font-medium text-sm">上传文件查看预览</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            支持 PDF 文件可视化预览
                          </p>
                          <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full inline-block">
                            拖拽文件到左侧上传区域
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="result" className="space-y-4">
                  {convertedContent ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">✅ 转换完成</h4>
                          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {selectedFormat.from.toUpperCase()} → {selectedFormat.to.toUpperCase()}
                          </Badge>
                        </div>
                        <Button onClick={downloadConverted} size="sm" className="gap-2">
                          <span>📥</span>
                          下载文件
                        </Button>
                      </div>
                      
                      {selectedFormat.to === 'txt' && extractedText ? (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">📝 提取的文本内容</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {extractedText.length} 字符
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(extractedText)}
                                  className="h-6 px-2 text-xs"
                                >
                                  复制
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 max-h-[600px] overflow-y-auto">
                            <div className="space-y-2">
                              {formatTextForPreview(extractedText).map((item, index) => {
                                if (item.type === 'title' && item.level === 1) {
                                  return (
                                    <div key={index} className="flex items-center gap-2 py-3 border-b border-primary/20 bg-primary/5 -mx-2 px-3 rounded mb-3">
                                      <span className="text-sm font-bold text-primary">
                                        📄 {item.content}
                                      </span>
                                    </div>
                                  )
                                }
                                
                                if (item.type === 'title' && item.level === 2) {
                                  return (
                                    <h4 key={index} className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2 pl-3 border-l-4 border-primary/50 bg-primary/5 py-1 rounded">
                                      {item.content}
                                    </h4>
                                  )
                                }
                                
                                if (item.type === 'content') {
                                  return (
                                    <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-3 py-1 rounded transition-colors border-l-2 border-transparent hover:border-primary/30">
                                      {item.content}
                                    </p>
                                  )
                                }
                                
                                if (item.type === 'empty') {
                                  return <div key={index} className="h-3"></div>
                                }
                                
                                return null
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 px-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                🎉 {convertedContent}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {originalFile?.name.replace(/\.[^/.]+$/, '')}.{selectedFormat.to}
                              </Badge>
                            </div>
                          </div>
                          {extractedText && (
                            <div className="p-4 bg-muted/20">
                                                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-muted-foreground">📖 内容预览</span>
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="搜索内容..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-6 w-32 text-xs"
                                  />
                                  {searchTerm && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSearchTerm('')}
                                      className="h-6 px-1 text-xs"
                                    >
                                      ✕
                                    </Button>
                                  )}
                                {conversionStats && (
                                  <div className="flex items-center gap-1">
                                    {conversionStats.pages && (
                                      <Badge variant="secondary" className="text-xs">
                                        {conversionStats.pages} 页
                                      </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                      {conversionStats.characters} 字符
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {conversionStats.words} 词
                                    </Badge>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(extractedText)}
                                  className="h-6 px-2 text-xs"
                                >
                                  复制文本
                                </Button>
                              </div>
                              </div>
                              <div className="p-4 bg-white dark:bg-gray-800 rounded border max-h-[600px] overflow-y-auto">
                                <div className="space-y-3">
                                  {formatTextForPreview(extractedText).slice(0, 30).map((item, index) => {
                                    if (item.type === 'title' && item.level === 1) {
                                      return (
                                        <div key={index} className="flex items-center gap-2 py-2 border-b border-primary/20 bg-primary/5 -mx-2 px-2 rounded">
                                          <span className="text-xs font-bold text-primary">
                                            📄 {item.content}
                                          </span>
                                        </div>
                                      )
                                    }
                                    
                                    if (item.type === 'title' && item.level === 2) {
                                      return (
                                        <h4 key={index} className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2 pl-2 border-l-3 border-primary/50">
                                          {item.content}
                                        </h4>
                                      )
                                    }
                                    
                                                                         if (item.type === 'content') {
                                       const shouldShow = !searchTerm || item.content.toLowerCase().includes(searchTerm.toLowerCase())
                                       if (!shouldShow) return null
                                       
                                       return (
                                         <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 py-1 rounded transition-colors">
                                           {highlightSearchTerm(item.content, searchTerm)}
                                         </p>
                                       )
                                     }
                                    
                                    if (item.type === 'empty') {
                                      return <div key={index} className="h-2"></div>
                                    }
                                    
                                    return null
                                  })}
                                  
                                  {formatTextForPreview(extractedText).length > 30 && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded text-center border border-blue-200 dark:border-blue-800">
                                      <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                                        📖 还有 {formatTextForPreview(extractedText).length - 30} 段内容
                                      </span>
                                      <br />
                                      <span className="text-blue-600 dark:text-blue-400 text-xs">
                                        点击下载按钮获取完整的 Word 文档
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <span className="text-blue-600 dark:text-blue-400">💡</span>
                        <div className="text-blue-700 dark:text-blue-300">
                          <strong>转换完成！</strong> 点击"下载文件"保存到本地，或使用"复制"功能快速获取文本内容。
                        </div>
                      </div>
                    </div>
                  ) : processing ? (
                    <div className="border-2 border-dashed border-primary/25 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                      <div className="flex items-center justify-center h-16">
                        <div className="text-center">
                          <p className="text-primary font-medium mb-2 text-sm">正在转换中...</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            请稍候，正在处理您的文件
                          </p>
                          <div className="flex justify-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors bg-muted/10 p-4">
                      <div className="flex items-center justify-center h-16">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2 font-medium text-sm">转换结果将在这里显示</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            上传文件并点击"开始转换"
                          </p>
                          <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full inline-block">
                            支持多种格式转换
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 使用说明 */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <h5 className="font-medium text-sm">📄 PDF 转换</h5>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 支持转换为 Word 文档</li>
                  <li>• 支持提取纯文本内容</li>
                  <li>• 保持原有文本格式</li>
                </ul>
              </div>
              <div className="space-y-1">
                <h5 className="font-medium text-sm">🔍 预览功能</h5>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• PDF 文件可视化预览</li>
                  <li>• 转换结果实时预览</li>
                  <li>• 文本内容可复制</li>
                </ul>
              </div>
              <div className="space-y-1">
                <h5 className="font-medium text-sm">💡 使用建议</h5>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 文件大小建议不超过 10MB</li>
                  <li>• 转换过程在本地完成</li>
                  <li>• 复杂格式可能需要调整</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 