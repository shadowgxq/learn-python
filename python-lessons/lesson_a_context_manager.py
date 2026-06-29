"""
Part A：上下文管理器（context manager）原理
目标：理解 with 的本质，再用它消除 service 层重复的 try/commit/rollback

前端类比：JS 没有完全对应物。最接近的是 try/finally（保证清理），
          或 TS/JS 较新的 `using` 声明。Python 用 with + 上下文管理器把
          "进入做准备、退出做清理（即使异常）"这件事封装成可复用的对象。
"""

from contextlib import contextmanager


# @contextmanager 把一个"只 yield 一次的生成器函数"变成上下文管理器。
# 这是 with 背后的协议：__enter__（进入）/ __exit__（退出）的简写。
@contextmanager
def managed(name: str):
    print(f"  [进入] 准备 {name}")        # ← yield 之前 = __enter__：with 一开始就执行
    try:
        yield f"{name}-资源"               # ← yield 的值给 as；在此暂停，去执行 with 代码块
        print(f"  [提交] {name} 正常结束")  # ← with 块正常跑完，回到这里
    except Exception as e:
        # ← with 块里抛的异常，会在上面 yield 那一行被重新抛出，于是这里能 catch 到
        print(f"  [回滚] {name} 出错：{e}")
        raise                              # 处理完仍要往外抛，否则异常被吞
    finally:
        print(f"  [清理] {name} 关闭")      # ← 无论正常还是异常，一定执行


print("=== 正常路径 ===")
with managed("事务A") as res:
    print(f"  使用 {res}")

print("\n=== 异常路径（看 with 块抛错时，控制流怎么走）===")
try:
    with managed("事务B"):
        print("  使用 事务B-资源")
        raise ValueError("boom")
except ValueError:
    print("  外层捕获到 ValueError（异常确实穿透出来了）")

# 关键观察：
#   正常时   进入 → 使用 → 提交 → 清理
#   异常时   进入 → 使用 → 回滚 → 清理 → 异常继续向外抛
# 这正好是"数据库事务"要的形状：进入开事务、正常 commit、异常 rollback、最后收尾。
