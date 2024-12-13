import { Account, Keypair, Networks, Operation, TransactionBuilder, nativeToScVal, Horizon } from '@stellar/stellar-sdk'
import { assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

const rpcUrl = 'https://soroban-testnet.stellar.org'
const horizonUrl = 'https://horizon-testnet.stellar.org'
const rpc = new Server(rpcUrl)
const horizon = new Horizon.Server(horizonUrl)

const sequenceKeypair = Keypair.fromSecret('SD3RQYH3I2OX7YGNYRNRWMW6VJGSFGZG4UUYZK4RVLHOJ2UMNARRW4OP') // GBE5YPPSOULORLRVRG3VALWLLUH2IJ3A6I43KIT2CNBIXEYYQTXP5NRR
const sequencePublicKey = sequenceKeypair.publicKey()
const sequenceSource = await rpc.getAccount(sequencePublicKey).then((account) => new Account(account.accountId(), account.sequenceNumber()))

const transferKeypair = Keypair.fromSecret('SCAFV3EO6PKPV32US5K3GUJ4D2W46YVXMQT2FEF2FULWJO5MUSGZMMTQ') // GDOT52JZM3MU5ZVROKEU6BNQSMDOHAHPV22XIQ43OLKUFTOOXI5OCYUP
const transferPublicKey = transferKeypair.publicKey()
const transferSource = await rpc.getAccount(transferPublicKey).then((account) => new Account(account.accountId(), account.sequenceNumber()))

const txn = new TransactionBuilder(sequenceSource, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
})
.addOperation(Operation.invokeContractFunction({
    contract: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    function: 'transfer',
    args: [
        nativeToScVal(transferPublicKey, {type: 'address'}),
        nativeToScVal(sequencePublicKey, {type: 'address'}),
        nativeToScVal(10, {type: 'i128'})
    ],
    source: sequencePublicKey
}))
.setTimeout(0)
.build()

const sim = await rpc.simulateTransaction(txn)

const transaction = assembleTransaction(txn, sim).build()

console.log(transaction.toXDR());

// const res = await horizon.submitTransaction(transaction)

// console.log(res);
