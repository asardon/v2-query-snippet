import { ethers } from 'hardhat'

const borrowerGatewayAbi = [
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "vaultAddr",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
    },
    {
        "components": [
        {
            "internalType": "address",
            "name": "borrower",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "collToken",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "loanToken",
            "type": "address"
        },
        {
            "internalType": "uint40",
            "name": "expiry",
            "type": "uint40"
        },
        {
            "internalType": "uint40",
            "name": "earliestRepay",
            "type": "uint40"
        },
        {
            "internalType": "uint128",
            "name": "initCollAmount",
            "type": "uint128"
        },
        {
            "internalType": "uint128",
            "name": "initLoanAmount",
            "type": "uint128"
        },
        {
            "internalType": "uint128",
            "name": "initRepayAmount",
            "type": "uint128"
        },
        {
            "internalType": "uint128",
            "name": "amountRepaidSoFar",
            "type": "uint128"
        },
        {
            "internalType": "uint128",
            "name": "amountReclaimedSoFar",
            "type": "uint128"
        },
        {
            "internalType": "bool",
            "name": "collUnlocked",
            "type": "bool"
        },
        {
            "internalType": "address",
            "name": "collTokenCompartmentAddr",
            "type": "address"
        }
        ],
        "indexed": false,
        "internalType": "struct DataTypesPeerToPeer.Loan",
        "name": "loan",
        "type": "tuple"
    },
    {
        "indexed": false,
        "internalType": "uint256",
        "name": "upfrontFee",
        "type": "uint256"
    },
    {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
    },
    {
        "indexed": false,
        "internalType": "address",
        "name": "callbackAddr",
        "type": "address"
    },
    {
        "indexed": false,
        "internalType": "bytes",
        "name": "callbackData",
        "type": "bytes"
    }
    ],
    "name": "Borrowed",
    "type": "event"
}
]

const lenderVaultAbi = [
    {
       "type":"function",
       "stateMutability":"view",
       "outputs":[
          {
             "type":"address",
             "name":"",
             "internalType":"address"
          }
       ],
       "name":"owner",
       "inputs":[
          
       ]
    }
 ]

async function main() {
    const borrowerGateway = await ethers.getContractAt(borrowerGatewayAbi, '0xd8b132A0abA610D0AaA18716A2b26e14141f112C')
    aggregateLoanStats(borrowerGateway)
}

async function aggregateLoanStats(borrowerGateway: any) {
    const filter = borrowerGateway.filters.Borrowed()

    const fromBlock = 3470992
    const toBlock = 'latest'

    const events = await borrowerGateway.queryFilter(filter, fromBlock, toBlock)
    const aggregatedLoansByBorrower: any = {}
    const aggregatedLoansByLender: any = {}
    const borrowerCounts: any = {}
    const lenderCounts: any = {}

    for (let event of events) {
        const borrower = event.args.borrower
        const lenderVault = event.args.vaultAddr
        const lenderVaultContract = await ethers.getContractAt(lenderVaultAbi, lenderVault)
        const lender = await lenderVaultContract.owner()
        const loanCurrency = event.args.loan.loanToken
        const initLoanAmount = event.args.loan.initLoanAmount

        // Aggregating loans by Borrower
        if (!aggregatedLoansByBorrower[borrower]) {
            aggregatedLoansByBorrower[borrower] = {}
        }
        if (aggregatedLoansByBorrower[borrower][loanCurrency]) {
            aggregatedLoansByBorrower[borrower][loanCurrency] = aggregatedLoansByBorrower[borrower][loanCurrency].add(initLoanAmount)
        } else {
            aggregatedLoansByBorrower[borrower][loanCurrency] = initLoanAmount
        }
        borrowerCounts[borrower] = (borrowerCounts[borrower] || 0) + 1

        // Aggregating loans by Lender
        if (!aggregatedLoansByLender[lender]) {
            aggregatedLoansByLender[lender] = {}
        }
        if (aggregatedLoansByLender[lender][loanCurrency]) {
            aggregatedLoansByLender[lender][loanCurrency] = aggregatedLoansByLender[lender][loanCurrency].add(initLoanAmount)
        } else {
            aggregatedLoansByLender[lender][loanCurrency] = initLoanAmount
        }
        lenderCounts[lender] = (lenderCounts[lender] || 0) + 1
    }

    console.log('*********** aggregated loans per borrower and token ***********')
    console.log(aggregatedLoansByBorrower)
    console.log('*********** number of loans per borrower ***********')
    console.log(borrowerCounts)

    console.log('*********** aggregated loans per lender and token ***********')
    console.log(aggregatedLoansByLender)
    console.log('*********** number of loans per lender ***********')
    console.log(lenderCounts)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})