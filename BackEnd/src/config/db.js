import mongoose from 'mongoose'

async function main() {
   await mongoose.connect(process.env.DB_CONNECT_KEY)
}

export default main;