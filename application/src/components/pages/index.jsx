import React from "react";
import { createUserIdentity } from "../../server/api/identity";
import { submitTransaction, submitPrivateTransaction } from "../../server/api/transaction";
import TextField from '@material-ui/core/TextField';

class Index extends React.Component {
    constructor() {
        super();
        this.state = { response: "" }
    }

    onSubmitIdentity = (event) => {
        event.preventDefault();
        const orgNum = this.state.orgNum;
        const dataPayload = { orgNum };
        return createUserIdentity(dataPayload).then((res) => {
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
        const isPrivate = this.state.isPrivate;

        if(!isPrivate || isPrivate === '' || isPrivate === 'n') {
            // transactionParams può essere o singolo valore o array
            if (this.state.transactionParams) dataPayload.transactionParams = this.state.transactionParams;
            return submitTransaction(dataPayload).then(res => {
                if(res.error) res = { error: res.error }
                else res = { response: res.response, error: undefined }
                this.setState(res);
            })
        } else if(isPrivate === 'y') {
            return submitPrivateTransaction(dataPayload).then(res => {
                if(res.error) res = { error: res.error }
                else res = { response: res.response, error: undefined }
                this.setState(res);
            })
        }
    } 

    render() {
        return (
            <div>
                <h1>ChorChain</h1>
                <div>
                    <form onSubmit={this.onSubmitIdentity}>
                        <br />   
                        <TextField label="Org number" onChange={(event) => { this.setState({ orgNum: event.target.value }); }} />
                        <br />
                        <button type={"submit"}>Create Org User identity</button>
                    </form>

                    <form onSubmit={this.onSubmitTransaction}>
                        <br />   
                        <TextField label="Connection ID" onChange={(event) => { this.setState({ connectionID: event.target.value }); }} />
                        <br />
                        <p>channel123</p>
                        <TextField label="Channel name" onChange={(event) => { this.setState({ channel: event.target.value }); }} />
                        <br />
                        <p>choreographyprivatedatacontract</p>
                        <TextField label="Contract namespace" onChange={(event) => { this.setState({ contractNamespace: event.target.value }); }} />
                        <br />
                        <p>org.chorchain.choreographyprivatedata_1</p>
                        <TextField label="Contract name" onChange={(event) => { this.setState({ contractName: event.target.value }); }} />
                        <br />
                        <p>Event_0tttznh</p>
                        <TextField label="Transaction name" onChange={(event) => { this.setState({ transactionName: event.target.value }); }} />
                        <br />
                        <br />
                        <TextField label="Transaction params" onChange={(event) => { this.setState({ transactionParams: event.target.value }); }} />
                        <br />
                        <br />
                        <TextField label="Is private transaction ? (y/n)" onChange={(event) => { this.setState({ isPrivate: event.target.value }); }} />
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