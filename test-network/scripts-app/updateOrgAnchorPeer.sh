#!/bin/bash

CHANNEL_NAME="$1"
ORG_COUNTER="$2"
MODEL_ID="$3"
ORDERER_ADDRESS="$4"
DELAY="$5"
: ${CHANNEL_NAME:="mychannel"}
: ${ORG_COUNTER:="1"}
: ${MODEL_ID:="example"}
: ${ORDERER_ADDRESS:="localhost:7050"}
: ${DELAY:="3"}

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ARTIFACTS_DIR=$SCRIPT_PATH/../channel-artifacts

export PATH=${SCRIPT_PATH}/../../bin:${SCRIPT_PATH}:$PATH
export FABRIC_CFG_PATH=$SCRIPT_PATH/../../config/
export ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations


# import utils
. $SCRIPT_PATH/envV.sh

updateAnchorPeers() {
  setGlobals $ORG_COUNTER $MODEL_ID
  set -x
  peer channel update -o $ORDERER_ADDRESS --ordererTLSHostnameOverride $ORDERER_DOM -c $CHANNEL_NAME -f ${ARTIFACTS_DIR}/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Anchor peer update failed"
  echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
  sleep $DELAY
  echo
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}

echo "Updating anchor peers for org${ORG_COUNTER}.${MODEL_ID}.com ..."
updateAnchorPeers

sleep $DELAY
exit 0
