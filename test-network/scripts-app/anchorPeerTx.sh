#!/bin/bash

CHANNEL_NAME="$1"
PROFILE_TX="$2" # The profile specified in configtx.yaml
ORGMSP="$3"
MODEL_ID="$4"
DELAY="$5"
MAX_RETRY="$6"
VERBOSE="$7"
: ${CHANNEL_NAME:="mychannel"}
: ${PROFILE_TX:="TwoOrgsChannel"}
: ${ORGMSP:="Org1MSP"}
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

createAncorPeerTx() {
    export FABRIC_CFG_PATH=$SCRIPT_PATH/../configtx/$MODEL_ID
	${BIN_DIR}/configtxgen -profile ${PROFILE_TX} -outputAnchorPeersUpdate ${ARTIFACTS_DIR}/${ORGMSP}anchors.tx -channelID $CHANNEL_NAME -asOrg ${ORGMSP}
	if [ $? -ne 0 ]; then
		echo "Failed to generate anchor peer update for ${ORGMSP}..."
		exit 1
	fi
	echo "#######    Generating anchor peer update for ${ORGMSP}  ##########"
}

createAncorPeerTx
sleep $DELAY
exit 0
