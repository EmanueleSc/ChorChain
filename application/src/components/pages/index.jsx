import React from "react";
import { createOrg1Identity, createOrg1ConnectionID, submitTransaction } from "../../server/api/network";
import TextField from '@material-ui/core/TextField';

class Index extends React.Component {
    constructor() {
        super();
        this.state = { response: "" }
    }

    onSubmitIdentity = (event) => {
        event.preventDefault();
        return createOrg1Identity().then((res) => {
            this.setState({ response: res.response });
        })
    }

    onSubmitConnection = (event) => {
        event.preventDefault();
        return createOrg1ConnectionID().then(res => {
            this.setState({ response: res.response });
        })
    }

    onSubmitTransaction = (event) => {
        event.preventDefault();
        const connectionID = this.state.connectionID;
        const channel = this.state.channel;
        const contractNamespace = this.state.contractNamespace;
        const contractName = this.state.contractName;
        const transactionName = this.state.transactionName;
        const dataPayload = { connectionID, channel, contractNamespace, contractName, transactionName };
        // transactionParams può essere o singolo valore o array
        if (this.state.transactionParams) dataPayload.transactionParams = this.state.transactionParams;

        return submitTransaction(dataPayload).then(res => {
            if(res.error) res = { error: res.error }
            else res = { response: res.response, error: undefined }
            this.setState(res);
        })
    } 

    render() {
        return (
            <div>
                <h1>ChorChain</h1>
                <div>
                    <button onClick={this.onSubmitIdentity}>Create Org1 identity</button>
                    <button onClick={this.onSubmitConnection}>Create Org1 connection ID</button>
                    <form onSubmit={this.onSubmitTransaction}>
                        <br />   
                        <TextField label="Connection ID" onChange={(event) => { this.setState({ connectionID: event.target.value }); }} />
                        <br />
                        <p>mychannel</p>
                        <TextField label="Channel name" onChange={(event) => { this.setState({ channel: event.target.value }); }} />
                        <br />
                        <p>choreographycontract</p>
                        <TextField label="Contract namespace" onChange={(event) => { this.setState({ contractNamespace: event.target.value }); }} />
                        <br />
                        <p>org.chorchain.choreography_1</p>
                        <TextField label="Contract name" onChange={(event) => { this.setState({ contractName: event.target.value }); }} />
                        <br />
                        <p>StartEvent_00yy9i8</p>
                        <TextField label="Transaction name" onChange={(event) => { this.setState({ transactionName: event.target.value }); }} />
                        <br />
                        <br />
                        <TextField label="Transaction params" onChange={(event) => { this.setState({ transactionParams: event.target.value }); }} />
                        <br />
                        <button type={"submit"}>Submit transaction</button>
                    </form>
                </div>
                <span>
                    <h5> Response: {
                        !this.state.error ? JSON.stringify(this.state.response)
                                          : JSON.stringify(this.state.error)
                    }
                    </h5>
                </span>
            </div>
        )
    }
}
export default Index;