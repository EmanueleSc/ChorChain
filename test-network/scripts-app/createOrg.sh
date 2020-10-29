#!/bin/bash

# certificate authorities compose file
COMPOSE_FILE_CA=../docker/docker-compose-ca.yaml
# COMPOSE_FILE_CA=../docker/docker-compose-ca-id.yaml # test (remove!!)
IMAGETAG="latest"

# TODO 
function createOrgs() {

#  if [ -d "organizations/peerOrganizations" ]; then
#    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
#  fi

    echo
    echo "##########################################################"
    echo "##### Generate certificates using Fabric CA's ############"
    echo "##########################################################"

    IMAGE_TAG=$IMAGETAG docker-compose -f $COMPOSE_FILE_CA up -d 2>&1

#    . organizations/fabric-ca/registerEnroll.sh

#    sleep 10

#    echo "##########################################################"
#    echo "############ Create Org1 Identities ######################"
#    echo "##########################################################"

#    createOrg1

#    echo "##########################################################"
#    echo "############ Create Org2 Identities ######################"
#    echo "##########################################################"

#    createOrg2

#    echo "##########################################################"
#    echo "############ Create Orderer Org Identities ###############"
#    echo "##########################################################"

#    createOrderer


#  echo
#  echo "Generate CCP files for Org1, Org2 and Org3"
#  ./organizations/ccp-generate.sh
}

createOrgs
exit 0
