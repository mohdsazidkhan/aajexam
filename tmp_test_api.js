
const fetch = require('node-fetch');

async function testApi(url) {
    console.log(`Testing API: ${url}`);
    try {
        const start = Date.now();
        const res = await fetch(url);
        const duration = Date.now() - start;
        console.log(`Status: ${res.status} (${duration}ms)`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Success: ${data.success}`);
            console.log(`Data length: ${data.data ? data.data.length : 'N/A'}`);
            if (data.data && data.data.length > 0) {
                console.log(`First category: ${data.data[0].name}`);
            }
        } else {
            const text = await res.text();
            console.log(`Error body: ${text.substring(0, 200)}`);
        }
    } catch (err) {
        console.error(`Fetch error: ${err.message}`);
    }
    console.log('-------------------');
}

async function runTests() {
    await testApi('http://localhost:3000/api/public/categories/detailed');
    await testApi('https://aajexam.com/api/public/categories/detailed');
    await testApi('http://localhost:3000/api/public/categories');
    await testApi('https://aajexam.com/api/public/categories');
}

runTests();

