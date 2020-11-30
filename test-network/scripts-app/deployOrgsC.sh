#!/bin/bash

CHANNEL_NAME="$1"
CC_NAME="$2"
VERSION="$3"
COLLECTION_POLICY="$4"
MODEL_ID="$5"
NUM_ORGS="$6"
ORDERER_ADDRESS="$7"
DELAY="$8"
MAX_RETRY="$9"
: ${CHANNEL_NAME:="mychannel"}
: ${CC_NAME:="choreographyprivatedatacontract"}
: ${VERSION:="1"}
: ${COLLECTION_POLICY:="NA"}
: ${MODEL_ID:="example"}
: ${NUM_ORGS:="3"}
: ${ORDERER_ADDRESS:="localhost:7050"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
# CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
# CC_SRC_PATH=$SCRIPT_PATH/../../chaincode/
COLLECTION_CONFIG=${SCRIPT_PATH}/../collections_config.json

export PATH=${SCRIPT_PATH}/../../bin:${SCRIPT_PATH}:$PATH
export FABRIC_CFG_PATH=$SCRIPT_PATH/../../config/
export ORGANIZATIONS_PATH=$SCRIPT_PATH/../organizations


# import utils
. $SCRIPT_PATH/envV.sh


# installChaincode PEER ORG
installChaincode() {
  ORG=$1
  setGlobals $ORG $MODEL_ID
  set -x
  peer lifecycle chaincode install ${SCRIPT_PATH}/../chaincode-artifacts/${CC_NAME}.tar.gz >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode installation on peer0.org${ORG} has failed"
  echo "===================== Chaincode is installed on peer0.org${ORG} ===================== "
  echo
}

# queryInstalled PEER ORG
queryInstalled() {
  ORG=$1
  setGlobals $ORG $MODEL_ID
  set -x
  peer lifecycle chaincode queryinstalled >&log.txt
  res=$?
  set +x
  cat log.txt
  PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
  verifyResult $res "Query installed on peer0.org${ORG} has failed"
  echo PackageID is ${PACKAGE_ID}
  echo "===================== Query installed successful on peer0.org${ORG} on channel ===================== "
  echo
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {
  ORG=$1
  setGlobals $ORG $MODEL_ID
  computeMSPs $NUM_ORGS $MODEL_ID
  local END_POLICY="OR($MSPs)" # e.g. "OR('Org1MSP.member','Org2MSP.member','Org3MSP.member')"
  set -x
  peer lifecycle chaincode approveformyorg -o $ORDERER_ADDRESS --ordererTLSHostnameOverride $ORDERER_DOM --collections-config $COLLECTION_CONFIG --signature-policy $END_POLICY --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} >&log.txt
  set +x
  cat log.txt
  verifyResult $res "Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME' ===================== "
  echo
}

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  computeMSPs $NUM_ORGS $MODEL_ID
  local END_POLICY="OR($MSPs)" # e.g. "OR('Org1MSP.member','Org2MSP.member','Org3MSP.member')"

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  set -x
  peer lifecycle chaincode commit -o $ORDERER_ADDRESS --ordererTLSHostnameOverride $ORDERER_DOM --collections-config $COLLECTION_CONFIG --signature-policy $END_POLICY --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode definition commit failed on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
  echo
}

# queryCommitted ORG
queryCommitted() {
  ORG=$1
  setGlobals $ORG $MODEL_ID
  EXPECTED_RESULT="Version: ${VERSION}, Sequence: ${VERSION}, Endorsement Plugin: escc, Validation Plugin: vscc"
  echo "===================== Querying chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
    # we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    echo "Attempting to Query committed status on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} >&log.txt
    res=$?
    set +x
	test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: [0-9], Sequence: [0-9], Endorsement Plugin: escc, Validation Plugin: vscc')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
	COUNTER=$(expr $COUNTER + 1)
	done
  echo
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Query chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME' ===================== "
	echo
  else
    echo "!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Query chaincode definition result on peer0.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}

chaincodeInvokeInit() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  set -x
  peer chaincode invoke -o $ORDERER_ADDRESS --ordererTLSHostnameOverride $ORDERER_DOM --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS --isInit -c '{"function":"instantiate","Args":[]}' >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}


## Install chaincode
c=1
while [ $c -le $NUM_ORGS ]
do
echo "Installing chaincode on peer0.org${c}..."
installChaincode $c
((c++))
done

## query whether the chaincode is installed
queryInstalled 1


## write collection policy into the file 'collections_config.json'
cat <<- EOF > ${COLLECTION_CONFIG}

${COLLECTION_POLICY}

EOF
## format the json file
sed -i 's/\\n/\n/g' $COLLECTION_CONFIG


## approve the definition
c=1
while [ $c -le $NUM_ORGS ]
do
echo "approve the definition for org${c}..."
approveForMyOrg $c
((c++))
done

## commit the definition
c=1
while [ $c -le $NUM_ORGS ]
do
echo "commit the definition for org${c}..."
commitChaincodeDefinition $c
((c++))
done

## query on orgs to see that the definition committed successfully
c=1
while [ $c -le $NUM_ORGS ]
do
echo "query if committed successfully on org${c}..."
queryCommitted $c
((c++))
done

## invoke the chaincode
c=1
while [ $c -le $NUM_ORGS ]
do
echo "invoke the chaincode on org${c}..."
chaincodeInvokeInit $c
((c++))
done

sleep 10

exit 0
