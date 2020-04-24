import React from "react";
import { createOrg1Identity, createOrg1Gateway } from "../../server/api/network";

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

    onSubmitGateway = (event) => {
        event.preventDefault();
        return createOrg1Gateway().then(res => {
            this.setState({ response: res.response });
        })
    }

    render() {
        return (
            <div>
                <h1>ChorChain</h1>
                <div>
                    <button type={"submit"} onClick={this.onSubmitIdentity}>Create Org1 identity</button>
                    <button type={"submit"} onClick={this.onSubmitGateway}>Create Org1 gateway</button>
                </div>
                <span><h5>Response: {this.state.response}</h5></span>
            </div>
        )
    }
}
export default Index;