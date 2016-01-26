在 MarkdownIME 的 VDom 中，使用了一个简单的 diff 算法以实现将目标 container 内容替换成想要的内容（shadow 的内容）。

使用 Markdown 最常见的情况就是

## 插入 & 删除

```
                   si2(1)    si2(2)
                    si        |
		            |         |
shadow [A]   [B]   [C]  [D]  [E]
        |    /       \       /
target [A]  [B]  [*]  [C]  [E]
                  |    |    |
                  ti   |    |
			        ti2(1) ti2(2)
```

`si` and `ti` are the iterator number.

when `src[si] == src[ti]`, keep `si++,ti++`

否则，各取三个节点并找到对应的


## 说明优先级怎么选择

```
target [A] [B] [C]

shadow [C] [B] [C]
```

如果是在 shadow 上定点，在 target 上循环，会导致 [B] 重建。

2016-01-26 

笔记什么的先去死吧！

反正怎么说，在 target 上，遍历寻找 shadow 里有没有对应的 Node 就是了！ 算法很垃圾，看谁有心情优化了，反正我不搞了