
fetchDataValue("enabled", (value) => {
    if (value) {
        openNewWindow();
    }
    else{
        selfRefresh();
    }
});
// 10点签到，这里设置为9点
const signinHour = 9;
const now = new Date();
const currentHour = now.getHours();
if (currentHour < signinHour) {
    const targetTime = new Date();
    targetTime.setHours(signinHour, 0, 0, 0);
    console.log("targetTime:", targetTime);
    const delay = targetTime - now;
    setTimeout(() => {
        setDataValue("ready", false);
        selfRefresh();
    }, delay);
} else if (currentHour >= signinHour + 1) {
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    targetTime.setHours(signinHour, 0, 0, 0);
    console.log("targetTime:", targetTime);
    const delay = targetTime - now;
    setTimeout(() => {
        setDataValue("ready", false);
        selfRefresh();
    }, delay);
} else {
    fetchDataValue("ready", (value) => {
        if (value) {
            openNewWindow();
        }
        else{
            selfRefresh();
        }
    });
}

function selfRefresh() {
    // 每隔一分钟刷新一次页面
    setTimeout(() => {
        location.reload();
    }, 60000);
}

document.getElementById('openButton').addEventListener('click', openNewWindow);

function openNewWindow() {
    window.open('https://sso.oa.wanmei.net/PWForms/', '_blank');
}
