#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
BIN_DIR=$SCRIPT_PATH/../../bin
IMAGETAG="latest"
COMPOSE_PROJECT_NAME=net
SYS_CHANNEL=system-channel

# id of choreography model
MODEL_ID="$1"
: ${MODEL_ID:="example"}

function createConsortium() {
    export FABRIC_CFG_PATH=${SCRIPT_PATH}/../configtx/${MODEL_ID}

    echo "#########  Generating Orderer Genesis block for net_${MODEL_ID} ##############"

    set -x
    ${BIN_DIR}/configtxgen -profile OrgsOrdererGenesis -channelID system-channel -outputBlock ${SCRIPT_PATH}/../system-genesis-block/genesis.block
    res=$?
    set +x

    if [ $res -ne 0 ]; then
      echo "Failed to generate orderer genesis block..."
      exit 1
    fi
}


function networkUp() {
    DATABASE="leveldb"
    COMPOSE_FILE_BASE="${SCRIPT_PATH}/../docker/docker-compose-test-net-${MODEL_ID}.yaml"
    COMPOSE_FILES="-f ${COMPOSE_FILE_BASE}"

    # couchdb not supported
    #if ["${DATABASE}" == "couchdb"]; then
    #    COMPOSE_FILES="${COMPOSE_FILES} -f ${COMPOSE_FILE_COUCH}"
    #fi

    IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} up -d 2>&1

    docker ps -a
    if [ $? -ne 0 ]; then
      echo "ERROR !!!! Unable to start network"
      exit 1
    fi
}

createConsortium
networkUp
exit 0
