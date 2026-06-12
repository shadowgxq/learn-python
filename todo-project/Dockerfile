 # 1. 用轻量级 Python 镜像
 FROM python:3.12-slim

 # 2. 安装 uv（快速包管理工具）
 RUN pip install uv

 # 3. 设置工作目录
 WORKDIR /app

# 4. 先复制依赖文件（利用 Docker 缓存）
COPY pyproject.toml uv.lock ./

# 5. 安装依赖
RUN uv sync --frozen --no-dev

# 6. 复制项目代码
COPY . .

# 7. 暴露端口
EXPOSE 8000

# 8. 启动命令
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]