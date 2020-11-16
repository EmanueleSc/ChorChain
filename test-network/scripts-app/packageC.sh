#!/bin/bash

CC_NAME="$1"
MODEL_ID="$2"
VERSION="$3"
: ${CC_NAME:="choreographyprivatedatacontract"}
: ${MODEL_ID:="example"}
: ${VERSION:="1"}

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
CC_SRC_PATH=$SCRIPT_PATH/../../chaincode/

export PATH=${SCRIPT_PATH}/../../bin:${SCRIPT_PATH}:$PATH
export FABRIC_CFG_PATH=$SCRIPT_PATH/../../config/
export ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations


# import utils
. $SCRIPT_PATH/envV.sh

packageChaincode() {
  ORG=$1
  setGlobals $ORG $MODEL_ID
  set -x
  peer lifecycle chaincode package ${SCRIPT_PATH}/../chaincode-artifacts/${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CC_NAME}_${VERSION} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode packaging on peer0.org${ORG} has failed"
  echo "===================== Chaincode is packaged on peer0.org${ORG} ===================== "
  echo
}

## package the chaincode
packageChaincode 1

sleep 10

exit 0