
export CORE_PEER_TLS_ENABLED=true

# =============================================== TODO =============================================================
# Set OrdererOrg.Admin globals
#setOrdererGlobals() {
#  export CORE_PEER_LOCALMSPID="OrdererMSP"
#  export CORE_PEER_TLS_ROOTCERT_FILE=${ORGANIZATIONS_PATH}/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
#  export CORE_PEER_MSPCONFIGPATH=${ORGANIZATIONS_PATH}/ordererOrganizations/example.com/users/Admin@example.com/msp
#}
# ==================================================================================================================

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"  
  fi

  local MODEL_ID=$2
  local ORG_MSP="Org${USING_ORG}MSP${MODEL_ID}"
  local ORG_DIR="org${USING_ORG}.${MODEL_ID}.com"

  local ORDERER_DIR="${MODEL_ID}.com"
  export ORDERER_DOM="orderer.${MODEL_ID}.com"
  export ORDERER_CA=${ORGANIZATIONS_PATH}/ordererOrganizations/${ORDERER_DIR}/orderers/${ORDERER_DOM}/msp/tlscacerts/tlsca.${ORDERER_DIR}-cert.pem

  echo "Using organization ${ORG_DIR}"

  export CORE_PEER_LOCALMSPID=$ORG_MSP
  export CORE_PEER_TLS_ROOTCERT_FILE=${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/peers/peer0.${ORG_DIR}/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/users/Admin@${ORG_DIR}/msp

  eval $(parse_yaml ${ORGANIZATIONS_PATH}/peerOrganizations/${ORG_DIR}/connection-org${USING_ORG}.yaml)
  local prefix="grpcs://"
  local string=$peers__url
  local PEER0_ADDRESS=${string#"$prefix"}

  export CORE_PEER_ADDRESS=$PEER0_ADDRESS

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

parse_yaml() {
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}

# =============================================== TODO ============================================================
# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
#parsePeerConnectionParameters() {
  # check for uneven number of peer and org parameters

#  PEER_CONN_PARMS=""
#  PEERS=""
#  while [ "$#" -gt 0 ]; do
#    setGlobals $1
#    PEER="peer0.org$1"
#    PEERS="$PEERS $PEER"
#    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
#    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
#      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_ORG$1_CA")
#      PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
#    fi
    # shift by two to get the next pair of peer/org parameters
#    shift
#  done
  # remove leading space for output
#  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
#}
# ==================================================================================================================

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}
