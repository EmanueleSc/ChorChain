
        'use strict'
        const { Contract } = require('fabric-contract-api')
        const { ChoreographyState, Status } = require('../ledger-api/choreographystate')
        const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')
        const chorID = '9fe1294e-8169-453d-b29a-97231beafdf9'
        const contractName = 'org.hyreochain.choreographyprivatedata_9fe1294e-8169-453d-b29a-97231beafdf9'
        const chorElements = [
            'Event_0lm8p7m','Message_1ikf3sd','Message_1e86ejs','Message_01dlbl5','Event_1icqmh1',
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
                choreography.setEnable('Event_0lm8p7m')
                await choreography.updateState(ctx)
                return choreography
            }

            
        async Event_0lm8p7m(ctx) {
            const choreography = await ChoreographyState.getState(ctx, chorID)

            if(choreography.elements.Event_0lm8p7m === Status.ENABLED) {
                choreography.setDone('Event_0lm8p7m')
                
            choreography.setEnable('Message_01dlbl5')
            await choreography.updateState(ctx)
        

                return choreography
            } else {
                throw new Error('Element Event_0lm8p7m not ENABLED')
            }
        }
    

            

            

            
            async Message_01dlbl5(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_01dlbl5 === Status.ENABLED && roles.Role1 === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.Role1Role2, chorID)
                    choreography.setDone('Message_01dlbl5')
                    
                    choreography.setEnable('Message_1e86ejs')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.Role1Role2)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_01dlbl5 is not ENABLED or submitter not allowed, only the Role1 can send this transaction')
                }
            }
        

            async Message_1e86ejs(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1e86ejs === Status.ENABLED && roles.Role2 === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.Role1Role2, chorID)
                    choreography.setDone('Message_1e86ejs')
                    
                    choreography.setEnable('Message_1ikf3sd')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.Role1Role2)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1e86ejs is not ENABLED or submitter not allowed, only the Role2 can send this transaction')
                }
            }
        

            async Message_1ikf3sd(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1ikf3sd === Status.ENABLED && roles.Role3 === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.Role2Role3, chorID)
                    choreography.setDone('Message_1ikf3sd')
                    
                    choreography.setEnable('Event_1icqmh1')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.Role2Role3)
await this.Event_1icqmh1(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1ikf3sd is not ENABLED or submitter not allowed, only the Role3 can send this transaction')
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

    