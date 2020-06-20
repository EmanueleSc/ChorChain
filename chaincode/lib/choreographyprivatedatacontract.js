'use strict';

const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');
const { ChoreographyState, Status } = require('../ledger-api/choreographystate');
const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate');

const chorID = 'CHOR1';
const contractName = 'org.chorchain.choreographyprivatedata_1';
const chorElements = [
    'Event_0tttznh',
    'Gateway_0c09rfi',
    'Message_11j40xz',
    'Message_0tn8489',
    'Gateway_09wrwyw',
    'Message_0h2m9uo',
    'Gateway_0460x0k',
    'Gateway_03r3vyj',
    'Message_1m9v97z',
    'Message_0311tyt',
    'Message_0p0m4qc',
    'Message_0n44po5',
    'Message_0uwy9oe',
    'Message_16ikq84',
    'Gateway_06oryac',
    'Message_1u3kcvh',
    'Message_09zwe1j',
    'Message_1d0fq3r',
    'Gateway_0nukfem',
    'Message_1en4kv8',
    'Gateway_0wkn4k8',
    'Gateway_0u8aigu',
    'Message_00x4erc',
    'Gateway_0u101rc',
    'Message_0foc0j2',
    'Message_0pl2dze',
    'Gateway_1u5n66e',
    'Event_1esg69d'
];
const roles = { Customer: 'Org1MSP', Bike_center: 'Org2MSP', Insurer: 'Org3MSP' };

// collection combination with 3 orgs: Org1 - Org2 , Org1 - Org3 , Org2 - Org3
const collectionsPrivate = {
    CustomerBike_center: 'collection' + roles.Customer + roles.Bike_center,
    CustomerInsurer: 'collection' + roles.Customer + roles.Insurer,
    Bike_centerInsurer: 'collection' + roles.Bike_center + roles.Insurer
};

class ChoreographyPrivateDataContract extends Contract {

    constructor() {
        super(contractName);
    }

    async instantiate(ctx) {
        logger.log('info', '==== INSTANTIATE THE CONTRACT');

        const choreography = new ChoreographyState({ chorID });
        choreography.initElements(chorElements);
        choreography.setEnable('Event_0tttznh');
        await choreography.updateState(ctx);

        logger.log('info', 'Choreography init state:');
        logger.log('info', choreography);

        return choreography;
    }

