const secret = '26d880e4-9ea7-4476-b75e-1d999f4a1ad3';
const dataUrl = `https://store.zapier.com/api/records?secret=${secret}`;

function setDataValue(newValue, key, toggleText) {
    if (toggleText) {
        toggleText.textContent = "设置中...请等待，请勿刷新页面";
    }

    fetch(dataUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [newValue]: key })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (toggleText) {
                toggleText.textContent = "设置成功";
            }
            return response.json();
        })
        .then(data => {
            if (toggleText) {
                toggleText.textContent = "设置成功";
            }
            console.log(`${key} state updated successfully:`, data);
        })
        .catch(error => {
            if (toggleText) {
                toggleText.textContent = "设置失败";
            }
            console.error(`Failed to update ${key} state:`, error.message);
        });
}

function fetchData(callback) {
    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('Failed to fetch data:', error.message);
        });
}

function fetchDataValue(key, callback){
    fetchData(data => {
        callback(data[key]);
    });
}