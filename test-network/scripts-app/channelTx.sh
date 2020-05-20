#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ARTIFACTS_DIR=$SCRIPT_PATH/../channel-artifacts
BIN_DIR=$SCRIPT_PATH/../../bin

CHANNEL_NAME="$1"
PROFILE_TX="$2" ## The profile specified in configtx.yaml
DELAY="$3"
MAX_RETRY="$4"
VERBOSE="$5"
: ${CHANNEL_NAME:="mychannel"}
: ${PROFILE_TX:="TwoOrgsChannel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

if [ ! -d "$ARTIFACTS_DIR" ]; then
	mkdir $ARTIFACTS_DIR
fi

createChannelTx() {
	export FABRIC_CFG_PATH=$SCRIPT_PATH/../configtx
	set -x
	${BIN_DIR}/configtxgen -profile ${PROFILE_TX} -outputCreateChannelTx ${ARTIFACTS_DIR}/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate channel configuration transaction..."
		exit 1
	fi
	echo
    exit 0
}

createChannelTx
