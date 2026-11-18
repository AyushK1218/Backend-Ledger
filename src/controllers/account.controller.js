const accountModel = require("../model/account.model")


async function createAccountController(req, res) {

    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountController(req, res) {

    const accounts = await accountModel.find({
        user: req.user._id
    })

    const accountIds = accounts.map((account) => account._id)

    const balanceData = await accountModel.getBalances(accountIds)

    const balancesByAccountId = new Map(
        balanceData.map((entry) => [entry._id.toString(), entry.balance])
    )

    const accountsWithBalance = accounts.map((account) => ({
        ...account.toObject(),
        balance: balancesByAccountId.get(account._id.toString()) || 0
    }))

    return res.status(200).json({
        accounts: accountsWithBalance
    })
}

async function getAccountBalanceController(req, res) {

    const {accountId} = req.params

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

module.exports = {createAccountController, getUserAccountController, getAccountBalanceController}