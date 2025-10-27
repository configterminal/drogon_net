cmake_minimum_required(VERSION 3.5)
project(org_chart CXX)

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

add_executable(${PROJECT_NAME} main.cc)

# ##############################################################################
# 设置 OpenSSL 路径（如果使用本地的 third_party/openssl）
# OpenSSL 需要先手动编译，然后设置 OPENSSL_ROOT_DIR
# 可以在调用 cmake 时设置：cmake -DOPENSSL_ROOT_DIR=server/third_party/openssl ..
# 或者让 cmake 自动查找系统中的 OpenSSL
if(NOT DEFINED OPENSSL_ROOT_DIR)
    # 默认使用本地的 OpenSSL 源码目录
    set(OPENSSL_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/third_party/openssl CACHE PATH "Path to OpenSSL")
endif()

# https://github.com/drogonframework/drogon
add_subdirectory(third_party/drogon)
target_link_libraries(${PROJECT_NAME} PRIVATE drogon)

# https://github.com/Thalhammer/jwt-cpp
add_subdirectory(third_party/jwt-cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE jwt-cpp)

# https://github.com/trusch/libbcrypt
add_subdirectory(third_party/libbcrypt)
target_link_libraries(${PROJECT_NAME} PRIVATE bcrypt)

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

aux_source_directory(controllers CTL_SRC)
aux_source_directory(filters FILTER_SRC)
aux_source_directory(plugins PLUGIN_SRC)
aux_source_directory(models MODEL_SRC)
aux_source_directory(utils UTIL_SRC)

target_include_directories(${PROJECT_NAME}
                           PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
                                   ${CMAKE_CURRENT_SOURCE_DIR}/models)
target_sources(${PROJECT_NAME}
               PRIVATE
               ${SRC_DIR}
               ${CTL_SRC}
               ${FILTER_SRC}
               ${PLUGIN_SRC}
               ${MODEL_SRC}
               ${UTIL_SRC})
# ##############################################################################
# uncomment the following line for dynamically loading views
# set_property(TARGET ${PROJECT_NAME} PROPERTY ENABLE_EXPORTS ON)

# ##############################################################################

add_subdirectory(test)

# add_executable(${PROJECT_NAME}_test test/test_main.cc)

# target_link_libraries(${PROJECT_NAME}_test PRIVATE drogon)

# ParseAndAddDrogonTests(${PROJECT_NAME}_test)
