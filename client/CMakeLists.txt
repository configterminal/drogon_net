cmake_minimum_required(VERSION 3.5)
project(org_chart_client CXX)

# Windows 特定配置
if(WIN32)
    # 设置 MSVC 运行时
    if(MSVC)
        add_compile_options(/W4 /WX-)
        add_compile_definitions(_CRT_SECURE_NO_WARNINGS)
        set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
    endif()
endif()

include(CheckIncludeFileCXX)

check_include_file_cxx(any HAS_ANY)
check_include_file_cxx(string_view HAS_STRING_VIEW)
check_include_file_cxx(coroutine HAS_COROUTINE)
if (NOT "${CMAKE_CXX_STANDARD}" STREQUAL "")
    # Do nothing
elseif (HAS_ANY AND HAS_STRING_VIEW AND HAS_COROUTINE)
    set(CMAKE_CXX_STANDARD 20)
elseif (HAS_ANY AND HAS_STRING_VIEW)
    set(CMAKE_CXX_STANDARD 17)
else ()
    set(CMAKE_CXX_STANDARD 14)
endif ()

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 创建客户端可执行文件
add_executable(${PROJECT_NAME} main.cc)

# ##############################################################################
# 设置 OpenSSL 路径（如果使用本地的 third_party/openssl）
# OpenSSL 需要先手动编译，然后设置 OPENSSL_ROOT_DIR
# 可以在调用 cmake 时设置：cmake -DOPENSSL_ROOT_DIR=../third_party/openssl ..
# 或者让 cmake 自动查找系统中的 OpenSSL
if(NOT DEFINED OPENSSL_ROOT_DIR)
    # 默认使用本地的 OpenSSL 源码目录
    set(OPENSSL_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/third_party/openssl CACHE PATH "Path to OpenSSL")
endif()

# 使用源码编译Drogon (从third_party目录)
# https://github.com/drogonframework/drogon
add_subdirectory(third_party/drogon)
target_link_libraries(${PROJECT_NAME} PRIVATE drogon)

# ##############################################################################
# 注意：我们使用源码编译，不使用系统的包管理
# 如果需要使用系统包（vcpkg等），取消注释以下两行，并注释掉上面的 add_subdirectory
# find_package(Drogon CONFIG REQUIRED)
# target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)
# ##############################################################################

if (CMAKE_CXX_STANDARD LESS 17)
    # With C++14, use boost to support any, string_view and filesystem
    message(STATUS "use c++14")
    find_package(Boost 1.61.0 REQUIRED)
    target_link_libraries(${PROJECT_NAME} PUBLIC Boost::boost)
elseif (CMAKE_CXX_STANDARD LESS 20)
    message(STATUS "use c++17")
else ()
    message(STATUS "use c++20")
endif ()

# 设置输出目录
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
