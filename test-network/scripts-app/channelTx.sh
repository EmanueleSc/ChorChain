#!/bin/bash

CHANNEL_NAME="$1"
PROFILE_TX="$2" # The profile specified in configtx.yaml
MODEL_ID="$3"
DELAY="$4"
MAX_RETRY="$5"
VERBOSE="$6"
: ${CHANNEL_NAME:="mychannel"}
: ${PROFILE_TX:="TwoOrgsChannel"}
: ${MODEL_ID:="example"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ARTIFACTS_DIR=$SCRIPT_PATH/../channel-artifacts
BIN_DIR=$SCRIPT_PATH/../../bin

if [ ! -d "$ARTIFACTS_DIR" ]; then
	mkdir $ARTIFACTS_DIR
fi

createChannelTx() {
	export FABRIC_CFG_PATH=$SCRIPT_PATH/../configtx/$MODEL_ID
	${BIN_DIR}/configtxgen -profile ${PROFILE_TX} -outputCreateChannelTx ${ARTIFACTS_DIR}/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
	if [ $? -ne 0 ]; then
		echo "Failed to generate channel configuration transaction..."
		exit 1
	fi
	echo "Channel configuration transaction ${CHANNEL_NAME}.tx generated."
}

createChannelTx
sleep $DELAY
exit 0
