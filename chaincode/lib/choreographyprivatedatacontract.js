
        'use strict'
        const { Contract } = require('fabric-contract-api')
        const { ChoreographyState, Status } = require('../ledger-api/choreographystate')
        const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')
        const chorID = 'ffe1f4df-9b25-4c2d-9577-60400705e55b'
        const contractName = 'org.hyreochain.choreographyprivatedata_ffe1f4df-9b25-4c2d-9577-60400705e55b'
        const chorElements = [
            'Event_04dc3oj','Message_0ynorau','Message_1h5bieh','Event_1haujxq',
        ]
        const roles = { Role1: 'Org1MSP', Role2: 'Org2MSP', Role3: 'Org3MSP',  }
        const collectionsPrivate = {
            Role1Role2: 'collection' + roles.Role1 + roles.Role2, Role1Role3: 'collection' + roles.Role1 + roles.Role3, Role2Role3: 'collection' + roles.Role2 + roles.Role3, 
        }

        class ChoreographyPrivateDataContract extends Contract {
            constructor() {
                super(contractName)
            }

            async instantiate(ctx) {
                const choreography = new ChoreographyState({ chorID })
                choreography.initElements(chorElements)
                choreography.setEnable('Event_04dc3oj')
                await choreography.updateState(ctx)
                return choreography
            }

            
        async Event_04dc3oj(ctx) {
            const choreography = await ChoreographyState.getState(ctx, chorID)

            if(choreography.elements.Event_04dc3oj === Status.ENABLED) {
                choreography.setDone('Event_04dc3oj')
                
            choreography.setEnable('Message_1h5bieh')
            await choreography.updateState(ctx)
        

                return choreography
            } else {
                throw new Error('Element Event_04dc3oj not ENABLED')
            }
        }
    

            

            

            
            async Message_1h5bieh(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1h5bieh === Status.ENABLED && roles.Role1 === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.Role1Role2, chorID)
                    choreography.setDone('Message_1h5bieh')
                    
                    choreography.setEnable('Message_0ynorau')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.Role1Role2)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1h5bieh is not ENABLED or submitter not allowed, only the Role1 can send this transaction')
                }
            }
        

            async Message_0ynorau(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0ynorau === Status.ENABLED && roles.Role3 === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.Role1Role3, chorID)
                    choreography.setDone('Message_0ynorau')
                    
                    choreography.setEnable('Event_1haujxq')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.Role1Role3)
await this.Event_1haujxq(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0ynorau is not ENABLED or submitter not allowed, only the Role3 can send this transaction')
                }
            }
        


            async queryChorState(ctx) {
                let privateState, privateCollection 
                let resp = {}
        
                // public state
                const choreography = await ChoreographyState.getState(ctx, chorID)
                resp.choreography = choreography
                resp.choreographyPrivate = {}
        
                const mspid = ctx.stub.getCreator().mspid
                const k1 = Object.keys(roles).find(key => roles[key] === 'Org1MSP')
                const k2 = Object.keys(roles).find(key => roles[key] === 'Org2MSP')
                const k3 = Object.keys(roles).find(key => roles[key] === 'Org3MSP')
        
                if(mspid === 'Org1MSP') {
                    privateCollection = k1 + k2
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
        
                    privateCollection = k1 + k3
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
                }
                else if(mspid === 'Org2MSP') {
                    privateCollection = k1 + k2
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
        
                    privateCollection = k2 + k3
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
                }
                else if(mspid === 'Org3MSP') {
                    privateCollection = k1 + k3
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
        
                    privateCollection = k2 + k3
                    privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID)
                    resp.choreographyPrivate[privateCollection] = privateState
                }
        
                return resp
            }

        }

        module.exports = ChoreographyPrivateDataContract

    