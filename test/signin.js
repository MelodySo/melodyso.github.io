const secret = '26d880e4-9ea7-4476-b75e-1d999f4a1ad3';
const qrcodeKey = 'qrcode';

const qrcodeUrl = `https://store.zapier.com/api/records?secret=${secret}&key=${qrcodeKey}`;

// 获取 qrcode 并打开新标签页
fetch(qrcodeUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        tipText.textContent = "获取成功:" + qrcodeUrl;
        const qrcodeValue = data.qrcode;
        if (qrcodeValue) {
            const newUrl = `https://api.caoliao.net/api/qrcode/code?text=${qrcodeValue}`;
            window.open(newUrl, '_blank');
        } else {
            console.error('No qrcode value found in the response.');
        }
    })
    .catch(error => {
        tipText.textContent = "获取失败:" + qrcodeUrl;
        console.error('Error:', error.message);
    });
