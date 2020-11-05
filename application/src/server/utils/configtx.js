
class ConfigTx {
    constructor(idModel, ordererPort, peer0Ports) {

        const ordererMSP = `OrdererMSP${idModel}`
        const ordererHost = `orderer.${idModel}.com`
        const ordererEndpoint = `orderer.${idModel}.com:${ordererPort}`
        const ordererMSPDir = `../../organizations/ordererOrganizations/${idModel}.com/msp` // configtx(DIR)/idModel(DIR)/organizations/ ...

        this.Organizations = [
            // first elem is the orderer
            {
                Name: ordererMSP,
                ID: ordererMSP,
                MSPDir: ordererMSPDir,
                Policies: {
                    Readers: { Type: 'Signature', Rule: `OR('${ordererMSP}.member')` },
                    Writers: { Type: 'Signature', Rule: `OR('${ordererMSP}.member')` },
                    Admins: { Type: 'Signature', Rule: `OR('${ordererMSP}.admin')` }
                },
                OrdererEndpoints: [ordererEndpoint]
            }
        ]

        ConfigTx.addOrgs(this.Organizations, idModel, peer0Ports)

        this.Capabilities = {
            Channel: { V2_0: true },
            Orderer: { V2_0: true },
            Application: { V2_0: true }
        }

        this.Application = {
            Organizations: null,
            Policies: {
                Readers: { Type: 'ImplicitMeta', Rule: "ANY Readers" },
                Writers: { Type: 'ImplicitMeta', Rule: "ANY Writers" },
                Admins: { Type: 'ImplicitMeta', Rule: "MAJORITY Admins" },
                LifecycleEndorsement: { Type: 'ImplicitMeta', Rule: "MAJORITY Endorsement" },
                Endorsement: { Type: 'ImplicitMeta', Rule: "MAJORITY Endorsement" }
            },
            Capabilities: this.Capabilities.Application
        }

        this.Orderer = {
            OrdererType: 'etcdraft',
            EtcdRaft: {
                Consenters: [
                    {
                        Host: ordererHost,
                        Port: ordererPort,
                        ClientTLSCert: `../../organizations/ordererOrganizations/${idModel}.com/orderers/${ordererHost}/tls/server.crt`,
                        ServerTLSCert: `../../organizations/ordererOrganizations/${idModel}.com/orderers/${ordererHost}/tls/server.crt`
                    }
                ]
            },
            BatchTimeout: '2s',
            BatchSize: {
                MaxMessageCount: 10,
                AbsoluteMaxBytes: '99 MB',
                PreferredMaxBytes: '512 KB',
            },
            Organizations: null,
            Policies: {
                Readers: { Type: 'ImplicitMeta', Rule: "ANY Readers" },
                Writers: { Type: 'ImplicitMeta', Rule: "ANY Writers" },
                Admins: { Type: 'ImplicitMeta', Rule: "MAJORITY Admins" },
                BlockValidation: { Type: 'ImplicitMeta', Rule: "ANY Writers" }
            }
        }

        this.Channel = {
            Policies: {
                Readers: { Type: 'ImplicitMeta', Rule: "ANY Readers" },
                Writers: { Type: 'ImplicitMeta', Rule: "ANY Writers" },
                Admins: { Type: 'ImplicitMeta', Rule: "MAJORITY Admins" }
            },
            Capabilities: this.Capabilities.Channel
        }

        const OrdererProfile = Object.assign(this.Orderer, { Organizations: [this.Organizations[0]], Capabilities: this.Capabilities.Orderer })
        const OrganizationsProfile = []
        this.Organizations.forEach((o, i) => {
            if(i !== 0) { // skip orderer organization
                OrganizationsProfile.push(o)
            }  
        })

        const ApplicationProfile = Object.assign(this.Application, { Organizations: OrganizationsProfile, Capabilities: this.Capabilities.Application })

        this.Profiles = {
            OrgsOrdererGenesis: {
                Policies: this.Channel.Policies,
                Capabilities: this.Channel.Capabilities,
                Orderer: OrdererProfile,
                Consortiums: {
                    SampleConsortium: {
                        Organizations: OrganizationsProfile
                    }
                }
            },
            OrgsChannel: {
                Consortium: 'SampleConsortium',
                Policies: this.Channel.Policies,
                Capabilities: this.Channel.Capabilities,
                Application: ApplicationProfile
            }
        }

    }

    static addOrgs(orgs, idModel, peer0Ports) {
        for(let i = 0; i < peer0Ports.length; i++) {
            const orgMSP = `Org${i+1}MSP${idModel}`
            const orgPort = peer0Ports[i]
            const orgDir = `org${i+1}.${idModel}.com`
            const orgMSPDir = `../../organizations/peerOrganizations/${orgDir}/msp`

            orgs.push({
                // next elements are the orgs/peers
                Name: orgMSP,
                ID: orgMSP,
                MSPDir: orgMSPDir,
                Policies: {
                    Readers: { Type: 'Signature', Rule: `OR("${orgMSP}.admin", "${orgMSP}.peer", "${orgMSP}.client")` },
                    Writers: { Type: 'Signature', Rule: `OR("${orgMSP}.admin", "${orgMSP}.client")` },
                    Admins: { Type: 'Signature', Rule: `OR("${orgMSP}.admin")` },
                    Endorsement: { Type: 'Signature', Rule: `OR("${orgMSP}.peer")` }
                },
                AnchorPeers: [
                    { Host: `peer0.${orgDir}`, Port: orgPort }
                ]
            })
        }
    }
}

module.exports = ConfigTx