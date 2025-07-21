'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function CalculatorTool() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)
  const [numberBase, setNumberBase] = useState<'dec' | 'hex' | 'oct' | 'bin'>('dec')

  const formatNumber = (num: number, base: 'dec' | 'hex' | 'oct' | 'bin'): string => {
    const intValue = Math.floor(Math.abs(num))
    switch (base) {
      case 'hex':
        return intValue.toString(16).toUpperCase()
      case 'oct':
        return intValue.toString(8)
      case 'bin':
        return intValue.toString(2)
      default:
        return num.toString()
    }
  }

  const parseNumber = (str: string, base: 'dec' | 'hex' | 'oct' | 'bin'): number => {
    switch (base) {
      case 'hex':
        return parseInt(str, 16)
      case 'oct':
        return parseInt(str, 8)
      case 'bin':
        return parseInt(str, 2)
      default:
        return parseFloat(str)
    }
  }

  const getCurrentValue = (): number => {
    return parseNumber(display, numberBase)
  }

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputDot = () => {
    if (numberBase !== 'dec') return // 只有十进制支持小数点

    if (waitingForNewValue) {
      setDisplay('0.')
      setWaitingForNewValue(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = getCurrentValue()

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(formatNumber(newValue, numberBase))
      setPreviousValue(newValue)
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      case '%':
        return firstValue % secondValue
      case '**':
        return Math.pow(firstValue, secondValue)
      case '&':
        return Math.floor(firstValue) & Math.floor(secondValue)
      case '|':
        return Math.floor(firstValue) | Math.floor(secondValue)
      case '^':
        return Math.floor(firstValue) ^ Math.floor(secondValue)
      case '<<':
        return Math.floor(firstValue) << Math.floor(secondValue)
      case '>>':
        return Math.floor(firstValue) >> Math.floor(secondValue)
      default:
        return secondValue
    }
  }

  const performUnaryOperation = (op: string) => {
    const value = getCurrentValue()
    let result: number

    switch (op) {
      case '~':
        result = ~Math.floor(value)
        break
      case 'sqrt':
        result = Math.sqrt(value)
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'ln':
        result = Math.log(value)
        break
      case 'sin':
        result = Math.sin(value * Math.PI / 180)
        break
      case 'cos':
        result = Math.cos(value * Math.PI / 180)
        break
      case 'tan':
        result = Math.tan(value * Math.PI / 180)
        break
      case '!':
        result = factorial(Math.floor(value))
        break
      case '+/-':
        result = -value
        break
      default:
        return
    }

    setDisplay(formatNumber(result, numberBase))
    setWaitingForNewValue(true)
  }

  const factorial = (n: number): number => {
    if (n < 0) return NaN
    if (n === 0 || n === 1) return 1
    if (n > 170) return Infinity // 避免溢出
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  const changeBase = (newBase: 'dec' | 'hex' | 'oct' | 'bin') => {
    const currentValue = getCurrentValue()
    setNumberBase(newBase)
    setDisplay(formatNumber(currentValue, newBase))
  }

  const getValidDigits = (base: 'dec' | 'hex' | 'oct' | 'bin'): string[] => {
    switch (base) {
      case 'bin':
        return ['0', '1']
      case 'oct':
        return ['0', '1', '2', '3', '4', '5', '6', '7']
      case 'dec':
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      case 'hex':
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
      default:
        return []
    }
  }

  const validDigits = getValidDigits(numberBase)
  const currentValue = getCurrentValue()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🧮 程序员计算器</h1>
          <p className="text-muted-foreground">支持多进制运算和位运算的科学计算器</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>计算器</CardTitle>
                <CardDescription>支持十进制、十六进制、八进制、二进制运算</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Number Base Selector */}
                <div className="flex gap-2">
                  {(['dec', 'hex', 'oct', 'bin'] as const).map((base) => (
                    <Button
                      key={base}
                      variant={numberBase === base ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeBase(base)}
                    >
                      {base.toUpperCase()}
                    </Button>
                  ))}
                </div>

                {/* Display */}
                <div className="w-full p-4 text-right text-2xl font-mono border rounded-lg bg-muted min-h-[60px] flex items-center justify-end">
                  {display}
                </div>

                {/* Number Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {validDigits.map((digit) => (
                    <Button
                      key={digit}
                      variant="outline"
                      onClick={() => inputNumber(digit)}
                      className="h-12"
                    >
                      {digit}
                    </Button>
                  ))}
                </div>

                {/* Operation Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <Button onClick={() => performOperation('+')} className="h-12">+</Button>
                  <Button onClick={() => performOperation('-')} className="h-12">-</Button>
                  <Button onClick={() => performOperation('*')} className="h-12">×</Button>
                  <Button onClick={() => performOperation('/')} className="h-12">÷</Button>

                  <Button onClick={() => performOperation('%')} variant="outline" className="h-12">%</Button>
                  <Button onClick={() => performOperation('**')} variant="outline" className="h-12">^</Button>
                  <Button onClick={clear} variant="destructive" className="h-12">C</Button>
                  <Button onClick={() => performOperation('=')} className="h-12">=</Button>
                </div>

                {/* Bitwise Operations */}
                <div className="space-y-2">
                  <h4 className="font-medium">位运算</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => performOperation('&')} variant="outline" size="sm">AND</Button>
                    <Button onClick={() => performOperation('|')} variant="outline" size="sm">OR</Button>
                    <Button onClick={() => performOperation('^')} variant="outline" size="sm">XOR</Button>
                    <Button onClick={() => performUnaryOperation('~')} variant="outline" size="sm">NOT</Button>
                    <Button onClick={() => performOperation('<<')} variant="outline" size="sm">{'<<'}</Button>
                    <Button onClick={() => performOperation('>>')} variant="outline" size="sm">{'>>'}</Button>
                  </div>
                </div>

                {/* Scientific Functions */}
                <div className="space-y-2">
                  <h4 className="font-medium">科学函数</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <Button onClick={() => performUnaryOperation('sqrt')} variant="outline" size="sm">√</Button>
                    <Button onClick={() => performUnaryOperation('log')} variant="outline" size="sm">log</Button>
                    <Button onClick={() => performUnaryOperation('ln')} variant="outline" size="sm">ln</Button>
                    <Button onClick={() => performUnaryOperation('!')} variant="outline" size="sm">n!</Button>
                    <Button onClick={() => performUnaryOperation('sin')} variant="outline" size="sm">sin</Button>
                    <Button onClick={() => performUnaryOperation('cos')} variant="outline" size="sm">cos</Button>
                    <Button onClick={() => performUnaryOperation('tan')} variant="outline" size="sm">tan</Button>
                    <Button onClick={() => performUnaryOperation('+/-')} variant="outline" size="sm">±</Button>
                  </div>
                </div>

                {numberBase === 'dec' && (
                  <Button onClick={inputDot} variant="outline" className="w-full">
                    小数点 (.)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Number System Converter */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>进制转换</CardTitle>
                <CardDescription>当前数值的不同进制表示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">十进制 (DEC)</Badge>
                    <code className="text-sm font-mono">{formatNumber(currentValue, 'dec')}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">十六进制 (HEX)</Badge>
                    <code className="text-sm font-mono">0x{formatNumber(currentValue, 'hex')}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">八进制 (OCT)</Badge>
                    <code className="text-sm font-mono">0o{formatNumber(currentValue, 'oct')}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">二进制 (BIN)</Badge>
                    <code className="text-sm font-mono break-all">0b{formatNumber(currentValue, 'bin')}</code>
                  </div>
                </div>

                {!isNaN(currentValue) && isFinite(currentValue) && (
                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">位信息</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>位数 (二进制):</span>
                        <Badge variant="outline">{Math.floor(currentValue).toString(2).length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>字节:</span>
                        <Badge variant="outline">{Math.ceil(Math.floor(currentValue).toString(2).length / 8)}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>快捷键</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>数字: 0-9, A-F</div>
                  <div>运算: +, -, *, /</div>
                  <div>清除: C 或 Escape</div>
                  <div>等于: = 或 Enter</div>
                  <div>进制: D/H/O/B</div>
                  <div>小数点: .</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
