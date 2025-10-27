#!/bin/bash

# 跨平台构建脚本
# 在 Linux/macOS 上使用
# 在 Windows 上可以使用 Git Bash 或 WSL

set -e

echo "=== 组织架构管理系统 - 从源码编译 ==="

# 检测平台
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "msys" ]]; then
    OS="Windows"
else
    OS="Unknown"
fi

echo "检测到操作系统: $OS"

# 编译服务端
echo ""
echo "=== 编译服务端 ==="
cd server
if [ ! -d "build" ]; then
    mkdir build
fi
cd build

# 配置 CMake
echo "配置 CMake..."
cmake ..

# 编译
echo "开始编译..."
cmake --build . -j4

# 检查可执行文件
if [ -f "org_chart" ] || [ -f "Release/org_chart.exe" ] || [ -f "org_chart.exe" ]; then
    echo "✓ 服务端编译成功"
    if [ -f "org_chart" ]; then
        ls -lh org_chart
    elif [ -f "Release/org_chart.exe" ]; then
        ls -lh Release/org_chart.exe
    else
        ls -lh org_chart.exe
    fi
else
    echo "✗ 服务端编译失败"
    exit 1
fi

cd ../..

# 编译客户端
echo ""
echo "=== 编译客户端 ==="
cd client
if [ ! -d "build" ]; then
    mkdir build
fi
cd build

# 配置 CMake
echo "配置 CMake..."
cmake ..

# 编译
echo "开始编译..."
cmake --build . -j4

# 检查可执行文件
if [ -f "bin/org_chart_client" ] || [ -f "bin/Release/org_chart_client.exe" ]; then
    echo "✓ 客户端编译成功"
    if [ -f "bin/org_chart_client" ]; then
        ls -lh bin/org_chart_client
    else
        ls -lh bin/Release/org_chart_client.exe
    fi
else
    echo "✗ 客户端编译失败"
    exit 1
fi

cd ../..

echo ""
echo "=== 编译完成 ==="
echo "服务端: server/build/org_chart"
echo "客户端: client/build/bin/org_chart_client"
echo ""
echo "运行服务端: cd server/build && ./org_chart"
echo "运行客户端: cd client/build && ./bin/org_chart_client"
