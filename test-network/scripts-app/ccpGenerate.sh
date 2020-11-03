#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations

# number of the organisation
COUNTER="$1"
# id of choreography model
MODEL_ID="$2"
# peer0 port (of the org)
P0PORT="$3"
# ca port (of the org)
CAPORT="$4"
: ${COUNTER:=1}
: ${MODEL_ID:="example"}
: ${P0PORT:=7051}
: ${CAPORT:=7054}


function ccpGenerate() {
    echo
    echo "##########################################################"
    echo "############ Generate CCP files for Org${COUNTER}#########"
    echo "##########################################################"

    ORG=org${COUNTER}.${MODEL_ID}.com
    PEERPEM=organizations/peerOrganizations/${ORG}/tlsca/tlsca.${ORG}-cert.pem
    CAPEM=organizations/peerOrganizations/${ORG}/ca/ca.${ORG}-cert.pem
    ORG_MSP=Org${COUNTER}MSP${MODEL_ID}
    CA_NAME=ca_org${COUNTER}_${MODEL_ID}

    echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_MSP $CA_NAME)" > ${ORGANIZATIONS_PATH}/peerOrganizations/${PEER_ORG_DIR}/connection-org${COUNTER}.json
    echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_MSP $CA_NAME)" > ${ORGANIZATIONS_PATH}/peerOrganizations/${PEER_ORG_DIR}/connection-org${COUNTER}.yaml
}

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s/\${ORG_MSP}/$6/" \
        -e "s/\${CA_NAME}/$7/" \
        ${ORGANIZATIONS_PATH}/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s/\${ORG_MSP}/$6/" \
        -e "s/\${CA_NAME}/$7/" \
        ${ORGANIZATIONS_PATH}/ccp-template.yaml | sed -e $'s/\\\\n/\\\n        /g'
}

ccpGenerate
exit 0