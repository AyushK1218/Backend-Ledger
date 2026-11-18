const mongoose = require("mongoose")
const ledgerModel = require("./ledger.model")

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true // index is used to optimize the searching query, when we have thousands or millions of account, index makes the searching very fast, and drastically reduces the query response time
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", 'FROZEN', 'CLOSED'],
            message: "Status can be either ACTIVE,FROZEN or CLOSED",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR",
    },
}, {
    timestamps: true
})

// when you create index on two fields, then it is known as compound index

accountSchema.index({user: 1, status: 1}) //this is a compound index for userid and status (if we query using status, then in that case as well it will optimize the searching)

accountSchema.methods.getBalance = async function () {
    const balanceData = await accountModel.getBalances([this._id])
    return balanceData.length === 0 ? 0 : balanceData[0].balance
}

accountSchema.statics.getBalances = async function (accountIds) {

    if (accountIds.length === 0) {
        return []
    }

    return await ledgerModel.aggregate([
        {$match: {account: {$in: accountIds}}},
        {
            $group: {
                _id: "$account",
                totalDebit: {
                    $sum: {
                        $cond: [
                            {$eq: ["$type", "DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            {$eq: ["$type", "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                balance: {$subtract: ["$totalCredit", "$totalDebit"]}
            }
        }
    ])
}

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel