const ChannelU = require('../utils/channelu')

// Using ChannelU
const main = async () => {
    try {
        const channelName = 'channel123'
        const configTxProfile = 'ThreeOrgsChannel' // need to be specified in configtx.yaml file (test_network)
        await ChannelU.generateChannelTransaction(channelName, configTxProfile)

        for(let i = 1; i <= 3; i++) {
            await ChannelU.generateAnchorPeerTransaction(channelName, configTxProfile, `Org${i}MSP`)
        }

        const client = await ChannelU.createClient('org1.example.com', 'Org1MSP', 'connection-org1.yaml')
        await ChannelU.createChannel(client, channelName)
        await ChannelU.joinChannel(client, channelName, 'org1.example.com', 'grpcs://localhost:7051')

        const client2 = await ChannelU.createClient('org2.example.com', 'Org2MSP', 'connection-org2.yaml')
        await ChannelU.joinChannel(client2, channelName, 'org2.example.com', 'grpcs://localhost:9051')

        const client3 = await ChannelU.createClient('org3.example.com', 'Org3MSP', 'connection-org3.yaml')
        await ChannelU.joinChannel(client3, channelName, 'org3.example.com', 'grpcs://localhost:11051')
        
        // update anchor peers to channel definition
        console.log('Update the 3Orgs Anchor Peers')
        //await ChannelU.update3OrgsAnchorPeers(channelName)

        console.log('Deploying the 3Orgs Contract')
        await ChannelU.deploy3OrgsContract(channelName, 1)

    } catch (error) {
        console.log('\n ----- ERROR -----')
        console.log(error)
    }
}

main()
