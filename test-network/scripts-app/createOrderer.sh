#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
BIN_DIR=$SCRIPT_PATH/../../bin
ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations
IMAGETAG="latest"

# id of choreography model
MODEL_ID="$1"
# CA name defined in docker-compose-ca-{idModel}.yaml
CA_NAME="$2"
# CA port defined in docker-compose-ca-{idModel}.yaml
CA_PORT="$3"
# CA address, localhost default
CA_ADDRESS="$4"
: ${MODEL_ID:="example"}
: ${CA_NAME:="ca_orderer"}
: ${CA_PORT:=9054}
: ${CA_ADDRESS:="localhost"}


function createOrderer() {
    echo
    echo "########################################################"
    echo "############ Create Orderer Org Identities #############"
    echo "########################################################"

    registerEnrollOrderer

#  echo
#  echo "Generate CCP files for Org1, Org2 and Org3"
#  ./organizations/ccp-generate.sh
}


function registerEnrollOrderer {
    local ORG_DIR="${MODEL_ID}.com"
    local ORD_DIR="orderer.${MODEL_ID}.com"
    local ORG_CA_DIR="ordererOrg-${MODEL_ID}"

    echo
    echo "Enroll the CA admin"
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/

    export FABRIC_CA_CLIENT_HOME=${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/
    
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
        OrganizationalUnitIdentifier: orderer" > ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/config.yaml


    local ORDERER_ID="orderer.${MODEL_ID}"
    local ORDERER_PW="ordererpw"
    echo
	echo "Register ${ORDERER_ID}"
    echo
    set -x
	${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name ${ORDERER_ID} --id.secret ${ORDERER_PW} --id.type orderer --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    #echo
    #echo "Register user"
    #echo
    #set -x
    #${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    #set +x

    local ADMIN_ID="ordererAdmin.${MODEL_ID}"
    local ADMIM_PW="ordererAdminpw"
    echo
    echo "Register orderer admin ${ADMIN_ID}"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client register --caname ${CA_NAME} --id.name ${ADMIN_ID} --id.secret ${ADMIM_PW} --id.type admin --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORG_DIR}/
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/

    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/msp/
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/

    echo
    echo "## Generate the ${ORDERER_ID} msp"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client enroll -u https://${ORDERER_ID}:${ORDERER_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/msp --csr.hosts ${ORD_DIR} --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/config.yaml ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/msp/config.yaml

    echo
    echo "## Generate the ${ORDERER_ID} tls certificates"
    echo
    set -x
    ${BIN_DIR}/fabric-ca-client enroll -u https://${ORDERER_ID}:${ORDERER_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls --enrollment.profile tls --csr.hosts ${ORD_DIR} --csr.hosts localhost --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/ca.crt
    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/signcerts/* ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/server.crt
    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/keystore/* ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/server.key

    mkdir ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/msp/tlscacerts
    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/msp/tlscacerts/tlsca.${ORG_DIR}-cert.pem

    mkdir ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/tlscacerts
    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/orderers/${ORD_DIR}/tls/tlscacerts/* ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/tlscacerts/tlsca.${ORG_DIR}-cert.pem

    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/users
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}
    mkdir -p ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp

    echo
    echo "## Generate the orderer Admin@${ORG_DIR} msp"
    echo
    set -x
	${BIN_DIR}/fabric-ca-client enroll -u https://${ADMIN_ID}:${ADMIM_PW}@${CA_ADDRESS}:${CA_PORT} --caname ${CA_NAME} -M ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp --tls.certfiles ${ORGANIZATIONS_PATH}/fabric-ca/${ORG_CA_DIR}/tls-cert.pem
    set +x

    cp ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/msp/config.yaml ${ORGANIZATIONS_PATH}/ordererOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp/config.yaml

}

createOrderer
exit 0
