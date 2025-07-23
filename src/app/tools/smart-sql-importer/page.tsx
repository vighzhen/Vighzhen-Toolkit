'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

interface ColumnMapping {
  originalName: string
  mappedName: string
  dataType: string
  isPrimaryKey: boolean
  isNullable: boolean
}

interface ParsedData {
  headers: string[]
  rows: string[][]
}

export default function SmartSQLImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [tableName, setTableName] = useState('my_table')
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [sqlOutput, setSqlOutput] = useState('')
  const [databaseType, setDatabaseType] = useState<'mysql' | 'postgresql' | 'sqlite'>('mysql')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setLoading(true)
    setError('')

    try {
      const parsed = await parseFile(selectedFile)
      setParsedData(parsed)
      
      // 初始化列映射
      const mappings: ColumnMapping[] = parsed.headers.map(header => ({
        originalName: header,
        mappedName: header.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        dataType: inferDataType(parsed.rows, parsed.headers.indexOf(header)),
        isPrimaryKey: false,
        isNullable: true
      }))
      
      // 设置第一列为主键（如果看起来像ID）
      if (mappings.length > 0 && (mappings[0].originalName.toLowerCase().includes('id') || mappings[0].originalName.toLowerCase() === 'id')) {
        mappings[0].isPrimaryKey = true
        mappings[0].isNullable = false
      }
      
      setColumnMappings(mappings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败')
    } finally {
      setLoading(false)
    }
  }

  const parseFile = async (file: File): Promise<ParsedData> => {
    const filename = file.name.toLowerCase()
    
    if (filename.endsWith('.csv')) {
      const text = await file.text()
      return parseCSV(text)
    } else if (filename.endsWith('.tsv') || filename.endsWith('.txt')) {
      const text = await file.text()
      return parseTSV(text)
    } else if (filename.endsWith('.json')) {
      const text = await file.text()
      return parseJSON(text)
    } else {
      throw new Error('不支持的文件格式，请使用CSV、TSV、TXT或JSON文件')
    }
  }

  const parseCSV = (content: string): ParsedData => {
    const lines = content.trim().split('\n')
    if (lines.length === 0) throw new Error('文件为空')
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    )
    
    return { headers, rows }
  }

  const parseTSV = (content: string): ParsedData => {
    const lines = content.trim().split('\n')
    if (lines.length === 0) throw new Error('文件为空')
    
    // 自动检测分隔符（制表符或多个空格）
    const firstLine = lines[0]
    const delimiter = firstLine.includes('\t') ? '\t' : /\s{2,}/.test(firstLine) ? /\s{2,}/ : '\t'
    
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => 
      line.split(delimiter).map(cell => cell.trim().replace(/"/g, ''))
    )
    
    return { headers, rows }
  }

  const parseJSON = (content: string): ParsedData => {
    try {
      const data = JSON.parse(content)
      
      // 处理不同的JSON结构
      let arrayData: any[]
      
      if (Array.isArray(data)) {
        arrayData = data
      } else if (data && typeof data === 'object') {
        // 如果是对象，尝试找到数组属性
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]))
        if (arrayKeys.length > 0) {
          arrayData = data[arrayKeys[0]]
        } else {
          // 如果没有数组属性，将对象转换为单行数据
          arrayData = [data]
        }
      } else {
        throw new Error('JSON格式不支持，请确保包含对象数组')
      }
      
      if (arrayData.length === 0) {
        throw new Error('JSON文件为空')
      }
      
      // 从第一个对象提取所有键作为列名
      const firstItem = arrayData[0]
      if (typeof firstItem !== 'object' || firstItem === null) {
        throw new Error('JSON数组中的元素必须是对象')
      }
      
      // 收集所有可能的键
      const allKeys = new Set<string>()
      arrayData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key))
        }
      })
      
      const headers = Array.from(allKeys)
      const rows = arrayData.map(item => 
        headers.map(header => {
          const value = item[header]
          if (value === null || value === undefined) {
            return ''
          }
          if (typeof value === 'object') {
            return JSON.stringify(value)
          }
          return String(value)
        })
      )
      
      return { headers, rows }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON格式错误: ' + error.message)
      }
      throw error
    }
  }




  

  

  

  

  


  const inferDataType = (rows: string[][], columnIndex: number): string => {
    const samples = rows.slice(0, 10).map(row => row[columnIndex]).filter(Boolean)
    
    if (samples.length === 0) return 'VARCHAR(255)'
    
    // 检查是否为数字
    const isAllNumbers = samples.every(sample => !isNaN(Number(sample)))
    if (isAllNumbers) {
      const hasDecimals = samples.some(sample => sample.includes('.'))
      return hasDecimals ? 'DECIMAL(10,2)' : 'INT'
    }
    
    // 检查是否为日期
    const isAllDates = samples.every(sample => !isNaN(Date.parse(sample)))
    if (isAllDates) return 'DATETIME'
    
    // 检查字符串长度
    const maxLength = Math.max(...samples.map(s => s.length))
    if (maxLength > 255) return 'TEXT'
    
    return `VARCHAR(${Math.max(255, maxLength + 50)})`
  }

  const updateColumnMapping = (index: number, field: keyof ColumnMapping, value: string | boolean) => {
    const updated = [...columnMappings]
    updated[index] = { ...updated[index], [field]: value }
    
    // 确保只有一个主键
    if (field === 'isPrimaryKey' && value === true) {
      updated.forEach((mapping, i) => {
        if (i !== index) mapping.isPrimaryKey = false
      })
    }
    
    setColumnMappings(updated)
  }

  const generateSQL = () => {
    if (!parsedData || columnMappings.length === 0) {
      setError('请先上传并配置数据')
      return
    }

    try {
      const createTableSQL = generateCreateTableSQL()
      const insertSQL = generateInsertSQL()
      
      setSqlOutput(`-- 创建表结构\n${createTableSQL}\n\n-- 插入数据\n${insertSQL}`)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SQL生成失败')
    }
  }

  const generateCreateTableSQL = (): string => {
    const columns = columnMappings.map(mapping => {
      let columnDef = `  ${mapping.mappedName} ${mapping.dataType}`
      
      if (!mapping.isNullable) columnDef += ' NOT NULL'
      if (mapping.isPrimaryKey) columnDef += ' PRIMARY KEY'
      
      return columnDef
    }).join(',\n')
    
    return `CREATE TABLE ${tableName} (\n${columns}\n);`
  }

  const generateInsertSQL = (): string => {
    if (!parsedData) return ''
    
    const columnNames = columnMappings.map(m => m.mappedName).join(', ')
    const insertStatements = parsedData.rows.map(row => {
      const values = row.map((value, index) => {
        const mapping = columnMappings[index]
        if (!mapping) return "''"
        
        // 处理不同数据类型
        if (mapping.dataType.includes('INT') || mapping.dataType.includes('DECIMAL')) {
          return value || '0'
        }
        
        // 转义单引号
        const escapedValue = value.replace(/'/g, "''")
        return `'${escapedValue}'`
      }).join(', ')
      
      return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`
    })
    
    return insertStatements.join('\n')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板!')
  }

  const downloadSQL = () => {
    if (!sqlOutput) return
    
    const blob = new Blob([sqlOutput], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}_import.sql`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setFile(null)
    setParsedData(null)
    setColumnMappings([])
    setSqlOutput('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🗄️ SmartSQL Importer</h1>
          <p className="text-muted-foreground">智能数据导入工具，支持CSV/TSV/TXT/JSON转SQL插入语句</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧输入区域 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>数据导入配置</CardTitle>
              <CardDescription>上传CSV、TSV、TXT或JSON文件并配置表结构</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 文件上传 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt,.json"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button onClick={clearAll} variant="outline">
                    清空
                  </Button>
                </div>
                
                {loading && (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">正在解析文件...</div>
                  </div>
                )}
                
                {file && (
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">文件:</span> {file.name}</div>
                      <div><span className="font-medium">大小:</span> {(file.size / 1024).toFixed(2)} KB</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 基本配置 */}
              {parsedData && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">表名</label>
                      <Input
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        placeholder="输入表名"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">数据库类型</label>
                      <div className="flex gap-1">
                        <Button
                          variant={databaseType === 'mysql' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDatabaseType('mysql')}
                        >
                          MySQL
                        </Button>
                        <Button
                          variant={databaseType === 'postgresql' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDatabaseType('postgresql')}
                        >
                          PostgreSQL
                        </Button>
                        <Button
                          variant={databaseType === 'sqlite' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDatabaseType('sqlite')}
                        >
                          SQLite
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 字段映射 */}
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">字段配置</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {columnMappings.map((mapping, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">原字段</div>
                            <div className="font-mono truncate">{mapping.originalName}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">映射名</div>
                            <Input
                              value={mapping.mappedName}
                              onChange={(e) => updateColumnMapping(index, 'mappedName', e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">类型</div>
                            <Input
                              value={mapping.dataType}
                              onChange={(e) => updateColumnMapping(index, 'dataType', e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant={mapping.isPrimaryKey ? 'default' : 'outline'}
                              size="sm"
                              className="h-5 px-2 text-xs"
                              onClick={() => updateColumnMapping(index, 'isPrimaryKey', !mapping.isPrimaryKey)}
                            >
                              {mapping.isPrimaryKey ? '✓ 主键' : '主键'}
                            </Button>
                            <Button
                              variant={mapping.isNullable ? 'default' : 'outline'}
                              size="sm"
                              className="h-5 px-2 text-xs"
                              onClick={() => updateColumnMapping(index, 'isNullable', !mapping.isNullable)}
                            >
                              {mapping.isNullable ? '✓ 空值' : '空值'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 生成按钮 */}
                  <Button onClick={generateSQL} className="w-full">
                    生成 SQL 语句
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* 右侧输出区域 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>输出结果</CardTitle>
              <CardDescription>
                {error ? '错误信息' : sqlOutput ? 'SQL语句已生成' : parsedData ? '数据已解析，请生成SQL' : '等待文件上传...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 解析成功信息 */}
              {parsedData && !error && (
                <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <div><span className="font-medium">列数:</span> {parsedData.headers.length}</div>
                    <div><span className="font-medium">行数:</span> {parsedData.rows.length}</div>
                    <div><span className="font-medium">列名:</span> {parsedData.headers.join(', ')}</div>
                  </div>
                </div>
              )}

              {/* 数据预览 */}
              {parsedData && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">数据预览 (前5行)</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          {parsedData.headers.map((header, index) => (
                            <th key={index} className="border-r border-border px-2 py-1 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-border">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border-r border-border px-2 py-1">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.rows.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      显示前5行，共{parsedData.rows.length}行数据
                    </div>
                  )}
                </div>
              )}

              {/* SQL输出 */}
              {sqlOutput && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">SQL语句</h4>
                      <Badge variant="outline">{databaseType.toUpperCase()}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(sqlOutput)}
                        size="sm"
                        variant="outline"
                      >
                        复制
                      </Button>
                      <Button
                        onClick={downloadSQL}
                        size="sm"
                        variant="outline"
                      >
                        下载
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={sqlOutput}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <div className="mt-6 p-4 border border-destructive rounded-lg bg-destructive/10">
            <h4 className="font-medium text-destructive mb-2">错误</h4>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}