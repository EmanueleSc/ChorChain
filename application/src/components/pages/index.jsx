import React from "react";
import { helloWorld } from "../../server/api/helloworld"

class Index extends React.Component {
    constructor() {
        super();
        this.state = { response: "" }
    }

    onFormSubmit = (event) => {
        event.preventDefault();

        return helloWorld().then((res) => {
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
                        <button type={"submit"}>Call hellorworld API</button>
                    </div>
                </form>
                <span><h5>Response: {this.state.response}</h5></span>
            </div>
        )
    }
}
export default Index;