#!/bin/bash

# Fabric version
VERSION=2.0.0
# Fabric CA version
CA_VERSION=1.4.6
# Version of thirdparty images (couchdb, kafka and zookeeper) released
THIRDPARTY_IMAGE_VERSION=0.4.18

# Print the usage message
function printHelp() {
  echo "Description: "
  echo "    Facilitates the installation of the necessary tools to get the hyperledger \"test_network\" running."
  echo "    It does the following operations:"
  echo "        1. Remove hyperledger docker containers"
  echo "        2. Delete hyperledger docker images"
  echo "        3. Delete all unused docker volumes"
  echo "        4. Delete all unused docker networks"
  echo "        5. Tear down the running network \"test_network\""
  echo "        6. Install the Hyperledger Fabric platform-specific binaries, config files and pull docker images"
  echo "           - Fabric Version:              2.0.0"
  echo "           - CA Version:                  1.4.6"
  echo "           - Thirdparty images Version:   0.4.18"
  echo "    If you have already installed the tools in step 6, please consider the flag -s"
  echo
  echo "Usage:"
  echo "  bootstrap.sh [Flags]"
  echo "    Flags:"
  echo "    -s : bypass tool installation at step 6"
  echo "    -h : print this message"
  echo
  echo "WARNING!"
  echo "    You may have other docker volumes and networks that may be deleted."
  echo "    Consider skipping the commands when asked at steps 3 and 4."
  echo
}

# Remove hyperledger docker containers
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /hyperledger.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" ] || [ "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

# Delete hyperledger docker images
function removeImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /hyperledger.*/ || /dev-peer*/) {print $3}')
  # if the length of string is zero (-z) or empty.
  if [ -z "$DOCKER_IMAGE_IDS" ] || [ "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Delete all unused docker volumes
function removeVolumes() {
  echo
  echo "Your current volumes:"
  docker volume ls
  echo
  echo "WARNING! Skip this command if you have your volumes"
  docker volume prune
}

# Delete all unused docker networks
function removeNetwork() {
  echo
  echo "Your current networks:"
  docker network ls
  echo
  echo "WARNING! Skip this command if you have your networks"
  docker network prune
}

# Tear down running network
function networkDown() {
  # stop org3 containers also in addition to org1 and org2, in case we were running sample to add org3
  docker-compose -f $COMPOSE_FILE_BASE -f $COMPOSE_FILE_COUCH -f $COMPOSE_FILE_CA down --volumes --remove-orphans
  docker-compose -f $COMPOSE_FILE_COUCH_ORG3 -f $COMPOSE_FILE_ORG3 down --volumes --remove-orphans
  # Don't remove the generated artifacts -- note, the ledgers are always removed
  
  # Bring down the network, deleting the volumes
  #Delete any ledger backups
  docker run -v $PWD/test-network:/tmp/test-network --rm hyperledger/fabric-tools:$IMAGETAG rm -Rf /tmp/test-network/ledgers-backup
  
  #Cleanup the chaincode containers
  clearContainers
  #Cleanup images
  removeImages
  #Cleanup volumes
  removeVolumes
  #Cleanup network
  removeNetwork
  
  # remove orderer block and other channel configuration transactions and certs
  rm -rf test-network/system-genesis-block/*.block 
  rm -rf test-network/organizations/peerOrganizations 
  rm -rf test-network/organizations/ordererOrganizations
  ## remove fabric ca artifacts
  rm -rf test-network/organizations/fabric-ca/org1/msp organizations/fabric-ca/org1/tls-cert.pem organizations/fabric-ca/org1/ca-cert.pem organizations/fabric-ca/org1/IssuerPublicKey organizations/fabric-ca/org1/IssuerRevocationPublicKey organizations/fabric-ca/org1/fabric-ca-server.db
  rm -rf test-network/organizations/fabric-ca/org2/msp organizations/fabric-ca/org2/tls-cert.pem organizations/fabric-ca/org2/ca-cert.pem organizations/fabric-ca/org2/IssuerPublicKey organizations/fabric-ca/org2/IssuerRevocationPublicKey organizations/fabric-ca/org2/fabric-ca-server.db
  rm -rf test-network/organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db
  rm -rf test-network/addOrg3/fabric-ca/org3/msp addOrg3/fabric-ca/org3/tls-cert.pem addOrg3/fabric-ca/org3/ca-cert.pem addOrg3/fabric-ca/org3/IssuerPublicKey addOrg3/fabric-ca/org3/IssuerRevocationPublicKey addOrg3/fabric-ca/org3/fabric-ca-server.db

  # remove channel and script artifacts
  rm -rf test-network/channel-artifacts test-network/log.txt test-network/choreographycontract.tar.gz
}

# Install the Hyperledger Fabric platform-specific binaries and config files for 
# the specific version into the /bin and /config directories of fabric-samples.
# More info: https://hyperledger-fabric.readthedocs.io/en/latest/install.html
function installTools() {
  curl -sSL https://bit.ly/2ysbOFE | bash -s -- $VERSION $CA_VERSION $THIRDPARTY_IMAGE_VERSION -s 
}

# default image tag
IMAGETAG="latest"
# use this as the default docker-compose yaml definition
COMPOSE_FILE_BASE=test-network/docker/docker-compose-test-net.yaml
# docker-compose.yaml file if you are using couchdb
COMPOSE_FILE_COUCH=test-network/docker/docker-compose-couch.yaml
# certificate authorities compose file
COMPOSE_FILE_CA=test-network/docker/docker-compose-ca.yaml
# use this as the docker compose couch file for org3
COMPOSE_FILE_COUCH_ORG3=test-network/addOrg3/docker/docker-compose-couch-org3.yaml
# use this as the default docker-compose yaml definition for org3
COMPOSE_FILE_ORG3=test-network/addOrg3/docker/docker-compose-org3.yaml

BINARIES=true

# parse flags
while [[ $# -ge 1 ]] ; do
  key="$1"
  case $key in
  -h )
    printHelp
    exit 0
    ;;
  -s )
    BINARIES=false
    shift
    ;;
  * )
    echo
    echo "Unknown flag: $key"
    echo
    printHelp
    exit 1
    ;;
  esac
  shift
done

networkDown

if [ "$BINARIES" == "true" ]; then
    echo
    echo "Pull Hyperledger Fabric binaries and Fabric docker images"
    echo
    installTools
fi