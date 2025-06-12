# Nightingale
A HTTP/gRPC server to proxy to BLE devices. For use with frameworks that do not have a native BLE stack

# Why ?

Not all languages have a framework or a library that allows talking to BLE GATT servers 
This library aims at creating a sort of "proxy" to talk to BLE GATT servers by using an HTTP or gRPC proxy

## This can be used in situations where
1) You want to create a desktop app to work with BLE sensors and cant find a good bluetooth library stack
2) You want to interact with a BLE device using normal HTTP or gRPC mechanism to normalize all outbound network protcols in your app
3) to allow multiple asynchronous clients to reuse a single BLE connection to satisfy multiple clients via simple HTTP ( clients can be created in any language of choice). This is almost like a dumb HTTP/gRPC gateway to a BLE connection behind the scenes
4) add typical authentication and authorization mechanism to BLE devices by creating a auth-proxy layer ( optional )


# Project files
The project is laid out in the following manner

* http folder - this folder contains the http server based on express
* grpc folder - this folder contains the grpc server based on grpc-node
* esp32-fw - firmware for a sample BLE GATT server sending out mock heart rate on a standard charcateristics + other configurable goodies
* root - everythign needed to run this as a docker container if need be

# Server defaults

## http server

* runs on port 3000 ( can be configured )
* by default doesnt have any authentication configured ( can be configured separately, see the docs below )
* http by default (TLS can be enabled optionally, please see docs below )

## grpc server
* runs on port 3001
* by default doesnt have any authentication configured ( can be configured separately, see the docs below )
* TLS can be enabled optionally, please see docs below 

