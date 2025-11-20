const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../../services/userService');

const JWT_SECRET = 'KUNCI_RAHASIA_SANGAT_AMAN_PM_COPILOT'; 
const SALT_ROUNDS = 10;


exports.register = async (req, res) => {
    const { email, password, role = 'engineer' } = req.body;

    if (userService.findUserByEmail(email)) {
        return res.status(400).json({ message: 'Pengguna dengan email ini sudah terdaftar.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = userService.createUser({
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({ 
            message: 'Pendaftaran berhasil!', 
            user: { id: newUser.id, email: newUser.email, role: newUser.role } 
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server saat pendaftaran.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = userService.findUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: 'Kombinasi email dan password salah.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Kombinasi email dan password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.json({ 
            message: 'Login berhasil!', 
            token, 
            user: { id: user.id, email: user.email, role: user.role } 
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
    }
};