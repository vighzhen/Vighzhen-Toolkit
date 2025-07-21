'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import Link from 'next/link'
import 'highlight.js/styles/github.css'

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Markdown 编辑器

欢迎使用 Markdown 编辑器！这是一个功能强大的实时预览编辑器。

## 功能特点

- ✅ **实时预览** - 边写边看效果
- ✅ **语法高亮** - 代码块支持多种语言
- ✅ **响应式设计** - 支持各种设备
- ✅ **导入导出** - 支持文件操作

## 语法示例

### 标题
# 一级标题
## 二级标题
### 三级标题

### 文本样式
**粗体文本**
*斜体文本*
~~删除线~~
\`行内代码\`

### 列表
1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项
- 无序列表项
- 无序列表项

### 链接和图片
[链接文本](https://example.com)
![图片描述](https://via.placeholder.com/150)

### 引用
> 这是一个引用文本
> 可以有多行

### 代码块
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

---

开始编辑以查看实时预览效果！`)

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const words = markdown.trim().split(/\s+/).filter(word => word.length > 0).length
    const chars = markdown.length
    setWordCount(words)
    setCharCount(chars)
  }, [markdown])

  const insertMarkdown = (syntax: string, text: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdown.substring(start, end)

    let replacement: string

    switch (syntax) {
      case 'bold':
        replacement = `**${selectedText || text || '粗体文本'}**`
        break
      case 'italic':
        replacement = `*${selectedText || text || '斜体文本'}*`
        break
      case 'strikethrough':
        replacement = `~~${selectedText || text || '删除线文本'}~~`
        break
      case 'code':
        replacement = `\`${selectedText || text || '代码'}\``
        break
      case 'link':
        replacement = `[${selectedText || '链接文本'}](${text || 'https://example.com'})`
        break
      case 'image':
        replacement = `![${selectedText || '图片描述'}](${text || 'https://via.placeholder.com/150'})`
        break
      case 'h1':
        replacement = `# ${selectedText || text || '一级标题'}`
        break
      case 'h2':
        replacement = `## ${selectedText || text || '二级标题'}`
        break
      case 'h3':
        replacement = `### ${selectedText || text || '三级标题'}`
        break
      case 'quote':
        replacement = `> ${selectedText || text || '引用文本'}`
        break
      case 'ul':
        replacement = `- ${selectedText || text || '列表项'}`
        break
      case 'ol':
        replacement = `1. ${selectedText || text || '列表项'}`
        break
      case 'codeblock':
        replacement = `\`\`\`${text || 'javascript'}\n${selectedText || '// 代码块'}\n\`\`\``
        break
      case 'table':
        replacement = `| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |`
        break
      default:
        replacement = selectedText
    }

    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end)
    setMarkdown(newMarkdown)

    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + replacement.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMarkdown(e.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      alert('请选择 .md 或 .txt 文件')
    }
  }

  const clearContent = () => {
    if (confirm('确定要清空所有内容吗？')) {
      setMarkdown('')
    }
  }

  const toolbarButtons = [
    { icon: '𝐁', action: () => insertMarkdown('bold'), title: '粗体 (Ctrl+B)' },
    { icon: '𝐼', action: () => insertMarkdown('italic'), title: '斜体 (Ctrl+I)' },
    { icon: '~~', action: () => insertMarkdown('strikethrough'), title: '删除线' },
    { icon: '<>', action: () => insertMarkdown('code'), title: '行内代码' },
    { icon: 'H1', action: () => insertMarkdown('h1'), title: '一级标题' },
    { icon: 'H2', action: () => insertMarkdown('h2'), title: '二级标题' },
    { icon: '🔗', action: () => insertMarkdown('link'), title: '链接' },
    { icon: '🖼️', action: () => insertMarkdown('image'), title: '图片' },
    { icon: '""', action: () => insertMarkdown('quote'), title: '引用' },
    { icon: '•', action: () => insertMarkdown('ul'), title: '无序列表' },
    { icon: '1.', action: () => insertMarkdown('ol'), title: '有序列表' },
    { icon: '{}', action: () => insertMarkdown('codeblock'), title: '代码块' },
    { icon: '⊞', action: () => insertMarkdown('table'), title: '表格' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">📝 Markdown 编辑器</h1>
          <p className="text-muted-foreground">功能强大的实时预览 Markdown 编辑器</p>
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={button.action}
                  title={button.title}
                  className="text-xs"
                >
                  {button.icon}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList>
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                  <TabsTrigger value="split">分屏</TabsTrigger>
                </TabsList>
              </Tabs>

              <Separator orientation="vertical" className="h-6" />

              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                onChange={importMarkdown}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                导入文件
              </Button>
              <Button variant="outline" size="sm" onClick={exportMarkdown}>
                导出 MD
              </Button>
              <Button variant="outline" size="sm" onClick={clearContent}>
                清空
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">字符: {charCount}</Badge>
                <Badge variant="outline">单词: {wordCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <Card className={viewMode === 'edit' ? 'lg:col-span-2' : ''}>
              <CardHeader>
                <CardTitle>编辑器</CardTitle>
                <CardDescription>在此编写 Markdown 内容</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="开始编写 Markdown..."
                  rows={20}
                  className="font-mono text-sm resize-none"
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card className={viewMode === 'preview' ? 'lg:col-span-2' : ''}>
              <CardHeader>
                <CardTitle>预览</CardTitle>
                <CardDescription>实时预览效果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto h-[500px] p-4 border rounded-md bg-background">
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      code({className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !(props as any)?.node?.data?.meta
                        return !isInline && match ? (
                          <pre className={className}>
                            <code className={className}>{children}</code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Markdown 语法快速指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h5 className="font-medium mb-2">文本格式</h5>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <div>**粗体** → <strong>粗体</strong></div>
                  <div>*斜体* → <em>斜体</em></div>
                  <div>~~删除线~~ → <del>删除线</del></div>
                  <div>`代码` → <code>代码</code></div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">标题</h5>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <div># 一级标题</div>
                  <div>## 二级标题</div>
                  <div>### 三级标题</div>
                  <div>#### 四级标题</div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">列表</h5>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <div>- 无序列表</div>
                  <div>1. 有序列表</div>
                  <div>&gt; 引用文本</div>
                  <div>--- 分割线</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
