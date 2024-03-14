import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));


const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobileNumber: String,
    project: String
})

const User = mongoose.model('User', userSchema);

const app = express()

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.post('/user', async (req, res) => {

    const { firstName, lastName, email, mobileNumber, project } = req.body;

    if (!firstName || !lastName || !email || !mobileNumber || !project) {
        return res.status(404).json({ message: "Fields cannot be empty" })
    }

    const user = new User({
        firstName, lastName, email, mobileNumber, project
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/user', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/user/:id', async (req, res) => {
    const id = req.params.id

    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId) {
        return res.status(400).json({ message: "Provide a valid MongoDB ObjectID" })
    }
    try {
        const user = await User.findById(id)
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user)
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

});

app.patch('/user/:id', async (req, res) => {

    const id = req.params.id

    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId) {
        return res.status(400).json({ message: "Provide a valid MongoDB ObjectID" })
    }

    const { firstName, lastName, email, mobileNumber, project } = req.body

    if (!firstName || !lastName || !email || !mobileNumber || !project) {
        res.status(400).json({ message: "Fields cannot be empty" })
    }

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updateData = {
            firstName,
            lastName,
            email,
            mobileNumber,
            project
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData)

        return res.status(200).json(updatedUser)

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }


});

app.delete('/user/:id', async (req, res) => {

    const id = req.params.id

    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId) {
        return res.status(400).json({ message: "Provide a valid MongoDB ObjectID" })
    }
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const deletedUser = await User.findByIdAndDelete(id);
        return res.status(201).json({ message: 'User deleted', deletedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const port = process.env.PORT || 5500
app.listen(port, () => {
    console.log(`Server has started on port ${port}`)
})