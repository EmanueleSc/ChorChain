#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
BIN_DIR=$SCRIPT_PATH/../../bin
ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations
IMAGETAG="latest"

# number of the organisation
COUNTER="$1"
# id of choreography model
MODEL_ID="$2"
# CA name defined in docker-compose-ca-{idModel}.yaml
CA_NAME="$3"
# CA port defined in docker-compose-ca-{idModel}.yaml
CA_PORT="$4"
# CA address, localhost default
CA_ADDRESS="$5"
: ${COUNTER:=1}
: ${MODEL_ID:="example"}
: ${CA_NAME:="ca-org1"}
: ${CA_PORT:=7054}
: ${CA_ADDRESS:="localhost"}



function createOrg() {
    echo
    echo "##########################################################"
    echo "############ Create Org${COUNTER} Identities #############"
    echo "##########################################################"

    registerEnrollOrg
}


function registerEnrollOrg {
    local ORG_DIR="org${COUNTER}.${MODEL_ID}.com"
    local ORG_CA_DIR="org${COUNTER}-${MODEL_ID}"

    echo
    echo "Enroll the CA admin"
    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/

    export FABRIC_CA_CLIENT_HOME=${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/
    
    set -x
    ${BIN_DIR}/fabric-ca-client enroll -u https://admin:adminpw@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    echo "NodeOUs:
    Enable: true
    ClientOUIdentifier:
        Certificate: cacerts/${CA_ADDRESS}-${CA_PORT}-${CA_NAME}.pem
        OrganizationalUnitIdentifier: client
    PeerOUIdentifier:
        Certificate: cacerts/${CA_ADDRESS}-${CA_PORT}-${CA_NAME}.pem
        OrganizationalUnitIdentifier: peer
    AdminOUIdentifier:
        Certificate: cacerts/${CA_ADDRESS}-${CA_PORT}-${CA_NAME}.pem
        OrganizationalUnitIdentifier: admin
    OrdererOUIdentifier:
        Certificate: cacerts/${CA_ADDRESS}-${CA_PORT}-${CA_NAME}.pem
        OrganizationalUnitIdentifier: orderer" > ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/config.yaml


    local PEER_ID="peer0.org${COUNTER}.${MODEL_ID}"
    local PEER_PW="peer0pw"
    echo
	echo "Register ${PEER_ID}"
    echo
    set -x
	${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name ${PEER_ID} --id.secret ${PEER_PW} --id.type peer --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    #echo
    #echo "Register user"
    #echo
    #set -x
    #${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    #set +x

    #local ADMIN_ID="org${COUNTER}admin.${MODEL_ID}"
    local ADMIN_ID="Admin@${ORG_DIR}"
    local ADMIM_PW="adminpw"
    echo
    echo "Register the org admin ${ADMIN_ID}"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name ${ADMIN_ID} --id.secret ${ADMIM_PW} --id.type admin --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/
    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/
    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/msp/
    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/

    echo
    echo "## Generate the ${PEER_ID} msp"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client enroll -u https://${PEER_ID}:${PEER_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/msp --csr.hosts peer0.${ORG_DIR} --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/config.yaml ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/msp/config.yaml

    echo
    echo "## Generate the ${PEER_ID} tls certificates"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client enroll -u https://${PEER_ID}:${PEER_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls --enrollment.profile tls --csr.hosts peer0.${ORG_DIR} --csr.hosts localhost --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/ca.crt
    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/signcerts/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/server.crt
    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/keystore/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/server.key

    mkdir ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/tlscacerts
    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/tlscacerts/ca.crt

    mkdir ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/tlsca
    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/tlsca/tlsca.${ORG_DIR}-cert.pem

    mkdir ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/ca
    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/msp/cacerts/* ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/ca/ca.${ORG_DIR}-cert.pem

    #mkdir -p organizations/peerOrganizations/org1.example.com/users
    #mkdir -p organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com
    #echo
    #echo "## Generate the user msp"
    #echo
    #set -x
	#    fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca-org1 -M ${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/org1/tls-cert.pem
    #set +x

    mkdir -p ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}
    echo
    echo "## Generate the org Admin@${ORG_DIR} msp"
    echo
    set -x
	${BIN_DIR}/fabric-ca-client enroll -u https://${ADMIN_ID}:${ADMIM_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/msp/config.yaml ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp/config.yaml

}

createOrg
exit 0
