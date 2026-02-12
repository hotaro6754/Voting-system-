const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const testJWT = () => {
    const secret = 'test_secret';
    process.env.JWT_SECRET = secret;
    const payload = { id: 'admin', role: 'admin' };
    const token = jwt.sign(payload, secret);
    const decoded = jwt.verify(token, secret);

    if (decoded.id === 'admin' && decoded.role === 'admin') {
        console.log('JWT Sign/Verify Test: PASSED');
    } else {
        console.log('JWT Sign/Verify Test: FAILED');
        process.exit(1);
    }
};

testJWT();
