#!/bin/bash

CHANNEL_NAME="$1"
DELAY="$2"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ARTIFACTS_DIR=$SCRIPT_PATH/../channel-artifacts

export PATH=${SCRIPT_PATH}/../../bin:${SCRIPT_PATH}:$PATH
export FABRIC_CFG_PATH=$SCRIPT_PATH/../../config/
export ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations


# import utils
. $SCRIPT_PATH/envV.sh

updateAnchorPeers() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ${ARTIFACTS_DIR}/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
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

echo "Updating anchor peers for org1..."
updateAnchorPeers 1
echo "Updating anchor peers for org2..."
updateAnchorPeers 2
echo "Updating anchor peers for org3..."
updateAnchorPeers 3

sleep $DELAY
exit 0