    async Event_0tttznh(ctx) {
        logger.log('info', '==== Event_0tttznh CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.Event_0tttznh === Status.ENABLED) {
            choreography.setDone('Event_0tttznh');
            choreography.setEnable('Gateway_0c09rfi');
            // await choreography.updateState(ctx);
            await this.Gateway_0c09rfi(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('Event_0tttznh is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0c09rfi(ctx, choreography) {
        logger.log('info', '==== Gateway_0c09rfi CALLED');
        // logger.log('info', 'Choreography ID: ' + chorID);

        // const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.Gateway_0c09rfi === Status.ENABLED) {
            choreography.setDone('Gateway_0c09rfi');
            choreography.setEnable('Message_11j40xz');
            await choreography.updateState(ctx);

            // logger.log('info', 'Choreography:');
            // logger.log('info', choreography);

            // return choreography;
        } else {
            throw new Error('Gateway_0c09rfi is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_11j40xz(ctx) {
        logger.log('info', '==== Message_11j40xz CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_11j40xz === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_11j40xz');
            choreography.setEnable('Message_0tn8489');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_11j40xz is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0tn8489(ctx) {
        logger.log('info', '==== Message_0tn8489 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0tn8489 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0tn8489');
            choreography.setEnable('Gateway_09wrwyw');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_09wrwyw(ctx, choreography, choreographyPrivate);
        
            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0tn8489 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_09wrwyw(ctx, choreography, choreographyPrivate) {
        logger.log('info', '==== Gateway_09wrwyw CALLED');

        if(choreography.elements.Gateway_09wrwyw === Status.ENABLED) {
            choreography.setDone('Gateway_09wrwyw');
            
            if(choreographyPrivate.isAvailable === false) {
                choreography.setEnable('Gateway_0c09rfi');
                await choreography.updateState(ctx);
            } 
            else if(choreographyPrivate.isAvailable === true) {
                choreography.setEnable('Message_0h2m9uo');
                await choreography.updateState(ctx);
            }

        } else {
            throw new Error('Gateway_09wrwyw is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0h2m9uo(ctx) {
        logger.log('info', '==== Message_0h2m9uo CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0h2m9uo === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0h2m9uo');
            choreography.setEnable('Gateway_0460x0k');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_0460x0k(ctx, choreography, choreographyPrivate);
        
            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0h2m9uo is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0460x0k(ctx, choreography, choreographyPrivate) {
        logger.log('info', '==== Gateway_0460x0k CALLED');

        if(choreography.elements.Gateway_0460x0k === Status.ENABLED) {
            choreography.setDone('Gateway_0460x0k');
            
            if(choreographyPrivate.insuranceReq === false) {
                choreography.setEnable('Gateway_03r3vyj');
                await this.Gateway_03r3vyj(ctx, choreography);
            } 
            else if(choreographyPrivate.insuranceReq === true) {
                choreography.setEnable('Message_1m9v97z');
                await choreography.updateState(ctx);
            }

        } else {
            throw new Error('Gateway_0460x0k is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_1m9v97z(ctx) {
        logger.log('info', '==== Message_1m9v97z CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_1m9v97z === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_1m9v97z');
            choreography.setEnable('Message_0311tyt');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_1m9v97z is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0311tyt(ctx) {
        logger.log('info', '==== Message_0311tyt CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0311tyt === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerInsurer, chorID);
            choreography.setDone('Message_0311tyt');
            choreography.setEnable('Message_0p0m4qc');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerInsurer);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0311tyt is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    /*async Message_0p0m4qc(ctx) {
        logger.log('info', '==== Message_0p0m4qc CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0p0m4qc === Status.ENABLED && roles.Insurer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerInsurer, chorID);
            choreography.setDone('Message_0p0m4qc');
            choreography.setEnable('Gateway_03r3vyj');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerInsurer);
            await this.Gateway_03r3vyj(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0p0m4qc is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_03r3vyj(ctx, choreography) {
        logger.log('info', '==== Gateway_03r3vyj CALLED');

        if(choreography.elements.Gateway_03r3vyj === Status.ENABLED) {
            choreography.setDone('Gateway_03r3vyj');
            choreography.setEnable('Message_0n44po5');
            await choreography.updateState(ctx);
        } else {
            throw new Error('Gateway_03r3vyj is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0n44po5(ctx) {
        logger.log('info', '==== Message_0n44po5 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0n44po5 === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0n44po5');
            choreography.setEnable('Message_0uwy9oe');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0n44po5 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0uwy9oe(ctx) {
        logger.log('info', '==== Message_0uwy9oe CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0uwy9oe === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0uwy9oe');
            choreography.setEnable('Message_16ikq84');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0uwy9oe is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_16ikq84(ctx) {
        logger.log('info', '==== Message_16ikq84 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_16ikq84 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_16ikq84');
            choreography.setEnable('Gateway_06oryac');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_06oryac(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_16ikq84 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    // Event-based gateway
    async Gateway_06oryac(ctx, choreography) {
        logger.log('info', '==== Gateway_06oryac CALLED');

        if(choreography.elements.Gateway_06oryac === Status.ENABLED) {
            choreography.setDone('Gateway_06oryac');
            choreography.setEnable('Message_1u3kcvh');
            choreography.setEnable('Message_09zwe1j');
            await choreography.updateState(ctx);
        } else {
            throw new Error('Gateway_06oryac is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_1u3kcvh(ctx) {
        logger.log('info', '==== Message_1u3kcvh CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_1u3kcvh === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_1u3kcvh');
            choreography.setDisable('Message_09zwe1j')
            choreography.setEnable('Message_1d0fq3r');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_1u3kcvh is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_1d0fq3r(ctx) {
        logger.log('info', '==== Message_1d0fq3r CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_1d0fq3r === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_1d0fq3r');
            choreography.setEnable('Gateway_0nukfem');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_0nukfem(ctx, choreography, choreographyPrivate);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_1d0fq3r is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0nukfem(ctx, choreography, choreographyPrivate) {
        logger.log('info', '==== Gateway_0nukfem CALLED');

        if(choreography.elements.Gateway_0nukfem === Status.ENABLED) {
            choreography.setDone('Gateway_0nukfem');
            
            if(choreographyPrivate.ask === false) {
                choreography.setEnable('Gateway_0wkn4k8');
                await this.Gateway_0wkn4k8(ctx, choreography);
            } 
            else if(choreographyPrivate.ask === true) {
                choreography.setEnable('Message_1en4kv8');
                await choreography.updateState(ctx);
            }

        } else {
            throw new Error('Gateway_0nukfem is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_1en4kv8(ctx) {
        logger.log('info', '==== Message_1en4kv8 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_1en4kv8 === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_1en4kv8');
            choreography.setEnable('Gateway_0wkn4k8');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_0wkn4k8(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_1en4kv8 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0wkn4k8(ctx, choreography) {
        logger.log('info', '==== Gateway_0wkn4k8 CALLED');

        if(choreography.elements.Gateway_0wkn4k8 === Status.ENABLED) {
            choreography.setDone('Gateway_0wkn4k8');
            choreography.setEnable('Gateway_0u8aigu');
            await this.Gateway_0u8aigu(ctx, choreography);
        } else {
            throw new Error('Gateway_0wkn4k8 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_09zwe1j(ctx) {
        logger.log('info', '==== Message_09zwe1j CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_09zwe1j === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_09zwe1j');
            choreography.setDisable('Message_1u3kcvh');
            choreography.setEnable('Gateway_0u8aigu');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_0u8aigu(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_09zwe1j is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0u8aigu(ctx, choreography) {
        logger.log('info', '==== Gateway_0u8aigu CALLED');

        if(choreography.elements.Gateway_0u8aigu === Status.ENABLED) {
            choreography.setDone('Gateway_0u8aigu');
            choreography.setEnable('Message_00x4erc');
            await choreography.updateState(ctx);
        } else {
            throw new Error('Gateway_0u8aigu is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_00x4erc(ctx, choreography) {
        logger.log('info', '==== Message_00x4erc CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_00x4erc === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_00x4erc');
            choreography.setEnable('Gateway_0u101rc');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await this.Gateway_0u101rc(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_00x4erc is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    // Parallel gateway
    async Gateway_0u101rc(ctx, choreography) {
        logger.log('info', '==== Gateway_0u101rc CALLED');

        if(choreography.elements.Gateway_0u101rc === Status.ENABLED) {
            choreography.setDone('Gateway_0u101rc');
            choreography.setEnable('Message_0foc0j2');
            choreography.setEnable('Message_0pl2dze');
            await choreography.updateState(ctx);
        } else {
            throw new Error('Gateway_0u101rc is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0foc0j2(ctx) {
        logger.log('info', '==== Message_0foc0j2 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0foc0j2 === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0foc0j2');
            choreography.setEnable('Gateway_1u5n66e');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);
            await this.Gateway_1u5n66e(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0foc0j2 is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Message_0pl2dze(ctx) {
        logger.log('info', '==== Message_0pl2dze CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_0pl2dze === Status.ENABLED && roles.Bike_center === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_0pl2dze');
            choreography.setEnable('Gateway_1u5n66e');
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);
            await choreography.updateState(ctx);
            await this.Gateway_1u5n66e(ctx, choreography);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_0pl2dze is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    // Parallel gateway
    async Gateway_1u5n66e(ctx, choreography) {
        logger.log('info', '==== Gateway_1u5n66e CALLED');

        if(choreography.elements.Gateway_1u5n66e === Status.ENABLED) {
            if(choreography.elements.Message_0foc0j2 === Status.DONE && choreography.elements.Message_0pl2dze === Status.DONE) {
                choreography.setDone('Gateway_1u5n66e');
                choreography.setEnable('Event_1esg69d'); // End Event
                await this.Event_1esg69d(ctx, choreography);
            }
        } else {
            throw new Error('Gateway_1u5n66e is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Event_1esg69d(ctx, choreography) {
        logger.log('info', '==== Event_1esg69d CALLED');

        if(choreography.elements.Event_1esg69d === Status.ENABLED) {
            choreography.setDone('Event_1esg69d');
            await choreography.updateState(ctx);
        } else {
            throw new Error('Event_1esg69d is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }*/

    async queryChorState(ctx) {
        logger.log('info', '==== Query choreography data CALLED');
        logger.log('info', 'MSP ID: ' + ctx.stub.getCreator().mspid);
        
        let privateState, privateCollection; 
        let resp = {};

        // public state
        const choreography = await ChoreographyState.getState(ctx, chorID);
        resp.choreography = choreography;
        resp.choreographyPrivate = {};

        const mspid = ctx.stub.getCreator().mspid;
        const k1 = Object.keys(roles).find(key => roles[key] === 'Org1MSP'); // Customer
        const k2 = Object.keys(roles).find(key => roles[key] === 'Org2MSP'); // Bike_center
        const k3 = Object.keys(roles).find(key => roles[key] === 'Org3MSP'); // Insurer

        if(mspid === 'Org1MSP') {
            privateCollection = k1 + k2;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;

            privateCollection = k1 + k3;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;
        }
        else if(mspid === 'Org2MSP') {
            privateCollection = k1 + k2;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;

            privateCollection = k2 + k3;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;
        }
        else if(mspid === 'Org3MSP') {
            privateCollection = k1 + k3;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;

            privateCollection = k2 + k3;
            privateState = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate[privateCollection], chorID);
            resp.choreographyPrivate[privateCollection] = privateState;
        }

        return resp;
    }

}

module.exports = ChoreographyPrivateDataContract;
