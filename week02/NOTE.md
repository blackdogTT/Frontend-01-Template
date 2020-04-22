# 第二周总结

### 编程语言通识

- 非形式语言
- 形式语言
  - 0型：无限制文法
    - 等号左边不止一个<a><b> ::= "c"
  - 1型：上下文相关文法
    - "a"<b>"c"::="a""x""c"
  - 2型：上下文无关文法
  - 3型：正则文法
- BNF产生式
- 图灵完备性
- 类型系统

## 词法和类型

- whiteSpace
- LineTerminator 换行符
- Comment 注释
- Token 一切有效东西的最小单元
  - Punctuator: 符号 比如 `> = < }`
  - Keywords：比如 `await`、`break`... 不能用作变量名，但像 getter 里的 `get`就是个例外
  - Literal: 直接量
    - Number
      - 存储 Uint8Array、Float64Array
      - 各种进制的写法
        - 二进制 0b
        - 八进制 0o
        - 十进制 0x
    - String
      - Character
      - Code Point
      - Encoding
        - unicode 编码 - utf
          - utf-8 可变长度 （控制位的用处）
      - Grammar
        - `''`、`""`、``` `
    - Boolean
      - `true`
      - `false`
    - Null
    - Undefind