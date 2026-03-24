import mongoose from 'mongoose'

async function main() {
   await mongoose.connect("mongodb+srv://ritiksharma14y_db_user:blKgkzCQQXhuCBNf@ritik.ta2zrff.mongodb.net/Leetcode")
}

export default main;