import crypto from 'crypto';

export const getPayuConfig = () => {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        merchantId: isProd ? process.env.PAYU_MERCHANT_ID : process.env.PAYU_MERCHANT_ID_TEST,
        merchantKey: isProd ? process.env.PAYU_MERCHANT_KEY : process.env.PAYU_MERCHANT_KEY_TEST,
        merchantSalt: isProd ? process.env.PAYU_MERCHANT_SALT : process.env.PAYU_MERCHANT_SALT_TEST,
        paymentUrl: isProd ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment'
    };
};

export const payuHelpers = {
    // Request hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
    generateRequestHash: ({ key, txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' }, salt) => {
        const raw = [key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, '', '', '', '', '', salt].join('|');
        return crypto.createHash('sha512').update(raw).digest('hex');
    },

    // Response hash: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    generateResponseHash: ({ key, txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '', status }, salt) => {
        const raw = [salt, status, '', '', '', '', '', udf5, udf4, udf3, udf2, udf1, email, firstname, productinfo, amount, txnid, key].join('|');
        return crypto.createHash('sha512').update(raw).digest('hex');
    },

    validateResponse: (response, { merchantKey, merchantSalt }) => {
        const expected = payuHelpers.generateResponseHash({ key: merchantKey, ...response }, merchantSalt);
        return (response.hash || '').toLowerCase() === expected.toLowerCase();
    },

    formatAmountForPayU: (amountNumber) => {
        return Number(amountNumber).toFixed(2);
    }
};
