# 第八周总结

#### css选择器优先级

##### 四元组[0 ,0, 0, 0]：[style，id, [class、父子选择器、属性选择器等各种],  标签]；*不参与排序

--------

#### 伪类

##### 链接/行为

- :any-link
- :link :visited
- :hover
- :active
- :focus
- :target

##### 树结构：容易引起回溯，影响性能

- :empty
- :nth-child()
- :nth-last-child()
- :first-child :last-child :only-child

##### 逻辑型：容易引起回溯，影响性能

- :not
- :where :has

----------

#### 伪元素

- ##### ::before

- ##### ::after

- ##### ::first-line 可设置与文字相关的属性，不可设置BFC相关（思考）

- ##### ::first-letter 

---

#### 排版

- ##### 标签(tag)、元素(element)、盒(box)

- ##### 盒模型

- ##### 正常流

  - ###### IFC:基线、行高问题（vertical-align最好只用top、middle、bottom）
  
  - ###### Bfc
  
- ##### float和clear（古代用法，排版用flex完全替代，文字环绕才使用）

- ##### margin折叠（BFC合并，间距共用，满足最大值即可）

  - ###### 同一个父BFC：只要两个子BFC合并

  - ###### 不同父BFC：两个子FBC不合并

  - ###### 特例：父BFC设置了overflow:visible，子BFC跟父BFC合并

- ##### 重要概念

  - ###### block-container：表示可以被放入 bfc

  - ###### block-level：表示可以容纳 bfc

  - ###### block-box：block-level + block-container