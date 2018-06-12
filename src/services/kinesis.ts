import {
  AccountRecord,
  CollectionPage,
  Keypair,
  LedgerCallBuilder,
  LedgerRecord,
  Network,
  Server,
  TransactionCallBuilder,
  TransactionRecord,
} from 'js-kinesis-sdk'
import { createHash } from 'crypto'
import { Connection } from '../types'

const STROOPS_IN_ONE_KINESIS = 10000000

export function convertStroopsToKinesis(numberInStroops: number): number {
  return numberInStroops / STROOPS_IN_ONE_KINESIS
}

export function getEmissionKeypair(connection: Connection): Keypair {
  const currentNetwork = getNetwork(connection)
  const emissionSeedString = `${currentNetwork.networkPassphrase}emission`
  const hash = createHash('sha256')
  hash.update(emissionSeedString)

  return Keypair.fromRawEd25519Seed(hash.digest())
}

export function getMasterKeypair(): Keypair {
  return Keypair.master()
}

export function getNetwork(connection: Connection): Network {
  Network.use(new Network(connection.networkPassphrase))
  return Network.current()
}

export function getServer(connection: Connection): Server {
  Network.use(new Network(connection.networkPassphrase))
  return new Server(connection.horizonURL)
}

export async function getTransaction(connection: Connection, transactionId: string) {
  const server = getServer(connection)
  return await server.transactions().transaction(transactionId).call()
}

export async function getTransactions(connection: Connection): Promise<TransactionRecord[]> {
  const server = getServer(connection)
  const { records }: CollectionPage<TransactionRecord> = await server.transactions().limit(10).order('desc').call()
  return records
}

export async function getTransactionStream(connection: Connection, cursor = 'now'): Promise<TransactionCallBuilder> {
  const server = getServer(connection)
  return await server.transactions().cursor(cursor)
}

export async function getLedger(connection: Connection, sequence: number | string): Promise<LedgerRecord> {
  const server = getServer(connection)
  const ledger = await (server.ledgers() as any).ledger(sequence).call() as LedgerRecord
  return ledger
}

export async function getLedgers(connection: Connection): Promise<LedgerRecord[]> {
  const server = getServer(connection)
  const { records }: CollectionPage<LedgerRecord> = await server.ledgers().limit(10).order('desc').call()
  return records
}

export async function getLedgerStream(connection: Connection, cursor = 'now'): Promise<LedgerCallBuilder> {
  const server = getServer(connection)
  return server.ledgers().cursor(cursor)
}

export async function getAccount(connection: Connection, accountId: string): Promise<AccountRecord> {
  const server = getServer(connection)
  const account: AccountRecord = await server.loadAccount(accountId)
  return account
}
