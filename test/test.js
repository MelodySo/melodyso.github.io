// 初始化开关状态（获取值之前隐藏开关）
fetchData(data => {
    // 获取到值后显示开关
    const enabledValue = data.enabled;
    toggleSwitch.checked = enabledValue === true;
    toggleLabel.style.display = 'inline';
    const readyValue = data.ready;
    readyToggleSwitch.checked = readyValue === true;
    readyToggleLabel.style.display = 'inline';
    // data.time转成date
    const lastRequestDate = new Date(data.time);
    lastRequestTimeText.textContent = "上次获取二维码时间:" + lastRequestDate.toLocaleString();
});

// 监听开关按钮的变化并更新状态
toggleSwitch.addEventListener('change', () => {
    setDataValue('enabled', toggleSwitch.checked, toggleText);
});

// 监听开关按钮的变化并更新状态
readyToggleSwitch.addEventListener('change', () => {
    setDataValue('ready', readyToggleSwitch.checked, toggleText);
});

// 点击 SignIn 按钮时跳转到 signin.html
signInButton.addEventListener('click', () => {
    window.location.href = 'signin.html';
});
