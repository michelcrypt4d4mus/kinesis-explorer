import * as React from 'react'
import { Server } from 'js-kinesis-sdk'

class OperationsTableAmount extends React.Component {
  constructor(props: any) {
    super(props)
    {
    }
  }

  server = new Server(this.props?.networkUrl)
  state = {
    operations: [],
    name: 'Nitish',
  }

  componentDidMount() {
    this.getOperations()
  }
  componentDidUpdate() {
    this.getOperations()
  }

  async getOperations() {
    const operationRecord = await this.server.operations().limit(this.props.translimit).order('desc').call()
    this.setState({ operations: operationRecord.records }, () => {
      this.server
        .operations()
        .cursor('now')
        .limit(1)
        .stream({
          onmessage: (nextData) => {
            console.warn('New Data Recieved!!', nextData.transaction_hash)

            this.setState({
              operations: [nextData, ...this.state.operations.slice(0, 9)],
            })
          },
        })
    })
  }

  render() {
    return (
      <div>
        <p> {this.state.operations[0]?.amount} </p>
      </div>
    )
  }
}
export default OperationsTableAmount
