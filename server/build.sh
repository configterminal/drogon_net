cd ./build &&
# 如果使用本地的 OpenSSL，首先需要编译它
# cd ../third_party/openssl
# ./Configure
# make
# cd ../../build
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl -DOPENSSL_LIBRARIES=/usr/local/opt/openssl/lib .. &&
# 或者使用本地的 OpenSSL：
# cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -DOPENSSL_ROOT_DIR=../third_party/openssl .. &&
make
