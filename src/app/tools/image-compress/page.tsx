'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

export default function ImageCompressTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [compressedImage, setCompressedImage] = useState<string>('')
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressionRatio, setCompressionRatio] = useState(0)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setOriginalFile(file)

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 重置压缩结果
      setCompressedImage('')
      setCompressedSize(0)
      setCompressionRatio(0)
    } else {
      alert('请选择有效的图片文件')
    }
  }

  const compressImage = async () => {
    if (!originalFile) return

    setProcessing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 计算新尺寸（保持宽高比）
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片到 canvas
        ctx?.drawImage(img, 0, 0, width, height)

        // 转换为压缩后的图片
        const compressedDataUrl = canvas.toDataURL(originalFile.type, quality / 100)
        setCompressedImage(compressedDataUrl)

        // 计算压缩后大小
        const base64Length = compressedDataUrl.split(',')[1].length
        const sizeInBytes = (base64Length * 3) / 4
        setCompressedSize(sizeInBytes)

        // 计算压缩比
        const ratio = ((originalFile.size - sizeInBytes) / originalFile.size * 100)
        setCompressionRatio(ratio)

        setProcessing(false)
      }

      img.src = originalPreview
    } catch (error) {
      console.error('压缩失败:', error)
      alert('图片压缩失败，请重试')
      setProcessing(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedImage || !originalFile) return

    const link = document.createElement('a')
    link.download = `compressed_${originalFile.name}`
    link.href = compressedImage
    link.click()
  }

  const resetAll = () => {
    setOriginalFile(null)
    setOriginalPreview('')
    setCompressedImage('')
    setCompressedSize(0)
    setCompressionRatio(0)
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

  const presetQualities = [
    { label: '高质量', value: 90 },
    { label: '标准', value: 80 },
    { label: '节省空间', value: 60 },
    { label: '最小体积', value: 40 }
  ]

  const presetSizes = [
    { label: '4K', width: 3840, height: 2160 },
    { label: '2K', width: 2560, height: 1440 },
    { label: 'Full HD', width: 1920, height: 1080 },
    { label: 'HD', width: 1280, height: 720 },
    { label: '微信头像', width: 640, height: 640 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🖼️ 图片压缩</h1>
          <p className="text-muted-foreground">在线压缩图片，减小文件大小同时保持画质</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Settings */}
          <Card>
            <CardHeader>
              <CardTitle>图片上传</CardTitle>
              <CardDescription>选择要压缩的图片文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              {originalFile && (
                <div className="p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">原图信息</h4>
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
                      <Badge variant="outline">{originalFile.type}</Badge>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">压缩设置</h4>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    压缩质量: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex gap-2 mt-2">
                    {presetQualities.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuality(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">最大宽度 (px)</label>
                    <Input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(Number(e.target.value))}
                      min="100"
                      max="4000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">最大高度 (px)</label>
                    <Input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(Number(e.target.value))}
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">预设尺寸</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presetSizes.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMaxWidth(preset.width)
                          setMaxHeight(preset.height)
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={compressImage}
                  disabled={!originalFile || processing}
                  className="flex-1"
                >
                  {processing ? '压缩中...' : '开始压缩'}
                </Button>
                <Button onClick={resetAll} variant="outline">
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Results */}
          <Card>
            <CardHeader>
              <CardTitle>预览和结果</CardTitle>
              <CardDescription>压缩前后对比</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {originalPreview && (
                <div>
                  <h4 className="font-medium mb-2">原图预览</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={originalPreview}
                      alt="原图预览"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {compressedImage && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">压缩后预览</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={compressedImage}
                        alt="压缩后预览"
                        className="w-full h-48 object-contain bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">压缩结果</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>压缩后大小:</span>
                        <Badge variant="outline">{formatFileSize(compressedSize)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>压缩比:</span>
                        <Badge variant="default">
                          {compressionRatio > 0 ? `减少 ${compressionRatio.toFixed(1)}%` : '无变化'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>节省空间:</span>
                        <Badge variant="default">
                          {formatFileSize(originalFile ? originalFile.size - compressedSize : 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button onClick={downloadCompressed} className="w-full">
                    下载压缩图片
                  </Button>
                </>
              )}

              {!originalFile && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">上传图片开始压缩</p>
                    <p className="text-sm text-muted-foreground">
                      支持 JPG、PNG、WebP 等格式
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>压缩建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium">🎯 质量选择</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 90%+: 适合打印、专业用途</li>
                  <li>• 70-90%: 适合网站展示</li>
                  <li>• 50-70%: 适合社交媒体</li>
                  <li>• 30-50%: 适合缩略图</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">📱 使用建议</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 压缩前先备份原图</li>
                  <li>• 多次压缩会导致画质下降</li>
                  <li>• PNG 格式压缩效果有限</li>
                  <li>• 建议使用 WebP 格式获得更好效果</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
