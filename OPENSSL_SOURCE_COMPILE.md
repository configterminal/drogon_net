# 如何使用源码编译 OpenSSL

**重要说明**: 使用源码编译 OpenSSL 虽然可行，但**不推荐**，原因如下：

## 为什么不推荐从源码编译 OpenSSL？

1. **编译时间太长**: OpenSSL 从源码编译需要 **10-30 分钟**
2. **依赖复杂**: 需要 Perl、NASM 等额外工具
3. **Windows 支持困难**: 在 Windows 上编译更加复杂
4. **不必要的复制**: OpenSSL 已经在 third_party 目录中（作为参考），项目会自动使用系统的 OpenSSL
5. **维护成本高**: 每次编译都要等待很久

## 推荐做法：使用系统包

### Linux
```bash
# 系统已包含 OpenSSL，无需安装
```

### Windows - 使用 vcpkg（推荐）

```powershell
# 安装 vcpkg
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat

# 安装 OpenSSL
.\vcpkg install openssl:x64-windows

# 在 CMakeLists.txt 中配置 vcpkg
set(CMAKE_TOOLCHAIN_FILE "C:/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake")
find_package(OpenSSL CONFIG REQUIRED)
```

### Windows - 使用预编译包

下载并安装 Win32 OpenSSL:
- https://slproweb.com/products/Win32OpenSSL.html
- 安装后 CMake 会自动找到

## 如果一定要从源码编译

### Linux/macOS

```bash
cd server/third_party/openssl

# 配置
./Configure linux-x86_64 --prefix=$PWD/../build-openssl

# 编译（需要 10-30 分钟）
make -j4

# 安装
make install

# 在 CMakeLists.txt 中指定路径
set(OpenSSL_ROOT_DIR "${CMAKE_SOURCE_DIR}/third_party/build-openssl")
```

### Windows（更复杂）

需要:
1. 安装 Perl (Strawberry Perl)
2. 安装 NASM 汇编器
3. Visual Studio 完整安装

```powershell
cd server/third_party/openssl

# 配置（使用开发者命令提示符）
perl Configure VC-WIN64A --prefix=build-openssl

# 编译（需要很长时间）
nmake

# 安装
nmake install
```

## 建议

**保持现状**：
- OpenSSL 源码在 third_party 目录作为参考
- 项目使用系统的 OpenSSL（find_package）
- 在 Windows 上使用 vcpkg 安装 OpenSSL
- 避免从源码编译（除非有特殊需求）
