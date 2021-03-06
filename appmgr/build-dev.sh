#!/bin/bash

set -e
shopt -s expand_aliases

if [ "$0" != "./build-dev.sh" ]; then
	>&2 echo "Must be run from appmgr directory"
	exit 1
fi

alias 'rust-arm-builder'='docker run --rm -it -v "$HOME/.cargo/registry":/root/.cargo/registry -v "$(pwd)":/home/rust/src start9/rust-arm-cross:latest'

cd ..
rust-arm-builder sh -c "(cd appmgr && cargo build)"
