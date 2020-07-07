
        'use strict'
        const { Contract } = require('fabric-contract-api')
        const { ChoreographyState, Status } = require('../ledger-api/choreographystate')
        const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')
        const chorID = 'CHOR1'
        const contractName = 'org.chorchain.choreographyprivatedata_1'
        const chorElements = [
            'Event_0tttznh','Gateway_0c09rfi','Gateway_09wrwyw','Gateway_0460x0k','Gateway_03r3vyj','Gateway_0nukfem','Gateway_0wkn4k8','Gateway_0u8aigu','Gateway_06oryac','Message_0pl2dze','Message_0foc0j2','Message_00x4erc','Message_1en4kv8','Message_1d0fq3r','Message_09zwe1j','Message_1u3kcvh','Message_16ikq84','Message_0uwy9oe','Message_0n44po5','Message_0p0m4qc','Message_0311tyt','Message_1m9v97z','Message_0h2m9uo','Message_0tn8489','Message_11j40xz','Gateway_0u101rc','Gateway_1u5n66e','Event_1esg69d',
        ]
        const roles = { Customer: 'Org1MSP', Bike_center: 'Org2MSP', Insurer: 'Org3MSP',  }
        const collectionsPrivate = {
            CustomerBike_center: 'collection' + roles.Customer + roles.Bike_center, CustomerInsurer: 'collection' + roles.Customer + roles.Insurer, Bike_centerInsurer: 'collection' + roles.Bike_center + roles.Insurer, 
        }

        class ChoreographyPrivateDataContract extends Contract {
            constructor() {
                super(contractName)
            }

            async instantiate(ctx) {
                const choreography = new ChoreographyState({ chorID })
                choreography.initElements(chorElements)
                choreography.setEnable('Event_0tttznh')
                await choreography.updateState(ctx)
                return choreography
            }

            
        async Event_0tttznh(ctx) {
            const choreography = await ChoreographyState.getState(ctx, chorID)

            if(choreography.elements.Event_0tttznh === Status.ENABLED) {
                choreography.setDone('Event_0tttznh')
                choreography.setEnable('Gateway_0c09rfi')
                await this.Gateway_0c09rfi(ctx, choreography)

                return choreography
            } else {
                throw new Error('Element Event_0tttznh not ENABLED')
            }
        }
    

            
        async Gateway_0c09rfi(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_0c09rfi === Status.ENABLED) {
                choreography.setDone('Gateway_0c09rfi')
                
                choreography.setEnable('Message_11j40xz')
                await choreography.updateState(ctx)
            
            } else {
                throw new Error('Element Gateway_0c09rfi is not ENABLED')
            }
        }
    

        async Gateway_09wrwyw(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_09wrwyw === Status.ENABLED) {
                choreography.setDone('Gateway_09wrwyw')
                
                if(choreographyPrivate.isAvailable==false) {
                    choreography.setEnable('Gateway_0c09rfi')
                    await this.Gateway_0c09rfi(ctx, choreography, choreographyPrivate)
                }
                
                if(choreographyPrivate.isAvailable==true) {
                    choreography.setEnable('Message_0h2m9uo')
                    await choreography.updateState(ctx)
                }
                
            } else {
                throw new Error('Element Gateway_09wrwyw is not ENABLED')
            }
        }
    

        async Gateway_0460x0k(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_0460x0k === Status.ENABLED) {
                choreography.setDone('Gateway_0460x0k')
                
                if(choreographyPrivate.insuranceReq==false) {
                    choreography.setEnable('Gateway_03r3vyj')
                    await this.Gateway_03r3vyj(ctx, choreography, choreographyPrivate)
                }
                
                if(choreographyPrivate.insuranceReq==true) {
                    choreography.setEnable('Message_1m9v97z')
                    await choreography.updateState(ctx)
                }
                
            } else {
                throw new Error('Element Gateway_0460x0k is not ENABLED')
            }
        }
    

        async Gateway_03r3vyj(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_03r3vyj === Status.ENABLED) {
                choreography.setDone('Gateway_03r3vyj')
                
                choreography.setEnable('Message_0n44po5')
                await choreography.updateState(ctx)
            
            } else {
                throw new Error('Element Gateway_03r3vyj is not ENABLED')
            }
        }
    

        async Gateway_0nukfem(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_0nukfem === Status.ENABLED) {
                choreography.setDone('Gateway_0nukfem')
                
                if(choreographyPrivate.ask==true) {
                    choreography.setEnable('Message_1en4kv8')
                    await choreography.updateState(ctx)
                }
                
                if(choreographyPrivate.ask==false) {
                    choreography.setEnable('Gateway_0wkn4k8')
                    await this.Gateway_0wkn4k8(ctx, choreography, choreographyPrivate)
                }
                
            } else {
                throw new Error('Element Gateway_0nukfem is not ENABLED')
            }
        }
    

        async Gateway_0wkn4k8(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_0wkn4k8 === Status.ENABLED) {
                choreography.setDone('Gateway_0wkn4k8')
                
                choreography.setEnable('Gateway_0u8aigu')
                await this.Gateway_0u8aigu(ctx, choreography, choreographyPrivate)
            
            } else {
                throw new Error('Element Gateway_0wkn4k8 is not ENABLED')
            }
        }
    

        async Gateway_0u8aigu(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.Gateway_0u8aigu === Status.ENABLED) {
                choreography.setDone('Gateway_0u8aigu')
                
                choreography.setEnable('Message_00x4erc')
                await choreography.updateState(ctx)
            
            } else {
                throw new Error('Element Gateway_0u8aigu is not ENABLED')
            }
        }
    


            
        async Gateway_06oryac(ctx, choreography) {

            if(choreography.elements.Gateway_06oryac === Status.ENABLED) {
                choreography.setDone('Gateway_06oryac')
                choreography.setEnable('Message_1u3kcvh')
choreography.setEnable('Message_09zwe1j')

                await choreography.updateState(ctx)
            } else {
                throw new Error('Element Gateway_06oryac is not ENABLED')
            }
        }
    


            
            async Message_11j40xz(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_11j40xz === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_11j40xz')
                    
                    choreography.setEnable('Message_0tn8489')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_11j40xz is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_0tn8489(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0tn8489 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0tn8489')
                    
                    choreography.setEnable('Gateway_09wrwyw')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_09wrwyw(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0tn8489 is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_0h2m9uo(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0h2m9uo === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0h2m9uo')
                    
                    choreography.setEnable('Gateway_0460x0k')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_0460x0k(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0h2m9uo is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_1m9v97z(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1m9v97z === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_1m9v97z')
                    
                    choreography.setEnable('Message_0311tyt')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1m9v97z is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_0311tyt(ctx) {
                /* two-way task - initial participant */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0311tyt === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerInsurer, chorID)
                    choreography.setDone('Message_0311tyt')
                    
                    choreography.setEnable('Message_0p0m4qc')
                    await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerInsurer)
                    await choreography.updateState(ctx)

                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0311tyt is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }

            async Message_0p0m4qc(ctx) {
                /* two-way task - last participant */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0p0m4qc === Status.ENABLED && roles.Insurer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerInsurer, chorID)
                    choreography.setDone('Message_0p0m4qc')
                    
                    
                choreography.setEnable('Gateway_03r3vyj')
                await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerInsurer)
                await this.Gateway_03r3vyj(ctx, choreography, choreographyPrivate)
            

                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0p0m4qc is not ENABLED or submitter not allowed, only the Insurer can send this transaction')
                }
            }
        

            async Message_0n44po5(ctx) {
                /* two-way task - initial participant */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0n44po5 === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0n44po5')
                    
                    choreography.setEnable('Message_0uwy9oe')
                    await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
                    await choreography.updateState(ctx)

                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0n44po5 is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }

            async Message_0uwy9oe(ctx) {
                /* two-way task - last participant */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0uwy9oe === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0uwy9oe')
                    
                    
                choreography.setEnable('Message_16ikq84')
                await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
                await choreography.updateState(ctx)
            

                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0uwy9oe is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_16ikq84(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_16ikq84 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_16ikq84')
                    
                    choreography.setEnable('Gateway_06oryac')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_06oryac(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_16ikq84 is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_1u3kcvh(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1u3kcvh === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_1u3kcvh')
                    
                    choreography.setEnable('Message_1d0fq3r')
choreography.setDisable('Message_09zwe1j')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await choreography.updateState(ctx)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1u3kcvh is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_09zwe1j(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_09zwe1j === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_09zwe1j')
                    
                    choreography.setEnable('Gateway_0u8aigu')
choreography.setDisable('Message_1u3kcvh')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_0u8aigu(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_09zwe1j is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_1d0fq3r(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1d0fq3r === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_1d0fq3r')
                    
                    choreography.setEnable('Gateway_0nukfem')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_0nukfem(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1d0fq3r is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_1en4kv8(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_1en4kv8 === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_1en4kv8')
                    
                    choreography.setEnable('Gateway_0wkn4k8')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_0wkn4k8(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_1en4kv8 is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_00x4erc(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_00x4erc === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_00x4erc')
                    
                    choreography.setEnable('Gateway_0u101rc')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_0u101rc(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_00x4erc is not ENABLED or submitter not allowed, only the Customer can send this transaction')
                }
            }
        

            async Message_0foc0j2(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0foc0j2 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0foc0j2')
                    
                    choreography.setEnable('Gateway_1u5n66e')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_1u5n66e(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0foc0j2 is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
                }
            }
        

            async Message_0pl2dze(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.Message_0pl2dze === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID)
                    choreography.setDone('Message_0pl2dze')
                    
                    choreography.setEnable('Gateway_1u5n66e')
await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center)
await this.Gateway_1u5n66e(ctx, choreography, choreographyPrivate)


                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element Message_0pl2dze is not ENABLED or submitter not allowed, only the Bike_center can send this transaction')
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
                const k1 = Object.keys(roles).find(key => roles[key] === 'Org1MSP') // Customer
                const k2 = Object.keys(roles).find(key => roles[key] === 'Org2MSP') // Bike_center
                const k3 = Object.keys(roles).find(key => roles[key] === 'Org3MSP') // Insurer
        
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
