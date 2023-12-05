import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const qrGenerator = {
  generateToken: (branchId, date, time) => {
    const uniqueString = `${branchId}-${date}-${time}-${uuidv4()}`;
    return crypto.createHash('sha256').update(uniqueString).digest('hex');
  },
};

export default qrGenerator;
