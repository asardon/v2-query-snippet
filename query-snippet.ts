import { ethers } from 'hardhat'

async function main() {
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

  const borrowerGateway = await ethers.getContractAt(borrowerGatewayAbi, '0xd8b132A0abA610D0AaA18716A2b26e14141f112C')

  aggregateLoanStats(borrowerGateway)
}

async function aggregateLoanStats(borrowerGateway: any) {
  const filter = borrowerGateway.filters.Borrowed()

  const fromBlock = 3470992
  const toBlock = 'latest'
  
  const events = await borrowerGateway.queryFilter(filter, fromBlock, toBlock)
  const aggregatedLoans: any = {}

  for (let event of events) {
      const lender = event.args.vaultAddr
      const loanCurrency = event.args.loan.loanToken
      const initLoanAmount = event.args.loan.initLoanAmount

      if (!aggregatedLoans[lender]) {
          aggregatedLoans[lender] = {}
      }

      if (aggregatedLoans[lender][loanCurrency]) {
          aggregatedLoans[lender][loanCurrency] = aggregatedLoans[lender][loanCurrency].add(initLoanAmount)
      } else {
          aggregatedLoans[lender][loanCurrency] = initLoanAmount
      }
  }

  console.log(aggregatedLoans)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
