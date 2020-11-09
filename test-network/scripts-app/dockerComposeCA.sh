#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations
IMAGETAG="latest"

# certificate authorities compose file
COMPOSE_FILE_CA="$1"
: ${COMPOSE_FILE_CA:="docker-compose-ca.yaml"}


function runCAs() {
    if [ ! -d "${ORGANIZATIONS_PATH}/fabric-ca" ]; then
        mkdir -p ${ORGANIZATIONS_PATH}/fabric-ca
    fi

    echo
    echo "##########################################################"
    echo "##### Generate certificates using Fabric CA's ############"
    echo "##########################################################"

    IMAGE_TAG=$IMAGETAG docker-compose -f "${SCRIPT_PATH}/../docker/${COMPOSE_FILE_CA}" up -d 2>&1
}

runCAs
exit 0
