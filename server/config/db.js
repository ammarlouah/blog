const mongoose = require('mongoose')
const connectDb = async () => {
    try {
        mongoose.set('strictQuery',false)
        const con = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Database Connected : ${con.connection.host}`)
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDb