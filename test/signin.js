// 获取 qrcode 并打开新标签页
fetch(dataUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const qrtime = data.time;
        console.log('data:', data);
        tipText.textContent = formatDate(qrtime) + ",获取成功:";
        const qrcodeValue = data.qrcode;
        if (qrcodeValue) {
            newUrl = `https://api.cl2wm.cn/api/qrcode/code?text=${qrcodeValue}`;
            window.open(newUrl, '_blank');
        } else {
            console.error('No qrcode value found in the response.');
        }
    })
    .catch(error => {
        tipText.textContent = "获取失败:" + qrcodeUrl;
        console.error('Error:', error.message);
    });
function formatDate(milliseconds) {
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 点击 SignIn 按钮时跳转到 signin.html
jumpButton.addEventListener('click', () => {
    window.location.href = newUrl;
});



