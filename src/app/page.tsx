'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tools = [
  {
    title: "颜色工具",
    description: "颜色选择器、调色板、颜色转换",
    href: "/tools/color",
    category: "设计工具",
    icon: "🎨"
  },
  {
    title: "二维码生成器",
    description: "快速生成二维码，支持文本、链接",
    href: "/tools/qrcode",
    category: "实用工具",
    icon: "📱"
  },
  {
    title: "JSON 工具",
    description: "JSON格式化、压缩、验证",
    href: "/tools/json",
    category: "开发工具",
    icon: "📋"
  },
  {
    title: "密码生成器",
    description: "生成安全的随机密码",
    href: "/tools/password",
    category: "安全工具",
    icon: "🔐"
  },
  {
    title: "时间戳转换",
    description: "时间戳与日期相互转换",
    href: "/tools/timestamp",
    category: "开发工具",
    icon: "⏰"
  },
  {
    title: "编码解码",
    description: "Base64、URL编解码工具",
    href: "/tools/encode",
    category: "开发工具",
    icon: "🔤"
  },
  {
    title: "哈希生成器",
    description: "MD5、SHA-1、SHA-256等哈希算法",
    href: "/tools/hash",
    category: "安全工具",
    icon: "🔒"
  },
  {
    title: "图片压缩",
    description: "在线压缩图片，支持多种格式",
    href: "/tools/image-compress",
    category: "实用工具",
    icon: "🖼️"
  },
  {
    title: "Markdown编辑器",
    description: "实时预览的Markdown编辑器",
    href: "/tools/markdown",
    category: "编辑工具",
    icon: "📝"
  },
  {
    title: "文本对比",
    description: "智能文本差异分析和对比工具",
    href: "/tools/text-diff",
    category: "实用工具",
    icon: "📊"
  },
  {
    title: "计算器",
    description: "程序员计算器，支持多进制",
    href: "/tools/calculator",
    category: "实用工具",
    icon: "🧮"
  },
  {
    title: "ASCII画生成器",
    description: "将文字转换为ASCII艺术字，创建个性化文本图案",
    href: "/tools/ascii-art",
    category: "设计工具",
    icon: "🎭"
  }
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTools, setFilteredTools] = useState(tools)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    const filtered = tools.filter(tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTools(filtered)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        searchInput?.focus()
      }
      if (e.key === 'Escape') {
        setSearchQuery('')
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        searchInput?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (value.trim() && !searchHistory.includes(value.trim())) {
      setSearchHistory(prev => [value.trim(), ...prev.slice(0, 4)])
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const categories = Array.from(new Set(tools.map(tool => tool.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                VZ
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl font-bold mb-4">Vighzhen</h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            欢迎来到我的个人工具集合！这里提供了一系列实用的开发和日常工具，
            让工作更高效。所有工具都在本地运行，保护您的隐私。
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">开发者</Badge>
            <Badge variant="secondary">工具制作者</Badge>
            <Badge variant="secondary">效率提升</Badge>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                id="search-input"
                type="text"
                placeholder="搜索工具... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Search Info */}
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div>
                {searchQuery ? (
                  <span>找到 {filteredTools.length} 个工具</span>
                ) : (
                  <span>共 {tools.length} 个工具</span>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Ctrl+K 快速搜索</Badge>
              </div>
            </div>

            {/* Category Filter */}
            {searchQuery === '' && (
              <div className="mt-4">
                <div className="flex gap-2 flex-wrap justify-center">
                  {categories.map(category => {
                    const count = tools.filter(tool => tool.category === category).length
                    return (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery(category)}
                        className="text-xs"
                      >
                        {category} ({count})
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && searchQuery === '' && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">最近搜索:</p>
                <div className="flex gap-2 flex-wrap">
                  {searchHistory.map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery(query)}
                      className="text-xs h-6 px-2"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          {searchQuery && (
            <h2 className="text-2xl font-bold mb-6 text-center">
              搜索结果: "{searchQuery}"
            </h2>
          )}

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tool.icon}</span>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {searchQuery ? (
                          <span dangerouslySetInnerHTML={{
                            __html: tool.title.replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          tool.title
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {searchQuery ? (
                          <span dangerouslySetInnerHTML={{
                            __html: tool.description.replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          tool.description
                        )}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M18 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">没有找到相关工具</h3>
                <p className="text-sm">试试搜索其他关键词，或浏览所有工具</p>
              </div>
              <Button onClick={clearSearch} variant="outline">
                查看所有工具
              </Button>
            </div>
          )}
        </div>

        {/* Search Statistics */}
        {searchQuery && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>搜索统计</CardTitle>
              <CardDescription>当前搜索结果的分类统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(category => {
                  const count = filteredTools.filter(tool => tool.category === category).length
                  const total = tools.filter(tool => tool.category === category).length

                  return (
                    <div key={category} className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-xs text-muted-foreground">{category}</div>
                      <div className="text-xs text-muted-foreground">共 {total} 个</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Tips */}
        {searchQuery === '' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>搜索小贴士</CardTitle>
              <CardDescription>让搜索更高效</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h5 className="font-medium">🔍 搜索方式</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 按工具名称搜索</li>
                    <li>• 按功能描述搜索</li>
                    <li>• 按工具分类搜索</li>
                    <li>• 支持中英文搜索</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">⌨️ 快捷键</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ctrl + K: 快速搜索</li>
                    <li>• Escape: 清空搜索</li>
                    <li>• 点击分类标签快速筛选</li>
                    <li>• 搜索历史记录快速复用</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">💡 搜索建议</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "颜色" - 查找设计工具</li>
                    <li>• "密码" - 查找安全工具</li>
                    <li>• "转换" - 查找转换工具</li>
                    <li>• "编辑" - 查找编辑工具</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t">
          <p className="text-muted-foreground">
            Built with ❤️ by Vighzhen | 持续更新中...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            未来计划接入AI智能体，敬请期待！
          </p>
        </div>
      </div>
    </div>
  )
}
