const ChannelU = require('../utils/channelu')

// Using ChannelU
const main = async () => {
    try {
        const channelName = 'channel12'
        const configTxProfile = 'TwoOrgsChannel' // need to be specified in configtx.yaml file (test_network)
        await ChannelU.generateChannelTransaction(channelName, configTxProfile)

        const client = await ChannelU.createClient('org1.example.com', 'Org1MSP', 'connection-org1.yaml')
        await ChannelU.createChannel(client, channelName)
        await ChannelU.joinChannel(client, channelName, 'org1.example.com', 'grpcs://localhost:7051')

        const client2 = await ChannelU.createClient('org2.example.com', 'Org2MSP', 'connection-org2.yaml')
        await ChannelU.joinChannel(client2, channelName, 'org2.example.com', 'grpcs://localhost:9051')

        // console.log('Deploying the Contract')
        // await ChannelU.deployContract(channelName, 3, 1, 2)
        
    } catch (error) {
        console.log('\n ----- ERROR -----')
        console.log(error)
    }
}

main()
