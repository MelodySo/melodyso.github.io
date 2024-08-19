const secret = '26d880e4-9ea7-4476-b75e-1d999f4a1ad3';
const enabledKey = 'enabled';

const toggleSwitch = document.getElementById('toggleSwitch');
const toggleLabel = document.getElementById('toggleLabel');
const signInButton = document.getElementById('signInButton');

const enabledUrl = `https://store.zapier.com/api/records?secret=${secret}&key=${enabledKey}`;

// 初始化开关状态（获取值之前隐藏开关）
fetch(enabledUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const enabledValue = data.enabled;
        toggleSwitch.checked = enabledValue === true;
        toggleLabel.style.display = 'inline'; // 获取到值后显示开关
    })
    .catch(error => {
        console.error('Failed to fetch initial enabled state:', error.message);
    });

// 监听开关按钮的变化并更新状态
toggleSwitch.addEventListener('change', () => {
    const newValue = toggleSwitch.checked;
    toggleText.textContent = "设置中...请等待，请勿刷新页面";

    fetch(`https://store.zapier.com/api/records?secret=${secret}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "enabled": newValue })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        toggleText.textContent = "设置成功";
        return response.json();
    })
    .then(data => {
        toggleText.textContent = "设置成功";
        console.log('Enabled state updated successfully:', data);
    })
    .catch(error => {
        toggleText.textContent = "设置失败";
        console.error('Failed to update enabled state:', error.message);
    });
});

// 点击 SignIn 按钮时跳转到 signin.html
signInButton.addEventListener('click', () => {
    window.location.href = 'signin.html';
});
