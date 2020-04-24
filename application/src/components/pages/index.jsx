import React from "react";
import { createOrg1Identity } from "../../server/api/network"

class Index extends React.Component {
    constructor() {
        super();
        this.state = { response: "" }
    }

    onFormSubmit = (event) => {
        event.preventDefault();

        return createOrg1Identity().then((res) => {
            console.log(res.response)
            this.setState({ response: res.response });
        })
    }

    render() {
        return (
            <div>
                <h1>ChorChain</h1>
                <form onSubmit={this.onFormSubmit}>
                    <div>
                        <button type={"submit"}>Create Org1 identity</button>
                    </div>
                </form>
                <span><h5>Response: {this.state.response}</h5></span>
            </div>
        )
    }
}
export default Index;